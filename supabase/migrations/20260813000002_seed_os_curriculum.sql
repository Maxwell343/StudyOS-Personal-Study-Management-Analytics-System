-- ==============================================================================
-- StudyOS Operating Systems (OS) Curriculum Update Migration (24 Lectures across 5 Modules)
-- Version: 20260813000002
-- Description:
--   Updates seed_os_curriculum(p_user_id, p_subject_id) to seed the new 
--   24-lecture OS syllabus with exact lecture titles and durations.
-- ==============================================================================

-- 1. Ensure os_seeded flag exists on public.subjects
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS os_seeded BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Stored Procedure for Seeding OS Curriculum
CREATE OR REPLACE FUNCTION public.seed_os_curriculum(
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
        'MODULE 1 — OS Fundamentals & Process Basics',
        'MODULE 2 — CPU Scheduling & Process Concurrency',
        'MODULE 3 — Deadlocks & System Isolation',
        'MODULE 4 — Memory Management & Paging',
        'MODULE 5 — Page Replacement & Storage Management'
      )
  );

  DELETE FROM public.topics
  WHERE subject_id = p_subject_id
    AND name NOT IN (
      'MODULE 1 — OS Fundamentals & Process Basics',
      'MODULE 2 — CPU Scheduling & Process Concurrency',
      'MODULE 3 — Deadlocks & System Isolation',
      'MODULE 4 — Memory Management & Paging',
      'MODULE 5 — Page Replacement & Storage Management'
    );

  -- ── MODULE 1 — OS Fundamentals & Process Basics ───────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 1 — OS Fundamentals & Process Basics', 1)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 1
  RETURNING id INTO v_top_m1;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m1, 'Lec 1: Introduction',                                                1, 'NOT_STARTED', 'MEDIUM', 6, '[]'::jsonb),
    (v_top_m1, 'Lec 2: What is an Operating System & Types of OS',                    2, 'NOT_STARTED', 'HIGH',   7, '[]'::jsonb),
    (v_top_m1, 'Lec 3: Process vs Threads vs Programs',                              3, 'NOT_STARTED', 'HIGH',   9, '[]'::jsonb),
    (v_top_m1, 'Lec 4: Multiprogramming vs Multiprocess vs Multitasking vs Multithreading', 4, 'NOT_STARTED', 'HIGH', 9, '[]'::jsonb),
    (v_top_m1, 'Lec 5: Various States of a Process',                                 5, 'NOT_STARTED', 'MEDIUM', 9, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 2 — CPU Scheduling & Process Concurrency ────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 2 — CPU Scheduling & Process Concurrency', 2)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 2
  RETURNING id INTO v_top_m2;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m2, 'Lec 6: CPU Scheduling Algorithms',                                    1, 'NOT_STARTED', 'HIGH',   9, '[]'::jsonb),
    (v_top_m2, 'Lec 7: Critical Section Problem',                                     2, 'NOT_STARTED', 'HIGH',   8, '[]'::jsonb),
    (v_top_m2, 'Lec 8: Process Synchronisation',                                      3, 'NOT_STARTED', 'HIGH',   9, '[]'::jsonb),
    (v_top_m2, 'Lec 9: Process Synchronisation Mechanisms',                           4, 'NOT_STARTED', 'MEDIUM', 8, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 3 — Deadlocks & System Isolation ────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 3 — Deadlocks & System Isolation', 3)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 3
  RETURNING id INTO v_top_m3;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m3, 'Lec 10: Deadlock',                                                   1, 'NOT_STARTED', 'HIGH',   9,  '[]'::jsonb),
    (v_top_m3, 'Lec 11: Deadlock Handling Techniques',                               2, 'NOT_STARTED', 'HIGH',   9,  '[]'::jsonb),
    (v_top_m3, 'Lec 22: Context Switching',                                          3, 'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb),
    (v_top_m3, 'Lec 23: Mutex vs Semaphore',                                         4, 'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m3, 'Lec 24: User Mode vs Kernel Mode',                                   5, 'NOT_STARTED', 'HIGH',   10, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 4 — Memory Management & Paging ──────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 4 — Memory Management & Paging', 4)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 4
  RETURNING id INTO v_top_m4;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m4, 'Lec 12: Memory Management',                                          1, 'NOT_STARTED', 'HIGH',   7, '[]'::jsonb),
    (v_top_m4, 'Lec 13: First-fit, Best-fit, Worst-fit Algorithms',                  2, 'NOT_STARTED', 'HIGH',   9, '[]'::jsonb),
    (v_top_m4, 'Lec 14: Paging',                                                     3, 'NOT_STARTED', 'HIGH',   9, '[]'::jsonb),
    (v_top_m4, 'Lec 15: Virtual Memory',                                             4, 'NOT_STARTED', 'HIGH',   9, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 5 — Page Replacement & Storage Management ──────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 5 — Page Replacement & Storage Management', 5)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 5
  RETURNING id INTO v_top_m5;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m5, 'Lec 16: Page Replacement Algorithms',                                1, 'NOT_STARTED', 'HIGH',   13, '[]'::jsonb),
    (v_top_m5, 'Lec 17: Thrashing',                                                  2, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb),
    (v_top_m5, 'Lec 18: Segmentation',                                               3, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb),
    (v_top_m5, 'Lec 19: Disk Management',                                            4, 'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb),
    (v_top_m5, 'Lec 20: Disk Scheduling Algorithms',                                 5, 'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m5, 'Lec 21: Quick Revision',                                             6, 'NOT_STARTED', 'LOW',    5,  '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── Mark subject as seeded ──────────────────────────────────────────────────
  UPDATE public.subjects
  SET os_seeded = TRUE
  WHERE id = p_subject_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
