import { supabase } from "@/lib/supabase/client";
import { formatErrorMessage } from "@/lib/utils";
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

export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + days);
  return getLocalYYYYMMDD(dateObj);
}

/**
 * Automatically move any uncompleted study session scheduled on a past date to the next day
 * (up to the current date) whenever the planned day has passed.
 */
export async function autoRolloverMissedSessions(userId: string): Promise<number> {
  const todayStr = getTodayDateString();
  let rolledOverCount = 0;

  try {
    const { data: pastSessions, error } = await supabase
      .from("planned_sessions")
      .select(`
        id,
        planned_minutes,
        status,
        study_plan_id,
        study_plans!inner (
          id,
          plan_date
        )
      `)
      .eq("user_id", userId)
      .neq("status", "COMPLETED")
      .lt("study_plans.plan_date", todayStr);

    if (error) {
      console.error("Error checking past missed sessions for auto-rollover:", formatErrorMessage(error), error);
      return 0;
    }

    if (!pastSessions || pastSessions.length === 0) {
      return 0;
    }

    const affectedPlanIds = new Set<string>();

    for (const session of pastSessions) {
      const oldPlan = Array.isArray(session.study_plans) ? session.study_plans[0] : session.study_plans;
      if (!oldPlan || !oldPlan.plan_date) continue;

      affectedPlanIds.add(oldPlan.id);

      // Determine target date: advance by 1 day, capped at today
      const nextDateStr = addDaysToDateStr(oldPlan.plan_date, 1);
      const targetDateStr = nextDateStr > todayStr ? todayStr : nextDateStr;

      // Fetch or create target date study_plan
      const { data: targetPlan, error: targetPlanErr } = await supabase
        .from("study_plans")
        .select("id")
        .eq("user_id", userId)
        .eq("plan_date", targetDateStr)
        .maybeSingle();

      if (targetPlanErr) {
        console.error(`Error fetching plan for target date ${targetDateStr}:`, targetPlanErr);
        continue;
      }

      let targetPlanId = targetPlan?.id;
      if (!targetPlanId) {
        const { data: newPlan, error: createPlanErr } = await supabase
          .from("study_plans")
          .insert({
            user_id: userId,
            plan_date: targetDateStr,
            target_minutes: session.planned_minutes || 60,
            status: "DRAFT",
          })
          .select("id")
          .single();

        if (createPlanErr || !newPlan) {
          console.error(`Error creating study plan for ${targetDateStr}:`, createPlanErr);
          continue;
        }
        targetPlanId = newPlan.id;
      }

      affectedPlanIds.add(targetPlanId);

      // Move session to target plan and reset status to PLANNED
      const { error: moveErr } = await supabase
        .from("planned_sessions")
        .update({
          study_plan_id: targetPlanId,
          status: "PLANNED",
        })
        .eq("id", session.id)
        .eq("user_id", userId);

      if (moveErr) {
        console.error(`Error moving planned session ${session.id} to ${targetDateStr}:`, moveErr);
        continue;
      }

      // Clean up incomplete study_sessions attempts for this planned_session from past dates
      await supabase
        .from("study_sessions")
        .delete()
        .eq("planned_session_id", session.id)
        .neq("status", "COMPLETED");

      rolledOverCount++;
    }

    // Recalculate target_minutes for all affected study_plans
    for (const planId of Array.from(affectedPlanIds)) {
      const { data: planSessions } = await supabase
        .from("planned_sessions")
        .select("planned_minutes")
        .eq("study_plan_id", planId);

      const newTargetMins = (planSessions || []).reduce((sum, s) => sum + (s.planned_minutes || 0), 0);
      await supabase
        .from("study_plans")
        .update({ target_minutes: newTargetMins })
        .eq("id", planId);
    }
  } catch (err) {
    console.error("Unexpected error in autoRolloverMissedSessions:", formatErrorMessage(err), err);
  }

  return rolledOverCount;
}

/**
 * Fetch a plan and its planned sessions for a given date.
 */
export async function fetchPlanForDate(
  userId: string,
  planDate: string
): Promise<PlanLoadResult> {
  try {
    await autoRolloverMissedSessions(userId);

    const { data: plan, error: planError } = await supabase
      .from("study_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_date", planDate)
      .maybeSingle();

    if (planError) {
      console.error("Error fetching study plan:", formatErrorMessage(planError), planError);
      return {
        planId: null,
        planDate,
        isLocked: false,
        sessions: [],
      };
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
      console.error("Error fetching planned sessions:", formatErrorMessage(sessionsError), sessionsError);
      return {
        planId: plan.id,
        planDate,
        isLocked: plan.status === "LOCKED",
        sessions: [],
      };
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
  } catch (err) {
    console.error("Unexpected error in fetchPlanForDate:", formatErrorMessage(err), err);
    return {
      planId: null,
      planDate,
      isLocked: false,
      sessions: [],
    };
  }
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

      const startTimeFormatted = s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime;
      const endTimeFormatted = s.endTime.length === 5 ? `${s.endTime}:00` : s.endTime;

      return {
        study_plan_id: planId,
        user_id: userId,
        subject_id: matchingSubject?.id || null,
        topic_id: foundTopicId || null,
        learning_item_id: foundLearningItemId || null,
        title: s.topic,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
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
            topicName: top.name,
            itemTitle: item.title,
          });
        }
      }
    }
  }

  return tasks;
}
