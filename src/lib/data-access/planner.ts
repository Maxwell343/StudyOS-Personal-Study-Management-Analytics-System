import { supabase } from "@/lib/supabase/client";
import type { PlanSession, PlannedTask } from "@/types/planner";
import type { Subject } from "@/types/subjects";
import type { Database, Json } from "@/lib/supabase/database.types";

export function getLocalYYYYMMDD(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalYYYYMMDD(tomorrow);
}

export function getTodayDateString(): string {
  return getLocalYYYYMMDD(new Date());
}

export interface PlanLoadResult {
  planId: string | null;
  planDate: string;
  isLocked: boolean;
  sessions: PlanSession[];
}

type DbSubject = Database["public"]["Tables"]["subjects"]["Row"];
type DbTopic = Database["public"]["Tables"]["topics"]["Row"];
type DbLearningItem = Database["public"]["Tables"]["learning_items"]["Row"];
type DbPlannedSession = Database["public"]["Tables"]["planned_sessions"]["Row"];

interface PlannedSessionWithRelations extends DbPlannedSession {
  subjects: DbSubject | DbSubject[] | null;
  learning_items: (DbLearningItem & { topics?: DbTopic | DbTopic[] | null }) | (DbLearningItem & { topics?: DbTopic | DbTopic[] | null })[] | null;
}

/**
 * Fetch a plan and its planned sessions for a given date.
 */
export async function fetchPlanForDate(
  userId: string,
  planDate: string
): Promise<PlanLoadResult> {
  const { data: plan, error: planError } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_date", planDate)
    .maybeSingle();

  if (planError) {
    console.error("Error fetching study plan:", planError);
    throw planError;
  }

  if (!plan) {
    return {
      planId: null,
      planDate,
      isLocked: false,
      sessions: [],
    };
  }

  // Fetch planned sessions
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("planned_sessions")
    .select(`
      *,
      subjects:subject_id (name, color),
      learning_items:learning_item_id (title, topics:topic_id (name))
    `)
    .eq("study_plan_id", plan.id)
    .order("start_time", { ascending: true });

  if (sessionsError) {
    console.error("Error fetching planned sessions:", sessionsError);
    throw sessionsError;
  }

  const rawSessions = (sessionsData || []) as unknown as PlannedSessionWithRelations[];

  const mappedSessions: PlanSession[] = rawSessions.map((row) => {
    const sub = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
    const li = Array.isArray(row.learning_items) ? row.learning_items[0] : row.learning_items;
    const topObj = Array.isArray(li?.topics) ? li?.topics[0] : li?.topics;

    return {
      id: row.id,
      subject: sub?.name || "General",
      topic: topObj?.name || row.title || "Study",
      learningItemId: row.learning_item_id || undefined,
      taskId: row.learning_item_id || undefined,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
      durationMinutes: row.planned_minutes,
      color: sub?.color || "#22d3ee",
      priority: undefined,
    };
  });

  return {
    planId: plan.id,
    planDate: plan.plan_date,
    isLocked: plan.status === "LOCKED",
    sessions: mappedSessions,
  };
}

/**
 * Persist the entire plan and its sessions to Supabase.
 */
export async function savePlanInDb(
  userId: string,
  planDate: string,
  sessions: PlanSession[],
  isLocked: boolean,
  subjects: Subject[]
): Promise<string> {
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const planStatus = isLocked ? "LOCKED" : "DRAFT";

  // 1. Upsert study_plan
  const { data: planData, error: planError } = await supabase
    .from("study_plans")
    .upsert(
      {
        user_id: userId,
        plan_date: planDate,
        target_minutes: totalMinutes,
        status: planStatus,
        locked_at: isLocked ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,plan_date" }
    )
    .select()
    .single();

  if (planError) throw planError;
  const planId = planData.id;

  // 2. Delete existing sessions for this plan
  await supabase.from("planned_sessions").delete().eq("study_plan_id", planId);

  // 3. Re-insert current sessions
  if (sessions.length > 0) {
    const rowsToInsert: Database["public"]["Tables"]["planned_sessions"]["Insert"][] = sessions.map((s) => {
      // Find matching subject and topic/item
      const matchingSubject = subjects.find(
        (sub) => sub.name.toLowerCase() === s.subject.toLowerCase()
      );

      let foundTopicId = "";
      let foundLearningItemId = s.learningItemId || "";

      if (matchingSubject) {
        for (const top of matchingSubject.topics) {
          if (top.name.toLowerCase() === s.topic.toLowerCase()) {
            foundTopicId = top.id;
          }
          for (const item of top.learningItems) {
            if (item.id === s.learningItemId) {
              foundTopicId = top.id;
              foundLearningItemId = item.id;
              break;
            }
          }
        }
        if (!foundTopicId && matchingSubject.topics.length > 0) {
          foundTopicId = matchingSubject.topics[0].id;
        }
      }

      return {
        study_plan_id: planId,
        user_id: userId,
        subject_id: matchingSubject?.id || null,
        topic_id: foundTopicId || null,
        learning_item_id: foundLearningItemId || null,
        title: `${s.subject}: ${s.topic}`,
        start_time: `${s.startTime}:00`,
        end_time: `${s.endTime}:00`,
        planned_minutes: s.durationMinutes,
        status: "PLANNED",
      };
    });

    const { error: insertError } = await supabase
      .from("planned_sessions")
      .insert(rowsToInsert);

    if (insertError) throw insertError;
  }

  // 4. Log activity if committed
  if (isLocked) {
    const metadataJson: Json = {
      plan_date: planDate,
      session_count: sessions.length,
      total_minutes: totalMinutes,
    };

    await supabase.from("activity_logs").insert({
      user_id: userId,
      type: "PLAN_COMMITTED",
      metadata: metadataJson,
    });
  }

  return planId;
}

/**
 * Extract available tasks / uncompleted learning items from real user subjects.
 */
export function extractAvailableTasksFromSubjects(subjects: Subject[]): PlannedTask[] {
  const tasks: PlannedTask[] = [];

  for (const sub of subjects) {
    for (const top of sub.topics) {
      for (const item of top.learningItems) {
        if (item.status !== "COMPLETED") {
          tasks.push({
            id: item.id,
            label: `${top.name} — ${item.title}`,
            subject: sub.name,
            learningItemId: item.id,
          });
        }
      }
    }
  }

  return tasks;
}
