# StudyOS Database Architecture & Supabase Setup

This directory contains the reproducible database schema migrations and curriculum seed scripts for StudyOS.

---

## 1. Schema Overview

StudyOS uses a normalized PostgreSQL relational database hosted on Supabase:

| Table | Description | Primary Key | Parent Reference |
| :--- | :--- | :--- | :--- |
| `profiles` | Authenticated user profile metadata | `id (UUID)` | `auth.users(id)` |
| `subjects` | Top-level learning domains (e.g. DSA, Java, ML, SQL) | `id (UUID)` | `profiles(id)` |
| `topics` | Sub-domains and modular chapters within a subject | `id (UUID)` | `subjects(id)` |
| `learning_items` | **Single Source of Truth** for learning tasks & status | `id (UUID)` | `topics(id)` |
| `study_plans` | Daily planning record (one per user per day) | `id (UUID)` | `profiles(id)` |
| `planned_sessions` | Scheduled time-blocks referencing specific learning items | `id (UUID)` | `study_plans(id)`, `learning_items(id)` |
| `tasks` | Actionable checklist items connected to learning items | `id (UUID)` | `learning_items(id)` |
| `study_sessions` | Actual historical study behavior with exact timestamps | `id (UUID)` | `planned_sessions(id)`, `learning_items(id)` |
| `activity_logs` | Event timeline for study activity & JARVIS analytics | `id (UUID)` | `profiles(id)` |

---

## 2. Row-Level Security (RLS) Rules

- **Direct User Entities**: `profiles`, `subjects`, `study_plans`, `planned_sessions`, `tasks`, `study_sessions`, `activity_logs` are protected via `auth.uid() = user_id`.
- **Nested Entities**: `topics` and `learning_items` enforce access through subject ownership joins:
  ```sql
  EXISTS (
    SELECT 1 FROM public.subjects
    WHERE subjects.id = topics.subject_id
    AND subjects.user_id = auth.uid()
  )
  ```

---

## 3. How to Apply Migrations

### Option A: Supabase Dashboard SQL Editor
1. Open your Supabase project: `https://cmniusglttkadvqgtjrx.supabase.co`.
2. Navigate to **SQL Editor** $\rightarrow$ **New Query**.
3. Copy the contents of `supabase/migrations/20260808000000_init_studyos_schema.sql` and run it.
4. Copy the contents of `supabase/seed.sql` and run it to define the seeding procedure.

### Option B: Seeding Curriculum for a User
To provision the complete foundational curriculum (DSA, Java, Machine Learning, SQL) for your authenticated user account:
```sql
SELECT public.seed_user_curriculum('<YOUR_AUTHENTICATED_USER_UUID>');
```
*(No fake study history is generated; real study metrics start cleanly at zero).*
