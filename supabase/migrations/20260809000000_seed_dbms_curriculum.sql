-- ==============================================================================
-- StudyOS DBMS Curriculum Seed Migration
-- Version: 20260809000000
-- Description:
--   1. Adds unique constraints on topics(subject_id, name) and
--      learning_items(topic_id, title) — safely, without data loss.
--   2. Adds a `dbms_seeded` boolean flag to subjects so we can track
--      whether the DBMS curriculum has already been initialised for a subject.
--      This prevents repeated re-seeding on every page load.
--   3. Creates the seed_dbms_curriculum(p_user_id, p_subject_id) function
--      that is idempotent — safe to call multiple times.
-- ==============================================================================

-- ── 1. UNIQUE CONSTRAINT: topics(subject_id, name) ───────────────────────────
-- Only add if it does not already exist. We first deduplicate if needed.

DO $$
BEGIN
  -- Deduplicate topics: keep the oldest row for each (subject_id, name) pair,
  -- preserving all learning items by re-parenting them to the kept row first.
  -- This is defensive; in practice there should be no duplicates yet.
  WITH ranked AS (
    SELECT
      id,
      subject_id,
      name,
      ROW_NUMBER() OVER (PARTITION BY subject_id, name ORDER BY created_at ASC) AS rn
    FROM public.topics
  ),
  duplicates AS (
    SELECT t.id AS dup_id, k.id AS keep_id
    FROM ranked t
    JOIN ranked k ON k.subject_id = t.subject_id AND k.name = t.name AND k.rn = 1
    WHERE t.rn > 1
  )
  -- Re-parent learning items from duplicate topics to the kept topic
  UPDATE public.learning_items li
  SET topic_id = d.keep_id
  FROM duplicates d
  WHERE li.topic_id = d.dup_id;

  -- Now delete the duplicate topics (their learning items have been moved)
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (PARTITION BY subject_id, name ORDER BY created_at ASC) AS rn
    FROM public.topics
  )
  DELETE FROM public.topics
  WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

  -- Add the unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.topics'::regclass
      AND conname = 'topics_subject_id_name_unique'
  ) THEN
    ALTER TABLE public.topics
      ADD CONSTRAINT topics_subject_id_name_unique UNIQUE (subject_id, name);
  END IF;
END;
$$;


-- ── 2. UNIQUE CONSTRAINT: learning_items(topic_id, title) ────────────────────

DO $$
BEGIN
  -- Deduplicate learning_items: keep the oldest row for each (topic_id, title).
  -- Prefer rows with COMPLETED status so we never lose user progress.
  WITH ranked AS (
    SELECT
      id,
      topic_id,
      title,
      status,
      ROW_NUMBER() OVER (
        PARTITION BY topic_id, title
        ORDER BY
          CASE status WHEN 'COMPLETED' THEN 0 WHEN 'IN_PROGRESS' THEN 1 ELSE 2 END,
          created_at ASC
      ) AS rn
    FROM public.learning_items
  )
  DELETE FROM public.learning_items
  WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

  -- Add the unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.learning_items'::regclass
      AND conname = 'learning_items_topic_id_title_unique'
  ) THEN
    ALTER TABLE public.learning_items
      ADD CONSTRAINT learning_items_topic_id_title_unique UNIQUE (topic_id, title);
  END IF;
END;
$$;


-- ── 3. SEEDED MARKER COLUMN on subjects ──────────────────────────────────────
-- We use a lightweight JSONB metadata column (or a boolean flag).
-- Using a boolean flag `dbms_seeded` is the simplest approach.

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS dbms_seeded BOOLEAN NOT NULL DEFAULT FALSE;


-- ── 4. SEED FUNCTION ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.seed_dbms_curriculum(
  p_user_id   UUID,
  p_subject_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_top_foundations        UUID;
  v_top_normalization      UUID;
  v_top_sql                UUID;
  v_top_transactions       UUID;
  v_top_concurrency        UUID;
  v_top_deadlocks          UUID;
  v_top_indexing           UUID;
  v_top_query_processing   UUID;
  v_top_storage_recovery   UUID;
  v_top_modern             UUID;
  v_top_design_practice    UUID;
BEGIN
  -- Safety check: subject must belong to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.subjects
    WHERE id = p_subject_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Subject % does not belong to user %', p_subject_id, p_user_id;
  END IF;

  -- Already seeded: skip
  IF EXISTS (
    SELECT 1 FROM public.subjects
    WHERE id = p_subject_id AND dbms_seeded = TRUE
  ) THEN
    RETURN;
  END IF;

  -- ── MODULE 1: DBMS Foundations ──────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'DBMS Foundations', 1)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 1
  RETURNING id INTO v_top_foundations;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_foundations, 'DBMS vs File System',                  1,  'NOT_STARTED', 'MEDIUM', 30, '[]'::jsonb),
    (v_top_foundations, 'DBMS vs RDBMS',                        2,  'NOT_STARTED', 'MEDIUM', 30, '[]'::jsonb),
    (v_top_foundations, 'DBMS Architecture — 2-tier and 3-tier',3,  'NOT_STARTED', 'MEDIUM', 30, '[]'::jsonb),
    (v_top_foundations, 'Schema vs Instance',                   4,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Data Abstraction',                     5,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Data Independence',                    6,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Super Key',                            7,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Candidate Key',                        8,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Primary Key',                          9,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Foreign Key',                          10, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Composite Key',                        11, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Alternate Key',                        12, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Entity Integrity',                     13, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Referential Integrity',                14, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Domain Integrity',                     15, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Entity',                               16, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_foundations, 'Attribute',                            17, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_foundations, 'Relationship',                         18, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_foundations, 'Cardinality',                          19, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Participation Constraints',            20, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_foundations, 'Strong vs Weak Entity',                21, 'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_foundations, 'Basic ER Diagram Design',              22, 'NOT_STARTED', 'HIGH',   45, '[]'::jsonb),
    (v_top_foundations, 'ER Diagram to Relational Schema',      23, 'NOT_STARTED', 'HIGH',   45, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 2: Normalization ─────────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Normalization', 2)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 2
  RETURNING id INTO v_top_normalization;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_normalization, 'Why Normalization?',                  1,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_normalization, 'Data Redundancy',                     2,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_normalization, 'Insert Anomaly',                      3,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_normalization, 'Update Anomaly',                      4,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_normalization, 'Delete Anomaly',                      5,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_normalization, 'Functional Dependency',               6,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_normalization, 'First Normal Form — 1NF',             7,  'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_normalization, 'Second Normal Form — 2NF',            8,  'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_normalization, 'Partial Dependency',                  9,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_normalization, 'Third Normal Form — 3NF',             10, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_normalization, 'Transitive Dependency',               11, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_normalization, 'Boyce-Codd Normal Form — BCNF',       12, 'NOT_STARTED', 'HIGH',   40, '[]'::jsonb),
    (v_top_normalization, '3NF vs BCNF',                         13, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_normalization, 'Lossless Decomposition',              14, 'NOT_STARTED', 'MEDIUM', 30, '[]'::jsonb),
    (v_top_normalization, 'Dependency Preservation',             15, 'NOT_STARTED', 'MEDIUM', 30, '[]'::jsonb),
    (v_top_normalization, 'Normalize Sample Tables',             16, 'NOT_STARTED', 'HIGH',   60, '[]'::jsonb),
    (v_top_normalization, 'Explain Normalization Problems',      17, 'NOT_STARTED', 'HIGH',   45, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 3: SQL Fundamentals ──────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'SQL Fundamentals', 3)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 3
  RETURNING id INTO v_top_sql;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_sql, 'SELECT',                        1,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'WHERE',                         2,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'ORDER BY',                      3,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'DISTINCT',                      4,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'COUNT',                         5,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'SUM',                           6,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'AVG',                           7,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'MIN',                           8,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'MAX',                           9,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_sql, 'GROUP BY',                      10, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_sql, 'HAVING',                        11, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_sql, 'WHERE vs HAVING',               12, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_sql, 'INNER JOIN',                    13, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_sql, 'LEFT JOIN',                     14, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_sql, 'RIGHT JOIN',                    15, 'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_sql, 'FULL OUTER JOIN',               16, 'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_sql, 'Subqueries',                    17, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_sql, 'Correlated Subqueries',         18, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_sql, 'UNION',                         19, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_sql, 'INTERSECT',                     20, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_sql, 'EXCEPT / MINUS',                21, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_sql, 'Views',                         22, 'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_sql, 'NOT NULL',                      23, 'NOT_STARTED', 'LOW',    15, '[]'::jsonb),
    (v_top_sql, 'UNIQUE',                        24, 'NOT_STARTED', 'LOW',    15, '[]'::jsonb),
    (v_top_sql, 'CHECK',                         25, 'NOT_STARTED', 'LOW',    15, '[]'::jsonb),
    (v_top_sql, 'DEFAULT',                       26, 'NOT_STARTED', 'LOW',    15, '[]'::jsonb),
    (v_top_sql, 'DELETE vs TRUNCATE vs DROP',    27, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_sql, 'Practice 20+ SQL Queries',      28, 'NOT_STARTED', 'HIGH',   120,'[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 4: Transactions & ACID ──────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Transactions & ACID', 4)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 4
  RETURNING id INTO v_top_transactions;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_transactions, 'What is a Transaction?',                  1,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_transactions, 'Transaction States',                      2,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_transactions, 'Atomicity',                               3,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_transactions, 'Consistency',                             4,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_transactions, 'Isolation',                               5,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_transactions, 'Durability',                              6,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_transactions, 'ACID Properties with Real-World Examples',7,  'NOT_STARTED', 'HIGH',   45, '[]'::jsonb),
    (v_top_transactions, 'COMMIT',                                  8,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_transactions, 'ROLLBACK',                                9,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_transactions, 'SAVEPOINT',                               10, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_transactions, 'Serial Transactions',                     11, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_transactions, 'Concurrent Transactions',                 12, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_transactions, 'Serializability',                         13, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_transactions, 'Banking Transaction Example',             14, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_transactions, 'Explain ACID Without Notes',              15, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 5: Concurrency Control & Isolation ───────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Concurrency Control & Isolation', 5)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 5
  RETURNING id INTO v_top_concurrency;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_concurrency, 'Why Concurrency Control is Needed',          1,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_concurrency, 'Lost Update Problem',                         2,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_concurrency, 'Dirty Read',                                  3,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_concurrency, 'Non-Repeatable Read',                         4,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_concurrency, 'Phantom Read',                                5,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_concurrency, 'Shared Lock',                                 6,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_concurrency, 'Exclusive Lock',                              7,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_concurrency, 'Lock Compatibility',                          8,  'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_concurrency, 'Two-Phase Locking — 2PL',                    9,  'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_concurrency, 'Strict 2PL',                                  10, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_concurrency, 'Read Uncommitted',                            11, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_concurrency, 'Read Committed',                              12, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_concurrency, 'Repeatable Read',                             13, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_concurrency, 'Serializable',                                14, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_concurrency, 'Isolation Levels',                            15, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_concurrency, 'Isolation Level vs Concurrency Anomalies',   16, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_concurrency, 'MVCC — Conceptual Understanding',            17, 'NOT_STARTED', 'MEDIUM', 30, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 6: Deadlocks ─────────────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Deadlocks', 6)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 6
  RETURNING id INTO v_top_deadlocks;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_deadlocks, 'What is a Deadlock?',                  1, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_deadlocks, 'Necessary Conditions for Deadlock',    2, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_deadlocks, 'Deadlock Prevention',                  3, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_deadlocks, 'Deadlock Detection',                   4, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_deadlocks, 'Deadlock Recovery',                    5, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_deadlocks, 'Wait-for Graph',                       6, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 7: Indexing & Storage ────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Indexing & Storage', 7)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 7
  RETURNING id INTO v_top_indexing;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_indexing, 'Why Indexing?',                         1,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_indexing, 'How Indexes Improve Query Performance', 2,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_indexing, 'Advantages of Indexing',               3,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Disadvantages of Indexing',            4,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Primary Index',                        5,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_indexing, 'Secondary Index',                      6,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_indexing, 'Clustered Index',                      7,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_indexing, 'Non-Clustered Index',                  8,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_indexing, 'Clustered vs Non-Clustered Index',     9,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_indexing, 'Dense Index',                          10, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Sparse Index',                         11, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Hash Indexing',                        12, 'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_indexing, 'B-Tree',                               13, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_indexing, 'B+ Tree',                              14, 'NOT_STARTED', 'HIGH',   40, '[]'::jsonb),
    (v_top_indexing, 'B-Tree vs B+ Tree',                    15, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_indexing, 'Why B+ Tree is Preferred',             16, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_indexing, 'Why Not Index Every Column?',          17, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_indexing, 'Index Impact on INSERT',               18, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Index Impact on UPDATE',               19, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Index Impact on DELETE',               20, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Heap File Organization',               21, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Sequential File Organization',         22, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_indexing, 'Hash File Organization',               23, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 8: Query Processing & Relational Algebra ─────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Query Processing & Relational Algebra', 8)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 8
  RETURNING id INTO v_top_query_processing;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_query_processing, 'Query Processing',         1,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_query_processing, 'Query Parsing',            2,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_query_processing, 'Query Execution',          3,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_query_processing, 'Query Execution Plan',     4,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_query_processing, 'Query Optimization',       5,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_query_processing, 'Cost-Based Optimization',  6,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_query_processing, 'Basic Join Processing',    7,  'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_query_processing, 'EXPLAIN / Execution Plans',8,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_query_processing, 'Selection',                9,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_query_processing, 'Projection',               10, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_query_processing, 'Union',                    11, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_query_processing, 'Set Difference',           12, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_query_processing, 'Cartesian Product',        13, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_query_processing, 'Natural Join',             14, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_query_processing, 'Theta Join',               15, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_query_processing, 'Division Operator',        16, 'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 9: Database Storage & Recovery ───────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Database Storage & Recovery', 9)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 9
  RETURNING id INTO v_top_storage_recovery;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_storage_recovery, 'Database Storage Basics',        1,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_storage_recovery, 'Pages',                          2,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_storage_recovery, 'Blocks',                         3,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_storage_recovery, 'Records',                        4,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_storage_recovery, 'File Organization',              5,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_storage_recovery, 'Buffer Management',              6,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_storage_recovery, 'Database Failure Types',         7,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_storage_recovery, 'Transaction Failure',            8,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_storage_recovery, 'System Crash',                   9,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_storage_recovery, 'Disk Failure',                   10, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_storage_recovery, 'Log-Based Recovery',             11, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_storage_recovery, 'Write-Ahead Logging — WAL',     12, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb),
    (v_top_storage_recovery, 'Checkpoints',                    13, 'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_storage_recovery, 'Undo',                           14, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_storage_recovery, 'Redo',                           15, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_storage_recovery, 'Crash Recovery',                 16, 'NOT_STARTED', 'HIGH',   35, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 10: Modern Database Concepts ─────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Modern Database Concepts', 10)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 10
  RETURNING id INTO v_top_modern;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_modern, 'Database Replication',                    1,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_modern, 'Primary-Replica Architecture',            2,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_modern, 'Synchronous Replication',                 3,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Asynchronous Replication',                4,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Read Replicas',                           5,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Database Partitioning',                   6,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_modern, 'Horizontal Partitioning',                 7,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_modern, 'Vertical Partitioning',                   8,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_modern, 'Database Sharding',                       9,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_modern, 'Horizontal Scaling',                      10, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Vertical Scaling',                        11, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Consistent Hashing — Basic Understanding',12, 'NOT_STARTED', 'MEDIUM', 25, '[]'::jsonb),
    (v_top_modern, 'CAP Theorem',                             13, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_modern, 'Consistency',                             14, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_modern, 'Availability',                            15, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_modern, 'Partition Tolerance',                     16, 'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_modern, 'Strong Consistency',                      17, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Eventual Consistency',                    18, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'SQL vs NoSQL',                            19, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_modern, 'Key-Value Databases',                     20, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Document Databases',                      21, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Column-Family Databases',                 22, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'Graph Databases',                         23, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_modern, 'When to Choose SQL vs NoSQL',             24, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_modern, 'OLTP vs OLAP',                            25, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 11: Database Design & Interview Practice ──────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'Database Design & Interview Practice', 11)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 11
  RETURNING id INTO v_top_design_practice;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_design_practice, 'Design an E-Commerce Database',              1,  'NOT_STARTED', 'HIGH',   60, '[]'::jsonb),
    (v_top_design_practice, 'Design a Social Media Database',             2,  'NOT_STARTED', 'HIGH',   60, '[]'::jsonb),
    (v_top_design_practice, 'Identify Entities',                          3,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_design_practice, 'Identify Relationships',                     4,  'NOT_STARTED', 'HIGH',   25, '[]'::jsonb),
    (v_top_design_practice, 'Choose Primary Keys',                        5,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_design_practice, 'Choose Foreign Keys',                        6,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb),
    (v_top_design_practice, 'Normalize a Real-World Schema',              7,  'NOT_STARTED', 'HIGH',   60, '[]'::jsonb),
    (v_top_design_practice, 'Decide Where Indexes Are Required',          8,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_design_practice, 'Identify Database Performance Bottlenecks',  9,  'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_design_practice, 'Normalization vs Denormalization',           10, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_design_practice, 'Indexing Trade-offs',                        11, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_design_practice, 'SQL vs NoSQL Design Decision',               12, 'NOT_STARTED', 'HIGH',   30, '[]'::jsonb),
    (v_top_design_practice, 'Explain Database Design and Trade-offs',     13, 'NOT_STARTED', 'HIGH',   45, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── Mark subject as seeded ──────────────────────────────────────────────────
  UPDATE public.subjects
  SET dbms_seeded = TRUE
  WHERE id = p_subject_id AND user_id = p_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
