import { supabase } from "@/lib/supabase/client";
import { formatErrorMessage } from "@/lib/utils";
import { getTodayDateString, getLocalYYYYMMDD } from "./planner";
import { computeDynamicSessionStatus } from "./dashboard";
import { formatMinutes } from "@/lib/planner-utils";
import type {
  CalendarDayData,
  CalendarSession,
  MonthSummaryStats,
  IntensityLevel,
} from "@/types/calendar";

export interface CalendarMonthResult {
  days: CalendarDayData[];
  monthStats: MonthSummaryStats;
}

interface RawPlannedSessionWithPlan {
  id: string;
  study_plan_id: string;
  topic_id?: string | null;
  learning_item_id?: string | null;
  start_time: string;
  end_time: string;
  planned_minutes: number;
  status: string;
  title: string;
  study_plans: { plan_date: string } | null;
  subjects?: { name?: string; color?: string } | { name?: string; color?: string }[] | null;
  learning_items?: {
    title?: string;
    topics?: { name?: string } | { name?: string }[] | null;
  } | {
    title?: string;
    topics?: { name?: string } | { name?: string }[] | null;
  }[] | null;
}

function computeIntensityLevel(actualMinutes: number): IntensityLevel {
  if (actualMinutes <= 0) return 0;
  if (actualMinutes < 30) return 1;
  if (actualMinutes < 60) return 2;
  if (actualMinutes < 120) return 3;
  return 4;
}

/**
 * Clean redundant subject prefix from topic titles
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

export async function fetchCalendarMonthData(
  userId: string,
  year: number,
  month: number // 1-indexed (1 = Jan, 8 = Aug)
): Promise<CalendarMonthResult> {
  const todayStr = getTodayDateString();
  const nowDate = new Date();

  // 1. Compute 7-column month grid date boundaries (Monday to Sunday)
  const firstOfMonth = new Date(year, month - 1, 1);
  const dayOfWeek = firstOfMonth.getDay(); // 0 = Sun, 1 = Mon...
  // ISO day: Mon = 0, Tue = 1, ..., Sun = 6
  const isoDay = (dayOfWeek + 6) % 7;

  const startDate = new Date(firstOfMonth);
  startDate.setDate(startDate.getDate() - isoDay);

  // 6 weeks * 7 days = 42 grid cells
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 41);

  const startDateStr = getLocalYYYYMMDD(startDate);
  const endDateStr = getLocalYYYYMMDD(endDate);

  // 2. Fetch planned_sessions for all study_plans in grid date range
  const { data: plannedSessionsData, error: plannedErr } = await supabase
    .from("planned_sessions")
    .select(`
      *,
      study_plans!inner(plan_date),
      subjects:subject_id (name, color),
      learning_items:learning_item_id (title, topics:topic_id (name))
    `)
    .eq("user_id", userId)
    .gte("study_plans.plan_date", startDateStr)
    .lte("study_plans.plan_date", endDateStr)
    .order("start_time", { ascending: true });

  if (plannedErr) {
    console.error("Error fetching planned sessions for calendar:", formatErrorMessage(plannedErr), plannedErr);
  }

  const rawPlanned = (plannedSessionsData || []) as unknown as RawPlannedSessionWithPlan[];

  // 3. Fetch completed study_sessions in grid date range for actual study minutes
  const { data: actualSessionsData } = await supabase
    .from("study_sessions")
    .select("id, planned_session_id, started_at, actual_minutes, status")
    .eq("user_id", userId)
    .gte("started_at", `${startDateStr}T00:00:00Z`)
    .lte("started_at", `${endDateStr}T23:59:59Z`);

  // Map actual minutes per planned_session_id & per date
  const actualMinutesByPlannedSession = new Map<string, number>();
  const actualMinutesByDate = new Map<string, number>();

  (actualSessionsData || []).forEach((s) => {
    if (s.status === "COMPLETED" && s.actual_minutes) {
      if (s.planned_session_id) {
        const current = actualMinutesByPlannedSession.get(s.planned_session_id) || 0;
        actualMinutesByPlannedSession.set(s.planned_session_id, current + s.actual_minutes);
      }
      const localDate = getLocalYYYYMMDD(new Date(s.started_at));
      const currentDayMinutes = actualMinutesByDate.get(localDate) || 0;
      actualMinutesByDate.set(localDate, currentDayMinutes + s.actual_minutes);
    }
  });

  // Group planned sessions by study_plans.plan_date
  const sessionsByDate = new Map<string, CalendarSession[]>();

  rawPlanned.forEach((row) => {
    const planDate = row.study_plans?.plan_date;
    if (!planDate) return;

    const sub = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
    const li = Array.isArray(row.learning_items) ? row.learning_items[0] : row.learning_items;
    const topObj = Array.isArray(li?.topics) ? li?.topics[0] : li?.topics;

    let appStatus = computeDynamicSessionStatus(
      row.status,
      row.start_time,
      row.end_time,
      nowDate
    );

    // If date is strictly in the past and not completed/active/paused, mark as missed
    if (planDate < todayStr && appStatus !== "completed" && appStatus !== "active" && appStatus !== "paused") {
      appStatus = "missed";
    }

    // If date is in the future, set status to upcoming unless completed
    if (planDate > todayStr && appStatus !== "completed") {
      appStatus = "upcoming";
    }

    const rawTopic = topObj?.name || row.title || "Study Session";
    const cleanedTopic = cleanTopicTitle(rawTopic, sub?.name);
    const actualMins = actualMinutesByPlannedSession.get(row.id) || (appStatus === "completed" ? row.planned_minutes : 0);

    const sessionItem: CalendarSession = {
      id: row.id,
      subject: sub?.name || "General",
      topic: cleanedTopic,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
      timeRange: `${row.start_time.slice(0, 5)} - ${row.end_time.slice(0, 5)}`,
      plannedMinutes: row.planned_minutes,
      actualMinutes: actualMins,
      status: appStatus,
      color: sub?.color || "#22d3ee",
      learningItemId: row.learning_item_id || undefined,
    };

    const existingList = sessionsByDate.get(planDate) || [];
    existingList.push(sessionItem);
    sessionsByDate.set(planDate, existingList);
  });

  // 4. Construct 42 Calendar Day objects
  const days: CalendarDayData[] = [];
  let totalPlannedMonth = 0;
  let totalActualMonth = 0;
  let completedCountMonth = 0;
  let missedCountMonth = 0;

  const currentIter = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    const dateStr = getLocalYYYYMMDD(currentIter);
    const dayNumber = currentIter.getDate();
    const isCurrentMonth = currentIter.getMonth() === month - 1;
    const isToday = dateStr === todayStr;

    const daySessions = sessionsByDate.get(dateStr) || [];

    const dayPlannedMinutes = daySessions.reduce((s, row) => s + row.plannedMinutes, 0);
    const dayActualMinutes = actualMinutesByDate.get(dateStr) || daySessions
      .filter((s) => s.status === "completed")
      .reduce((s, row) => s + (row.actualMinutes || row.plannedMinutes), 0);

    const dayAdherence = dayPlannedMinutes > 0
      ? Math.min(100, Math.round((dayActualMinutes / dayPlannedMinutes) * 100))
      : 0;

    const intensity = computeIntensityLevel(dayActualMinutes);

    days.push({
      dateStr,
      dayNumber,
      isCurrentMonth,
      isToday,
      plannedMinutes: dayPlannedMinutes,
      actualMinutes: dayActualMinutes,
      adherencePercent: dayAdherence,
      intensityLevel: intensity,
      sessions: daySessions,
    });

    // Accumulate monthly stats (only for days in the target month)
    if (isCurrentMonth) {
      totalPlannedMonth += dayPlannedMinutes;
      totalActualMonth += dayActualMinutes;

      daySessions.forEach((s) => {
        if (s.status === "completed") completedCountMonth++;
        if (s.status === "missed") missedCountMonth++;
      });
    }

    currentIter.setDate(currentIter.getDate() + 1);
  }

  const overallAdherenceMonth = totalPlannedMonth > 0
    ? Math.min(100, Math.round((totalActualMonth / totalPlannedMonth) * 100))
    : 0;

  return {
    days,
    monthStats: {
      totalPlannedMinutes: totalPlannedMonth,
      totalActualMinutes: totalActualMonth,
      completedCount: completedCountMonth,
      missedCount: missedCountMonth,
      adherencePercent: overallAdherenceMonth,
    },
  };
}
