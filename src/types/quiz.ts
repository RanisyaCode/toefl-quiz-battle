export type QuizCategory = 'listening' | 'structure' | 'reading';

export interface Question {
  id: string;
  category: QuizCategory;
  categoryLabel: string;
  subtype: string; // e.g. "Double Negative Expressions", "Inversion with Place Expressions", "Unstated Details (EXCEPT)"
  stimulusText?: string; // Reading passage or dialogue context
  promptText: string; // The specific question prompt
  options: [string, string, string, string]; // 4 options A, B, C, D
  correctAnswerIndex: number; // 0, 1, 2, 3 (kept secret on server during active quiz)
  explanationId: string; // Penjelasan Bahasa Indonesia
  explanationEn: string; // Explanation in English
  audioUrl?: string | null; // For listening, null if not yet uploaded
  audioTranscript?: string; // Transcript hidden during exam, revealed during review
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timePerQuestionSeconds: number; // default 30
  status: 'draft' | 'published';
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export type RoomMode = 'live' | 'self_paced';
export type RoomState = 'waiting' | 'in_progress' | 'paused' | 'finished';

export interface Participant {
  id: string;
  token: string;
  name: string;
  avatar: string; // Cute emoji or avatar key
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  totalResponseTimeMs: number;
  tabSwitchCount: number;
  joinedAt: number;
  completedAt?: number;
  answers: Record<string, {
    selectedOptionIndex: number | null; // null if timeout
    isCorrect: boolean;
    isTimeout: boolean;
    earnedScore: number;
    responseTimeMs: number;
  }>;
}

export interface QuizRoom {
  id: string;
  pin: string; // 6-digit room PIN or custom code
  quizId: string;
  quizTitle: string;
  mode: RoomMode;
  state: RoomState;
  maxParticipants?: number;
  timePerQuestionSeconds: number; // 30
  currentQuestionIndex: number;
  totalQuestions?: number;
  participantCount?: number;
  questionStartedAt: number;
  questionDeadline: number; // Server-authoritative timestamp
  isReviewUnlocked: boolean; // Admin controls when review is unlocked
  createdAt: number;
  serverNow?: number;
  participants: Record<string, Participant>;
}

export interface ClientQuestionView {
  questionNumber: number;
  totalQuestions: number;
  category: QuizCategory;
  categoryLabel: string;
  subtype: string;
  stimulusText?: string;
  promptText: string;
  options: [string, string, string, string];
  audioUrl?: string | null;
  timeLimitSeconds: number;
  serverDeadline: number;
  serverNow: number;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  isTimeout: boolean;
  correctAnswerIndex: number;
  earnedScore: number;
  currentTotalScore: number;
  responseTimeMs: number;
}

export interface ParticipantReviewCard {
  questionNumber: number;
  category: QuizCategory;
  categoryLabel: string;
  subtype: string;
  stimulusText?: string;
  promptText: string;
  options: [string, string, string, string];
  selectedOptionIndex: number | null;
  correctAnswerIndex: number;
  isCorrect: boolean;
  isTimeout: boolean;
  earnedScore: number;
  responseTimeMs: number;
  audioUrl?: string | null;
  audioTranscript?: string;
  explanationId: string;
  explanationEn: string;
}

export interface LeaderboardEntry {
  rank: number;
  isTied: boolean;
  id: string;
  name: string;
  avatar: string;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  totalResponseTimeMs: number;
}
