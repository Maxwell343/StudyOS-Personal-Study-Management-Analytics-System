-- ==============================================================================
-- StudyOS Object Oriented Programming (OOP) Curriculum Update Migration (7 Lectures across 7 Modules)
-- Version: 20260813000001
-- Description:
--   Updates seed_oop_curriculum(p_user_id, p_subject_id) to seed the new 
--   7-lecture OOP syllabus with exact lecture titles and durations.
-- ==============================================================================

-- 1. Ensure oop_seeded flag exists on public.subjects
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS oop_seeded BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Stored Procedure for Seeding OOP Curriculum
CREATE OR REPLACE FUNCTION public.seed_oop_curriculum(
  p_user_id   UUID,
  p_subject_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_top_m1 UUID;
  v_top_m2 UUID;
  v_top_m3 UUID;
  v_top_m4 UUID;
  v_top_m5 UUID;
  v_top_m6 UUID;
  v_top_m7 UUID;
BEGIN
  -- Safety check: subject must belong to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.subjects
    WHERE id = p_subject_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Subject % does not belong to user %', p_subject_id, p_user_id;
  END IF;

  -- ── Clean up legacy topics from older schema versions if present ───────────
  DELETE FROM public.learning_items
  WHERE topic_id IN (
    SELECT id FROM public.topics
    WHERE subject_id = p_subject_id
      AND name NOT IN (
        'MODULE 1 — Introduction & Concepts',
        'MODULE 2 — Packages, Static & Singleton',
        'MODULE 3 — OOP Principles',
        'MODULE 4 — Access Control & Object Class',
        'MODULE 5 — Abstract Classes & Interfaces',
        'MODULE 6 — Generics & Exception Handling',
        'MODULE 7 — Collections Framework & Enums'
      )
  );

  DELETE FROM public.topics
  WHERE subject_id = p_subject_id
    AND name NOT IN (
      'MODULE 1 — Introduction & Concepts',
      'MODULE 2 — Packages, Static & Singleton',
      'MODULE 3 — OOP Principles',
      'MODULE 4 — Access Control & Object Class',
      'MODULE 5 — Abstract Classes & Interfaces',
      'MODULE 6 — Generics & Exception Handling',
      'MODULE 7 — Collections Framework & Enums'
    );

  -- ── MODULE 1 — Introduction & Concepts ─────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 1 — Introduction & Concepts', 1)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 1
  RETURNING id INTO v_top_m1;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m1, 'OOP 1 — Introduction & Concepts: Classes, Objects, Constructors, Keywords', 1, 'NOT_STARTED', 'HIGH', 107, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 2 — Packages, Static & Singleton ────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 2 — Packages, Static & Singleton', 2)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 2
  RETURNING id INTO v_top_m2;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m2, 'OOP 2 — Packages, Static, Singleton Class, In-built Methods', 1, 'NOT_STARTED', 'HIGH', 84, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 3 — OOP Principles ──────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 3 — OOP Principles', 3)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 3
  RETURNING id INTO v_top_m3;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m3, 'OOP 3 — Principles: Inheritance, Polymorphism, Encapsulation, Abstraction', 1, 'NOT_STARTED', 'HIGH', 138, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 4 — Access Control & Object Class ───────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 4 — Access Control & Object Class', 4)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 4
  RETURNING id INTO v_top_m4;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m4, 'OOP 4 — Access Control, In-built Packages, Object Class', 1, 'NOT_STARTED', 'MEDIUM', 56, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 5 — Abstract Classes & Interfaces ───────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 5 — Abstract Classes & Interfaces', 5)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 5
  RETURNING id INTO v_top_m5;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m5, 'OOP 5 — Abstract Classes, Interfaces, Annotations', 1, 'NOT_STARTED', 'HIGH', 76, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 6 — Generics & Exception Handling ───────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 6 — Generics & Exception Handling', 6)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 6
  RETURNING id INTO v_top_m6;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m6, 'OOP 6 — Generics, Custom ArrayList, Lambda Expressions, Exception Handling, Object Cloning', 1, 'NOT_STARTED', 'HIGH', 97, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 7 — Collections Framework & Enums ───────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 7 — Collections Framework & Enums', 7)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 7
  RETURNING id INTO v_top_m7;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m7, 'OOP 7 — Collections Framework, Vector Class, Enums in Java', 1, 'NOT_STARTED', 'MEDIUM', 32, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── Mark subject as seeded ──────────────────────────────────────────────────
  UPDATE public.subjects
  SET oop_seeded = TRUE
  WHERE id = p_subject_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
