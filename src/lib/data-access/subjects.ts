import { supabase } from "@/lib/supabase/client";
import { formatErrorMessage } from "@/lib/utils";
import type {
  Subject,
  Topic,
  LearningItem,
  LearningItemStatus,
  LearningItemPriority,
  LearningItemResource,
} from "@/types/subjects";
import type { Database, Json } from "@/lib/supabase/database.types";

type DbSubject = Database["public"]["Tables"]["subjects"]["Row"];
type DbTopic = Database["public"]["Tables"]["topics"]["Row"];
type DbLearningItem = Database["public"]["Tables"]["learning_items"]["Row"];

interface DbTopicWithItems extends DbTopic {
  learning_items: DbLearningItem[];
}

interface DbSubjectWithHierarchy extends DbSubject {
  topics: DbTopicWithItems[];
}

// ── Mappers ──────────────────────────────────────────────────────────────────

function mapDbItemToAppItem(dbItem: DbLearningItem): LearningItem {
  let resources: LearningItemResource[] = [];
  try {
    if (Array.isArray(dbItem.resources)) {
      resources = dbItem.resources as unknown as LearningItemResource[];
    }
  } catch {
    resources = [];
  }

  return {
    id: dbItem.id,
    topicId: dbItem.topic_id,
    title: dbItem.title,
    description: dbItem.description || undefined,
    status: dbItem.status as LearningItemStatus,
    priority: dbItem.priority as LearningItemPriority,
    estimatedMinutes: dbItem.estimated_minutes,
    notes: dbItem.notes || undefined,
    resources,
    completedAt: dbItem.completed_at || undefined,
    lastStudiedAt: dbItem.last_studied_at || undefined,
    order: dbItem.display_order,
  };
}

function mapDbTopicToAppTopic(dbTopic: DbTopicWithItems): Topic {
  const sortedItems = (dbTopic.learning_items || [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(mapDbItemToAppItem);

  return {
    id: dbTopic.id,
    subjectId: dbTopic.subject_id,
    name: dbTopic.name,
    description: dbTopic.description || undefined,
    order: dbTopic.display_order,
    learningItems: sortedItems,
  };
}

function mapDbSubjectToAppSubject(dbSubject: DbSubjectWithHierarchy): Subject {
  const sortedTopics = (dbSubject.topics || [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(mapDbTopicToAppTopic);

  return {
    id: dbSubject.id,
    name: dbSubject.name,
    description: dbSubject.description || "",
    category: dbSubject.category,
    color: dbSubject.color,
    targetDate: dbSubject.target_date || undefined,
    archived: dbSubject.archived,
    topics: sortedTopics,
  };
}

// ── Query Functions ──────────────────────────────────────────────────────────

/**
 * Fetch all active subjects and their nested topics and learning items for a user.
 */
export async function fetchSubjectsForUser(userId: string): Promise<Subject[]> {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select(`
        *,
        topics (
          *,
          learning_items (*)
        )
      `)
      .eq("user_id", userId)
      .eq("archived", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching subjects:", formatErrorMessage(error), error);
      return [];
    }

    const subjectsHierarchy = (data || []) as unknown as DbSubjectWithHierarchy[];

    let needsReFetch = false;
    for (const sub of subjectsHierarchy) {
      const totalItems = (sub.topics || []).reduce(
        (acc, t) => acc + (t.learning_items?.length || 0),
        0
      );

      const nameLower = sub.name.toLowerCase().trim();
      if (nameLower.includes("python") && (totalItems < 39 || (sub.topics || []).length < 9)) {
        try {
          await seedPythonCurriculumInDb(userId, sub.id);
          needsReFetch = true;
        } catch (err) {
          console.error("Error auto-seeding Python curriculum in fetchSubjectsForUser:", formatErrorMessage(err), err);
        }
      } else if (
        (nameLower.includes("dbms") || nameLower.includes("database management systems")) &&
        (totalItems < 140 || (sub.topics || []).length < 11)
      ) {
        try {
          await seedDbmsCurriculumInDb(userId, sub.id);
          needsReFetch = true;
        } catch (err) {
          console.error("Error auto-seeding DBMS curriculum in fetchSubjectsForUser:", formatErrorMessage(err), err);
        }
      } else if (
        (nameLower.includes("sql") || nameLower.includes("structured query language")) &&
        (totalItems < 38 || (sub.topics || []).length < 7)
      ) {
        try {
          await seedSqlCurriculumInDb(userId, sub.id);
          needsReFetch = true;
        } catch (err) {
          console.error("Error auto-seeding SQL curriculum in fetchSubjectsForUser:", formatErrorMessage(err), err);
        }
      } else if (
        (nameLower.includes("oop") || nameLower.includes("object oriented programming")) &&
        (totalItems < 7 || (sub.topics || []).length < 7)
      ) {
        try {
          await seedOopCurriculumInDb(userId, sub.id);
          needsReFetch = true;
        } catch (err) {
          console.error("Error auto-seeding OOP curriculum in fetchSubjectsForUser:", formatErrorMessage(err), err);
        }
      } else if (
        (nameLower.includes("operating system") || nameLower.includes("operating systems") || nameLower === "os") &&
        (totalItems < 24 || (sub.topics || []).length < 5)
      ) {
        try {
          await seedOsCurriculumInDb(userId, sub.id);
          needsReFetch = true;
        } catch (err) {
          console.error("Error auto-seeding OS curriculum in fetchSubjectsForUser:", formatErrorMessage(err), err);
        }
      } else if (
        (nameLower.includes("computer network") || nameLower.includes("computer networking") || nameLower.includes("cn")) &&
        (totalItems < 43 || (sub.topics || []).length < 6)
      ) {
        try {
          await seedCnCurriculumInDb(userId, sub.id);
          needsReFetch = true;
        } catch (err) {
          console.error("Error auto-seeding CN curriculum in fetchSubjectsForUser:", formatErrorMessage(err), err);
        }
      }
    }

    if (needsReFetch) {
      const { data: refetched } = await supabase
        .from("subjects")
        .select(`
          *,
          topics (
            *,
            learning_items (*)
          )
        `)
        .eq("user_id", userId)
        .eq("archived", false)
        .order("created_at", { ascending: true });

      if (refetched) {
        return (refetched as unknown as DbSubjectWithHierarchy[]).map(mapDbSubjectToAppSubject);
      }
    }

    return subjectsHierarchy.map(mapDbSubjectToAppSubject);
  } catch (err) {
    console.error("Unexpected error in fetchSubjectsForUser:", formatErrorMessage(err), err);
    return [];
  }
}

/**
 * Fetch a single subject with full hierarchy by ID.
 */
export async function fetchSubjectById(userId: string, subjectId: string): Promise<Subject | null> {
  const { data, error } = await supabase
    .from("subjects")
    .select(`
      *,
      topics (
        *,
        learning_items (*)
      )
    `)
    .eq("user_id", userId)
    .eq("id", subjectId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subject by id:", formatErrorMessage(error), error);
    return null;
  }

  if (!data) return null;

  const rawSub = data as unknown as DbSubjectWithHierarchy;
  const totalItems = (rawSub.topics || []).reduce(
    (acc, t) => acc + (t.learning_items?.length || 0),
    0
  );

  const nameLower = rawSub.name.toLowerCase().trim();
  if (nameLower.includes("python") && (totalItems < 39 || (rawSub.topics || []).length < 9)) {
    try {
      await seedPythonCurriculumInDb(userId, subjectId);
      const { data: refetched } = await supabase
        .from("subjects")
        .select(`
          *,
          topics (
            *,
            learning_items (*)
          )
        `)
        .eq("user_id", userId)
        .eq("id", subjectId)
        .maybeSingle();

      if (refetched) {
        return mapDbSubjectToAppSubject(refetched as unknown as DbSubjectWithHierarchy);
      }
    } catch (err) {
      console.error("Error auto-seeding Python in fetchSubjectById:", err);
    }
  } else if (
    (nameLower.includes("dbms") || nameLower.includes("database management systems")) &&
    (totalItems < 140 || (rawSub.topics || []).length < 11)
  ) {
    try {
      await seedDbmsCurriculumInDb(userId, subjectId);
      const { data: refetched } = await supabase
        .from("subjects")
        .select(`
          *,
          topics (
            *,
            learning_items (*)
          )
        `)
        .eq("user_id", userId)
        .eq("id", subjectId)
        .maybeSingle();

      if (refetched) {
        return mapDbSubjectToAppSubject(refetched as unknown as DbSubjectWithHierarchy);
      }
    } catch (err) {
      console.error("Error auto-seeding DBMS in fetchSubjectById:", err);
    }
  } else if (
    (nameLower.includes("sql") || nameLower.includes("structured query language")) &&
    (totalItems < 38 || (rawSub.topics || []).length < 7)
  ) {
    try {
      await seedSqlCurriculumInDb(userId, subjectId);
      const { data: refetched } = await supabase
        .from("subjects")
        .select(`
          *,
          topics (
            *,
            learning_items (*)
          )
        `)
        .eq("user_id", userId)
        .eq("id", subjectId)
        .maybeSingle();

      if (refetched) {
        return mapDbSubjectToAppSubject(refetched as unknown as DbSubjectWithHierarchy);
      }
    } catch (err) {
      console.error("Error auto-seeding SQL in fetchSubjectById:", err);
    }
  } else if (
    (nameLower.includes("oop") || nameLower.includes("object oriented programming")) &&
    (totalItems < 7 || (rawSub.topics || []).length < 7)
  ) {
    try {
      await seedOopCurriculumInDb(userId, subjectId);
      const { data: refetched } = await supabase
        .from("subjects")
        .select(`
          *,
          topics (
            *,
            learning_items (*)
          )
        `)
        .eq("user_id", userId)
        .eq("id", subjectId)
        .maybeSingle();

      if (refetched) {
        return mapDbSubjectToAppSubject(refetched as unknown as DbSubjectWithHierarchy);
      }
    } catch (err) {
      console.error("Error auto-seeding OOP in fetchSubjectById:", err);
    }
  } else if (
    (nameLower.includes("operating system") || nameLower.includes("operating systems") || nameLower === "os") &&
    (totalItems < 24 || (rawSub.topics || []).length < 5)
  ) {
    try {
      await seedOsCurriculumInDb(userId, subjectId);
      const { data: refetched } = await supabase
        .from("subjects")
        .select(`
          *,
          topics (
            *,
            learning_items (*)
          )
        `)
        .eq("user_id", userId)
        .eq("id", subjectId)
        .maybeSingle();

      if (refetched) {
        return mapDbSubjectToAppSubject(refetched as unknown as DbSubjectWithHierarchy);
      }
    } catch (err) {
      console.error("Error auto-seeding OS in fetchSubjectById:", err);
    }
  } else if (
    (nameLower.includes("computer network") || nameLower.includes("computer networking") || nameLower.includes("cn")) &&
    (totalItems < 43 || (rawSub.topics || []).length < 6)
  ) {
    try {
      await seedCnCurriculumInDb(userId, subjectId);
      const { data: refetched } = await supabase
        .from("subjects")
        .select(`
          *,
          topics (
            *,
            learning_items (*)
          )
        `)
        .eq("user_id", userId)
        .eq("id", subjectId)
        .maybeSingle();

      if (refetched) {
        return mapDbSubjectToAppSubject(refetched as unknown as DbSubjectWithHierarchy);
      }
    } catch (err) {
      console.error("Error auto-seeding CN in fetchSubjectById:", err);
    }
  }

  return mapDbSubjectToAppSubject(rawSub);
}

// ── Mutation Functions ───────────────────────────────────────────────────────

export async function createSubjectInDb(
  userId: string,
  subject: { name: string; description?: string; category?: string; color?: string; targetDate?: string }
): Promise<Subject> {
  const insertPayload: Database["public"]["Tables"]["subjects"]["Insert"] = {
    user_id: userId,
    name: subject.name,
    description: subject.description || null,
    category: subject.category || "General",
    color: subject.color || "#22d3ee",
    target_date: subject.targetDate || null,
  };

  const { data, error } = await supabase
    .from("subjects")
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  
  if (data) {
    const nLower = data.name.toLowerCase().trim();
    if (nLower.includes("python")) {
      try {
        await seedPythonCurriculumInDb(userId, data.id);
      } catch (sErr) {
        console.error("Error auto-seeding Python curriculum on subject creation:", sErr);
      }
    } else if (nLower.includes("sql") || nLower.includes("structured query language")) {
      try {
        await seedSqlCurriculumInDb(userId, data.id);
      } catch (sErr) {
        console.error("Error auto-seeding SQL curriculum on subject creation:", sErr);
      }
    } else if (nLower.includes("oop") || nLower.includes("object oriented programming")) {
      try {
        await seedOopCurriculumInDb(userId, data.id);
      } catch (sErr) {
        console.error("Error auto-seeding OOP curriculum on subject creation:", sErr);
      }
    } else if (nLower.includes("operating system") || nLower.includes("operating systems") || nLower === "os") {
      try {
        await seedOsCurriculumInDb(userId, data.id);
      } catch (sErr) {
        console.error("Error auto-seeding OS curriculum on subject creation:", sErr);
      }
    } else if (nLower.includes("computer network") || nLower.includes("computer networking") || nLower.includes("cn")) {
      try {
        await seedCnCurriculumInDb(userId, data.id);
      } catch (sErr) {
        console.error("Error auto-seeding CN curriculum on subject creation:", sErr);
      }
    }
  }

  return mapDbSubjectToAppSubject({
    ...data,
    topics: [],
  } as unknown as DbSubjectWithHierarchy);
}

export async function updateSubjectInDb(
  subjectId: string,
  updates: { name?: string; description?: string; category?: string; color?: string; targetDate?: string }
): Promise<void> {
  const updatePayload: Database["public"]["Tables"]["subjects"]["Update"] = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;
  if (updates.category !== undefined) updatePayload.category = updates.category;
  if (updates.color !== undefined) updatePayload.color = updates.color;
  if (updates.targetDate !== undefined) updatePayload.target_date = updates.targetDate || null;

  const { error } = await supabase
    .from("subjects")
    .update(updatePayload)
    .eq("id", subjectId);

  if (error) throw error;
}

export async function deleteSubjectInDb(subjectId: string): Promise<void> {
  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
  if (error) throw error;
}

export async function createTopicInDb(
  subjectId: string,
  topic: { name: string; description?: string; order?: number }
): Promise<Topic> {
  const insertPayload: Database["public"]["Tables"]["topics"]["Insert"] = {
    subject_id: subjectId,
    name: topic.name,
    description: topic.description || null,
    display_order: topic.order ?? 0,
  };

  const { data, error } = await supabase
    .from("topics")
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  
  return mapDbTopicToAppTopic({
    ...data,
    learning_items: [],
  } as unknown as DbTopicWithItems);
}

export async function updateTopicInDb(
  topicId: string,
  updates: { name?: string; description?: string; order?: number }
): Promise<void> {
  const updatePayload: Database["public"]["Tables"]["topics"]["Update"] = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.description !== undefined) updatePayload.description = updates.description;
  if (updates.order !== undefined) updatePayload.display_order = updates.order;

  const { error } = await supabase
    .from("topics")
    .update(updatePayload)
    .eq("id", topicId);

  if (error) throw error;
}

export async function deleteTopicInDb(topicId: string): Promise<void> {
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) throw error;
}

export async function createLearningItemInDb(
  topicId: string,
  item: {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    priority?: LearningItemPriority;
    status?: LearningItemStatus;
    resources?: LearningItemResource[];
    order?: number;
  }
): Promise<LearningItem> {
  const insertPayload: Database["public"]["Tables"]["learning_items"]["Insert"] = {
    topic_id: topicId,
    title: item.title,
    description: item.description || null,
    estimated_minutes: item.estimatedMinutes || 45,
    priority: item.priority || "MEDIUM",
    status: item.status || "NOT_STARTED",
    resources: (item.resources || []) as unknown as Json,
    display_order: item.order ?? 0,
  };

  const { data, error } = await supabase
    .from("learning_items")
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return mapDbItemToAppItem(data);
}

export async function updateLearningItemInDb(
  itemId: string,
  updates: {
    title?: string;
    description?: string;
    estimatedMinutes?: number;
    priority?: LearningItemPriority;
    status?: LearningItemStatus;
    resources?: LearningItemResource[];
    order?: number;
  }
): Promise<void> {
  const updatePayload: Database["public"]["Tables"]["learning_items"]["Update"] = {};
  if (updates.title !== undefined) updatePayload.title = updates.title;
  if (updates.description !== undefined) updatePayload.description = updates.description;
  if (updates.estimatedMinutes !== undefined) updatePayload.estimated_minutes = updates.estimatedMinutes;
  if (updates.priority !== undefined) updatePayload.priority = updates.priority;
  if (updates.status !== undefined) updatePayload.status = updates.status;
  if (updates.resources !== undefined) updatePayload.resources = updates.resources as unknown as Json;
  if (updates.order !== undefined) updatePayload.display_order = updates.order;

  const { error } = await supabase
    .from("learning_items")
    .update(updatePayload)
    .eq("id", itemId);

  if (error) throw error;
}

export async function deleteLearningItemInDb(itemId: string): Promise<void> {
  const { error } = await supabase.from("learning_items").delete().eq("id", itemId);
  if (error) throw error;
}

/**
 * Toggle learning item status between NOT_STARTED / IN_PROGRESS and COMPLETED.
 */
export async function toggleLearningItemCompletionInDb(
  itemId: string,
  currentStatus: LearningItemStatus,
  userId: string,
  subjectId?: string,
  itemTitle?: string
): Promise<LearningItemStatus> {
  const isCompleted = currentStatus === "COMPLETED";
  const newStatus: LearningItemStatus = isCompleted ? "NOT_STARTED" : "COMPLETED";
  const timestamp = isCompleted ? null : new Date().toISOString();

  const { error } = await supabase
    .from("learning_items")
    .update({
      status: newStatus,
      completed_at: timestamp,
      last_studied_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) throw error;

  // Insert activity log if marking completed
  if (newStatus === "COMPLETED") {
    const meta: Json = { title: itemTitle || "Learning Item" };
    await supabase.from("activity_logs").insert({
      user_id: userId,
      type: "LEARNING_ITEM_COMPLETED",
      learning_item_id: itemId,
      subject_id: subjectId || null,
      metadata: meta,
    });
  }

  return newStatus;
}

/**
 * Provision default curriculum (DSA, Java, ML, SQL) for an authenticated user.
 */
export async function seedCurriculumForUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc("seed_user_curriculum", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error seeding curriculum:", error);
    throw error;
  }
}

export const DBMS_CURRICULUM_DATA = [
  {
    name: "MODULE 1 — DBMS Fundamentals & Keys",
    items: [
      { title: "Lec 1: DBMS Syllabus & Overview", minutes: 23 },
      { title: "Lec 2: Introduction to DBMS", minutes: 17 },
      { title: "Lec 3: File System vs DBMS", minutes: 18 },
      { title: "Lec 4: 2-Tier & 3-Tier Architecture", minutes: 18 },
      { title: "Lec 5: Schema", minutes: 10 },
      { title: "Lec 6: Three Schema Architecture", minutes: 20 },
      { title: "Lec 7: Data Independence", minutes: 15 },
      { title: "Lec 8: Integrity Constraints", minutes: 12 },
      { title: "Lec 9: Candidate Key & Primary Key", minutes: 10 },
      { title: "Lec 10: Primary Key", minutes: 17 },
      { title: "Lec 11: Foreign Key", minutes: 14 },
      { title: "Lec 12: Referential Integrity", minutes: 23 },
      { title: "Lec 13: Foreign Key Questions", minutes: 14 },
      { title: "Lec 14: ON DELETE CASCADE", minutes: 11 },
      { title: "Lec 15: Super Key", minutes: 15 },
    ],
  },
  {
    name: "MODULE 2 — ER Model",
    items: [
      { title: "Lec 16: Introduction to ER Model", minutes: 14 },
      { title: "Lec 17: Types of Attributes", minutes: 19 },
      { title: "Lec 18: One-to-One Relationship", minutes: 22 },
      { title: "Lec 19: One-to-Many Relationship", minutes: 19 },
      { title: "Lec 20: Many-to-Many Relationship", minutes: 16 },
      { title: "Lec 21: Weak Entity Set", minutes: 17 },
      { title: "Lec 22: Minimizing Tables in ER Model", minutes: 11 },
      { title: "Lec 23: Important ER Model Questions", minutes: 14 },
    ],
  },
  {
    name: "MODULE 3 — Normalization & Functional Dependencies",
    items: [
      { title: "Lec 24: Normalization & Anomalies", minutes: 18, priority: "HIGH" },
      { title: "Lec 25: 1NF", minutes: 13, priority: "HIGH" },
      { title: "Lec 26: Closure of Functional Dependency", minutes: 23, priority: "HIGH" },
      { title: "Lec 27: Functional Dependency & Properties", minutes: 22, priority: "HIGH" },
      { title: "Lec 28: 2NF", minutes: 23, priority: "HIGH" },
      { title: "Lec 29: 3NF", minutes: 21, priority: "HIGH" },
      { title: "Lec 30: BCNF", minutes: 12, priority: "HIGH" },
      { title: "Lec 31: BCNF & Dependency Preservation", minutes: 15, priority: "HIGH" },
      { title: "Lec 32: Lossless/Lossy Decomposition & 5NF", minutes: 27, priority: "HIGH" },
      { title: "Lec 33: All Normal Forms", minutes: 16, priority: "HIGH" },
      { title: "Lec 34: Minimal/Canonical Cover", minutes: 14, priority: "HIGH" },
      { title: "Lec 35: Normalization Practice Questions", minutes: 25, priority: "HIGH" },
      { title: "Lec 36: Finding Normal Form of Relation", minutes: 29, priority: "HIGH" },
      { title: "Lec 37: Solving Normalization Questions", minutes: 14, priority: "HIGH" },
      { title: "Lec 38: Important Normalization Questions", minutes: 24, priority: "HIGH" },
      { title: "Lec 39: Normalization Schema Questions", minutes: 12, priority: "HIGH" },
      { title: "Lec 40: Cover & Equivalence of FDs", minutes: 18, priority: "HIGH" },
      { title: "Lec 41: Dependency Preserving Decomposition", minutes: 16, priority: "HIGH" },
      { title: "Lec 42: Dependency Preserving Decomposition — Example 2", minutes: 12, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 4 — Joins & Relational Algebra",
    items: [
      { title: "Lec 43: Introduction to Joins & Types", minutes: 16 },
      { title: "Lec 44: Natural Join", minutes: 21 },
      { title: "Lec 45: Self Join", minutes: 20 },
      { title: "Lec 46: Equi Join", minutes: 19 },
      { title: "Lec 47: Left Outer Join", minutes: 13 },
      { title: "Lec 48: Right Outer Join", minutes: 14 },
      { title: "Lec 49: Inner/Left/Right/Full Outer Join Questions", minutes: 9 },
      { title: "Lec 50: Introduction to Relational Algebra", minutes: 9 },
      { title: "Lec 51: Projection", minutes: 11 },
      { title: "Lec 52: Selection", minutes: 12 },
      { title: "Lec 53: Cartesian Product", minutes: 11 },
      { title: "Lec 54: Set Difference", minutes: 11 },
      { title: "Lec 55: Union", minutes: 12 },
      { title: "Lec 56: Division", minutes: 20 },
      { title: "Lec 57: Rename Operator", minutes: 18 },
      { title: "Lec 58: Tuple Calculus", minutes: 21 },
    ],
  },
  {
    name: "MODULE 5 — SQL",
    items: [
      { title: "Lec 59: Introduction to SQL", minutes: 17, priority: "HIGH" },
      { title: "Lec 60: DDL, DML, DCL, TCL & Constraints", minutes: 16, priority: "HIGH" },
      { title: "Lec 61: CREATE TABLE", minutes: 12, priority: "HIGH" },
      { title: "Lec 62: CREATE Command", minutes: 16, priority: "HIGH" },
      { title: "Lec 63: ALTER Command", minutes: 18, priority: "HIGH" },
      { title: "Lec 64: ALTER vs UPDATE", minutes: 13, priority: "HIGH" },
      { title: "Lec 65: DELETE vs DROP vs TRUNCATE", minutes: 15, priority: "HIGH" },
      { title: "Lec 66: SQL Constraints", minutes: 17, priority: "HIGH" },
      { title: "Lec 67: SQL Queries & Subqueries — Part 1", minutes: 14, priority: "HIGH" },
      { title: "Lec 68: Nested Queries & 2nd Highest Salary", minutes: 17, priority: "HIGH" },
      { title: "Lec 69: GROUP BY", minutes: 14, priority: "HIGH" },
      { title: "Lec 70: WITH / CTE", minutes: 15, priority: "HIGH" },
      { title: "Lec 71: HAVING", minutes: 16, priority: "HIGH" },
      { title: "Lec 72: SQL Queries & Subqueries — Part 5", minutes: 17, priority: "HIGH" },
      { title: "Lec 73: IN / NOT IN", minutes: 14, priority: "HIGH" },
      { title: "Lec 74: IN / NOT IN in Subquery", minutes: 15, priority: "HIGH" },
      { title: "Lec 75: EXISTS / NOT EXISTS", minutes: 19, priority: "HIGH" },
      { title: "Lec 76: LIKE", minutes: 16, priority: "HIGH" },
      { title: "Lec 77: SEQUENCE", minutes: 12, priority: "HIGH" },
      { title: "Lec 78: SQL Query Execution Order", minutes: 12, priority: "HIGH" },
      { title: "Lec 79: Aggregate Functions", minutes: 16, priority: "HIGH" },
      { title: "Lec 80: Aggregate Functions & NULL", minutes: 12, priority: "HIGH" },
      { title: "Lec 81: Correlated Subquery", minutes: 17, priority: "HIGH" },
      { title: "Lec 82: Non-Correlated Subquery", minutes: 23, priority: "HIGH" },
      { title: "Lec 83: Joins vs Nested vs Correlated Subquery", minutes: 21, priority: "HIGH" },
      { title: "Lec 84: Nth Highest Salary", minutes: 18, priority: "HIGH" },
      { title: "Lec 85: Important SQL Questions", minutes: 15, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 6 — Transactions & Concurrency Control",
    items: [
      { title: "Lec 86: Introduction to PL-SQL", minutes: 11, priority: "HIGH" },
      { title: "Lec 87: Transaction Concurrency", minutes: 18, priority: "HIGH" },
      { title: "Lec 88: ACID Properties", minutes: 19, priority: "HIGH" },
      { title: "Lec 89: Transaction States", minutes: 17, priority: "HIGH" },
      { title: "Lec 90: Serial vs Parallel Schedule", minutes: 16, priority: "HIGH" },
      { title: "Lec 91: Concurrency Problems", minutes: 10, priority: "HIGH" },
      { title: "Lec 92: Dirty Read / Write-Read Conflict", minutes: 13, priority: "HIGH" },
      { title: "Lec 93: Read-Write Conflict / Unrepeatable Read", minutes: 13, priority: "HIGH" },
      { title: "Lec 94: Recoverable vs Irrecoverable Schedule", minutes: 11, priority: "HIGH" },
      { title: "Lec 95: Cascading vs Cascadeless Schedule", minutes: 17, priority: "HIGH" },
      { title: "Lec 96: Serializability", minutes: 14, priority: "HIGH" },
      { title: "Lec 97: Conflict Equivalent Schedules", minutes: 12, priority: "HIGH" },
      { title: "Lec 98: Conflict Serializability & Precedence Graph", minutes: 17, priority: "HIGH" },
      { title: "Lec 99: View Serializability", minutes: 16, priority: "HIGH" },
      { title: "Lec 100: Shared & Exclusive Locking", minutes: 12, priority: "HIGH" },
      { title: "Lec 101: Drawbacks of S/X Locking", minutes: 16, priority: "HIGH" },
      { title: "Lec 102: 2-Phase Locking (2PL)", minutes: 15, priority: "HIGH" },
      { title: "Lec 103: Drawbacks of 2PL", minutes: 16, priority: "HIGH" },
      { title: "Lec 104: Strict/Rigorous/Conservative 2PL", minutes: 17, priority: "HIGH" },
      { title: "Lec 105: Timestamp Ordering Protocol", minutes: 20, priority: "HIGH" },
      { title: "Lec 106: Timestamp Ordering Questions", minutes: 18, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 7 — Indexing & B/B+ Trees",
    items: [
      { title: "Lec 107: Introduction to Indexing", minutes: 15, priority: "HIGH" },
      { title: "Lec 108: I/O Cost in Indexing — Part 1", minutes: 17, priority: "HIGH" },
      { title: "Lec 109: I/O Cost in Indexing — Part 2", minutes: 17, priority: "HIGH" },
      { title: "Lec 110: Types of Indexes", minutes: 10, priority: "HIGH" },
      { title: "Lec 111: Primary Index", minutes: 13, priority: "HIGH" },
      { title: "Lec 112: Clustered Index", minutes: 12, priority: "HIGH" },
      { title: "Lec 113: Secondary & Multilevel Indexing", minutes: 18, priority: "HIGH" },
      { title: "Lec 114: B-Tree Structure", minutes: 15, priority: "HIGH" },
      { title: "Lec 115: B-Tree Insertion", minutes: 18, priority: "HIGH" },
      { title: "Lec 116: Order of B-Tree", minutes: 16, priority: "HIGH" },
      { title: "Lec 117: B-Tree vs B+Tree", minutes: 20, priority: "HIGH" },
      { title: "Lec 118: Order of B+Tree", minutes: 15, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 8 — Database Recovery",
    items: [
      { title: "Lec 119: Immediate Database Modification / Log Recovery", minutes: 11 },
      { title: "Lec 120: Deferred Database Modification / Log Recovery", minutes: 16 },
    ],
  },
  {
    name: "MODULE 9 — PL/SQL & Database Objects",
    items: [
      { title: "Lec 121: Basic PL-SQL Programming", minutes: 13 },
      { title: "Lec 122: PL-SQL While & For Loops", minutes: 11 },
      { title: "Lec 123: Single-Row & Multi-Row Functions", minutes: 11 },
      { title: "Lec 124: Character Functions", minutes: 16 },
      { title: "Lec 125: Views", minutes: 19 },
    ],
  },
  {
    name: "MODULE 10 — Advanced DBMS",
    items: [
      { title: "Lec 126: RAID 0, 1, 4, 5, 6, RAID 10", minutes: 20 },
      { title: "Lec 127: Database Objects", minutes: 11 },
      { title: "Lec 128: Important DBMS & Data Modelling Questions", minutes: 16 },
      { title: "Lec 129: Advanced DBMS, Big Data & Data Warehouse", minutes: 15 },
      { title: "Lec 130: Relational Algebra Questions", minutes: 14 },
      { title: "Lec 131: Codd's 12 Rules of RDBMS", minutes: 19 },
    ],
  },
  {
    name: "MODULE 11 — Interview & Extra SQL/PL-SQL",
    items: [
      { title: "Lec 132: Top 15 SQL Interview Questions", minutes: 18 },
      { title: "Lec 133: Introduction to Hadoop", minutes: 18 },
      { title: "Lec 134: Introduction to Big Data", minutes: 18 },
      { title: "Lec 135: Simple vs Complex vs Materialized Views", minutes: 13 },
      { title: "Lec 136: Procedures in PL-SQL", minutes: 12 },
      { title: "Lec 137: Fetch Data Using Procedures", minutes: 12 },
      { title: "Lec 138: Cursor in PL-SQL", minutes: 17 },
      { title: "Lec 139: %TYPE & %ROWTYPE", minutes: 14 },
      { title: "Lec 140: Data Cleaning Using SQL Functions", minutes: 12 },
    ],
  },
];

/**
 * Seed the DBMS curriculum into an existing DBMS subject.
 * Safe and idempotent: tries RPC first; falls back to client-side table queries
 * if the RPC function has not been created on Supabase.
 */
export async function seedDbmsCurriculumInDb(
  userId: string,
  subjectId: string
): Promise<void> {
  // 1. Try RPC seeding if available on server
  try {
    const { error: rpcError } = await supabase.rpc("seed_dbms_curriculum", {
      p_user_id: userId,
      p_subject_id: subjectId,
    });

    if (!rpcError) {
      return;
    }
  } catch {
    // Ignore and proceed to client-side fallback
  }

  // 2. Client-side idempotent fallback seeding
  const { data: existingTopics } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId);

  const topicList = existingTopics || [];
  const validModuleNames = new Set(DBMS_CURRICULUM_DATA.map((m) => m.name.toLowerCase().trim()));

  // Remove outdated topics from previous schema versions if present
  const outdatedTopics = topicList.filter(
    (t) => !validModuleNames.has(t.name.toLowerCase().trim())
  );
  if (outdatedTopics.length > 0) {
    const outdatedIds = outdatedTopics.map((t) => t.id);
    await supabase.from("learning_items").delete().in("topic_id", outdatedIds);
    await supabase.from("topics").delete().in("id", outdatedIds);
  }

  const activeTopicList = topicList.filter((t) =>
    validModuleNames.has(t.name.toLowerCase().trim())
  );
  const topicIds = activeTopicList.map((t) => t.id);

  let existingItems: Database["public"]["Tables"]["learning_items"]["Row"][] = [];
  if (topicIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("learning_items")
      .select("*")
      .in("topic_id", topicIds);
    existingItems = itemsData || [];
  }

  for (let topicIdx = 0; topicIdx < DBMS_CURRICULUM_DATA.length; topicIdx++) {
    const mod = DBMS_CURRICULUM_DATA[topicIdx];

    // Find existing topic by name
    let topicId = "";
    const matchedTopic = activeTopicList.find(
      (t) => t.name.toLowerCase().trim() === mod.name.toLowerCase().trim()
    );

    if (matchedTopic) {
      topicId = matchedTopic.id;
    } else {
      const { data: newTopic, error: tErr } = await supabase
        .from("topics")
        .insert({
          subject_id: subjectId,
          name: mod.name,
          display_order: topicIdx + 1,
        })
        .select()
        .single();

      if (tErr || !newTopic) {
        console.error("Error creating DBMS topic fallback:", mod.name, tErr);
        continue;
      }
      topicId = newTopic.id;
      activeTopicList.push(newTopic);
    }

    const currentTopicItems = existingItems.filter((li) => li.topic_id === topicId);
    const itemsToInsert = [];

    for (let itemIdx = 0; itemIdx < mod.items.length; itemIdx++) {
      const itemDef = mod.items[itemIdx];
      const itemTitle = typeof itemDef === "string" ? itemDef : itemDef.title;
      const itemMinutes = typeof itemDef === "string" ? 20 : itemDef.minutes;
      const itemPriority = (typeof itemDef === "object" && "priority" in itemDef && itemDef.priority) || "MEDIUM";

      const exists = currentTopicItems.some(
        (li) => li.title.toLowerCase().trim() === itemTitle.toLowerCase().trim()
      );

      if (!exists) {
        itemsToInsert.push({
          topic_id: topicId,
          title: itemTitle,
          display_order: itemIdx + 1,
          status: "NOT_STARTED" as const,
          priority: itemPriority as "LOW" | "MEDIUM" | "HIGH",
          estimated_minutes: itemMinutes,
          resources: [] as unknown as Json,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: iErr } = await supabase
        .from("learning_items")
        .insert(itemsToInsert);

      if (iErr) {
        console.error("Error inserting DBMS learning items fallback for:", mod.name, iErr);
      }
    }
  }

  // Mark subject as seeded
  await supabase
    .from("subjects")
    .update({ dbms_seeded: true })
    .eq("id", subjectId);
}

export const SQL_CURRICULUM_DATA = [
  {
    name: "MODULE 1 — SQL & Database Fundamentals",
    items: [
      { title: "Lec 1: Introduction to SQL", minutes: 7, priority: "HIGH" },
      { title: "Lec 2: What is Database?", minutes: 5, priority: "MEDIUM" },
      { title: "Lec 3: Types of Databases", minutes: 7, priority: "MEDIUM" },
      { title: "Lec 4: Installation of MySQL", minutes: 9, priority: "MEDIUM" },
      { title: "Lec 5: Database Structure", minutes: 10, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 2 — Database & Table Basics",
    items: [
      { title: "Lec 6: What is Table?", minutes: 6, priority: "MEDIUM" },
      { title: "Lec 7: Creating our First Database", minutes: 7, priority: "HIGH" },
      { title: "Lec 8: Creating our First Table", minutes: 11, priority: "HIGH" },
      { title: "Lec 9: SQL Datatypes", minutes: 12, priority: "HIGH" },
      { title: "Lec 10: Types of SQL Commands", minutes: 8, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 3 — Queries & Data Manipulation",
    items: [
      { title: "Lec 11: Database Related Queries", minutes: 9, priority: "MEDIUM" },
      { title: "Lec 12: Table Related Queries", minutes: 8, priority: "MEDIUM" },
      { title: "Lec 13: SELECT Command", minutes: 6, priority: "HIGH" },
      { title: "Lec 14: INSERT Command", minutes: 11, priority: "HIGH" },
      { title: "Lec 15: Practice Questions", minutes: 10, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 4 — Keys, Constraints & Filtering",
    items: [
      { title: "Lec 16: Keys", minutes: 10, priority: "HIGH" },
      { title: "Lec 17: Constraints", minutes: 17, priority: "HIGH" },
      { title: "Lec 18: SELECT Command in Detail", minutes: 7, priority: "HIGH" },
      { title: "Lec 19: WHERE Clause", minutes: 11, priority: "HIGH" },
      { title: "Lec 20: Operators", minutes: 10, priority: "MEDIUM" },
      { title: "Lec 21: LIMIT Clause", minutes: 9, priority: "MEDIUM" },
      { title: "Lec 22: ORDER BY Clause", minutes: 6, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 5 — Aggregations & Grouping",
    items: [
      { title: "Lec 23: Aggregate Functions", minutes: 8, priority: "HIGH" },
      { title: "Lec 24: GROUP BY Clause", minutes: 10, priority: "HIGH" },
      { title: "Lec 25: Practice Questions", minutes: 11, priority: "HIGH" },
      { title: "Lec 26: HAVING Clause", minutes: 9, priority: "HIGH" },
      { title: "Lec 27: General Order of Commands", minutes: 8, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 6 — Data Modification & Schema Updates",
    items: [
      { title: "Lec 28: UPDATE Command", minutes: 11, priority: "HIGH" },
      { title: "Lec 29: DELETE Command", minutes: 7, priority: "HIGH" },
      { title: "Lec 30: Revisiting Foreign Keys", minutes: 13, priority: "HIGH" },
      { title: "Lec 31: Cascading Foreign Keys", minutes: 11, priority: "HIGH" },
      { title: "Lec 32: ALTER Command", minutes: 8, priority: "HIGH" },
      { title: "Lec 33: CHANGE and MODIFY Commands", minutes: 10, priority: "MEDIUM" },
      { title: "Lec 34: TRUNCATE Command", minutes: 8, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 7 — Joins, Subqueries & Views",
    items: [
      { title: "Lec 35: JOINS in SQL", minutes: 32, priority: "HIGH" },
      { title: "Lec 36: UNION in SQL", minutes: 8, priority: "MEDIUM" },
      { title: "Lec 37: SQL Sub Queries", minutes: 23, priority: "HIGH" },
      { title: "Lec 38: MySQL Views", minutes: 23, priority: "HIGH" },
    ],
  },
];

/**
 * Seed the SQL curriculum into an existing SQL subject.
 * Safe and idempotent: tries RPC first; falls back to client-side table queries.
 */
export async function seedSqlCurriculumInDb(
  userId: string,
  subjectId: string
): Promise<void> {
  try {
    const { error: rpcError } = await supabase.rpc("seed_sql_curriculum", {
      p_user_id: userId,
      p_subject_id: subjectId,
    });

    if (!rpcError) {
      return;
    }
  } catch {
    // Ignore and proceed to client-side fallback
  }

  const { data: existingTopics } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId);

  const topicList = existingTopics || [];
  const validModuleNames = new Set(SQL_CURRICULUM_DATA.map((m) => m.name.toLowerCase().trim()));

  const outdatedTopics = topicList.filter(
    (t) => !validModuleNames.has(t.name.toLowerCase().trim())
  );
  if (outdatedTopics.length > 0) {
    const outdatedIds = outdatedTopics.map((t) => t.id);
    await supabase.from("learning_items").delete().in("topic_id", outdatedIds);
    await supabase.from("topics").delete().in("id", outdatedIds);
  }

  const topicIds = topicList.map((t) => t.id);
  let existingItems: Database["public"]["Tables"]["learning_items"]["Row"][] = [];
  if (topicIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("learning_items")
      .select("*")
      .in("topic_id", topicIds);
    existingItems = itemsData || [];
  }

  for (let topicIdx = 0; topicIdx < SQL_CURRICULUM_DATA.length; topicIdx++) {
    const mod = SQL_CURRICULUM_DATA[topicIdx];

    let topicId = "";
    const matchedTopic = topicList.find(
      (t) => t.name.toLowerCase().trim() === mod.name.toLowerCase().trim()
    );

    if (matchedTopic) {
      topicId = matchedTopic.id;
    } else {
      const { data: newTopic, error: tErr } = await supabase
        .from("topics")
        .insert({
          subject_id: subjectId,
          name: mod.name,
          display_order: topicIdx + 1,
        })
        .select()
        .single();

      if (tErr || !newTopic) {
        console.error("Error creating SQL topic fallback:", mod.name, tErr);
        continue;
      }
      topicId = newTopic.id;
      topicList.push(newTopic);
    }

    const currentTopicItems = existingItems.filter((li) => li.topic_id === topicId);
    const itemsToInsert = [];

    for (let itemIdx = 0; itemIdx < mod.items.length; itemIdx++) {
      const itemDef = mod.items[itemIdx];
      const exists = currentTopicItems.some(
        (li) => li.title.toLowerCase().trim() === itemDef.title.toLowerCase().trim()
      );

      if (!exists) {
        itemsToInsert.push({
          topic_id: topicId,
          title: itemDef.title,
          display_order: itemIdx + 1,
          status: "NOT_STARTED" as const,
          priority: (itemDef.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
          estimated_minutes: itemDef.minutes,
          resources: [] as unknown as Json,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: iErr } = await supabase
        .from("learning_items")
        .insert(itemsToInsert);

      if (iErr) {
        console.error("Error inserting SQL learning items for:", mod.name, iErr);
      }
    }
  }

  await supabase
    .from("subjects")
    .update({ sql_seeded: true })
    .eq("id", subjectId);
}

export const OOP_CURRICULUM_DATA = [
  {
    name: "MODULE 1 — Introduction & Concepts",
    items: [
      { title: "OOP 1 — Introduction & Concepts: Classes, Objects, Constructors, Keywords", minutes: 107, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 2 — Packages, Static & Singleton",
    items: [
      { title: "OOP 2 — Packages, Static, Singleton Class, In-built Methods", minutes: 84, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 3 — OOP Principles",
    items: [
      { title: "OOP 3 — Principles: Inheritance, Polymorphism, Encapsulation, Abstraction", minutes: 138, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 4 — Access Control & Object Class",
    items: [
      { title: "OOP 4 — Access Control, In-built Packages, Object Class", minutes: 56, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 5 — Abstract Classes & Interfaces",
    items: [
      { title: "OOP 5 — Abstract Classes, Interfaces, Annotations", minutes: 76, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 6 — Generics & Exception Handling",
    items: [
      { title: "OOP 6 — Generics, Custom ArrayList, Lambda Expressions, Exception Handling, Object Cloning", minutes: 97, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 7 — Collections Framework & Enums",
    items: [
      { title: "OOP 7 — Collections Framework, Vector Class, Enums in Java", minutes: 32, priority: "MEDIUM" },
    ],
  },
];

/**
 * Seed the OOP curriculum into an existing OOP subject.
 * Safe and idempotent: tries RPC first; falls back to client-side table queries.
 */
export async function seedOopCurriculumInDb(
  userId: string,
  subjectId: string
): Promise<void> {
  try {
    const { error: rpcError } = await supabase.rpc("seed_oop_curriculum", {
      p_user_id: userId,
      p_subject_id: subjectId,
    });

    if (!rpcError) {
      return;
    }
  } catch {
    // Ignore and proceed to client-side fallback
  }

  const { data: existingTopics } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId);

  const topicList = existingTopics || [];
  const validModuleNames = new Set(OOP_CURRICULUM_DATA.map((m) => m.name.toLowerCase().trim()));

  const outdatedTopics = topicList.filter(
    (t) => !validModuleNames.has(t.name.toLowerCase().trim())
  );
  if (outdatedTopics.length > 0) {
    const outdatedIds = outdatedTopics.map((t) => t.id);
    await supabase.from("learning_items").delete().in("topic_id", outdatedIds);
    await supabase.from("topics").delete().in("id", outdatedIds);
  }

  const topicIds = topicList.map((t) => t.id);
  let existingItems: Database["public"]["Tables"]["learning_items"]["Row"][] = [];
  if (topicIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("learning_items")
      .select("*")
      .in("topic_id", topicIds);
    existingItems = itemsData || [];
  }

  for (let topicIdx = 0; topicIdx < OOP_CURRICULUM_DATA.length; topicIdx++) {
    const mod = OOP_CURRICULUM_DATA[topicIdx];

    let topicId = "";
    const matchedTopic = topicList.find(
      (t) => t.name.toLowerCase().trim() === mod.name.toLowerCase().trim()
    );

    if (matchedTopic) {
      topicId = matchedTopic.id;
    } else {
      const { data: newTopic, error: tErr } = await supabase
        .from("topics")
        .insert({
          subject_id: subjectId,
          name: mod.name,
          display_order: topicIdx + 1,
        })
        .select()
        .single();

      if (tErr || !newTopic) {
        console.error("Error creating OOP topic fallback:", mod.name, tErr);
        continue;
      }
      topicId = newTopic.id;
      topicList.push(newTopic);
    }

    const currentTopicItems = existingItems.filter((li) => li.topic_id === topicId);
    const itemsToInsert = [];

    for (let itemIdx = 0; itemIdx < mod.items.length; itemIdx++) {
      const itemDef = mod.items[itemIdx];
      const exists = currentTopicItems.some(
        (li) => li.title.toLowerCase().trim() === itemDef.title.toLowerCase().trim()
      );

      if (!exists) {
        itemsToInsert.push({
          topic_id: topicId,
          title: itemDef.title,
          display_order: itemIdx + 1,
          status: "NOT_STARTED" as const,
          priority: (itemDef.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
          estimated_minutes: itemDef.minutes,
          resources: [] as unknown as Json,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: iErr } = await supabase
        .from("learning_items")
        .insert(itemsToInsert);

      if (iErr) {
        console.error("Error inserting OOP learning items for:", mod.name, iErr);
      }
    }
  }

  await supabase
    .from("subjects")
    .update({ oop_seeded: true })
    .eq("id", subjectId);
}

export const OS_CURRICULUM_DATA = [
  {
    name: "MODULE 1 — OS Fundamentals & Process Basics",
    items: [
      { title: "Lec 1: Introduction", minutes: 6, priority: "MEDIUM" },
      { title: "Lec 2: What is an Operating System & Types of OS", minutes: 7, priority: "HIGH" },
      { title: "Lec 3: Process vs Threads vs Programs", minutes: 9, priority: "HIGH" },
      { title: "Lec 4: Multiprogramming vs Multiprocess vs Multitasking vs Multithreading", minutes: 9, priority: "HIGH" },
      { title: "Lec 5: Various States of a Process", minutes: 9, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 2 — CPU Scheduling & Process Concurrency",
    items: [
      { title: "Lec 6: CPU Scheduling Algorithms", minutes: 9, priority: "HIGH" },
      { title: "Lec 7: Critical Section Problem", minutes: 8, priority: "HIGH" },
      { title: "Lec 8: Process Synchronisation", minutes: 9, priority: "HIGH" },
      { title: "Lec 9: Process Synchronisation Mechanisms", minutes: 8, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 3 — Deadlocks & System Isolation",
    items: [
      { title: "Lec 10: Deadlock", minutes: 9, priority: "HIGH" },
      { title: "Lec 11: Deadlock Handling Techniques", minutes: 9, priority: "HIGH" },
      { title: "Lec 22: Context Switching", minutes: 10, priority: "MEDIUM" },
      { title: "Lec 23: Mutex vs Semaphore", minutes: 10, priority: "HIGH" },
      { title: "Lec 24: User Mode vs Kernel Mode", minutes: 10, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 4 — Memory Management & Paging",
    items: [
      { title: "Lec 12: Memory Management", minutes: 7, priority: "HIGH" },
      { title: "Lec 13: First-fit, Best-fit, Worst-fit Algorithms", minutes: 9, priority: "HIGH" },
      { title: "Lec 14: Paging", minutes: 9, priority: "HIGH" },
      { title: "Lec 15: Virtual Memory", minutes: 9, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 5 — Page Replacement & Storage Management",
    items: [
      { title: "Lec 16: Page Replacement Algorithms", minutes: 13, priority: "HIGH" },
      { title: "Lec 17: Thrashing", minutes: 8, priority: "MEDIUM" },
      { title: "Lec 18: Segmentation", minutes: 8, priority: "MEDIUM" },
      { title: "Lec 19: Disk Management", minutes: 8, priority: "MEDIUM" },
      { title: "Lec 20: Disk Scheduling Algorithms", minutes: 10, priority: "HIGH" },
      { title: "Lec 21: Quick Revision", minutes: 5, priority: "LOW" },
    ],
  },
];

/**
 * Seed the OS curriculum into an existing OS subject.
 * Safe and idempotent: tries RPC first; falls back to client-side table queries.
 */
export async function seedOsCurriculumInDb(
  userId: string,
  subjectId: string
): Promise<void> {
  try {
    const { error: rpcError } = await supabase.rpc("seed_os_curriculum", {
      p_user_id: userId,
      p_subject_id: subjectId,
    });

    if (!rpcError) {
      return;
    }
  } catch {
    // Ignore and proceed to client-side fallback
  }

  const { data: existingTopics } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId);

  const topicList = existingTopics || [];
  const validModuleNames = new Set(OS_CURRICULUM_DATA.map((m) => m.name.toLowerCase().trim()));

  const outdatedTopics = topicList.filter(
    (t) => !validModuleNames.has(t.name.toLowerCase().trim())
  );
  if (outdatedTopics.length > 0) {
    const outdatedIds = outdatedTopics.map((t) => t.id);
    await supabase.from("learning_items").delete().in("topic_id", outdatedIds);
    await supabase.from("topics").delete().in("id", outdatedIds);
  }

  const topicIds = topicList.map((t) => t.id);
  let existingItems: Database["public"]["Tables"]["learning_items"]["Row"][] = [];
  if (topicIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("learning_items")
      .select("*")
      .in("topic_id", topicIds);
    existingItems = itemsData || [];
  }

  for (let topicIdx = 0; topicIdx < OS_CURRICULUM_DATA.length; topicIdx++) {
    const mod = OS_CURRICULUM_DATA[topicIdx];

    let topicId = "";
    const matchedTopic = topicList.find(
      (t) => t.name.toLowerCase().trim() === mod.name.toLowerCase().trim()
    );

    if (matchedTopic) {
      topicId = matchedTopic.id;
    } else {
      const { data: newTopic, error: tErr } = await supabase
        .from("topics")
        .insert({
          subject_id: subjectId,
          name: mod.name,
          display_order: topicIdx + 1,
        })
        .select()
        .single();

      if (tErr || !newTopic) {
        console.error("Error creating OS topic fallback:", mod.name, tErr);
        continue;
      }
      topicId = newTopic.id;
      topicList.push(newTopic);
    }

    const currentTopicItems = existingItems.filter((li) => li.topic_id === topicId);
    const itemsToInsert = [];

    for (let itemIdx = 0; itemIdx < mod.items.length; itemIdx++) {
      const itemDef = mod.items[itemIdx];
      const exists = currentTopicItems.some(
        (li) => li.title.toLowerCase().trim() === itemDef.title.toLowerCase().trim()
      );

      if (!exists) {
        itemsToInsert.push({
          topic_id: topicId,
          title: itemDef.title,
          display_order: itemIdx + 1,
          status: "NOT_STARTED" as const,
          priority: (itemDef.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
          estimated_minutes: itemDef.minutes,
          resources: [] as unknown as Json,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: iErr } = await supabase
        .from("learning_items")
        .insert(itemsToInsert);

      if (iErr) {
        console.error("Error inserting OS learning items for:", mod.name, iErr);
      }
    }
  }

  await supabase
    .from("subjects")
    .update({ os_seeded: true })
    .eq("id", subjectId);
}

export const CN_CURRICULUM_DATA = [
  {
    name: "MODULE 1 — Network Fundamentals & Architectures",
    items: [
      { title: "Lec 1: Introduction", minutes: 10, priority: "HIGH" },
      { title: "Lec 2: How it all started?", minutes: 18, priority: "MEDIUM" },
      { title: "Lec 3: Client-Server Architecture", minutes: 9, priority: "HIGH" },
      { title: "Lec 4: Protocols", minutes: 7, priority: "HIGH" },
      { title: "Lec 5: How Data is Transferred? — IP Address", minutes: 15, priority: "HIGH" },
      { title: "Lec 6: Port Numbers", minutes: 13, priority: "HIGH" },
      { title: "Lec 7: Submarine Cables Map — Optical Fibre Cable", minutes: 11, priority: "MEDIUM" },
      { title: "Lec 8: LAN, MAN, WAN", minutes: 9, priority: "MEDIUM" },
      { title: "Lec 9: Modem, Router", minutes: 8, priority: "HIGH" },
      { title: "Lec 10: Network Topologies — Bus, Ring, Star, Tree, Mesh", minutes: 11, priority: "HIGH" },
      { title: "Lec 11: Structure of the Network", minutes: 10, priority: "MEDIUM" },
    ],
  },
  {
    name: "MODULE 2 — Reference Models & Hardware Devices",
    items: [
      { title: "Lec 12: OSI Model — 7 Layers", minutes: 27, priority: "HIGH" },
      { title: "Lec 13: TCP/IP Model — 5 Layers", minutes: 14, priority: "HIGH" },
      { title: "Lec 14: Client-Server Architecture (Detailed)", minutes: 7, priority: "MEDIUM" },
      { title: "Lec 15: Peer-to-Peer Architecture", minutes: 8, priority: "MEDIUM" },
      { title: "Lec 16: Networking Devices", minutes: 12, priority: "HIGH" },
      { title: "Lec 17: Application Layer Protocols", minutes: 6, priority: "MEDIUM" },
      { title: "Lec 18: Sockets", minutes: 7, priority: "HIGH" },
      { title: "Lec 19: Ports", minutes: 12, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 3 — Application Layer & Web Protocols",
    items: [
      { title: "Lec 20: HTTP", minutes: 10, priority: "HIGH" },
      { title: "Lec 21: HTTP Methods — GET, POST, PUT, DELETE", minutes: 7, priority: "HIGH" },
      { title: "Lec 22: HTTP Error / Status Codes", minutes: 10, priority: "HIGH" },
      { title: "Lec 23: Cookies", minutes: 13, priority: "MEDIUM" },
      { title: "Lec 24: How Email Works", minutes: 18, priority: "MEDIUM" },
      { title: "Lec 25: DNS — Domain Name System", minutes: 20, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 4 — Transport Layer & Reliable Transfer",
    items: [
      { title: "Lec 26: TCP/IP Model — Transport Layer", minutes: 6, priority: "HIGH" },
      { title: "Lec 27: Checksum", minutes: 10, priority: "MEDIUM" },
      { title: "Lec 28: Timers", minutes: 13, priority: "MEDIUM" },
      { title: "Lec 29: UDP — User Datagram Protocol", minutes: 12, priority: "HIGH" },
      { title: "Lec 30: TCP — Transmission Control Protocol", minutes: 10, priority: "HIGH" },
      { title: "Lec 31: TCP 3-Way Handshake ⭐", minutes: 13, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 5 — Network Layer & Addressing",
    items: [
      { title: "Lec 32: TCP — Network Layer", minutes: 8, priority: "HIGH" },
      { title: "Lec 33: Control Plane", minutes: 19, priority: "HIGH" },
      { title: "Lec 34: IP — Internet Protocol", minutes: 8, priority: "HIGH" },
      { title: "Lec 35: Packets", minutes: 13, priority: "MEDIUM" },
      { title: "Lec 36: IPv4 vs IPv6 ⭐", minutes: 8, priority: "HIGH" },
      { title: "Lec 37: Middle Boxes", minutes: 9, priority: "MEDIUM" },
      { title: "Lec 38: NAT — Network Address Translation", minutes: 5, priority: "HIGH" },
    ],
  },
  {
    name: "MODULE 6 — Data Link Layer & Network Interview Essentials",
    items: [
      { title: "Lec 39: TCP — Data Link Layer", minutes: 10, priority: "HIGH" },
      { title: "Lec 40: MAC Address vs IP Address ⭐", minutes: 10, priority: "HIGH" },
      { title: "Lec 41: Hub vs Switch vs Router ⭐", minutes: 10, priority: "HIGH" },
      { title: "Lec 42: HTTP vs HTTPS ⭐", minutes: 10, priority: "HIGH" },
      { title: "Lec 43: What Happens When You Enter a URL in a Browser? ⭐⭐⭐", minutes: 15, priority: "HIGH" },
    ],
  },
];

/**
 * Seed the CN curriculum into an existing CN subject.
 * Safe and idempotent: tries RPC first; falls back to client-side table queries.
 */
export async function seedCnCurriculumInDb(
  userId: string,
  subjectId: string
): Promise<void> {
  try {
    const { error: rpcError } = await supabase.rpc("seed_cn_curriculum", {
      p_user_id: userId,
      p_subject_id: subjectId,
    });

    if (!rpcError) {
      return;
    }
  } catch {
    // Ignore and proceed to client-side fallback
  }

  const { data: existingTopics } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId);

  const topicList = existingTopics || [];
  const validModuleNames = new Set(CN_CURRICULUM_DATA.map((m) => m.name.toLowerCase().trim()));

  const outdatedTopics = topicList.filter(
    (t) => !validModuleNames.has(t.name.toLowerCase().trim())
  );
  if (outdatedTopics.length > 0) {
    const outdatedIds = outdatedTopics.map((t) => t.id);
    await supabase.from("learning_items").delete().in("topic_id", outdatedIds);
    await supabase.from("topics").delete().in("id", outdatedIds);
  }

  const topicIds = topicList.map((t) => t.id);
  let existingItems: Database["public"]["Tables"]["learning_items"]["Row"][] = [];
  if (topicIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("learning_items")
      .select("*")
      .in("topic_id", topicIds);
    existingItems = itemsData || [];
  }

  for (let topicIdx = 0; topicIdx < CN_CURRICULUM_DATA.length; topicIdx++) {
    const mod = CN_CURRICULUM_DATA[topicIdx];

    let topicId = "";
    const matchedTopic = topicList.find(
      (t) => t.name.toLowerCase().trim() === mod.name.toLowerCase().trim()
    );

    if (matchedTopic) {
      topicId = matchedTopic.id;
    } else {
      const { data: newTopic, error: tErr } = await supabase
        .from("topics")
        .insert({
          subject_id: subjectId,
          name: mod.name,
          display_order: topicIdx + 1,
        })
        .select()
        .single();

      if (tErr || !newTopic) {
        console.error("Error creating CN topic fallback:", mod.name, tErr);
        continue;
      }
      topicId = newTopic.id;
      topicList.push(newTopic);
    }

    const currentTopicItems = existingItems.filter((li) => li.topic_id === topicId);
    const itemsToInsert = [];

    for (let itemIdx = 0; itemIdx < mod.items.length; itemIdx++) {
      const itemDef = mod.items[itemIdx];
      const exists = currentTopicItems.some(
        (li) => li.title.toLowerCase().trim() === itemDef.title.toLowerCase().trim()
      );

      if (!exists) {
        itemsToInsert.push({
          topic_id: topicId,
          title: itemDef.title,
          display_order: itemIdx + 1,
          status: "NOT_STARTED" as const,
          priority: (itemDef.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
          estimated_minutes: itemDef.minutes,
          resources: [] as unknown as Json,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: iErr } = await supabase
        .from("learning_items")
        .insert(itemsToInsert);

      if (iErr) {
        console.error("Error inserting CN learning items for:", mod.name, iErr);
      }
    }
  }

  await supabase
    .from("subjects")
    .update({ cn_seeded: true })
    .eq("id", subjectId);
}

export const PYTHON_CURRICULUM_DATA = [
  {
    name: "Python Basics",
    items: [
      { title: "Python Variables & Naming Rules", minutes: 16 },
      { title: "Python Data Types", minutes: 8 },
      { title: "Print Statement in Python", minutes: 15 },
      { title: "Type Conversion in Python", minutes: 16 },
      { title: "Escape Sequences", minutes: 12 },
      { title: "Python Operators", minutes: 30 },
    ],
  },
  {
    name: "Conditional Statements",
    items: [
      { title: "If Else Statements in Python", minutes: 32 },
    ],
  },
  {
    name: "Loops in Python",
    items: [
      { title: "While Loops", minutes: 42 },
      { title: "For Loops", minutes: 15 },
      { title: "Break & Continue", minutes: 16 },
      { title: "Pattern Questions in Python", minutes: 66 },
    ],
  },
  {
    name: "Functions in Python",
    items: [
      { title: "Introduction to Functions", minutes: 14 },
      { title: "Parameters & Arguments", minutes: 19 },
      { title: "Return Statements", minutes: 23 },
      { title: "Default & Keyword Arguments", minutes: 34 },
      { title: "Local vs Global Variables", minutes: 48 },
      { title: "Lambda Functions", minutes: 15 },
    ],
  },
  {
    name: "Python Lists",
    items: [
      { title: "Introduction to Lists", minutes: 23 },
      { title: "List Indexing", minutes: 20 },
      { title: "List Slicing", minutes: 20 },
      { title: "Looping Through Lists", minutes: 42 },
      { title: "List Methods in Python", minutes: 54 },
      { title: "List Comprehension", minutes: 22 },
      { title: "Lists & Matrix Questions", minutes: 34 },
    ],
  },
  {
    name: "Python Tuples",
    items: [
      { title: "Introduction to Tuples", minutes: 15 },
      { title: "Packing & Unpacking", minutes: 13 },
    ],
  },
  {
    name: "Python Dictionaries",
    items: [
      { title: "Introduction to Dictionaries", minutes: 25 },
      { title: "Looping Through Dictionaries", minutes: 38 },
      { title: "Sorting Dictionary using Lambda", minutes: 21 },
      { title: "Dictionary Comprehension", minutes: 16 },
    ],
  },
  {
    name: "Python Sets",
    items: [
      { title: "Introduction to Sets", minutes: 13 },
      { title: "Set Methods in Python", minutes: 15 },
    ],
  },
  {
    name: "Python Strings",
    items: [
      { title: "Introduction to Strings", minutes: 17 },
      { title: "String Indexing & Slicing", minutes: 6 },
      { title: "Looping Through Strings", minutes: 15 },
      { title: "String Functions in Python", minutes: 14 },
      { title: "Case Conversion Methods", minutes: 10 },
      { title: "Content Checking Methods", minutes: 13 },
      { title: "Split & Join in Python", minutes: 38 },
      { title: "Strip Method in Python", minutes: 15 },
    ],
  },
];

/**
 * Seed the Python curriculum into an existing Python subject.
 */
export async function seedPythonCurriculumInDb(
  userId: string,
  subjectId: string
): Promise<void> {
  const { data: existingTopics } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId);

  const topicList = existingTopics || [];
  const topicIds = topicList.map((t) => t.id);

  let existingItems: Database["public"]["Tables"]["learning_items"]["Row"][] = [];
  if (topicIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("learning_items")
      .select("*")
      .in("topic_id", topicIds);
    existingItems = itemsData || [];
  }

  for (let topicIdx = 0; topicIdx < PYTHON_CURRICULUM_DATA.length; topicIdx++) {
    const mod = PYTHON_CURRICULUM_DATA[topicIdx];

    let topicId = "";
    const matchedTopic = topicList.find(
      (t) => t.name.toLowerCase().trim() === mod.name.toLowerCase().trim()
    );

    if (matchedTopic) {
      topicId = matchedTopic.id;
    } else {
      const { data: newTopic, error: tErr } = await supabase
        .from("topics")
        .insert({
          subject_id: subjectId,
          name: mod.name,
          display_order: topicIdx + 1,
        })
        .select()
        .single();

      if (tErr || !newTopic) {
        console.error("Error creating Python topic fallback:", mod.name, tErr);
        continue;
      }
      topicId = newTopic.id;
      topicList.push(newTopic);
    }

    const currentTopicItems = existingItems.filter((li) => li.topic_id === topicId);
    const itemsToInsert = [];

    for (let itemIdx = 0; itemIdx < mod.items.length; itemIdx++) {
      const itemDef = mod.items[itemIdx];
      const exists = currentTopicItems.some(
        (li) => li.title.toLowerCase().trim() === itemDef.title.toLowerCase().trim()
      );

      if (!exists) {
        itemsToInsert.push({
          topic_id: topicId,
          title: itemDef.title,
          display_order: itemIdx + 1,
          status: "NOT_STARTED" as const,
          priority: "MEDIUM" as const,
          estimated_minutes: itemDef.minutes,
          resources: [] as unknown as Json,
        });
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: iErr } = await supabase
        .from("learning_items")
        .insert(itemsToInsert);

      if (iErr) {
        console.error("Error inserting Python learning items for:", mod.name, iErr);
      }
    }
  }
}

/**
 * Bulk-toggle all learning items in a topic to a specific status.
 * Performs a single Supabase UPDATE filtered by topic_id — not N individual calls.
 * Preserves RLS (the anon key client is used; RLS policies apply via topics→subjects→user_id chain).
 */
export async function bulkToggleLearningItemsInDb(
  topicId: string,
  newStatus: LearningItemStatus,
  userId: string,
  subjectId?: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const isCompleting = newStatus === "COMPLETED";

  const updatePayload: Database["public"]["Tables"]["learning_items"]["Update"] = {
    status: newStatus,
    last_studied_at: timestamp,
    completed_at: isCompleting ? timestamp : null,
  };

  const { error } = await supabase
    .from("learning_items")
    .update(updatePayload)
    .eq("topic_id", topicId);

  if (error) throw error;

  // Log a single summary activity entry (not one per item)
  if (isCompleting) {
    const meta: Json = {
      topic_id: topicId,
      action: "bulk_complete_topic",
    };
    await supabase.from("activity_logs").insert({
      user_id: userId,
      type: "TOPIC_BULK_COMPLETED",
      subject_id: subjectId || null,
      metadata: meta,
    });
  }
}
