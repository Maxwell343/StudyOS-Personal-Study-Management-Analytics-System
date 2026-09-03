# StudyOS Database Architecture & Supabase Setup

This directory contains the **reproducible PostgreSQL database migrations, Row-Level Security policies, and curriculum seed logic** for StudyOS.

The database is hosted on **Supabase PostgreSQL** and is designed around a normalized relational model with explicit ownership boundaries, secure data access, and a single source of truth for learning progress.

---

## 1. Database Architecture

StudyOS follows a hierarchical learning model:

**Profile → Subject → Topic → Learning Item**

Planning and execution are modeled separately:

**Study Plan → Planned Session → Study Session**

Actionable work is represented through:

**Learning Item → Tasks**

### Core Tables

| Table              | Purpose                                                                        | Primary Key | Parent / Ownership Reference                 |
| ------------------ | ------------------------------------------------------------------------------ | ----------- | -------------------------------------------- |
| `profiles`         | Application-level metadata for authenticated users                             | `id (UUID)` | `auth.users(id)`                             |
| `subjects`         | Top-level learning domains such as DSA, Java, ML, and SQL                      | `id (UUID)` | `profiles(id)`                               |
| `topics`           | Chapters, modules, and sub-domains within a subject                            | `id (UUID)` | `subjects(id)`                               |
| `learning_items`   | **Single source of truth** for learning objectives, tasks, and progress state  | `id (UUID)` | `topics(id)`                                 |
| `study_plans`      | Daily study-planning record; one plan per user per day                         | `id (UUID)` | `profiles(id)`                               |
| `planned_sessions` | Scheduled time blocks associated with specific learning items                  | `id (UUID)` | `study_plans(id)`, `learning_items(id)`      |
| `tasks`            | Actionable checklist items associated with learning items                      | `id (UUID)` | `learning_items(id)`                         |
| `study_sessions`   | Historical record of actual study activity and timestamps                      | `id (UUID)` | `planned_sessions(id)`, `learning_items(id)` |
| `activity_logs`    | Append-oriented event timeline used for activity tracking and JARVIS analytics | `id (UUID)` | `profiles(id)`                               |

### Architectural Principle

`learning_items` is intentionally treated as the **single source of truth for learning state**.

Planning, tasks, and historical study activity reference learning items rather than maintaining independent copies of learning progress. This prevents state duplication and keeps progress calculations consistent across the application.

---

## 2. Data Ownership & Row-Level Security

StudyOS uses **PostgreSQL Row-Level Security (RLS)** to enforce user-level data isolation directly at the database layer.

Application-level authorization should therefore be treated as an additional layer, not the primary security boundary.

### 2.1 Direct User-Owned Entities

The following tables contain an explicit `user_id` ownership column:

* `profiles`
* `subjects`
* `study_plans`
* `planned_sessions`
* `tasks`
* `study_sessions`
* `activity_logs`

Their RLS policies enforce access using:

```sql
auth.uid() = user_id
```

This ensures that an authenticated user can only access rows belonging to their own account.

---

### 2.2 Nested Entities

`topics` and `learning_items` derive ownership through their parent hierarchy.

For example, access to a topic is authorized by verifying ownership of its parent subject:

```sql
EXISTS (
    SELECT 1
    FROM public.subjects
    WHERE subjects.id = topics.subject_id
      AND subjects.user_id = auth.uid()
)
```

The same ownership model is applied to `learning_items` through the corresponding subject hierarchy.

Conceptually:

```text
auth.users
    │
    ▼
profiles
    │
    ▼
subjects
    │
    ▼
topics
    │
    ▼
learning_items
```

This prevents users from accessing nested resources by directly manipulating UUIDs or bypassing application-level relationships.

---

## 3. Migration Strategy

All schema changes should be committed as **versioned SQL migrations**.

Current initialization migration:

```text
supabase/migrations/
└── 20260808000000_init_studyos_schema.sql
```

The migration should be treated as the canonical definition of the StudyOS database schema.

### Recommended Workflow

1. Create a new migration for every schema change.
2. Never modify an already-applied migration in a shared or production environment.
3. Apply migrations through the Supabase CLI or migration pipeline for reproducible deployments.
4. Use the Supabase SQL Editor primarily for development, inspection, and controlled manual operations.
5. Keep seed logic separate from schema migrations.

---

## 4. Applying the Initial Schema

### Option A — Supabase Dashboard

1. Open the Supabase project.
2. Navigate to **SQL Editor**.
3. Create a new SQL query.
4. Execute:

```text
supabase/migrations/20260808000000_init_studyos_schema.sql
```

5. Verify that the expected tables, indexes, constraints, and RLS policies were created successfully.
6. Execute `supabase/seed.sql` to install the curriculum seeding function.

### Option B — Supabase CLI

For local development and CI/CD, prefer the Supabase CLI migration workflow.

Apply pending migrations using the project's configured migration process rather than manually executing individual schema files.

This keeps development, staging, and production environments synchronized.

---

## 5. Curriculum Seeding

StudyOS provides a database-level seeding function for provisioning the foundational curriculum for an authenticated user.

The default curriculum contains:

* **Data Structures & Algorithms (DSA)**
* **Java**
* **Machine Learning**
* **SQL**

After the schema and seed function have been installed, execute:

```sql
SELECT public.seed_user_curriculum(
    '<AUTHENTICATED_USER_UUID>'
);
```

Replace `<AUTHENTICATED_USER_UUID>` with the UUID associated with the target authenticated user.

### Example

```sql
SELECT public.seed_user_curriculum(
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
);
```

The seeding operation provisions the curriculum hierarchy without generating artificial study activity.

### Important

Curriculum provisioning **does not create fake study history or fabricated performance metrics**.

A newly provisioned user therefore starts with a clean behavioral baseline:

```text
Curriculum
    ├── Subjects
    ├── Topics
    └── Learning Items

Study History
    └── Empty / Zero
```

Actual study metrics begin accumulating only when the user performs real study activity.

---

## 6. Expected Data Lifecycle

A typical learning workflow follows this model:

```text
User
 │
 ├── Subject
 │    └── Topic
 │         └── Learning Item
 │              └── Tasks
 │
 └── Study Plan
      └── Planned Session
           │
           └── Learning Item
                │
                └── Study Session
                     │
                     └── Activity Log
```

This separation allows StudyOS to distinguish between:

* **What the user needs to learn** — `learning_items`
* **What the user plans to study** — `study_plans`, `planned_sessions`
* **What actions the user needs to complete** — `tasks`
* **What the user actually studied** — `study_sessions`
* **What happened over time** — `activity_logs`

---

## 7. Security Model

The database should be considered secure only when all of the following are enforced:

* RLS is enabled on every user-owned table.
* Policies validate ownership using `auth.uid()`.
* Nested resources validate ownership through their parent hierarchy.
* Foreign keys enforce referential integrity.
* UUIDs are used for externally addressable records.
* Client applications never bypass RLS using privileged database credentials.
* Service-role credentials remain server-side and are never exposed to the client.

The Supabase service role should be treated as a **privileged backend credential** and must never be embedded in frontend code.

---

## 8. Reproducibility

The repository should contain everything required to recreate the StudyOS database from scratch:

```text
supabase/
├── migrations/
│   └── 20260808000000_init_studyos_schema.sql
│
└── seed.sql
```

The migration files define:

* Database tables
* Primary keys
* Foreign keys
* Constraints
* Indexes
* RLS configuration
* RLS policies
* Database functions required by the application

The seed file defines curriculum provisioning logic without introducing artificial user activity.

A fresh Supabase project should therefore be reproducible from the repository without relying on undocumented manual database changes.

---

## 9. Source of Truth

The following hierarchy should be maintained as an architectural invariant:

> **Schema migrations are the source of truth for database structure.**
> **`learning_items` is the source of truth for learning state.**
> **`study_sessions` is the source of truth for actual study behavior.**
> **`activity_logs` is the source of truth for the chronological activity/event stream.**

Application code should consume and update these sources rather than maintaining independent representations of the same state.

---

## 10. Initial Setup Checklist

Before connecting the StudyOS application to the database, verify:

* [ ] Supabase project is configured.
* [ ] Initial schema migration has been applied.
* [ ] All expected tables exist.
* [ ] Foreign-key relationships are valid.
* [ ] RLS is enabled on user-owned tables.
* [ ] RLS policies correctly enforce user ownership.
* [ ] `seed_user_curriculum()` exists.
* [ ] Curriculum seeding has been tested with a development account.
* [ ] No synthetic study history is generated during provisioning.
* [ ] Service-role credentials are stored only on trusted backend infrastructure.
* [ ] Migrations are committed to version control.
* [ ] Production schema changes are applied through the migration workflow.

---

## 11. Production Recommendation

For production environments, the recommended workflow is:

```text
Developer
   │
   ▼
Create SQL Migration
   │
   ▼
Local Supabase
   │
   ▼
Test Schema + RLS
   │
   ▼
Commit Migration
   │
   ▼
CI/CD
   │
   ▼
Staging
   │
   ▼
Production Supabase
```

Avoid making undocumented production-only schema changes through the dashboard. Every structural change should be represented by a version-controlled migration so the database can be reconstructed and audited reliably.

---

**StudyOS database architecture is therefore centered around three principles:**

1. **Normalized relational data** — clear ownership and referential integrity.
2. **Database-enforced security** — RLS prevents cross-user data access.
3. **Reproducible infrastructure** — migrations and seed functions keep environments consistent.
