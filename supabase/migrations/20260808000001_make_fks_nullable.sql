-- Relax constraints to allow custom/ad-hoc sessions without linking to a specific learning item
ALTER TABLE public.planned_sessions 
  ALTER COLUMN subject_id DROP NOT NULL,
  ALTER COLUMN topic_id DROP NOT NULL,
  ALTER COLUMN learning_item_id DROP NOT NULL;

ALTER TABLE public.study_sessions 
  ALTER COLUMN subject_id DROP NOT NULL,
  ALTER COLUMN topic_id DROP NOT NULL,
  ALTER COLUMN learning_item_id DROP NOT NULL;
