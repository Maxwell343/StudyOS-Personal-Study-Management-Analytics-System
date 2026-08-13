-- ==============================================================================
-- StudyOS Computer Networks (CN) Curriculum Update Migration (43 Lectures across 6 Modules)
-- Version: 20260813000003
-- Description:
--   Updates seed_cn_curriculum(p_user_id, p_subject_id) to seed the new 
--   43-lecture CN syllabus with exact lecture titles and durations.
-- ==============================================================================

-- 1. Ensure cn_seeded flag exists on public.subjects
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS cn_seeded BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Stored Procedure for Seeding CN Curriculum
CREATE OR REPLACE FUNCTION public.seed_cn_curriculum(
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
        'MODULE 1 — Network Fundamentals & Architectures',
        'MODULE 2 — Reference Models & Hardware Devices',
        'MODULE 3 — Application Layer & Web Protocols',
        'MODULE 4 — Transport Layer & Reliable Transfer',
        'MODULE 5 — Network Layer & Addressing',
        'MODULE 6 — Data Link Layer & Network Interview Essentials'
      )
  );

  DELETE FROM public.topics
  WHERE subject_id = p_subject_id
    AND name NOT IN (
      'MODULE 1 — Network Fundamentals & Architectures',
      'MODULE 2 — Reference Models & Hardware Devices',
      'MODULE 3 — Application Layer & Web Protocols',
      'MODULE 4 — Transport Layer & Reliable Transfer',
      'MODULE 5 — Network Layer & Addressing',
      'MODULE 6 — Data Link Layer & Network Interview Essentials'
    );

  -- ── MODULE 1 — Network Fundamentals & Architectures ────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 1 — Network Fundamentals & Architectures', 1)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 1
  RETURNING id INTO v_top_m1;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m1, 'Lec 1: Introduction',                                                1,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m1, 'Lec 2: How it all started?',                                          2,  'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m1, 'Lec 3: Client-Server Architecture',                                   3,  'NOT_STARTED', 'HIGH',   9,  '[]'::jsonb),
    (v_top_m1, 'Lec 4: Protocols',                                                    4,  'NOT_STARTED', 'HIGH',   7,  '[]'::jsonb),
    (v_top_m1, 'Lec 5: How Data is Transferred? — IP Address',                       5,  'NOT_STARTED', 'HIGH',   15, '[]'::jsonb),
    (v_top_m1, 'Lec 6: Port Numbers',                                                 6,  'NOT_STARTED', 'HIGH',   13, '[]'::jsonb),
    (v_top_m1, 'Lec 7: Submarine Cables Map — Optical Fibre Cable',                   7,  'NOT_STARTED', 'MEDIUM', 11, '[]'::jsonb),
    (v_top_m1, 'Lec 8: LAN, MAN, WAN',                                                8,  'NOT_STARTED', 'MEDIUM', 9,  '[]'::jsonb),
    (v_top_m1, 'Lec 9: Modem, Router',                                                9,  'NOT_STARTED', 'HIGH',   8,  '[]'::jsonb),
    (v_top_m1, 'Lec 10: Network Topologies — Bus, Ring, Star, Tree, Mesh',            10, 'NOT_STARTED', 'HIGH',   11, '[]'::jsonb),
    (v_top_m1, 'Lec 11: Structure of the Network',                                    11, 'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 2 — Reference Models & Hardware Devices ─────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 2 — Reference Models & Hardware Devices', 2)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 2
  RETURNING id INTO v_top_m2;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m2, 'Lec 12: OSI Model — 7 Layers',                                       1,  'NOT_STARTED', 'HIGH',   27, '[]'::jsonb),
    (v_top_m2, 'Lec 13: TCP/IP Model — 5 Layers',                                    2,  'NOT_STARTED', 'HIGH',   14, '[]'::jsonb),
    (v_top_m2, 'Lec 14: Client-Server Architecture (Detailed)',                      3,  'NOT_STARTED', 'MEDIUM', 7,  '[]'::jsonb),
    (v_top_m2, 'Lec 15: Peer-to-Peer Architecture',                                  4,  'NOT_STARTED', 'MEDIUM', 8,  '[]'::jsonb),
    (v_top_m2, 'Lec 16: Networking Devices',                                         5,  'NOT_STARTED', 'HIGH',   12, '[]'::jsonb),
    (v_top_m2, 'Lec 17: Application Layer Protocols',                                6,  'NOT_STARTED', 'MEDIUM', 6,  '[]'::jsonb),
    (v_top_m2, 'Lec 18: Sockets',                                                    7,  'NOT_STARTED', 'HIGH',   7,  '[]'::jsonb),
    (v_top_m2, 'Lec 19: Ports',                                                      8,  'NOT_STARTED', 'HIGH',   12, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 3 — Application Layer & Web Protocols ───────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 3 — Application Layer & Web Protocols', 3)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 3
  RETURNING id INTO v_top_m3;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m3, 'Lec 20: HTTP',                                                       1,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m3, 'Lec 21: HTTP Methods — GET, POST, PUT, DELETE',                       2,  'NOT_STARTED', 'HIGH',   7,  '[]'::jsonb),
    (v_top_m3, 'Lec 22: HTTP Error / Status Codes',                                  3,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m3, 'Lec 23: Cookies',                                                    4,  'NOT_STARTED', 'MEDIUM', 13, '[]'::jsonb),
    (v_top_m3, 'Lec 24: How Email Works',                                            5,  'NOT_STARTED', 'MEDIUM', 18, '[]'::jsonb),
    (v_top_m3, 'Lec 25: DNS — Domain Name System',                                   6,  'NOT_STARTED', 'HIGH',   20, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 4 — Transport Layer & Reliable Transfer ─────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 4 — Transport Layer & Reliable Transfer', 4)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 4
  RETURNING id INTO v_top_m4;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m4, 'Lec 26: TCP/IP Model — Transport Layer',                            1,  'NOT_STARTED', 'HIGH',   6,  '[]'::jsonb),
    (v_top_m4, 'Lec 27: Checksum',                                                   2,  'NOT_STARTED', 'MEDIUM', 10, '[]'::jsonb),
    (v_top_m4, 'Lec 28: Timers',                                                     3,  'NOT_STARTED', 'MEDIUM', 13, '[]'::jsonb),
    (v_top_m4, 'Lec 29: UDP — User Datagram Protocol',                                4,  'NOT_STARTED', 'HIGH',   12, '[]'::jsonb),
    (v_top_m4, 'Lec 30: TCP — Transmission Control Protocol',                        5,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m4, 'Lec 31: TCP 3-Way Handshake ⭐',                                     6,  'NOT_STARTED', 'HIGH',   13, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 5 — Network Layer & Addressing ──────────────────────────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 5 — Network Layer & Addressing', 5)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 5
  RETURNING id INTO v_top_m5;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m5, 'Lec 32: TCP — Network Layer',                                        1,  'NOT_STARTED', 'HIGH',   8,  '[]'::jsonb),
    (v_top_m5, 'Lec 33: Control Plane',                                              2,  'NOT_STARTED', 'HIGH',   19, '[]'::jsonb),
    (v_top_m5, 'Lec 34: IP — Internet Protocol',                                     3,  'NOT_STARTED', 'HIGH',   8,  '[]'::jsonb),
    (v_top_m5, 'Lec 35: Packets',                                                    4,  'NOT_STARTED', 'MEDIUM', 13, '[]'::jsonb),
    (v_top_m5, 'Lec 36: IPv4 vs IPv6 ⭐',                                             5,  'NOT_STARTED', 'HIGH',   8,  '[]'::jsonb),
    (v_top_m5, 'Lec 37: Middle Boxes',                                               6,  'NOT_STARTED', 'MEDIUM', 9,  '[]'::jsonb),
    (v_top_m5, 'Lec 38: NAT — Network Address Translation',                          7,  'NOT_STARTED', 'HIGH',   5,  '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── MODULE 6 — Data Link Layer & Network Interview Essentials ──────────────
  INSERT INTO public.topics (subject_id, name, display_order)
  VALUES (p_subject_id, 'MODULE 6 — Data Link Layer & Network Interview Essentials', 6)
  ON CONFLICT (subject_id, name) DO UPDATE SET display_order = 6
  RETURNING id INTO v_top_m6;

  INSERT INTO public.learning_items (topic_id, title, display_order, status, priority, estimated_minutes, resources)
  VALUES
    (v_top_m6, 'Lec 39: TCP — Data Link Layer',                                      1,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m6, 'Lec 40: MAC Address vs IP Address ⭐',                                2,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m6, 'Lec 41: Hub vs Switch vs Router ⭐',                                  3,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m6, 'Lec 42: HTTP vs HTTPS ⭐',                                             4,  'NOT_STARTED', 'HIGH',   10, '[]'::jsonb),
    (v_top_m6, 'Lec 43: What Happens When You Enter a URL in a Browser? ⭐⭐⭐',        5,  'NOT_STARTED', 'HIGH',   15, '[]'::jsonb)
  ON CONFLICT (topic_id, title) DO NOTHING;

  -- ── Mark subject as seeded ──────────────────────────────────────────────────
  UPDATE public.subjects
  SET cn_seeded = TRUE
  WHERE id = p_subject_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
