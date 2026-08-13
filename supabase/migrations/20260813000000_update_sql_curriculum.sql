-- ==============================================================================
-- StudyOS Structured Query Language (SQL) Curriculum Update Migration (38 Lectures across 7 Modules)
-- Version: 20260813000000
-- Description:
--   Updates seed_sql_curriculum(p_user_id, p_subject_id) to seed the new 
--   38-lecture, 7-module SQL syllabus with exact lecture titles and durations.
-- ==============================================================================

-- 1. Ensure sql_seeded flag exists on public.subjects
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS sql_seeded BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Stored Procedure for Seeding SQL Curriculum
CREATE OR REPLACE FUNCTION public.seed_sql_curriculum(
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
        'MODULE 1 — SQL & Database Fundamentals',
        'MODULE 2 — Database & Table Basics',
        'MODULE 3 — Queries & Data Manipulation',
        'MODULE 4 — Keys, Constraints & Filtering',
        'MODULE 5 — Aggregations & Grouping',
        'MODULE 6 — Data Modification & Schema Updates',
        'MODULE 7 — Joins, Subqueries & Views'
      )
  );

  DELETE FROM public.topics
  WHERE subject_id = p_subject_id
    AND name NOT IN (
      'MODULE 1 — SQL & Database Fundamentals',
      'MODULE 2 — Database & Table Basics',
      'MODULE 3 — Queries & Data Manipulation',
      'MODULE 4 — Keys, Constraints & Filtering',
      'MODULE 5 — Aggregations & Grouping',
      'MODULE 6 — Data Modification & Schema Updates',
      'MODULE 7 — Joins, Subqueries & Views'
    );

  -- ── MODULE 1 — SQL & Database Fundamentals ──────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 1 — SQL & Database Fundamentals', 1)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 1
  RETURNING id INTO v_top_m1;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m1, 'Lec 1: Introduction to SQL',      1, 'NOT_STARTED', 'HIGH',   7, '[]'::jsonb),
    (v_top_m1, 'Lec 2: What is Database?',        2, 'NOT_STARTED', 'MEDIUM', 5, '[]'::jsonb),
    (v_top_m1, 'Lec 3: Types of Databases',       3, 'NOT_STARTED', 'MEDIUM', 7, '[]'::jsonb),
    (v_top_m1, 'Lec 4: Installation of MySQL',    4, 'NOT_STARTED', 'MEDIUM', 9, '[]'::jsonb),
    (v_top_m1, 'Lec 5: Database Structure',       5, 'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 2 — Database & Table Basics ──────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 2 — Database & Table Basics', 2)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 2
  RETURNING id INTO v_top_m2;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m2, 'Lec 6: What is Table?',           1, 'NOT_STARTED', 'MEDIUM', 6,  '[]'::jsonb),
    (v_top_m2, 'Lec 7: Creating our First Database', 2, 'NOT_STARTED', 'HIGH',   7,  '[]'::jsonb),
    (v_top_m2, 'Lec 8: Creating our First Table', 3, 'NOT_STARTED', 'HIGH',   11, '[]'::jsonb),
    (v_top_m2, 'Lec 9: SQL Datatypes',            4, 'NOT_STARTED', 'HIGH',   12, '[]'::jsonb),
    (v_top_m2, 'Lec 10: Types of SQL Commands',   5, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 3 — Queries & Data Manipulation ─────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 3 — Queries & Data Manipulation', 3)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 3
  RETURNING id INTO v_top_m3;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m3, 'Lec 11: Database Related Queries', 1, 'NOT_STARTED', 'MEDIUM', 9,  '[]'::jsonb),
    (v_top_m3, 'Lec 12: Table Related Queries',    2, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb),
    (v_top_m3, 'Lec 13: SELECT Command',           3, 'NOT_STARTED', 'HIGH',   6,  '[]'::jsonb),
    (v_top_m3, 'Lec 14: INSERT Command',           4, 'NOT_STARTED', 'HIGH',   11, '[]'::jsonb),
    (v_top_m3, 'Lec 15: Practice Questions',       5, 'NOT_STARTED', 'HIGH',   10, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 4 — Keys, Constraints & Filtering ───────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 4 — Keys, Constraints & Filtering', 4)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 4
  RETURNING id INTO v_top_m4;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m4, 'Lec 16: Keys',                    1, 'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m4, 'Lec 17: Constraints',             2, 'NOT_STARTED', 'HIGH',   17, '[]'::jsonb),
    (v_top_m4, 'Lec 18: SELECT Command in Detail',3, 'NOT_STARTED', 'HIGH',   7,  '[]'::jsonb),
    (v_top_m4, 'Lec 19: WHERE Clause',            4, 'NOT_STARTED', 'HIGH',   11, '[]'::jsonb),
    (v_top_m4, 'Lec 20: Operators',               5, 'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb),
    (v_top_m4, 'Lec 21: LIMIT Clause',            6, 'NOT_STARTED', 'MEDIUM', 9,  '[]'::jsonb),
    (v_top_m4, 'Lec 22: ORDER BY Clause',         7, 'NOT_STARTED', 'MEDIUM', 6,  '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 5 — Aggregations & Grouping ─────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 5 — Aggregations & Grouping', 5)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 5
  RETURNING id INTO v_top_m5;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m5, 'Lec 23: Aggregate Functions',      1, 'NOT_STARTED', 'HIGH',   8,  '[]'::jsonb),
    (v_top_m5, 'Lec 24: GROUP BY Clause',          2, 'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m5, 'Lec 25: Practice Questions',       3, 'NOT_STARTED', 'HIGH',   11, '[]'::jsonb),
    (v_top_m5, 'Lec 26: HAVING Clause',            4, 'NOT_STARTED', 'HIGH',   9,  '[]'::jsonb),
    (v_top_m5, 'Lec 27: General Order of Commands', 5, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 6 — Data Modification & Schema Updates ──────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 6 — Data Modification & Schema Updates', 6)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 6
  RETURNING id INTO v_top_m6;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m6, 'Lec 28: UPDATE Command',          1, 'NOT_STARTED', 'HIGH',   11, '[]'::jsonb),
    (v_top_m6, 'Lec 29: DELETE Command',          2, 'NOT_STARTED', 'HIGH',   7,  '[]'::jsonb),
    (v_top_m6, 'Lec 30: Revisiting Foreign Keys',  3, 'NOT_STARTED', 'HIGH',   13, '[]'::jsonb),
    (v_top_m6, 'Lec 31: Cascading Foreign Keys',  4, 'NOT_STARTED', 'HIGH',   11, '[]'::jsonb),
    (v_top_m6, 'Lec 32: ALTER Command',           5, 'NOT_STARTED', 'HIGH',   8,  '[]'::jsonb),
    (v_top_m6, 'Lec 33: CHANGE and MODIFY Commands', 6, 'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb),
    (v_top_m6, 'Lec 34: TRUNCATE Command',        7, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 7 — Joins, Subqueries & Views ───────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 7 — Joins, Subqueries & Views', 7)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 7
  RETURNING id INTO v_top_m7;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m7, 'Lec 35: JOINS in SQL',            1, 'NOT_STARTED', 'HIGH',   32, '[]'::jsonb),
    (v_top_m7, 'Lec 36: UNION in SQL',            2, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb),
    (v_top_m7, 'Lec 37: SQL Sub Queries',         3, 'NOT_STARTED', 'HIGH',   23, '[]'::jsonb),
    (v_top_m7, 'Lec 38: MySQL Views',             4, 'NOT_STARTED', 'HIGH',   23, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── Mark subject as seeded ──────────────────────────────────────────────────
  UPDATE public.subjects
  SET sql_seeded = TRUE
  WHERE id = p_subject_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
