import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { PlanSession } from "@/types/planner";
import type {
  StudySession,
  SessionStatus,
  FocusTask,
  DailyTask,
  SubjectProgressData,
  WeeklyDataPoint,
  DailyMetric,
  InsightData,
} from "@/types/dashboard";
import type { Subject } from "@/types/subjects";
import { fetchSubjectsForUser } from "./subjects";
import { getTodayDateString, getLocalYYYYMMDD, getTomorrowDateString } from "./planner";
import { formatMinutes } from "@/lib/planner-utils";

export interface DashboardData {
  todaySessions: StudySession[];
  nextSession: StudySession | null;
  dailyMetrics: DailyMetric[];
  focusTasks: FocusTask[];
  dailyTasks: DailyTask[];
  subjectProgress: SubjectProgressData[];
  weeklyData: WeeklyDataPoint[];
  jarvisInsight: InsightData;
  targetMinutesToday: number;
  actualMinutesToday: number;
  completedSessionsToday: number;
  rawSubjects: Subject[];
}

interface RawPlannedSessionRow {
  id: string;
  topic_id?: string | null;
  learning_item_id?: string | null;
  start_time: string;
  end_time: string;
  planned_minutes: number;
  status: string;
  title: string;
  subjects?: { name?: string; color?: string } | { name?: string; color?: string }[] | null;
  learning_items?: {
    title?: string;
    topics?: { name?: string } | { name?: string }[] | null;
  } | {
    title?: string;
    topics?: { name?: string } | { name?: string }[] | null;
  }[] | null;
}

/**
 * Fetch all dashboard metrics and items for a user.
 */
function cleanTopicTitle(topic: string, subjectName?: string): string {
  if (!topic) return "";
  let cleaned = topic.trim();
  if (subjectName) {
    const escapedSubject = subjectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixReg = new RegExp(`^(?:${escapedSubject}\\s*:\\s*)+`, "gi");
    cleaned = cleaned.replace(prefixReg, "").trim();
  }
  cleaned = cleaned.replace(/(.+?):\s*\1(?::|\s|$)/gi, "$1").trim();
  return cleaned || topic;
}

export function computeDynamicSessionStatus(
  rowStatus: string,
  startTimeStr: string,
  endTimeStr: string,
  nowDate: Date = new Date()
): StudySession["status"] {
  if (rowStatus === "COMPLETED") return "completed";
  if (rowStatus === "ACTIVE") return "active";
  if (rowStatus === "PAUSED") return "paused";

  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  const [sh, sm] = startTimeStr.slice(0, 5).split(":").map(Number);
  const startMinutes = (sh || 0) * 60 + (sm || 0);

  const [eh, em] = endTimeStr.slice(0, 5).split(":").map(Number);
  const endMinutes = (eh || 0) * 60 + (em || 0);

  if (nowMinutes > endMinutes) {
    return "missed";
  }
  if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
    return "behind-schedule";
  }
  if (startMinutes - nowMinutes <= 15 && startMinutes - nowMinutes > 0) {
    return "starting-soon";
  }
  return "upcoming";
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const today = getTodayDateString();

  // 1. Fetch user's subjects (for subject progress and task pool)
  const subjects: Subject[] = await fetchSubjectsForUser(userId);

  // 2. Fetch today's study plan
  const { data: planData } = await supabase
    .from("study_plans")
    .select("id, target_minutes, status")
    .eq("user_id", userId)
    .eq("plan_date", today)
    .maybeSingle();

  // 3. Fetch today's planned sessions if plan exists
  let plannedSessionsRaw: RawPlannedSessionRow[] = [];
  if (planData?.id) {
    const { data: psData } = await supabase
      .from("planned_sessions")
      .select(`
        *,
        subjects:subject_id (name, color),
        learning_items:learning_item_id (title, topics:topic_id (name))
      `)
      .eq("study_plan_id", planData.id)
      .order("start_time", { ascending: true });

    if (psData) {
      plannedSessionsRaw = psData as unknown as RawPlannedSessionRow[];
    }
  }

  // 3b. Fetch planned sessions for other dates to exclude future-planned tasks/modules from today's task list
  const { data: futurePlannedSessions } = await supabase
    .from("planned_sessions")
    .select("topic_id, learning_item_id, title, study_plans!inner(plan_date)")
    .eq("user_id", userId)
    .neq("study_plans.plan_date", today);

  const futurePlanItemIds = new Set<string>();
  const futurePlanTopicIds = new Set<string>();
  const futurePlanTitles = new Set<string>();

  (futurePlannedSessions || []).forEach((row) => {
    if (row.learning_item_id) {
      futurePlanItemIds.add(row.learning_item_id);
    }
    if (row.topic_id) {
      futurePlanTopicIds.add(row.topic_id);
    }
    if (row.title) {
      futurePlanTitles.add(row.title.toLowerCase().trim());
    }
  });

  const todayPlanItemIds = new Set<string>();
  const todayPlanTopicIds = new Set<string>();
  plannedSessionsRaw.forEach((row) => {
    if (row.learning_item_id) {
      todayPlanItemIds.add(row.learning_item_id);
    }
    if (row.topic_id) {
      todayPlanTopicIds.add(row.topic_id);
    }
  });

  // 4. Fetch all study sessions from past 30 days (for streak calculation)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = getLocalYYYYMMDD(thirtyDaysAgo);

  const { data: recentSessions } = await supabase
    .from("study_sessions")
    .select("id, started_at, planned_minutes, actual_minutes, status, learning_item_id")
    .eq("user_id", userId)
    .gte("started_at", `${thirtyDaysAgoStr}T00:00:00Z`);

  // Compute Today's actual study minutes & completed sessions
  let actualMinutesToday = 0;
  let completedSessionsToday = 0;

  (recentSessions || []).forEach((s) => {
    if (s.started_at.startsWith(today) && s.status === "COMPLETED") {
      actualMinutesToday += s.actual_minutes || 0;
      completedSessionsToday += 1;
    }
  });

  const todaySessionsList: StudySession[] = plannedSessionsRaw.map((row) => {
    const sub = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
    const li = Array.isArray(row.learning_items) ? row.learning_items[0] : row.learning_items;
    const topObj = Array.isArray(li?.topics) ? li?.topics[0] : li?.topics;

    const appStatus = computeDynamicSessionStatus(
      row.status,
      row.start_time,
      row.end_time
    );

    const rawTopic = topObj?.name || row.title || "Study Session";
    const cleanedTopic = cleanTopicTitle(rawTopic, sub?.name);

    return {
      id: row.id,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
      timeRange: `${row.start_time.slice(0, 5)} - ${row.end_time.slice(0, 5)}`,
      subject: sub?.name || "General",
      topic: cleanedTopic,
      duration: formatMinutes(row.planned_minutes),
      plannedMinutes: row.planned_minutes,
      status: appStatus,
      color: sub?.color || "#22d3ee",
    };
  });

  const targetMinutesToday =
    planData?.target_minutes ||
    (todaySessionsList.length > 0
      ? todaySessionsList.reduce((sum, s) => sum + s.plannedMinutes, 0)
      : 0);

  // 5. Weekly Analytics (Last 7 Days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyMap = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = getLocalYYYYMMDD(d);
    weeklyMap.set(dStr, 0);
  }

  (recentSessions || []).forEach((s) => {
    if (s.status === "COMPLETED" && s.actual_minutes) {
      const localDate = new Date(s.started_at);
      const dateKey = getLocalYYYYMMDD(localDate);
      if (weeklyMap.has(dateKey)) {
        const current = weeklyMap.get(dateKey) || 0;
        weeklyMap.set(dateKey, current + s.actual_minutes / 60);
      }
    }
  });

  const weeklyData: WeeklyDataPoint[] = Array.from(weeklyMap.entries()).map(
    ([dateStr, hours]) => {
      const d = new Date(dateStr + "T12:00:00Z");
      const dayName = dayNames[d.getDay()];
      return {
        day: dayName,
        hours: Math.round(hours * 10) / 10,
        target: 3.5,
      };
    }
  );

  // 6. Current Streak Calculation (consecutive days with completed study sessions)
  let streak = 0;
  const testDate = new Date();
  const hasToday = (recentSessions || []).some((s) => {
    const localStr = getLocalYYYYMMDD(new Date(s.started_at));
    return localStr === today && s.status === "COMPLETED";
  });
  if (hasToday) streak++;

  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setDate(testDate.getDate() - i);
    const dStr = getLocalYYYYMMDD(d);
    const studiedOnDay = (recentSessions || []).some((s) => {
      const localStr = getLocalYYYYMMDD(new Date(s.started_at));
      return localStr === dStr && s.status === "COMPLETED";
    });
    if (studiedOnDay) {
      streak++;
    } else {
      break;
    }
  }

  // 7. Focus Tasks (from today's planned sessions)
  const focusTasks: FocusTask[] = [];
  let focusTaskIdx = 0;
  for (const s of todaySessionsList) {
    if (focusTasks.length >= 4) break;
    focusTasks.push({
      id: `ft-${s.id}-${focusTaskIdx++}`,
      sessionId: s.id,
      label: `${s.subject}: ${s.topic}`,
      done: s.status === "completed",
    });
  }

  // 8. Daily Tasks (tasks for today: prioritize items in today's plan, exclude items planned for future days)
  const dailyTasks: DailyTask[] = [];

  const allItems: {
    item: typeof subjects[0]["topics"][0]["learningItems"][0];
    topicId: string;
    topicName: string;
    subjectName: string;
  }[] = [];

  for (const sub of subjects) {
    for (const top of sub.topics) {
      for (const item of top.learningItems) {
        allItems.push({
          item,
          topicId: top.id,
          topicName: top.name,
          subjectName: sub.name,
        });
      }
    }
  }

  // Priority 1: Items explicitly planned for TODAY (by item ID or topic ID)
  if (todayPlanItemIds.size > 0 || todayPlanTopicIds.size > 0) {
    for (const { item, topicId, subjectName } of allItems) {
      if (todayPlanItemIds.has(item.id) || todayPlanTopicIds.has(topicId)) {
        if (!dailyTasks.some((dt) => dt.id === item.id)) {
          dailyTasks.push({
            id: item.id,
            label: item.title,
            subject: subjectName,
            done: (item.status as string) === "COMPLETED",
          });
        }
      }
    }
  }

  // Priority 2: Fill remaining slots with uncompleted items NOT planned for future dates
  if (dailyTasks.length < 5) {
    for (const { item, topicId, topicName, subjectName } of allItems) {
      if (dailyTasks.length >= 5) break;

      const isFuturePlanned =
        futurePlanItemIds.has(item.id) ||
        futurePlanTopicIds.has(topicId) ||
        futurePlanTitles.has(topicName.toLowerCase().trim());

      if (
        dailyTasks.some((dt) => dt.id === item.id) ||
        (item.status as string) === "COMPLETED" ||
        isFuturePlanned
      ) {
        continue;
      }

      dailyTasks.push({
        id: item.id,
        label: item.title,
        subject: subjectName,
        done: (item.status as string) === "COMPLETED",
      });
    }
  }

  // 9. Subject Progress (derived dynamically)
  const subjectProgress: SubjectProgressData[] = subjects.map((sub) => {
    let totalItems = 0;
    let completedItems = 0;
    for (const top of sub.topics) {
      for (const item of top.learningItems) {
        totalItems++;
        if (item.status === "COMPLETED") completedItems++;
      }
    }
    const progress =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return {
      id: sub.id,
      name: sub.name,
      progress,
      color: sub.color,
    };
  });

  // 10. Next upcoming session
  const nextSession =
    todaySessionsList.find((s) => s.status !== "completed") || null;

  // 11. Daily Metrics Grid
  const hoursStudied = (actualMinutesToday / 60).toFixed(1);
  const totalTargetHours = (targetMinutesToday / 60).toFixed(1);
  const efficiencyPercent =
    targetMinutesToday > 0
      ? Math.min(
          100,
          Math.round((actualMinutesToday / targetMinutesToday) * 100)
        )
      : 0;

  const dailyMetrics: DailyMetric[] = [
    {
      label: "TOTAL STUDY TIME",
      value: `${hoursStudied}h`,
      sub:
        targetMinutesToday > 0
          ? `/ ${totalTargetHours}h target`
          : "No target set",
      iconName: "Clock",
      iconColor: "#22d3ee",
      iconBg: "rgba(34,211,238,0.1)",
    },
    {
      label: "FOCUS SESSIONS",
      value: `${completedSessionsToday}`,
      sub:
        todaySessionsList.length > 0
          ? `/ ${todaySessionsList.length} completed`
          : "0 planned today",
      iconName: "Target",
      iconColor: "#34d399",
      iconBg: "rgba(52,211,153,0.1)",
    },
    {
      label: "CURRENT STREAK",
      value: `${streak}d`,
      sub: streak > 0 ? "Active streak" : "0 days streak",
      iconName: "Flame",
      iconColor: "#f97316",
      iconBg: "rgba(249,115,22,0.1)",
    },
    {
      label: "PLAN ADHERENCE",
      value: `${efficiencyPercent}%`,
      sub:
        targetMinutesToday > 0
          ? actualMinutesToday >= targetMinutesToday
            ? "Target achieved"
            : "In progress"
          : "No target",
      iconName: "Zap",
      iconColor: "#a78bfa",
      iconBg: "rgba(167,139,250,0.1)",
    },
  ];

  // 12. JARVIS Insight
  let insightMsg = "StudyOS ready. No study sessions planned for today yet.";
  if (actualMinutesToday >= targetMinutesToday && targetMinutesToday > 0) {
    insightMsg = `Outstanding performance! You have exceeded your daily study target (${hoursStudied}h logged). Keep up the great consistency.`;
  } else if (todaySessionsList.length > 0) {
    insightMsg = `System active. You have ${todaySessionsList.length} session${
      todaySessionsList.length !== 1 ? "s" : ""
    } planned today (${(targetMinutesToday / 60).toFixed(1)}h target). ${completedSessionsToday} completed so far.`;
  }

  const jarvisInsight: InsightData = {
    message: insightMsg,
    highlights: [
      { text: `${hoursStudied}h logged`, color: "#22d3ee", bold: true },
      { text: `${streak} day streak`, color: "#f97316", bold: true },
    ],
  };

  return {
    todaySessions: todaySessionsList,
    nextSession,
    dailyMetrics,
    focusTasks,
    dailyTasks,
    subjectProgress,
    weeklyData,
    jarvisInsight,
    targetMinutesToday,
    actualMinutesToday,
    completedSessionsToday,
    rawSubjects: subjects,
  };
}

/**
 * Delete a planned session from today's mission list.
 * Cleans up linked study_sessions, updates the study_plan target_minutes,
 * and maintains complete data integrity.
 */
export async function deletePlannedSessionFromDb(
  userId: string,
  sessionId: string
): Promise<void> {
  // 1. Fetch details of the session to get its study_plan_id
  const { data: sessionRow } = await supabase
    .from("planned_sessions")
    .select("study_plan_id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  // 2. Delete linked active or paused study_sessions
  await supabase
    .from("study_sessions")
    .delete()
    .eq("planned_session_id", sessionId)
    .eq("user_id", userId);

  // 3. Delete the planned session
  const { error: deleteError } = await supabase
    .from("planned_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  // 4. Update plan target minutes if plan exists
  if (sessionRow?.study_plan_id) {
    const { data: remainingSessions } = await supabase
      .from("planned_sessions")
      .select("planned_minutes")
      .eq("study_plan_id", sessionRow.study_plan_id);

    const newTargetMinutes = (remainingSessions || []).reduce(
      (sum, s) => sum + (s.planned_minutes || 0),
      0
    );

    await supabase
      .from("study_plans")
      .update({ target_minutes: newTargetMinutes })
      .eq("id", sessionRow.study_plan_id);
  }
}

/**
 * Move a planned session from today to tomorrow's study plan.
 * If tomorrow's study plan doesn't exist, create it.
 */
export async function movePlannedSessionToTomorrow(
  userId: string,
  sessionId: string,
  newStartTime?: string,
  newEndTime?: string
): Promise<void> {
  const tomorrowDate = getTomorrowDateString();

  // 1. Fetch current session details
  const { data: sessionRow, error: sessionErr } = await supabase
    .from("planned_sessions")
    .select("study_plan_id, planned_minutes, start_time, end_time")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionErr || !sessionRow) throw new Error("Planned session not found");

  const oldPlanId = sessionRow.study_plan_id;

  // 2. Fetch or create tomorrow's study plan
  const { data: tomorrowPlan, error: planErr } = await supabase
    .from("study_plans")
    .select("id, target_minutes")
    .eq("user_id", userId)
    .eq("plan_date", tomorrowDate)
    .maybeSingle();

  if (planErr) throw planErr;

  let tomorrowPlanId = tomorrowPlan?.id;

  if (!tomorrowPlanId) {
    const { data: newPlan, error: createErr } = await supabase
      .from("study_plans")
      .insert({
        user_id: userId,
        plan_date: tomorrowDate,
        target_minutes: sessionRow.planned_minutes || 60,
        status: "DRAFT",
      })
      .select("id")
      .single();

    if (createErr) throw createErr;
    tomorrowPlanId = newPlan.id;
  }

  // 3. Move session to tomorrow's plan and reset status to PLANNED
  const updatePayload: Database["public"]["Tables"]["planned_sessions"]["Update"] = {
    study_plan_id: tomorrowPlanId,
    status: "PLANNED",
  };
  if (newStartTime) updatePayload.start_time = `${newStartTime}:00`;
  if (newEndTime) updatePayload.end_time = `${newEndTime}:00`;

  const { error: updateErr } = await supabase
    .from("planned_sessions")
    .update(updatePayload)
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (updateErr) throw updateErr;

  // 4. Recalculate target minutes for old plan (today)
  if (oldPlanId) {
    const { data: oldSessions } = await supabase
      .from("planned_sessions")
      .select("planned_minutes")
      .eq("study_plan_id", oldPlanId);

    const oldTarget = (oldSessions || []).reduce((s, row) => s + (row.planned_minutes || 0), 0);
    await supabase.from("study_plans").update({ target_minutes: oldTarget }).eq("id", oldPlanId);
  }

  // 5. Recalculate target minutes for tomorrow's plan
  const { data: newSessions } = await supabase
    .from("planned_sessions")
    .select("planned_minutes")
    .eq("study_plan_id", tomorrowPlanId);

  const newTarget = (newSessions || []).reduce((s, row) => s + (row.planned_minutes || 0), 0);
  await supabase.from("study_plans").update({ target_minutes: newTarget }).eq("id", tomorrowPlanId);
}

/**
 * Reschedule a planned session for later today with new start & end times.
 */
export async function reschedulePlannedSessionToday(
  userId: string,
  sessionId: string,
  newStartTime: string,
  newEndTime: string
): Promise<void> {
  const [sh, sm] = newStartTime.split(":").map(Number);
  const [eh, em] = newEndTime.split(":").map(Number);
  const plannedMinutes = Math.max(15, (eh * 60 + em) - (sh * 60 + sm));

  const { error } = await supabase
    .from("planned_sessions")
    .update({
      start_time: `${newStartTime}:00`,
      end_time: `${newEndTime}:00`,
      planned_minutes: plannedMinutes,
      status: "PLANNED",
    })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Reschedule a planned session with custom parameters (date, start, end, duration, topic).
 */
export async function reschedulePlannedSessionCustom(
  userId: string,
  sessionId: string,
  options: {
    targetDate: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    plannedMinutes: number;
    title?: string;
  }
): Promise<void> {
  // 1. Fetch current session details
  const { data: sessionRow } = await supabase
    .from("planned_sessions")
    .select("study_plan_id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  const oldPlanId = sessionRow?.study_plan_id;

  // 2. Fetch or create plan for targetDate
  const { data: targetPlan } = await supabase
    .from("study_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_date", options.targetDate)
    .maybeSingle();

  let targetPlanId = targetPlan?.id;

  if (!targetPlanId) {
    const { data: newPlan, error: createErr } = await supabase
      .from("study_plans")
      .insert({
        user_id: userId,
        plan_date: options.targetDate,
        target_minutes: options.plannedMinutes,
        status: "DRAFT",
      })
      .select("id")
      .single();

    if (createErr) throw createErr;
    targetPlanId = newPlan.id;
  }

  // 3. Update session
  const updatePayload: Database["public"]["Tables"]["planned_sessions"]["Update"] = {
    study_plan_id: targetPlanId,
    start_time: `${options.startTime}:00`,
    end_time: `${options.endTime}:00`,
    planned_minutes: options.plannedMinutes,
    status: "PLANNED",
  };
  if (options.title) {
    updatePayload.title = options.title;
  }

  const { error: updateErr } = await supabase
    .from("planned_sessions")
    .update(updatePayload)
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (updateErr) throw updateErr;

  // 4. Update target minutes for old plan if different
  if (oldPlanId && oldPlanId !== targetPlanId) {
    const { data: oldSessions } = await supabase
      .from("planned_sessions")
      .select("planned_minutes")
      .eq("study_plan_id", oldPlanId);

    const oldTarget = (oldSessions || []).reduce((s, row) => s + (row.planned_minutes || 0), 0);
    await supabase.from("study_plans").update({ target_minutes: oldTarget }).eq("id", oldPlanId);
  }

  // 5. Update target minutes for target plan
  const { data: targetSessions } = await supabase
    .from("planned_sessions")
    .select("planned_minutes")
    .eq("study_plan_id", targetPlanId);

  const targetTarget = (targetSessions || []).reduce((s, row) => s + (row.planned_minutes || 0), 0);
  await supabase.from("study_plans").update({ target_minutes: targetTarget }).eq("id", targetPlanId);
}

/**
 * Add a new planned session directly to Today's study plan.
 */
export async function addPlannedSessionToToday(
  userId: string,
  session: PlanSession,
  subjects: Subject[]
): Promise<void> {
  const today = getTodayDateString();

  // 1. Fetch or create today's study plan
  let { data: todayPlan } = await supabase
    .from("study_plans")
    .select("id, target_minutes")
    .eq("user_id", userId)
    .eq("plan_date", today)
    .maybeSingle();

  let todayPlanId = todayPlan?.id;

  if (!todayPlanId) {
    const { data: newPlan, error: createErr } = await supabase
      .from("study_plans")
      .insert({
        user_id: userId,
        plan_date: today,
        target_minutes: session.durationMinutes,
        status: "DRAFT",
      })
      .select("id")
      .single();

    if (createErr) throw createErr;
    todayPlanId = newPlan.id;
  }

  // 2. Resolve subject & topic IDs
  const matchingSubject = subjects.find(
    (sub) => sub.name.toLowerCase() === session.subject.toLowerCase()
  );

  let foundTopicId = "";
  let foundLearningItemId = session.learningItemId || "";

  if (matchingSubject) {
    for (const top of matchingSubject.topics) {
      if (top.name.toLowerCase() === session.topic.toLowerCase()) {
        foundTopicId = top.id;
      }
      for (const item of top.learningItems) {
        if (item.id === session.learningItemId) {
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

  const rowToInsert: Database["public"]["Tables"]["planned_sessions"]["Insert"] = {
    study_plan_id: todayPlanId,
    user_id: userId,
    subject_id: matchingSubject?.id || null,
    topic_id: foundTopicId || null,
    learning_item_id: foundLearningItemId || null,
    title: session.topic,
    start_time: `${session.startTime}:00`,
    end_time: `${session.endTime}:00`,
    planned_minutes: session.durationMinutes,
    status: "PLANNED",
  };

  const { error: insertError } = await supabase
    .from("planned_sessions")
    .insert(rowToInsert);

  if (insertError) throw insertError;

  // 3. Recalculate target minutes for today's plan
  const { data: allSessions } = await supabase
    .from("planned_sessions")
    .select("planned_minutes")
    .eq("study_plan_id", todayPlanId);

  const newTarget = (allSessions || []).reduce((sum, s) => sum + (s.planned_minutes || 0), 0);
  await supabase
    .from("study_plans")
    .update({ target_minutes: newTarget })
    .eq("id", todayPlanId);
}

/**
 * Update a planned session's status (e.g. COMPLETED / PLANNED)
 * and automatically sync/mark the linked learning item or topic as COMPLETED in the subjects table.
 */
export async function updatePlannedSessionStatusInDb(
  userId: string,
  sessionId: string,
  newStatus: SessionStatus
): Promise<void> {
  const dbStatus = newStatus === "completed" ? "COMPLETED" : "PLANNED";

  // 1. Update planned_session status in database
  const { data: sessionRow, error: sErr } = await supabase
    .from("planned_sessions")
    .update({ status: dbStatus })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (sErr || !sessionRow) return;

  const isCompleting = newStatus === "completed";
  const targetItemStatus = isCompleting ? "COMPLETED" : "NOT_STARTED";
  const nowTs = new Date().toISOString();

  // 2. If learning_item_id is directly attached to the session
  if (sessionRow.learning_item_id) {
    await supabase
      .from("learning_items")
      .update({
        status: targetItemStatus,
        completed_at: isCompleting ? nowTs : null,
        last_studied_at: nowTs,
      })
      .eq("id", sessionRow.learning_item_id);
    return;
  }

  // 3. If topic_id is attached to the session
  if (sessionRow.topic_id) {
    const sessionTitleLower = (sessionRow.title || "").toLowerCase().trim();

    const { data: topicItems } = await supabase
      .from("learning_items")
      .select("id, title")
      .eq("topic_id", sessionRow.topic_id);

    const matchingItem = (topicItems || []).find(
      (li) => li.title.toLowerCase().trim() === sessionTitleLower
    );

    if (matchingItem) {
      await supabase
        .from("learning_items")
        .update({
          status: targetItemStatus,
          completed_at: isCompleting ? nowTs : null,
          last_studied_at: nowTs,
        })
        .eq("id", matchingItem.id);
    } else {
      // Mark all items under this topic as completed if session is for the topic
      await supabase
        .from("learning_items")
        .update({
          status: targetItemStatus,
          completed_at: isCompleting ? nowTs : null,
          last_studied_at: nowTs,
        })
        .eq("topic_id", sessionRow.topic_id);
    }
    return;
  }

  // 4. Fallback search by subject_id + title across user's subjects
  if (sessionRow.subject_id && sessionRow.title) {
    const sessionTitleLower = sessionRow.title.toLowerCase().trim();

    const { data: subTopics } = await supabase
      .from("topics")
      .select("id, name")
      .eq("subject_id", sessionRow.subject_id);

    if (subTopics && subTopics.length > 0) {
      const topicIds = subTopics.map((t) => t.id);

      const { data: subItems } = await supabase
        .from("learning_items")
        .select("id, title")
        .in("topic_id", topicIds);

      const matchedItem = (subItems || []).find(
        (li) => li.title.toLowerCase().trim() === sessionTitleLower
      );

      if (matchedItem) {
        await supabase
          .from("learning_items")
          .update({
            status: targetItemStatus,
            completed_at: isCompleting ? nowTs : null,
            last_studied_at: nowTs,
          })
          .eq("id", matchedItem.id);
      }
    }
  }
}

