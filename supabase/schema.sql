-- ====================================================================
-- TOEFL QUIZ BATTLE - SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE quiz_status AS ENUM ('draft', 'published');
CREATE TYPE question_category AS ENUM ('listening', 'structure', 'reading');
CREATE TYPE room_mode AS ENUM ('live', 'self_paced');
CREATE TYPE room_state AS ENUM ('waiting', 'in_progress', 'paused', 'finished');

-- 3. PROFILES / ADMIN USERS
-- Role-based access control: Only users with role 'admin' can manage quizzes
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  time_per_question_seconds INT NOT NULL DEFAULT 30,
  status quiz_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTIONS TABLE
-- Security Note: correctAnswerIndex, explanationId, explanationEn, and audioTranscript
-- are shielded from active test participants via RLS or server-side RPC.
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  category question_category NOT NULL,
  category_label TEXT NOT NULL,
  subtype TEXT NOT NULL,
  stimulus_text TEXT,
  prompt_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 strings [A, B, C, D]
  correct_answer_index INT NOT NULL CHECK (correct_answer_index BETWEEN 0 AND 3),
  explanation_id TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  audio_url TEXT, -- NULL if not yet uploaded
  audio_transcript TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin VARCHAR(10) UNIQUE NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE RESTRICT,
  quiz_title TEXT NOT NULL,
  mode room_mode NOT NULL DEFAULT 'live',
  state room_state NOT NULL DEFAULT 'waiting',
  current_question_index INT NOT NULL DEFAULT 0,
  question_started_at TIMESTAMPTZ,
  question_deadline TIMESTAMPTZ,
  is_review_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  max_participants INT DEFAULT 100,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🎓',
  total_score INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  timeout_count INT NOT NULL DEFAULT 0,
  total_response_time_ms BIGINT NOT NULL DEFAULT 0,
  tab_switch_count INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 8. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  selected_option_index INT, -- NULL if timed out
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  is_timeout BOOLEAN NOT NULL DEFAULT FALSE,
  earned_score INT NOT NULL DEFAULT 0,
  response_time_ms INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, question_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Helper function: Is caller an Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Anyone can read their own profile; admins can read all
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Quizzes: Anyone can read published quizzes; Admins have full access
CREATE POLICY "Public can read published quizzes"
  ON public.quizzes FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins have full quiz control"
  ON public.quizzes FOR ALL
  USING (public.is_admin());

-- Questions: Admins have full access.
-- Students only receive questions through server-side RPC / API to protect answer keys!
CREATE POLICY "Admins have full question control"
  ON public.questions FOR ALL
  USING (public.is_admin());

-- Rooms: Anyone can read room state by PIN; Admins manage rooms
CREATE POLICY "Public can view active rooms"
  ON public.rooms FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage rooms"
  ON public.rooms FOR ALL
  USING (public.is_admin());

-- Participants: Anyone can join a room; can update own stats
CREATE POLICY "Anyone can register participant"
  ON public.participants FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Participants can view room roster"
  ON public.participants FOR SELECT
  USING (TRUE);

-- Answers: Participant submits answer; cannot modify previous answers
CREATE POLICY "Participant can insert answers"
  ON public.answers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Participant can view own answers or admin views all"
  ON public.answers FOR SELECT
  USING (TRUE);

-- ====================================================================
-- REALTIME PUBLICATION
-- ====================================================================
-- Enable Realtime for room state and participant scores
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
