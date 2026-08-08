import { supabase } from "@/lib/supabase/client";
import type {
  StudySession,
  FocusTask,
  DailyTask,
  SubjectProgressData,
  WeeklyDataPoint,
  DailyMetric,
  InsightData,
} from "@/types/dashboard";
import type { Subject } from "@/types/subjects";
import { fetchSubjectsForUser } from "./subjects";
import { getTodayDateString } from "./planner";
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
}

interface RawPlannedSessionRow {
  id: string;
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

  // 4. Fetch all study sessions from past 30 days (for streak calculation)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const { data: recentSessions } = await supabase
    .from("study_sessions")
    .select("id, started_at, planned_minutes, actual_minutes, status, learning_item_id")
    .eq("user_id", userId)
    .gte("started_at", `${thirtyDaysAgoStr}T00:00:00Z`);

  // Compute Today's actual study minutes & completed sessions
  let actualMinutesToday = 0;
  let completedSessionsToday = 0;

  const todaySessionsList: StudySession[] = plannedSessionsRaw.map((row) => {
    const sub = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
    const li = Array.isArray(row.learning_items) ? row.learning_items[0] : row.learning_items;
    const topObj = Array.isArray(li?.topics) ? li?.topics[0] : li?.topics;

    let appStatus: StudySession["status"] = "upcoming";
    if (row.status === "COMPLETED") appStatus = "completed";
    else if (row.status === "ACTIVE") appStatus = "active";
    else if (row.status === "PAUSED") appStatus = "paused";

    return {
      id: row.id,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
      timeRange: `${row.start_time.slice(0, 5)} - ${row.end_time.slice(0, 5)}`,
      subject: sub?.name || "General",
      topic: topObj?.name || row.title || "Study Session",
      duration: formatMinutes(row.planned_minutes),
      plannedMinutes: row.planned_minutes,
      status: appStatus,
      color: sub?.color || "#22d3ee",
    };
  });

  (recentSessions || []).forEach((s) => {
    if (s.started_at.startsWith(today) && s.status === "COMPLETED") {
      actualMinutesToday += s.actual_minutes || 0;
      completedSessionsToday += 1;
    }
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
    const dStr = d.toISOString().split("T")[0];
    weeklyMap.set(dStr, 0);
  }

  (recentSessions || []).forEach((s) => {
    if (s.status === "COMPLETED" && s.actual_minutes) {
      const dateKey = s.started_at.split("T")[0];
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
  const hasToday = (recentSessions || []).some(
    (s) => s.started_at.startsWith(today) && s.status === "COMPLETED"
  );
  if (hasToday) streak++;

  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setDate(testDate.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const studiedOnDay = (recentSessions || []).some(
      (s) => s.started_at.startsWith(dStr) && s.status === "COMPLETED"
    );
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

  // 8. Daily Tasks (uncompleted items from subjects)
  const dailyTasks: DailyTask[] = [];
  for (const sub of subjects) {
    for (const top of sub.topics) {
      for (const item of top.learningItems) {
        if (dailyTasks.length >= 5) break;
        dailyTasks.push({
          id: item.id,
          label: item.title,
          subject: sub.name,
          done: item.status === "COMPLETED",
        });
      }
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
    todaySessionsList.find((s) => s.status !== "completed") ||
    (todaySessionsList.length > 0 ? todaySessionsList[0] : null);

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
  };
}
