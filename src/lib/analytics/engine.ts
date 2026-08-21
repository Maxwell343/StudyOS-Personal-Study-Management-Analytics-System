import { getSupabaseClient, getAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  AnalyticsTimeRange,
  JarvisContext,
  CoreMetricsSummary,
  MetricValue,
  DetectedPattern,
  SubjectIntelligenceData,
  BehaviorAnalysisData,
  TimeWindowBehavior,
  DurationBucketBehavior,
  DayOfWeekBehavior,
  BehavioralClaimPhrasing,
  ExecutiveBriefing,
  DataQualityState,
  TrendDirection,
  DailyPerformancePoint,
  StudyHealthScore,
  PerformanceChangeIndicator,
  SubjectAttentionItem,
  StudyHeatmapDay,
} from "./types";
import { ANALYTICS_CONFIG, classifyDataQuality, classifySubjectRisk } from "./analyticsConfig";
import { RuleBasedInsightGenerator, RuleBasedRecommendationGenerator } from "./generators";

type SubjectRow = Database["public"]["Tables"]["subjects"]["Row"];
type TopicRow = Database["public"]["Tables"]["topics"]["Row"];
type LearningItemRow = Database["public"]["Tables"]["learning_items"]["Row"];

interface PlannedSessionWithPlan {
  id: string;
  study_plan_id: string;
  user_id: string;
  subject_id: string | null;
  topic_id: string | null;
  learning_item_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  planned_minutes: number;
  status: string;
  created_at: string;
  updated_at: string;
  study_plans?: { plan_date: string } | null;
}

function calculateMetricDelta(current: number, previous: number): MetricValue {
  const diff = current - previous;
  let pct = 0;

  if (previous > 0) {
    pct = Math.round((diff / previous) * 100);
  } else if (current > 0) {
    pct = 100;
  }

  let trend: TrendDirection = "stable";
  if (diff > 0.5) trend = "improving";
  else if (diff < -0.5) trend = "declining";

  return {
    current,
    previous,
    difference: Number(diff.toFixed(1)),
    percentageChange: pct,
    trend,
    formattedCurrent: String(current),
    formattedPrevious: String(previous),
  };
}

function getTimeWindowLabel(hour: number): TimeWindowBehavior["windowName"] {
  if (hour >= 6 && hour < 12) return "Morning (6 AM–12 PM)";
  if (hour >= 12 && hour < 17) return "Afternoon (12 PM–5 PM)";
  if (hour >= 17 && hour < 21) return "Evening (5 PM–9 PM)";
  return "Night (9 PM–6 AM)";
}

function getDurationBucketLabel(minutes: number): DurationBucketBehavior["bucketLabel"] {
  if (minutes < 30) return "< 30 min";
  if (minutes <= 45) return "30–45 min";
  if (minutes <= 60) return "45–60 min";
  if (minutes <= 90) return "60–90 min";
  return "90+ min";
}

/**
 * Fetch all required StudyOS data for a user in a single batch.
 * Uses authenticated Supabase client to pass RLS when token is available.
 */
export async function fetchRawAnalyticsData(userId: string, rangeDays: number, accessToken?: string | null) {
  const supabase = accessToken ? getAuthenticatedSupabaseClient(accessToken) : getSupabaseClient();
  const now = new Date();
  
  // Current range boundaries
  const currentStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  const currentEnd = now;

  // Previous baseline range boundaries
  const previousStart = new Date(now.getTime() - rangeDays * 2 * 24 * 60 * 60 * 1000);
  const previousEnd = currentStart;

  const [
    { data: studySessionsData },
    { data: studyPlansData },
    { data: plannedSessionsData },
    { data: subjectsData },
    { data: topicsData },
    { data: learningItemsData },
    { data: tasksData },
  ] = await Promise.all([
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId),
    
    supabase
      .from("study_plans")
      .select("*")
      .eq("user_id", userId),

    supabase
      .from("planned_sessions")
      .select("*")
      .eq("user_id", userId),

    supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", false),

    supabase
      .from("topics")
      .select("*"),

    supabase
      .from("learning_items")
      .select("*"),

    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId),
  ]);

  const studySessions = studySessionsData || [];
  const studyPlans = studyPlansData || [];
  const rawPlannedSessions = plannedSessionsData || [];
  const subjects = subjectsData || [];
  const topics = topicsData || [];
  const learningItems = learningItemsData || [];
  const tasks = tasksData || [];

  // Create plan date lookup map
  const planDateMap = new Map<string, string>();
  studyPlans.forEach((plan) => planDateMap.set(plan.id, plan.plan_date));

  // Attach study_plans.plan_date to plannedSessions
  const plannedSessions: PlannedSessionWithPlan[] = rawPlannedSessions.map((ps) => {
    const planDate = planDateMap.get(ps.study_plan_id) || ps.created_at.split("T")[0];
    return {
      ...ps,
      study_plans: { plan_date: planDate },
    };
  });

  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    studySessions,
    plannedSessions,
    subjects,
    topics,
    learningItems,
    tasks,
  };
}

/**
 * Main Progressive Deterministic Analytics Engine function
 */
export async function computeJarvisAnalytics(
  userId: string,
  range: AnalyticsTimeRange = "7d",
  accessToken?: string | null
): Promise<JarvisContext> {
  const rangeDays = range === "90d" ? 90 : range === "30d" ? 30 : 7;
  const nowISO = new Date().toISOString();

  const {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    studySessions,
    plannedSessions,
    subjects,
    topics,
    learningItems,
    tasks,
  } = await fetchRawAnalyticsData(userId, rangeDays, accessToken);

  const currentStartMs = currentStart.getTime();

  // Partition sessions into current range vs previous baseline period
  const currentStudySessions = studySessions.filter(
    (s) => new Date(s.started_at).getTime() >= currentStartMs
  );
  const previousStudySessions = studySessions.filter((s) => {
    const t = new Date(s.started_at).getTime();
    return t < currentStartMs && t >= previousStart.getTime();
  });

  const currentPlanned = plannedSessions.filter((p) => {
    const planDateStr = p.study_plans?.plan_date;
    if (!planDateStr) return false;
    const planDateMs = new Date(`${planDateStr}T00:00:00`).getTime();
    return planDateMs >= currentStartMs;
  });

  const previousPlanned = plannedSessions.filter((p) => {
    const planDateStr = p.study_plans?.plan_date;
    if (!planDateStr) return false;
    const planDateMs = new Date(`${planDateStr}T00:00:00`).getTime();
    return planDateMs < currentStartMs && planDateMs >= previousStart.getTime();
  });

  // Evaluate Data Quality
  const currentPeriodCount = Math.max(currentStudySessions.length, currentPlanned.length);
  const previousPeriodCount = Math.max(previousStudySessions.length, previousPlanned.length);
  const totalUserActivityCount = studySessions.length + plannedSessions.length;
  
  const dataQuality: DataQualityState = classifyDataQuality(currentPeriodCount);

  // Progressive Revelation: Show analytics dashboard as long as user has any data or subjects in StudyOS
  const hasAnyData = totalUserActivityCount > 0 || currentPeriodCount > 0 || subjects.length > 0;
  const isSufficientData = hasAnyData;

  const insufficientReason = !hasAnyData
    ? "No study sessions, planned sessions, or subjects found for this user."
    : null;

  // Development server diagnostics logging
  if (process.env.NODE_ENV !== "production") {
    console.log("[JARVIS ANALYTICS DEBUG]");
    console.log("userId:", userId);
    console.log("range:", range);
    console.log("currentPeriod:", {
      start: currentStart.toISOString(),
      end: currentEnd.toISOString(),
      studySessions: currentStudySessions.length,
      plannedSessions: currentPlanned.length,
    });
    console.log("previousPeriod:", {
      start: previousStart.toISOString(),
      end: previousEnd.toISOString(),
      studySessions: previousStudySessions.length,
      plannedSessions: previousPlanned.length,
      previousPeriodCount,
    });
    console.log("subjects:", subjects.length);
    console.log("topics:", topics.length);
    console.log("learningItems:", learningItems.length);
    console.log("tasks:", tasks.length);
    console.log("dataQuality:", dataQuality);
    console.log("insufficient:", !isSufficientData);
    console.log("insufficientReason:", insufficientReason);
  }

  // 1. Calculate Core Metrics
  const curStudyTimeMinutes = currentStudySessions.reduce(
    (acc, s) => acc + (s.actual_minutes || s.planned_minutes || 0),
    0
  );
  const prevStudyTimeMinutes = previousStudySessions.reduce(
    (acc, s) => acc + (s.actual_minutes || s.planned_minutes || 0),
    0
  );

  const curPlannedCompleted = currentPlanned.filter((p) => p.status === "COMPLETED").length;
  const curPlannedTotal = currentPlanned.length;
  const curCompRate = curPlannedTotal > 0 ? Math.round((curPlannedCompleted / curPlannedTotal) * 100) : 0;

  const prevPlannedCompleted = previousPlanned.filter((p) => p.status === "COMPLETED").length;
  const prevPlannedTotal = previousPlanned.length;
  const prevCompRate = prevPlannedTotal > 0 ? Math.round((prevPlannedCompleted / prevPlannedTotal) * 100) : 0;

  const curCompletedStudySessions = currentStudySessions.filter((s) => s.status === "COMPLETED");
  const prevCompletedStudySessions = previousStudySessions.filter((s) => s.status === "COMPLETED");

  const curAvgDuration =
    curCompletedStudySessions.length > 0
      ? Math.round(curStudyTimeMinutes / curCompletedStudySessions.length)
      : curPlannedTotal > 0
      ? Math.round(currentPlanned.reduce((a, b) => a + (b.planned_minutes || 0), 0) / curPlannedTotal)
      : 0;

  const prevAvgDuration =
    prevCompletedStudySessions.length > 0
      ? Math.round(prevStudyTimeMinutes / prevCompletedStudySessions.length)
      : prevPlannedTotal > 0
      ? Math.round(previousPlanned.reduce((a, b) => a + (b.planned_minutes || 0), 0) / prevPlannedTotal)
      : 0;

  const curPlannedMinutesTotal = currentPlanned.reduce((acc, p) => acc + (p.planned_minutes || 0), 0);
  const prevPlannedMinutesTotal = previousPlanned.reduce((acc, p) => acc + (p.planned_minutes || 0), 0);

  const curAdherence =
    curPlannedMinutesTotal > 0 ? Math.round((curStudyTimeMinutes / curPlannedMinutesTotal) * 100) : 100;
  const prevAdherence =
    prevPlannedMinutesTotal > 0 ? Math.round((prevStudyTimeMinutes / prevPlannedMinutesTotal) * 100) : 100;

  const metrics: CoreMetricsSummary = {
    studyTime: {
      ...calculateMetricDelta(curStudyTimeMinutes, prevStudyTimeMinutes),
      formattedCurrent: `${Math.floor(curStudyTimeMinutes / 60)}h ${curStudyTimeMinutes % 60}m`,
      formattedPrevious: `${Math.floor(prevStudyTimeMinutes / 60)}h ${prevStudyTimeMinutes % 60}m`,
    },
    completionRate: {
      ...calculateMetricDelta(curCompRate, prevCompRate),
      formattedCurrent: `${curCompRate}%`,
      formattedPrevious: `${prevCompRate}%`,
    },
    sessionCompletion: {
      ...calculateMetricDelta(curPlannedCompleted, prevPlannedCompleted),
      formattedCurrent: `${curPlannedCompleted} / ${curPlannedTotal}`,
      formattedPrevious: `${prevPlannedCompleted} / ${prevPlannedTotal}`,
    },
    averageSessionDuration: {
      ...calculateMetricDelta(curAvgDuration, prevAvgDuration),
      formattedCurrent: `${curAvgDuration} min`,
      formattedPrevious: `${prevAvgDuration} min`,
    },
    scheduleAdherence: {
      ...calculateMetricDelta(curAdherence, prevAdherence),
      formattedCurrent: `${curAdherence}% adherence`,
      formattedPrevious: `${prevAdherence}% adherence`,
    },
  };

  // Maps for efficient subject/topic lookup
  const subjectMap = new Map<string, SubjectRow>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const topicMap = new Map<string, TopicRow>();
  topics.forEach((t) => topicMap.set(t.id, t));

  const itemsBySubjectId = new Map<string, LearningItemRow[]>();
  learningItems.forEach((item) => {
    const topic = topicMap.get(item.topic_id);
    if (topic) {
      const existing = itemsBySubjectId.get(topic.subject_id) || [];
      existing.push(item);
      itemsBySubjectId.set(topic.subject_id, existing);
    }
  });

  // Track strongest subject callout so at most ONE subject is highlighted as strongest
  let strongestSubjectId: string | null = null;

  // 2. Compute Subject Intelligence Data (Enforcing 0/0 Activity Fix & Separate Activity Status)
  const subjectIntelList: SubjectIntelligenceData[] = subjects.map((sub) => {
    const subItems = itemsBySubjectId.get(sub.id) || [];
    const totalItems = subItems.length;
    const completedItems = subItems.filter((i) => i.status === "COMPLETED").length;
    const actualProgPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const subPlanned = currentPlanned.filter((p) => p.subject_id === sub.id);
    const subPlannedTotal = subPlanned.length;
    const subPlannedComp = subPlanned.filter((p) => p.status === "COMPLETED").length;

    const subStudySessions = currentStudySessions.filter((s) => {
      if (s.learning_item_id) {
        const item = subItems.find((i) => i.id === s.learning_item_id);
        if (item) return true;
      }
      if (s.planned_session_id) {
        const ps = currentPlanned.find((p) => p.id === s.planned_session_id);
        return ps?.subject_id === sub.id;
      }
      return false;
    });

    const subStudyTime = subStudySessions.reduce(
      (acc, s) => acc + (s.actual_minutes || s.planned_minutes || 0),
      0
    );

    const missedCount = subPlanned.filter((p) => p.status === "MISSED").length;

    const windowVelocity = subItems.filter((item) => {
      if (!item.completed_at) return false;
      return new Date(item.completed_at).getTime() >= currentStartMs;
    }).length;

    // Check for zero-activity / insufficient activity case
    const isInsufficientActivity =
      subPlannedTotal === 0 && subStudySessions.length === 0 && actualProgPct === 0 && completedItems === 0;

    if (isInsufficientActivity) {
      return {
        id: sub.id,
        name: sub.name,
        color: sub.color || "#22d3ee",
        studyTimeMinutes: 0,
        completionRate: null, // 0/0 -> null
        plannedProgressPercentage: 0,
        actualProgressPercentage: 0,
        trend: "stable" as TrendDirection,
        missedSessionsCount: 0,
        topicCompletionVelocity: 0,
        activityStatus: "INSUFFICIENT_ACTIVITY" as const,
        riskLevel: null, // NO risk level assigned for zero activity
        jarvisCommentary: "There isn't enough recent activity to evaluate this subject.",
      };
    }

    // Active Subject
    const subCompRate = subPlannedTotal > 0 ? Math.round((subPlannedComp / subPlannedTotal) * 100) : 100;
    const plannedProgPct = Math.min(100, Math.round(actualProgPct + (subPlannedTotal > 0 ? 10 : 0)));

    const riskLevel = classifySubjectRisk(subCompRate, plannedProgPct, actualProgPct);

    let trend: TrendDirection = "stable";
    if (subCompRate >= 85) trend = "improving";
    else if (subCompRate < 70 || missedCount > 1) trend = "declining";

    let commentary = `${sub.name} progress is active with steady session completion.`;
    if (riskLevel === "CRITICAL") {
      commentary = `${sub.name} is critically behind planned schedule with low completion rate.`;
    } else if (riskLevel === "AT_RISK") {
      commentary = `${sub.name} is lagging behind planned progress by ${plannedProgPct - actualProgPct}%.`;
    } else if (riskLevel === "HEALTHY" && actualProgPct > 0 && !strongestSubjectId) {
      strongestSubjectId = sub.id;
      commentary = `${sub.name} is currently your strongest active subject.`;
    }

    return {
      id: sub.id,
      name: sub.name,
      color: sub.color || "#22d3ee",
      studyTimeMinutes: subStudyTime,
      completionRate: subCompRate,
      plannedProgressPercentage: plannedProgPct,
      actualProgressPercentage: actualProgPct,
      trend,
      missedSessionsCount: missedCount,
      topicCompletionVelocity: windowVelocity,
      activityStatus: "ACTIVE" as const,
      riskLevel,
      jarvisCommentary: commentary,
    };
  });

  // 3. Compute Behavior Analysis Data with Confidence-Aware Phrasing
  const windowBuckets: Record<TimeWindowBehavior["windowName"], { total: number; completed: number; durationSum: number }> = {
    "Morning (6 AM–12 PM)": { total: 0, completed: 0, durationSum: 0 },
    "Afternoon (12 PM–5 PM)": { total: 0, completed: 0, durationSum: 0 },
    "Evening (5 PM–9 PM)": { total: 0, completed: 0, durationSum: 0 },
    "Night (9 PM–6 AM)": { total: 0, completed: 0, durationSum: 0 },
  };

  const combinedSessionsForTimeWindow = [
    ...currentStudySessions.map((s) => ({
      startedAt: s.started_at,
      status: s.status,
      minutes: s.actual_minutes || s.planned_minutes || 0,
    })),
    ...currentPlanned.map((p) => {
      const planDateStr = p.study_plans?.plan_date || new Date().toISOString().split("T")[0];
      const startIso = `${planDateStr}T${(p.start_time || "09:00").slice(0, 5)}:00`;
      return {
        startedAt: startIso,
        status: p.status,
        minutes: p.planned_minutes || 0,
      };
    }),
  ];

  combinedSessionsForTimeWindow.forEach((s) => {
    const started = new Date(s.startedAt);
    const win = getTimeWindowLabel(started.getHours());
    windowBuckets[win].total += 1;
    if (s.status === "COMPLETED") windowBuckets[win].completed += 1;
    windowBuckets[win].durationSum += s.minutes;
  });

  const timeWindows: TimeWindowBehavior[] = (Object.keys(windowBuckets) as Array<keyof typeof windowBuckets>).map(
    (winName) => {
      const b = windowBuckets[winName];
      const compRate = b.total > 0 ? Math.round((b.completed / b.total) * 100) : 0;
      const avgDur = b.completed > 0 ? Math.round(b.durationSum / b.completed) : 0;
      return {
        windowName: winName,
        totalSessions: b.total,
        completionRate: compRate,
        averageDurationMinutes: avgDur,
      };
    }
  );

  let bestStudyTimeWindow: TimeWindowBehavior | null = null;
  let bestStudyTimeClaim: BehavioralClaimPhrasing = {
    phrase: "JARVIS needs more session history to determine your optimal study window.",
    tier: "INSUFFICIENT_DATA",
  };

  const eligibleWindows = timeWindows.filter((w) => w.totalSessions >= 2);
  if (eligibleWindows.length > 0) {
    eligibleWindows.sort((a, b) => b.completionRate - a.completionRate);
    bestStudyTimeWindow = eligibleWindows[0];
    const winShortName = bestStudyTimeWindow.windowName.split(" ")[0];

    if (bestStudyTimeWindow.totalSessions >= 8) {
      bestStudyTimeClaim = {
        phrase: `Your strongest study window is ${winShortName}.`,
        tier: "HIGH_CONFIDENCE",
      };
    } else if (bestStudyTimeWindow.totalSessions >= 4) {
      bestStudyTimeClaim = {
        phrase: `Your data suggests ${winShortName} sessions may work best for you.`,
        tier: "MODERATE_CONFIDENCE",
      };
    } else {
      bestStudyTimeClaim = {
        phrase: `Early evidence points toward ${winShortName} sessions.`,
        tier: "LOW_CONFIDENCE",
      };
    }
  }

  const durationBucketMap: Record<DurationBucketBehavior["bucketLabel"], { total: number; completed: number; durationSum: number }> = {
    "< 30 min": { total: 0, completed: 0, durationSum: 0 },
    "30–45 min": { total: 0, completed: 0, durationSum: 0 },
    "45–60 min": { total: 0, completed: 0, durationSum: 0 },
    "60–90 min": { total: 0, completed: 0, durationSum: 0 },
    "90+ min": { total: 0, completed: 0, durationSum: 0 },
  };

  combinedSessionsForTimeWindow.forEach((s) => {
    const mins = s.minutes;
    const bucketLabel = getDurationBucketLabel(mins);
    durationBucketMap[bucketLabel].total += 1;
    if (s.status === "COMPLETED") durationBucketMap[bucketLabel].completed += 1;
    durationBucketMap[bucketLabel].durationSum += mins;
  });

  const durationBuckets: DurationBucketBehavior[] = (
    Object.keys(durationBucketMap) as Array<keyof typeof durationBucketMap>
  ).map((label) => {
    const b = durationBucketMap[label];
    const compRate = b.total > 0 ? Math.round((b.completed / b.total) * 100) : 0;
    const avgMins = b.completed > 0 ? Math.round(b.durationSum / b.completed) : 0;
    return {
      bucketLabel: label,
      totalSessions: b.total,
      completionRate: compRate,
      averageActualMinutes: avgMins,
    };
  });

  let optimalSessionDuration: DurationBucketBehavior | null = null;
  let optimalDurationClaim: BehavioralClaimPhrasing = {
    phrase: "JARVIS needs more session history to determine your optimal session length.",
    tier: "INSUFFICIENT_DATA",
  };

  const eligibleBuckets = durationBuckets.filter((b) => b.totalSessions >= 2);
  if (eligibleBuckets.length > 0) {
    eligibleBuckets.sort((a, b) => b.completionRate - a.completionRate);
    optimalSessionDuration = eligibleBuckets[0];

    if (optimalSessionDuration.totalSessions >= 8) {
      optimalDurationClaim = {
        phrase: `Your strongest session duration is ${optimalSessionDuration.bucketLabel}.`,
        tier: "HIGH_CONFIDENCE",
      };
    } else if (optimalSessionDuration.totalSessions >= 4) {
      optimalDurationClaim = {
        phrase: `Your data suggests ${optimalSessionDuration.bucketLabel} sessions work best.`,
        tier: "MODERATE_CONFIDENCE",
      };
    } else {
      optimalDurationClaim = {
        phrase: `Early evidence points toward ${optimalSessionDuration.bucketLabel} sessions.`,
        tier: "LOW_CONFIDENCE",
      };
    }
  }

  const daysArr: DayOfWeekBehavior["dayName"][] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeekMap = daysArr.map((dayName, idx) => ({
    dayName,
    dayIndex: idx,
    totalSessions: 0,
    completed: 0,
    studyTimeMinutes: 0,
  }));

  combinedSessionsForTimeWindow.forEach((s) => {
    const dayIdx = new Date(s.startedAt).getDay();
    dayOfWeekMap[dayIdx].totalSessions += 1;
    if (s.status === "COMPLETED") dayOfWeekMap[dayIdx].completed += 1;
    dayOfWeekMap[dayIdx].studyTimeMinutes += s.minutes;
  });

  const dayOfWeekPerformance: DayOfWeekBehavior[] = dayOfWeekMap.map((d) => ({
    dayName: d.dayName,
    dayIndex: d.dayIndex,
    totalSessions: d.totalSessions,
    completionRate: d.totalSessions > 0 ? Math.round((d.completed / d.totalSessions) * 100) : 0,
    studyTimeMinutes: d.studyTimeMinutes,
  }));

  let mostConsistentDay: DayOfWeekBehavior | null = null;
  const activeDays = dayOfWeekPerformance.filter((d) => d.totalSessions >= 1);
  if (activeDays.length > 0) {
    activeDays.sort((a, b) => b.completionRate - a.completionRate);
    mostConsistentDay = activeDays[0];
  }

  const behavior: BehaviorAnalysisData = {
    timeWindows,
    bestStudyTimeWindow,
    bestStudyTimeClaim,
    durationBuckets,
    optimalSessionDuration,
    optimalDurationClaim,
    dayOfWeekPerformance,
    mostConsistentDay,
  };

  // 4. Pattern Detection (Multi-factor Confidence Scoring)
  const detectedPatterns: DetectedPattern[] = [];

  if (currentPeriodCount > 0) {
    // Pattern A: Consistency Shift
    const compRateDiff = curCompRate - prevCompRate;
    if (Math.abs(compRateDiff) >= 5 || curCompRate > 0) {
      const isPositive = compRateDiff >= 0;
      const sampleSizeFactor = Math.min(1, currentPeriodCount / 10);
      const effectSizeFactor = Math.min(1, Math.max(Math.abs(compRateDiff), 10) / 30);
      const consistencyFactor = curCompRate > 75 ? 0.9 : 0.6;

      const confidence = Number(
        (
          sampleSizeFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.SAMPLE_SIZE_WEIGHT +
          effectSizeFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.EFFECT_SIZE_WEIGHT +
          consistencyFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.CONSISTENCY_WEIGHT
        ).toFixed(2)
      );

      detectedPatterns.push({
        id: isPositive ? "pattern_consistency_improving" : "pattern_consistency_declining",
        type: isPositive ? "POSITIVE" : "WARNING",
        category: "Consistency",
        title: isPositive ? "Study consistency is active" : "Study consistency has dropped",
        explanation: isPositive
          ? `Your planned session completion rate is currently at ${curCompRate}%.`
          : `Your session completion rate decreased compared to the previous period.`,
        severity: isPositive ? "LOW" : "MEDIUM",
        confidence,
        sampleSize: currentPeriodCount,
        effectSize: Math.abs(compRateDiff),
        consistency: consistencyFactor,
        evidence: {
          summary: `Completion rate is currently ${curCompRate}%.`,
          primaryMetricName: "Current Period",
          comparisonMetricName: "Previous Period",
          details: [
            {
              label: "Completion Rate",
              primaryValue: curCompRate,
              comparisonValue: prevCompRate,
              formattedPrimary: `${curCompRate}%`,
              formattedComparison: `${prevCompRate}%`,
              unit: "%",
            },
            {
              label: "Completed Sessions",
              primaryValue: curPlannedCompleted,
              comparisonValue: prevPlannedCompleted,
              formattedPrimary: `${curPlannedCompleted}`,
              formattedComparison: `${prevPlannedCompleted}`,
            },
          ],
          chartData: [
            { name: "Previous", current: prevCompRate, baseline: prevCompRate },
            { name: "Current", current: curCompRate, baseline: prevCompRate },
          ],
        },
        detectedAt: nowISO,
        impactScore: isPositive ? 0.7 : 0.85,
        urgencyScore: isPositive ? 0.3 : 0.8,
        actionabilityScore: 0.8,
      });
    }

    // Pattern B: Subject Lag Warnings
    subjectIntelList.forEach((sub) => {
      if (sub.activityStatus !== "ACTIVE") return;
      const lag = sub.plannedProgressPercentage - sub.actualProgressPercentage;
      if (lag >= 5 || sub.riskLevel === "CRITICAL" || sub.riskLevel === "AT_RISK") {
        const sampleSizeFactor = Math.min(1, Math.max(sub.studyTimeMinutes / 60, 1) / 3);
        const effectSizeFactor = Math.min(1, Math.max(lag, 10) / 30);
        const consistencyFactor = sub.completionRate !== null && sub.completionRate < 60 ? 0.85 : 0.65;

        const confidence = Number(
          (
            sampleSizeFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.SAMPLE_SIZE_WEIGHT +
            effectSizeFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.EFFECT_SIZE_WEIGHT +
            consistencyFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.CONSISTENCY_WEIGHT
          ).toFixed(2)
        );

        detectedPatterns.push({
          id: `subject_behind_${sub.id}`,
          type: "WARNING",
          category: "Subject Pace",
          title: `${sub.name} is falling behind planned pace`,
          explanation: `${sub.name} actual progress (${sub.actualProgressPercentage}%) lags planned progress (${sub.plannedProgressPercentage}%).`,
          severity: sub.riskLevel === "CRITICAL" ? "HIGH" : "MEDIUM",
          confidence,
          sampleSize: sub.missedSessionsCount + 3,
          effectSize: lag,
          consistency: consistencyFactor,
          evidence: {
            summary: `Actual progress is ${sub.actualProgressPercentage}% vs planned ${sub.plannedProgressPercentage}%.`,
            primaryMetricName: "Planned Progress",
            comparisonMetricName: "Actual Progress",
            details: [
              {
                label: "Planned Progress",
                primaryValue: sub.plannedProgressPercentage,
                comparisonValue: sub.actualProgressPercentage,
                formattedPrimary: `${sub.plannedProgressPercentage}%`,
                formattedComparison: `${sub.actualProgressPercentage}%`,
                unit: "%",
              },
              {
                label: "Missed Sessions",
                primaryValue: sub.missedSessionsCount,
                comparisonValue: 0,
                formattedPrimary: `${sub.missedSessionsCount}`,
                formattedComparison: `0`,
              },
            ],
            chartData: [
              { name: "Planned", current: sub.plannedProgressPercentage, baseline: 100 },
              { name: "Actual", current: sub.actualProgressPercentage, baseline: 100 },
            ],
          },
          detectedAt: nowISO,
          subjectId: sub.id,
          subjectName: sub.name,
          impactScore: sub.riskLevel === "CRITICAL" ? 0.95 : 0.75,
          urgencyScore: sub.riskLevel === "CRITICAL" ? 0.9 : 0.7,
          actionabilityScore: 0.85,
        });
      }
    });

    // Pattern C: Optimal Session Duration
    if (optimalSessionDuration && optimalSessionDuration.totalSessions >= 2) {
      const sampleSizeFactor = Math.min(1, optimalSessionDuration.totalSessions / 5);
      const effectSizeFactor = Math.min(1, Math.max(optimalSessionDuration.completionRate, 50) / 100);
      const confidence = Number(
        (
          sampleSizeFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.SAMPLE_SIZE_WEIGHT +
          effectSizeFactor * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.EFFECT_SIZE_WEIGHT +
          0.7 * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.CONSISTENCY_WEIGHT
        ).toFixed(2)
      );

      detectedPatterns.push({
        id: `optimal_duration_${optimalSessionDuration.bucketLabel.replace(/\s+/g, "_")}`,
        type: "BEHAVIORAL",
        category: "Session Duration",
        title: `Optimal session length: ${optimalSessionDuration.bucketLabel}`,
        explanation: `Sessions between ${optimalSessionDuration.bucketLabel} yielded your highest completion rate (${optimalSessionDuration.completionRate}%).`,
        severity: "LOW",
        confidence,
        sampleSize: optimalSessionDuration.totalSessions,
        effectSize: optimalSessionDuration.completionRate,
        consistency: 0.8,
        evidence: {
          summary: `${optimalSessionDuration.bucketLabel} sessions achieved ${optimalSessionDuration.completionRate}% completion rate.`,
          primaryMetricName: optimalSessionDuration.bucketLabel,
          comparisonMetricName: "Overall Average",
          details: durationBuckets.map((b) => ({
            label: b.bucketLabel,
            primaryValue: b.completionRate,
            comparisonValue: curCompRate,
            formattedPrimary: `${b.completionRate}%`,
            formattedComparison: `${curCompRate}%`,
            unit: "%",
          })),
          chartData: durationBuckets.map((b) => ({
            name: b.bucketLabel,
            current: b.completionRate,
            baseline: curCompRate,
          })),
        },
        detectedAt: nowISO,
        impactScore: 0.65,
        urgencyScore: 0.3,
        actionabilityScore: 0.9,
      });
    }

    // Pattern D: Evening / Time Window Drop-off
    const eveningWindow = timeWindows.find((w) => w.windowName.startsWith("Evening"));
    const morningWindow = timeWindows.find((w) => w.windowName.startsWith("Morning"));

    if (
      eveningWindow &&
      eveningWindow.totalSessions >= 2 &&
      morningWindow &&
      morningWindow.totalSessions >= 2 &&
      morningWindow.completionRate - eveningWindow.completionRate >= 15
    ) {
      const drop = morningWindow.completionRate - eveningWindow.completionRate;
      const confidence = Number(
        (
          0.6 * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.SAMPLE_SIZE_WEIGHT +
          (drop / 50) * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.EFFECT_SIZE_WEIGHT +
          0.75 * ANALYTICS_CONFIG.CONFIDENCE_WEIGHTS.CONSISTENCY_WEIGHT
        ).toFixed(2)
      );

      detectedPatterns.push({
        id: "evening_drop_pattern",
        type: "TIME_BASED",
        category: "Study Window",
        title: "Evening sessions have lower completion rates",
        explanation: `Session completion after 5 PM is ${drop}% lower than daytime morning sessions.`,
        severity: "MEDIUM",
        confidence,
        sampleSize: eveningWindow.totalSessions + morningWindow.totalSessions,
        effectSize: drop,
        consistency: 0.75,
        evidence: {
          summary: `Morning completion rate is ${morningWindow.completionRate}% vs Evening ${eveningWindow.completionRate}%.`,
          primaryMetricName: "Morning",
          comparisonMetricName: "Evening",
          details: [
            {
              label: "Morning Completion Rate",
              primaryValue: morningWindow.completionRate,
              comparisonValue: eveningWindow.completionRate,
              formattedPrimary: `${morningWindow.completionRate}%`,
              formattedComparison: `${eveningWindow.completionRate}%`,
              unit: "%",
            },
            {
              label: "Evening Completion Rate",
              primaryValue: eveningWindow.completionRate,
              comparisonValue: morningWindow.completionRate,
              formattedPrimary: `${eveningWindow.completionRate}%`,
              formattedComparison: `${morningWindow.completionRate}%`,
              unit: "%",
            },
          ],
          chartData: timeWindows.map((w) => ({
            name: w.windowName.split(" ")[0],
            current: w.completionRate,
            baseline: curCompRate,
          })),
        },
        detectedAt: nowISO,
        impactScore: 0.75,
        urgencyScore: 0.6,
        actionabilityScore: 0.85,
      });
    }
  }

  // 5. Generate Ranked Insights & Recommendations
  const insightGenerator = new RuleBasedInsightGenerator();
  const rankedInsights = insightGenerator.generateInsights(detectedPatterns);

  const recommendationGenerator = new RuleBasedRecommendationGenerator();
  const recommendations = recommendationGenerator.generateRecommendations(detectedPatterns, subjectIntelList);

  // 6. Synthesize Dynamic Executive Briefing
  let overallStatus: ExecutiveBriefing["status"] = "Healthy";
  const hasCritical = subjectIntelList.some((s) => s.riskLevel === "CRITICAL");
  const hasAtRisk = subjectIntelList.some((s) => s.riskLevel === "AT_RISK");

  if (hasCritical) overallStatus = "Critical";
  else if (hasAtRisk || curCompRate < 70) overallStatus = "Needs Attention";
  else if (curCompRate >= 80) overallStatus = "Healthy";
  else overallStatus = "Stable";

  let briefMessage = "JARVIS needs more study history to detect reliable behavioral patterns.";
  if (currentPeriodCount > 0 || subjects.length > 0) {
    if (rankedInsights.length > 0) {
      const topInsight = rankedInsights[0];
      const secondInsight = rankedInsights[1];
      briefMessage = `${topInsight.explanation} ${secondInsight ? secondInsight.explanation : ""}`;
    } else {
      briefMessage = `Your study session consistency is active with a ${curCompRate}% session completion rate across your active subjects.`;
    }
  }

  const avgConfidence =
    rankedInsights.length > 0
      ? Number(
          (
            rankedInsights.reduce((acc, i) => acc + i.confidence, 0) / rankedInsights.length
          ).toFixed(2)
        )
      : 0.75;

  const briefing: ExecutiveBriefing = {
    message: briefMessage,
    status: overallStatus,
    overallConfidence: avgConfidence,
    detectedPatternsCount: rankedInsights.length,
    analyzedAt: nowISO,
  };

  // 7. Compute Daily Performance Points & Heatmap for Selected Time Range
  const dailyPerformance: DailyPerformancePoint[] = [];
  const heatmap: StudyHeatmapDay[] = [];
  const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = rangeDays - 1; i >= 0; i--) {
    const targetDate = new Date(currentEnd.getTime() - i * 24 * 60 * 60 * 1000);
    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, "0");
    const d = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const dayOfWeek = targetDate.getDay();
    const dayName = dayNamesShort[dayOfWeek];

    const displayDate =
      rangeDays <= 7
        ? targetDate.toLocaleDateString("en-US", { weekday: "short" })
        : targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Actual sessions on dateStr
    const dayStudySessions = currentStudySessions.filter((s) => {
      const sDate = s.started_at ? s.started_at.split("T")[0] : "";
      return sDate === dateStr;
    });
    const actualMinutes = dayStudySessions.reduce(
      (acc, s) => acc + (s.actual_minutes || s.planned_minutes || 0),
      0
    );

    // Planned sessions on dateStr
    const dayPlannedSessions = currentPlanned.filter((p) => {
      const pDate = p.study_plans?.plan_date || (p.created_at ? p.created_at.split("T")[0] : "");
      return pDate === dateStr;
    });
    const plannedMinutes = dayPlannedSessions.reduce((acc, p) => acc + (p.planned_minutes || 0), 0);

    const completedPlanned = dayPlannedSessions.filter((p) => p.status === "COMPLETED").length;
    const completedAdhoc = dayStudySessions.filter(
      (s) => s.status === "COMPLETED" && !s.planned_session_id
    ).length;
    const completedSessions = completedPlanned + completedAdhoc;
    const missedSessions = dayPlannedSessions.filter((p) => p.status === "MISSED").length;
    const totalSessions = Math.max(dayPlannedSessions.length, dayStudySessions.length);
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const actualHours = Math.round((actualMinutes / 60) * 10) / 10;
    const plannedHours = Math.round((plannedMinutes / 60) * 10) / 10;

    dailyPerformance.push({
      date: dateStr,
      displayDate,
      actualMinutes,
      plannedMinutes,
      actualHours,
      plannedHours,
      completedSessions,
      missedSessions,
      totalSessions,
      completionRate,
    });

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (actualMinutes >= 180) intensity = 4;
    else if (actualMinutes >= 90) intensity = 3;
    else if (actualMinutes >= 45) intensity = 2;
    else if (actualMinutes > 0) intensity = 1;

    heatmap.push({
      date: dateStr,
      dayOfWeek,
      dayName,
      studyMinutes: actualMinutes,
      studyHours: actualHours,
      sessionCount: completedSessions,
      completionRate,
      intensity,
    });
  }

  // 8. Compute Deterministic Study Health Score (0-100)
  const activeDaysCount = dailyPerformance.filter((d) => d.actualMinutes > 0 || d.completedSessions > 0).length;
  const targetDays = Math.max(1, Math.round(rangeDays * 0.65));
  const consistencyScore = Math.min(100, Math.round((activeDaysCount / targetDays) * 100));
  const completionScore = curCompRate;
  const adherenceScore = Math.min(100, Math.max(0, curAdherence));
  const focusScore =
    curCompletedStudySessions.length > 0
      ? Math.min(100, Math.round((curCompletedStudySessions.length / Math.max(currentPeriodCount, 1)) * 100))
      : curCompRate > 0
      ? curCompRate
      : 70;

  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        consistencyScore * 0.25 + completionScore * 0.35 + adherenceScore * 0.20 + focusScore * 0.20
      )
    )
  );

  let healthStatus: StudyHealthScore["status"] = "Healthy";
  if (overallScore >= 85) healthStatus = "Exceptional";
  else if (overallScore >= 70) healthStatus = "Healthy";
  else if (overallScore >= 50) healthStatus = "Attention Needed";
  else healthStatus = "Critical";

  const healthScore: StudyHealthScore = {
    overallScore,
    consistencyScore,
    completionScore,
    adherenceScore,
    focusScore,
    status: healthStatus,
  };

  // 9. Compute "What Changed?" Indicators
  const whatChanged: PerformanceChangeIndicator[] = [];

  // Study Time delta
  const studyTimeDiffPct = metrics.studyTime.percentageChange;
  whatChanged.push({
    id: "change_study_time",
    label: "Study Time",
    value: metrics.studyTime.formattedCurrent,
    changeText: `${studyTimeDiffPct >= 0 ? "+" : ""}${studyTimeDiffPct}%`,
    trend: metrics.studyTime.trend,
    status: studyTimeDiffPct >= 0 ? "positive" : "negative",
    category: "metric",
    explanation: studyTimeDiffPct >= 0 ? "Increased logged focus time" : "Decreased focus hours",
  });

  // Completion rate delta
  const compDiff = metrics.completionRate.difference;
  whatChanged.push({
    id: "change_completion_rate",
    label: "Completion Rate",
    value: metrics.completionRate.formattedCurrent,
    changeText: `${compDiff >= 0 ? "+" : ""}${compDiff}%`,
    trend: metrics.completionRate.trend,
    status: compDiff >= 0 ? "positive" : "negative",
    category: "metric",
    explanation: compDiff >= 0 ? "Improved session follow-through" : "Session completion dropped",
  });

  // Sessions delta
  const sessionDiff = metrics.sessionCompletion.difference;
  whatChanged.push({
    id: "change_sessions",
    label: "Sessions Completed",
    value: metrics.sessionCompletion.formattedCurrent,
    changeText: `${sessionDiff >= 0 ? "+" : ""}${sessionDiff}`,
    trend: metrics.sessionCompletion.trend,
    status: sessionDiff >= 0 ? "positive" : "negative",
    category: "metric",
    explanation: `${curPlannedCompleted} of ${curPlannedTotal} planned sessions completed`,
  });

  // Subject-specific shifts
  subjectIntelList.forEach((sub) => {
    if (sub.activityStatus !== "ACTIVE") return;
    const lag = sub.plannedProgressPercentage - sub.actualProgressPercentage;
    if (sub.riskLevel === "CRITICAL" || lag >= 10) {
      whatChanged.push({
        id: `change_sub_${sub.id}`,
        label: `${sub.name}`,
        value: `${sub.actualProgressPercentage}% vs ${sub.plannedProgressPercentage}%`,
        changeText: `${lag}% lag`,
        trend: "declining",
        status: "negative",
        category: "subject",
        explanation: `${sub.name} is ${lag}% behind planned schedule`,
      });
    } else if (sub.riskLevel === "HEALTHY" && sub.actualProgressPercentage > 0) {
      whatChanged.push({
        id: `change_sub_${sub.id}`,
        label: `${sub.name}`,
        value: `${sub.actualProgressPercentage}%`,
        changeText: "On track",
        trend: "improving",
        status: "positive",
        category: "subject",
        explanation: `${sub.name} is on track with planned syllabus`,
      });
    }
  });

  // 10. Compute Subject Attention Ranking (Sorted by deviation / lag)
  const subjectAttention: SubjectAttentionItem[] = subjectIntelList
    .map((sub) => {
      const lag = sub.plannedProgressPercentage - sub.actualProgressPercentage;
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        color: sub.color,
        plannedProgress: sub.plannedProgressPercentage,
        actualProgress: sub.actualProgressPercentage,
        lag: Math.max(0, lag),
        riskLevel: sub.riskLevel,
        studyTimeMinutes: sub.studyTimeMinutes,
        isInactive: sub.activityStatus === "INSUFFICIENT_ACTIVITY",
      };
    })
    .sort((a, b) => b.lag - a.lag);

  // 11. Return complete structured JarvisContext
  return {
    range,
    dataQuality,
    briefing,
    metrics,
    insights: rankedInsights,
    subjects: subjectIntelList,
    behavior,
    recommendations,
    dailyPerformance,
    healthScore,
    whatChanged,
    subjectAttention,
    heatmap,
    meta: {
      analyzedAt: nowISO,
      dataQuality,
      sampleSizeSessions: currentPeriodCount,
      sampleSizePlanned: curPlannedTotal,
      timeRangeDays: rangeDays,
      isSufficientData,
    },
  };
}
