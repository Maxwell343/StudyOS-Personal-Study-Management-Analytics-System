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
        console.error("Error auto-seeding Python curriculum in fetchSubjectsForUser:", err);
      }
    } else if (
      (nameLower.includes("dbms") || nameLower.includes("database management systems")) &&
      totalItems === 0
    ) {
      try {
        await seedDbmsCurriculumInDb(userId, sub.id);
        needsReFetch = true;
      } catch (err) {
        console.error("Error auto-seeding DBMS curriculum in fetchSubjectsForUser:", err);
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
    totalItems === 0
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
  
  if (data && data.name.toLowerCase().trim().includes("python")) {
    try {
      await seedPythonCurriculumInDb(userId, data.id);
    } catch (sErr) {
      console.error("Error auto-seeding Python curriculum on subject creation:", sErr);
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

const DBMS_CURRICULUM_DATA = [
  {
    name: "DBMS Foundations",
    items: [
      "DBMS vs File System",
      "DBMS vs RDBMS",
      "DBMS Architecture — 2-tier and 3-tier",
      "Schema vs Instance",
      "Data Abstraction",
      "Data Independence",
      "Super Key",
      "Candidate Key",
      "Primary Key",
      "Foreign Key",
      "Composite Key",
      "Alternate Key",
      "Entity Integrity",
      "Referential Integrity",
      "Domain Integrity",
      "Entity",
      "Attribute",
      "Relationship",
      "Cardinality",
      "Participation Constraints",
      "Strong vs Weak Entity",
      "Basic ER Diagram Design",
      "ER Diagram to Relational Schema",
    ],
  },
  {
    name: "Normalization",
    items: [
      "Why Normalization?",
      "Data Redundancy",
      "Insert Anomaly",
      "Update Anomaly",
      "Delete Anomaly",
      "Functional Dependency",
      "First Normal Form — 1NF",
      "Second Normal Form — 2NF",
      "Partial Dependency",
      "Third Normal Form — 3NF",
      "Transitive Dependency",
      "Boyce-Codd Normal Form — BCNF",
      "3NF vs BCNF",
      "Lossless Decomposition",
      "Dependency Preservation",
      "Normalize Sample Tables",
      "Explain Normalization Problems",
    ],
  },
  {
    name: "SQL Fundamentals",
    items: [
      "SELECT",
      "WHERE",
      "ORDER BY",
      "DISTINCT",
      "COUNT",
      "SUM",
      "AVG",
      "MIN",
      "MAX",
      "GROUP BY",
      "HAVING",
      "WHERE vs HAVING",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL OUTER JOIN",
      "Subqueries",
      "Correlated Subqueries",
      "UNION",
      "INTERSECT",
      "EXCEPT / MINUS",
      "Views",
      "NOT NULL",
      "UNIQUE",
      "CHECK",
      "DEFAULT",
      "DELETE vs TRUNCATE vs DROP",
      "Practice 20+ SQL Queries",
    ],
  },
  {
    name: "Transactions & ACID",
    items: [
      "What is a Transaction?",
      "Transaction States",
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability",
      "ACID Properties with Real-World Examples",
      "COMMIT",
      "ROLLBACK",
      "SAVEPOINT",
      "Serial Transactions",
      "Concurrent Transactions",
      "Serializability",
      "Banking Transaction Example",
      "Explain ACID Without Notes",
    ],
  },
  {
    name: "Concurrency Control & Isolation",
    items: [
      "Why Concurrency Control is Needed",
      "Lost Update Problem",
      "Dirty Read",
      "Non-Repeatable Read",
      "Phantom Read",
      "Shared Lock",
      "Exclusive Lock",
      "Lock Compatibility",
      "Two-Phase Locking — 2PL",
      "Strict 2PL",
      "Read Uncommitted",
      "Read Committed",
      "Repeatable Read",
      "Serializable",
      "Isolation Levels",
      "Isolation Level vs Concurrency Anomalies",
      "MVCC — Conceptual Understanding",
    ],
  },
  {
    name: "Deadlocks",
    items: [
      "What is a Deadlock?",
      "Necessary Conditions for Deadlock",
      "Deadlock Prevention",
      "Deadlock Detection",
      "Deadlock Recovery",
      "Wait-for Graph",
    ],
  },
  {
    name: "Indexing & Storage",
    items: [
      "Why Indexing?",
      "How Indexes Improve Query Performance",
      "Advantages of Indexing",
      "Disadvantages of Indexing",
      "Primary Index",
      "Secondary Index",
      "Clustered Index",
      "Non-Clustered Index",
      "Clustered vs Non-Clustered Index",
      "Dense Index",
      "Sparse Index",
      "Hash Indexing",
      "B-Tree",
      "B+ Tree",
      "B-Tree vs B+ Tree",
      "Why B+ Tree is Preferred",
      "Why Not Index Every Column?",
      "Index Impact on INSERT",
      "Index Impact on UPDATE",
      "Index Impact on DELETE",
      "Heap File Organization",
      "Sequential File Organization",
      "Hash File Organization",
    ],
  },
  {
    name: "Query Processing & Relational Algebra",
    items: [
      "Query Processing",
      "Query Parsing",
      "Query Execution",
      "Query Execution Plan",
      "Query Optimization",
      "Cost-Based Optimization",
      "Basic Join Processing",
      "EXPLAIN / Execution Plans",
      "Selection",
      "Projection",
      "Union",
      "Set Difference",
      "Cartesian Product",
      "Natural Join",
      "Theta Join",
      "Division Operator",
    ],
  },
  {
    name: "Database Storage & Recovery",
    items: [
      "Database Storage Basics",
      "Pages",
      "Blocks",
      "Records",
      "File Organization",
      "Buffer Management",
      "Database Failure Types",
      "Transaction Failure",
      "System Crash",
      "Disk Failure",
      "Log-Based Recovery",
      "Write-Ahead Logging — WAL",
      "Checkpoints",
      "Undo",
      "Redo",
      "Crash Recovery",
    ],
  },
  {
    name: "Modern Database Concepts",
    items: [
      "Database Replication",
      "Primary-Replica Architecture",
      "Synchronous Replication",
      "Asynchronous Replication",
      "Read Replicas",
      "Database Partitioning",
      "Horizontal Partitioning",
      "Vertical Partitioning",
      "Database Sharding",
      "Horizontal Scaling",
      "Vertical Scaling",
      "Consistent Hashing — Basic Understanding",
      "CAP Theorem",
      "Consistency",
      "Availability",
      "Partition Tolerance",
      "Strong Consistency",
      "Eventual Consistency",
      "SQL vs NoSQL",
      "Key-Value Databases",
      "Document Databases",
      "Column-Family Databases",
      "Graph Databases",
      "When to Choose SQL vs NoSQL",
      "OLTP vs OLAP",
    ],
  },
  {
    name: "Database Design & Interview Practice",
    items: [
      "Design an E-Commerce Database",
      "Design a Social Media Database",
      "Identify Entities",
      "Identify Relationships",
      "Choose Primary Keys",
      "Choose Foreign Keys",
      "Normalize a Real-World Schema",
      "Decide Where Indexes Are Required",
      "Identify Database Performance Bottlenecks",
      "Normalization vs Denormalization",
      "Indexing Trade-offs",
      "SQL vs NoSQL Design Decision",
      "Explain Database Design and Trade-offs",
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
  const topicIds = topicList.map((t) => t.id);

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
        console.error("Error creating DBMS topic fallback:", mod.name, tErr);
        continue;
      }
      topicId = newTopic.id;
      topicList.push(newTopic);
    }

    const currentTopicItems = existingItems.filter((li) => li.topic_id === topicId);
    const itemsToInsert = [];

    for (let itemIdx = 0; itemIdx < mod.items.length; itemIdx++) {
      const itemTitle = mod.items[itemIdx];
      const exists = currentTopicItems.some(
        (li) => li.title.toLowerCase().trim() === itemTitle.toLowerCase().trim()
      );

      if (!exists) {
        itemsToInsert.push({
          topic_id: topicId,
          title: itemTitle,
          display_order: itemIdx + 1,
          status: "NOT_STARTED" as const,
          priority: "MEDIUM" as const,
          estimated_minutes: 30,
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
