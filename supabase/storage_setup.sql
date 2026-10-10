-- ====================================================================
-- TOEFL QUIZ BATTLE - SUPABASE STORAGE CONFIGURATION
-- Bucket: toefl-audio (Public read, Authenticated Admin write)
-- ====================================================================

-- 1. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('toefl-audio', 'toefl-audio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
CREATE POLICY "Public Read Access for TOEFL Audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'toefl-audio');

CREATE POLICY "Admin Upload Access for TOEFL Audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'toefl-audio' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admin Delete Access for TOEFL Audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'toefl-audio' AND
    auth.role() = 'authenticated'
  );
