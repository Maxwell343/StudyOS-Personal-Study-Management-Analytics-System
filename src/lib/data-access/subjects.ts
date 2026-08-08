import { supabase } from "@/lib/supabase/client";
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
    console.error("Error fetching subjects:", error);
    throw error;
  }

  const subjectsHierarchy = (data || []) as unknown as DbSubjectWithHierarchy[];
  return subjectsHierarchy.map(mapDbSubjectToAppSubject);
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
    console.error("Error fetching subject by id:", error);
    throw error;
  }

  if (!data) return null;

  return mapDbSubjectToAppSubject(data as unknown as DbSubjectWithHierarchy);
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
  
  // Return the newly created subject with an empty topics array
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
