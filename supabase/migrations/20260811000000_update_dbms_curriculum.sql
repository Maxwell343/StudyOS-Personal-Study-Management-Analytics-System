-- ==============================================================================
-- StudyOS DBMS Curriculum Update Migration (140 Lectures across 11 Modules)
-- Version: 20260811000000
-- Description:
--   Updates seed_dbms_curriculum(p_user_id, p_subject_id) to seed the new 
--   140-lecture, 11-module DBMS syllabus with exact lecture titles and durations.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.seed_dbms_curriculum(
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
  v_top_m8 UUID;
  v_top_m9 UUID;
  v_top_m10 UUID;
  v_top_m11 UUID;
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
        'MODULE 1 — DBMS Fundamentals & Keys',
        'MODULE 2 — ER Model',
        'MODULE 3 — Normalization & Functional Dependencies',
        'MODULE 4 — Joins & Relational Algebra',
        'MODULE 5 — SQL',
        'MODULE 6 — Transactions & Concurrency Control',
        'MODULE 7 — Indexing & B/B+ Trees',
        'MODULE 8 — Database Recovery',
        'MODULE 9 — PL/SQL & Database Objects',
        'MODULE 10 — Advanced DBMS',
        'MODULE 11 — Interview & Extra SQL/PL-SQL'
      )
  );

  DELETE FROM public.topics
  WHERE subject_id = p_subject_id
    AND name NOT IN (
      'MODULE 1 — DBMS Fundamentals & Keys',
      'MODULE 2 — ER Model',
      'MODULE 3 — Normalization & Functional Dependencies',
      'MODULE 4 — Joins & Relational Algebra',
      'MODULE 5 — SQL',
      'MODULE 6 — Transactions & Concurrency Control',
      'MODULE 7 — Indexing & B/B+ Trees',
      'MODULE 8 — Database Recovery',
      'MODULE 9 — PL/SQL & Database Objects',
      'MODULE 10 — Advanced DBMS',
      'MODULE 11 — Interview & Extra SQL/PL-SQL'
    );

  -- ── MODULE 1 — DBMS Fundamentals & Keys ───────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 1 — DBMS Fundamentals & Keys', 1)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 1
  RETURNING id INTO v_top_m1;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m1, 'Lec 1: DBMS Syllabus & Overview',      1,  'NOT_STARTED', 'MEDIUM', 23, '[]'::jsonb),
    (v_top_m1, 'Lec 2: Introduction to DBMS',         2,  'NOT_STARTED', 'MEDIUM', 17, '[]'::jsonb),
    (v_top_m1, 'Lec 3: File System vs DBMS',          3,  'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m1, 'Lec 4: 2-Tier & 3-Tier Architecture', 4,  'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m1, 'Lec 5: Schema',                       5,  'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb),
    (v_top_m1, 'Lec 6: Three Schema Architecture',    6,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_m1, 'Lec 7: Data Independence',            7,  'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_m1, 'Lec 8: Integrity Constraints',        8,  'NOT_STARTED', 'MEDIUM', 12, '[]'::jsonb),
    (v_top_m1, 'Lec 9: Candidate Key & Primary Key',  9,  'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb),
    (v_top_m1, 'Lec 10: Primary Key',                 10, 'NOT_STARTED', 'MEDIUM', 17, '[]'::jsonb),
    (v_top_m1, 'Lec 11: Foreign Key',                 11, 'NOT_STARTED', 'MEDIUM', 14, '[]'::jsonb),
    (v_top_m1, 'Lec 12: Referential Integrity',       12, 'NOT_STARTED', 'MEDIUM', 23, '[]'::jsonb),
    (v_top_m1, 'Lec 13: Foreign Key Questions',       13, 'NOT_STARTED', 'MEDIUM', 14, '[]'::jsonb),
    (v_top_m1, 'Lec 14: ON DELETE CASCADE',           14, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m1, 'Lec 15: Super Key',                   15, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 2 — ER Model ───────────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 2 — ER Model', 2)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 2
  RETURNING id INTO v_top_m2;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m2, 'Lec 16: Introduction to ER Model',      1, 'NOT_STARTED', 'MEDIUM', 14, '[]'::jsonb),
    (v_top_m2, 'Lec 17: Types of Attributes',           2, 'NOT_STARTED', 'MEDIUM', 19, '[]'::jsonb),
    (v_top_m2, 'Lec 18: One-to-One Relationship',       3, 'NOT_STARTED', 'MEDIUM', 22, '[]'::jsonb),
    (v_top_m2, 'Lec 19: One-to-Many Relationship',      4, 'NOT_STARTED', 'MEDIUM', 19, '[]'::jsonb),
    (v_top_m2, 'Lec 20: Many-to-Many Relationship',     5, 'NOT_STARTED', 'MEDIUM', 16, '[]'::jsonb),
    (v_top_m2, 'Lec 21: Weak Entity Set',               6, 'NOT_STARTED', 'MEDIUM', 17, '[]'::jsonb),
    (v_top_m2, 'Lec 22: Minimizing Tables in ER Model', 7, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m2, 'Lec 23: Important ER Model Questions',  8, 'NOT_STARTED', 'MEDIUM', 14, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 3 — Normalization & Functional Dependencies ────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 3 — Normalization & Functional Dependencies', 3)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 3
  RETURNING id INTO v_top_m3;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m3, 'Lec 24: Normalization & Anomalies',                     1,  'NOT_STARTED', 'HIGH', 18, '[]'::jsonb),
    (v_top_m3, 'Lec 25: 1NF',                                           2,  'NOT_STARTED', 'HIGH', 13, '[]'::jsonb),
    (v_top_m3, 'Lec 26: Closure of Functional Dependency',              3,  'NOT_STARTED', 'HIGH', 23, '[]'::jsonb),
    (v_top_m3, 'Lec 27: Functional Dependency & Properties',            4,  'NOT_STARTED', 'HIGH', 22, '[]'::jsonb),
    (v_top_m3, 'Lec 28: 2NF',                                           5,  'NOT_STARTED', 'HIGH', 23, '[]'::jsonb),
    (v_top_m3, 'Lec 29: 3NF',                                           6,  'NOT_STARTED', 'HIGH', 21, '[]'::jsonb),
    (v_top_m3, 'Lec 30: BCNF',                                          7,  'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m3, 'Lec 31: BCNF & Dependency Preservation',                8,  'NOT_STARTED', 'HIGH', 15, '[]'::jsonb),
    (v_top_m3, 'Lec 32: Lossless/Lossy Decomposition & 5NF',            9,  'NOT_STARTED', 'HIGH', 27, '[]'::jsonb),
    (v_top_m3, 'Lec 33: All Normal Forms',                              10, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m3, 'Lec 34: Minimal/Canonical Cover',                       11, 'NOT_STARTED', 'HIGH', 14, '[]'::jsonb),
    (v_top_m3, 'Lec 35: Normalization Practice Questions',              12, 'NOT_STARTED', 'HIGH', 25, '[]'::jsonb),
    (v_top_m3, 'Lec 36: Finding Normal Form of Relation',               13, 'NOT_STARTED', 'HIGH', 29, '[]'::jsonb),
    (v_top_m3, 'Lec 37: Solving Normalization Questions',               14, 'NOT_STARTED', 'HIGH', 14, '[]'::jsonb),
    (v_top_m3, 'Lec 38: Important Normalization Questions',             15, 'NOT_STARTED', 'HIGH', 24, '[]'::jsonb),
    (v_top_m3, 'Lec 39: Normalization Schema Questions',                16, 'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m3, 'Lec 40: Cover & Equivalence of FDs',                    17, 'NOT_STARTED', 'HIGH', 18, '[]'::jsonb),
    (v_top_m3, 'Lec 41: Dependency Preserving Decomposition',           18, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m3, 'Lec 42: Dependency Preserving Decomposition — Example 2',19, 'NOT_STARTED', 'HIGH', 12, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 4 — Joins & Relational Algebra ─────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 4 — Joins & Relational Algebra', 4)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 4
  RETURNING id INTO v_top_m4;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m4, 'Lec 43: Introduction to Joins & Types',                 1,  'NOT_STARTED', 'MEDIUM', 16, '[]'::jsonb),
    (v_top_m4, 'Lec 44: Natural Join',                                  2,  'NOT_STARTED', 'MEDIUM', 21, '[]'::jsonb),
    (v_top_m4, 'Lec 45: Self Join',                                     3,  'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_m4, 'Lec 46: Equi Join',                                     4,  'NOT_STARTED', 'MEDIUM', 19, '[]'::jsonb),
    (v_top_m4, 'Lec 47: Left Outer Join',                               5,  'NOT_STARTED', 'MEDIUM', 13, '[]'::jsonb),
    (v_top_m4, 'Lec 48: Right Outer Join',                              6,  'NOT_STARTED', 'MEDIUM', 14, '[]'::jsonb),
    (v_top_m4, 'Lec 49: Inner/Left/Right/Full Outer Join Questions',    7,  'NOT_STARTED', 'MEDIUM', 9,  '[]'::jsonb),
    (v_top_m4, 'Lec 50: Introduction to Relational Algebra',            8,  'NOT_STARTED', 'MEDIUM', 9,  '[]'::jsonb),
    (v_top_m4, 'Lec 51: Projection',                                    9,  'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m4, 'Lec 52: Selection',                                     10, 'NOT_STARTED', 'MEDIUM', 12, '[]'::jsonb),
    (v_top_m4, 'Lec 53: Cartesian Product',                             11, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m4, 'Lec 54: Set Difference',                                12, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m4, 'Lec 55: Union',                                         13, 'NOT_STARTED', 'MEDIUM', 12, '[]'::jsonb),
    (v_top_m4, 'Lec 56: Division',                                      14, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_m4, 'Lec 57: Rename Operator',                               15, 'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m4, 'Lec 58: Tuple Calculus',                                16, 'NOT_STARTED', 'MEDIUM', 21, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 5 — SQL ────────────────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 5 — SQL', 5)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 5
  RETURNING id INTO v_top_m5;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m5, 'Lec 59: Introduction to SQL',                        1,  'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m5, 'Lec 60: DDL, DML, DCL, TCL & Constraints',             2,  'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m5, 'Lec 61: CREATE TABLE',                                 3,  'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m5, 'Lec 62: CREATE Command',                               4,  'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m5, 'Lec 63: ALTER Command',                                5,  'NOT_STARTED', 'HIGH', 18, '[]'::jsonb),
    (v_top_m5, 'Lec 64: ALTER vs UPDATE',                              6,  'NOT_STARTED', 'HIGH', 13, '[]'::jsonb),
    (v_top_m5, 'Lec 65: DELETE vs DROP vs TRUNCATE',                   7,  'NOT_STARTED', 'HIGH', 15, '[]'::jsonb),
    (v_top_m5, 'Lec 66: SQL Constraints',                              8,  'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m5, 'Lec 67: SQL Queries & Subqueries — Part 1',            9,  'NOT_STARTED', 'HIGH', 14, '[]'::jsonb),
    (v_top_m5, 'Lec 68: Nested Queries & 2nd Highest Salary',          10, 'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m5, 'Lec 69: GROUP BY',                                     11, 'NOT_STARTED', 'HIGH', 14, '[]'::jsonb),
    (v_top_m5, 'Lec 70: WITH / CTE',                                   12, 'NOT_STARTED', 'HIGH', 15, '[]'::jsonb),
    (v_top_m5, 'Lec 71: HAVING',                                       13, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m5, 'Lec 72: SQL Queries & Subqueries — Part 5',            14, 'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m5, 'Lec 73: IN / NOT IN',                                  15, 'NOT_STARTED', 'HIGH', 14, '[]'::jsonb),
    (v_top_m5, 'Lec 74: IN / NOT IN in Subquery',                      16, 'NOT_STARTED', 'HIGH', 15, '[]'::jsonb),
    (v_top_m5, 'Lec 75: EXISTS / NOT EXISTS',                          17, 'NOT_STARTED', 'HIGH', 19, '[]'::jsonb),
    (v_top_m5, 'Lec 76: LIKE',                                         18, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m5, 'Lec 77: SEQUENCE',                                     19, 'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m5, 'Lec 78: SQL Query Execution Order',                    20, 'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m5, 'Lec 79: Aggregate Functions',                          21, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m5, 'Lec 80: Aggregate Functions & NULL',                   22, 'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m5, 'Lec 81: Correlated Subquery',                          23, 'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m5, 'Lec 82: Non-Correlated Subquery',                      24, 'NOT_STARTED', 'HIGH', 23, '[]'::jsonb),
    (v_top_m5, 'Lec 83: Joins vs Nested vs Correlated Subquery',       25, 'NOT_STARTED', 'HIGH', 21, '[]'::jsonb),
    (v_top_m5, 'Lec 84: Nth Highest Salary',                           26, 'NOT_STARTED', 'HIGH', 18, '[]'::jsonb),
    (v_top_m5, 'Lec 85: Important SQL Questions',                      27, 'NOT_STARTED', 'HIGH', 15, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 6 — Transactions & Concurrency Control ─────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 6 — Transactions & Concurrency Control', 6)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 6
  RETURNING id INTO v_top_m6;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m6, 'Lec 86: Introduction to PL-SQL',                       1,  'NOT_STARTED', 'HIGH', 11, '[]'::jsonb),
    (v_top_m6, 'Lec 87: Transaction Concurrency',                      2,  'NOT_STARTED', 'HIGH', 18, '[]'::jsonb),
    (v_top_m6, 'Lec 88: ACID Properties',                              3,  'NOT_STARTED', 'HIGH', 19, '[]'::jsonb),
    (v_top_m6, 'Lec 89: Transaction States',                          4,  'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m6, 'Lec 90: Serial vs Parallel Schedule',                  5,  'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m6, 'Lec 91: Concurrency Problems',                         6,  'NOT_STARTED', 'HIGH', 10, '[]'::jsonb),
    (v_top_m6, 'Lec 92: Dirty Read / Write-Read Conflict',             7,  'NOT_STARTED', 'HIGH', 13, '[]'::jsonb),
    (v_top_m6, 'Lec 93: Read-Write Conflict / Unrepeatable Read',      8,  'NOT_STARTED', 'HIGH', 13, '[]'::jsonb),
    (v_top_m6, 'Lec 94: Recoverable vs Irrecoverable Schedule',       9,  'NOT_STARTED', 'HIGH', 11, '[]'::jsonb),
    (v_top_m6, 'Lec 95: Cascading vs Cascadeless Schedule',            10, 'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m6, 'Lec 96: Serializability',                              11, 'NOT_STARTED', 'HIGH', 14, '[]'::jsonb),
    (v_top_m6, 'Lec 97: Conflict Equivalent Schedules',                12, 'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m6, 'Lec 98: Conflict Serializability & Precedence Graph',   13, 'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m6, 'Lec 99: View Serializability',                         14, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m6, 'Lec 100: Shared & Exclusive Locking',                  15, 'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m6, 'Lec 101: Drawbacks of S/X Locking',                    16, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m6, 'Lec 102: 2-Phase Locking (2PL)',                       17, 'NOT_STARTED', 'HIGH', 15, '[]'::jsonb),
    (v_top_m6, 'Lec 103: Drawbacks of 2PL',                            18, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m6, 'Lec 104: Strict/Rigorous/Conservative 2PL',             19, 'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m6, 'Lec 105: Timestamp Ordering Protocol',                 20, 'NOT_STARTED', 'HIGH', 20, '[]'::jsonb),
    (v_top_m6, 'Lec 106: Timestamp Ordering Questions',                21, 'NOT_STARTED', 'HIGH', 18, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 7 — Indexing & B/B+ Trees ──────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 7 — Indexing & B/B+ Trees', 7)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 7
  RETURNING id INTO v_top_m7;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m7, 'Lec 107: Introduction to Indexing',             1,  'NOT_STARTED', 'HIGH', 15, '[]'::jsonb),
    (v_top_m7, 'Lec 108: I/O Cost in Indexing — Part 1',        2,  'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m7, 'Lec 109: I/O Cost in Indexing — Part 2',        3,  'NOT_STARTED', 'HIGH', 17, '[]'::jsonb),
    (v_top_m7, 'Lec 110: Types of Indexes',                     4,  'NOT_STARTED', 'HIGH', 10, '[]'::jsonb),
    (v_top_m7, 'Lec 111: Primary Index',                        5,  'NOT_STARTED', 'HIGH', 13, '[]'::jsonb),
    (v_top_m7, 'Lec 112: Clustered Index',                      6,  'NOT_STARTED', 'HIGH', 12, '[]'::jsonb),
    (v_top_m7, 'Lec 113: Secondary & Multilevel Indexing',      7,  'NOT_STARTED', 'HIGH', 18, '[]'::jsonb),
    (v_top_m7, 'Lec 114: B-Tree Structure',                     8,  'NOT_STARTED', 'HIGH', 15, '[]'::jsonb),
    (v_top_m7, 'Lec 115: B-Tree Insertion',                     9,  'NOT_STARTED', 'HIGH', 18, '[]'::jsonb),
    (v_top_m7, 'Lec 116: Order of B-Tree',                      10, 'NOT_STARTED', 'HIGH', 16, '[]'::jsonb),
    (v_top_m7, 'Lec 117: B-Tree vs B+Tree',                     11, 'NOT_STARTED', 'HIGH', 20, '[]'::jsonb),
    (v_top_m7, 'Lec 118: Order of B+Tree',                      12, 'NOT_STARTED', 'HIGH', 15, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 8 — Database Recovery ───────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 8 — Database Recovery', 8)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 8
  RETURNING id INTO v_top_m8;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m8, 'Lec 119: Immediate Database Modification / Log Recovery', 1, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m8, 'Lec 120: Deferred Database Modification / Log Recovery',  2, 'NOT_STARTED', 'MEDIUM', 16, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 9 — PL/SQL & Database Objects ──────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 9 — PL/SQL & Database Objects', 9)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 9
  RETURNING id INTO v_top_m9;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m9, 'Lec 121: Basic PL-SQL Programming',        1, 'NOT_STARTED', 'MEDIUM', 13, '[]'::jsonb),
    (v_top_m9, 'Lec 122: PL-SQL While & For Loops',        2, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m9, 'Lec 123: Single-Row & Multi-Row Functions',3, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m9, 'Lec 124: Character Functions',             4, 'NOT_STARTED', 'MEDIUM', 16, '[]'::jsonb),
    (v_top_m9, 'Lec 125: Views',                           5, 'NOT_STARTED', 'MEDIUM', 19, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 10 — Advanced DBMS ──────────────────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 10 — Advanced DBMS', 10)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 10
  RETURNING id INTO v_top_m10;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m10, 'Lec 126: RAID 0, 1, 4, 5, 6, RAID 10',                 1, 'NOT_STARTED', 'MEDIUM', 20, '[]'::jsonb),
    (v_top_m10, 'Lec 127: Database Objects',                           2, 'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m10, 'Lec 128: Important DBMS & Data Modelling Questions',  3, 'NOT_STARTED', 'MEDIUM', 16, '[]'::jsonb),
    (v_top_m10, 'Lec 129: Advanced DBMS, Big Data & Data Warehouse',   4, 'NOT_STARTED', 'MEDIUM', 15, '[]'::jsonb),
    (v_top_m10, 'Lec 130: Relational Algebra Questions',               5, 'NOT_STARTED', 'MEDIUM', 14, '[]'::jsonb),
    (v_top_m10, 'Lec 131: Codd''s 12 Rules of RDBMS',                  6, 'NOT_STARTED', 'MEDIUM', 19, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 11 — Interview & Extra SQL/PL-SQL ───────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 11 — Interview & Extra SQL/PL-SQL', 11)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 11
  RETURNING id INTO v_top_m11;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m11, 'Lec 132: Top 15 SQL Interview Questions',       1, 'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m11, 'Lec 133: Introduction to Hadoop',               2, 'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m11, 'Lec 134: Introduction to Big Data',              3, 'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m11, 'Lec 135: Simple vs Complex vs Materialized Views',4, 'NOT_STARTED', 'MEDIUM', 13, '[]'::jsonb),
    (v_top_m11, 'Lec 136: Procedures in PL-SQL',                 5, 'NOT_STARTED', 'MEDIUM', 12, '[]'::jsonb),
    (v_top_m11, 'Lec 137: Fetch Data Using Procedures',          6, 'NOT_STARTED', 'MEDIUM', 12, '[]'::jsonb),
    (v_top_m11, 'Lec 138: Cursor in PL-SQL',                     7, 'NOT_STARTED', 'MEDIUM', 17, '[]'::jsonb),
    (v_top_m11, 'Lec 139: %TYPE & %ROWTYPE',                     8, 'NOT_STARTED', 'MEDIUM', 14, '[]'::jsonb),
    (v_top_m11, 'Lec 140: Data Cleaning Using SQL Functions',    9, 'NOT_STARTED', 'MEDIUM', 12, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── Mark subject as seeded ──────────────────────────────────────────────────
  UPDATE public.subjects
  SET dbms_seeded = TRUE
  WHERE id = p_subject_id AND user_id = p_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
