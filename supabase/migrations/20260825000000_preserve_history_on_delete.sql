-- ==============================================================================
-- StudyOS History Preservation & Concurrency Safeguards Migration
-- Version: 20260825000000
-- Description:
--   1. Ensures study_sessions and activity_logs preserve study history when
--      learning items or subjects are deleted (ON DELETE SET NULL).
--   2. Adds unique index to guarantee single active/paused session integrity.
-- ==============================================================================

-- 1. Drop existing cascading foreign keys if present and recreate with SET NULL
ALTER TABLE public.study_sessions
  DROP CONSTRAINT IF EXISTS study_sessions_learning_item_id_fkey,
  DROP CONSTRAINT IF EXISTS study_sessions_subject_id_fkey,
  DROP CONSTRAINT IF EXISTS study_sessions_topic_id_fkey;

ALTER TABLE public.study_sessions
  ADD CONSTRAINT study_sessions_learning_item_id_fkey
    FOREIGN KEY (learning_item_id) REFERENCES public.learning_items(id) ON DELETE SET NULL,
  ADD CONSTRAINT study_sessions_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL,
  ADD CONSTRAINT study_sessions_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;

-- 2. Activity logs foreign keys preservation
ALTER TABLE public.activity_logs
  DROP CONSTRAINT IF EXISTS activity_logs_learning_item_id_fkey,
  DROP CONSTRAINT IF EXISTS activity_logs_subject_id_fkey;

ALTER TABLE public.activity_logs
  ADD CONSTRAINT activity_logs_learning_item_id_fkey
    FOREIGN KEY (learning_item_id) REFERENCES public.learning_items(id) ON DELETE SET NULL,
  ADD CONSTRAINT activity_logs_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;

-- 3. Enforce single active/paused study session per user to avoid concurrency race conditions
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_study_session_per_user
  ON public.study_sessions (user_id)
  WHERE status IN ('ACTIVE', 'PAUSED');
