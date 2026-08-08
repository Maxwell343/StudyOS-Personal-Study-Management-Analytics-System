/**
 * Pure utility functions for plan/schedule computation.
 * These contain ZERO mock data — only logic.
 */
import type {
  PlanSession,
  PlannedTask,
  PlanHealthData,
  PlanHealthStatus,
  PlanConflict,
  SubjectAllocation,
  PlanSummary,
  JarvisPlanInsight,
} from "@/types/planner";

// ── Time Utilities ─────────────────────────────────────────────────────────

/** Convert "HH:MM" to minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Format total minutes into "Xh Ym" display */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

/** Calculate duration in minutes between two "HH:MM" times */
export function calculateDuration(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

/** Format "HH:MM" for display (24h format) */
export function formatTime(time: string): string {
  return time;
}

// ── Conflict Detection ─────────────────────────────────────────────────────

export function detectConflicts(sessions: PlanSession[]): PlanConflict[] {
  const conflicts: PlanConflict[] = [];
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const aEnd = timeToMinutes(a.endTime);
      const bStart = timeToMinutes(b.startTime);
      if (aEnd > bStart) {
        conflicts.push({ sessionA: a, sessionB: b });
      }
    }
  }
  return conflicts;
}

// ── Break Time Calculation ─────────────────────────────────────────────────

export function calculateBreakTime(sessions: PlanSession[]): number {
  if (sessions.length < 2) return 0;

  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  let breakMinutes = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap =
      timeToMinutes(sorted[i + 1].startTime) -
      timeToMinutes(sorted[i].endTime);
    if (gap > 0) {
      breakMinutes += gap;
    }
  }
  return breakMinutes;
}

// ── Plan Health Computation ────────────────────────────────────────────────

export function computePlanHealth(sessions: PlanSession[]): PlanHealthData {
  const totalStudyMinutes = sessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );
  const sessionCount = sessions.length;
  const breakMinutes = calculateBreakTime(sessions);
  const conflicts = detectConflicts(sessions);

  // Subject distribution
  const subjectMap = new Map<string, { minutes: number; color: string }>();
  for (const s of sessions) {
    const existing = subjectMap.get(s.subject) || {
      minutes: 0,
      color: s.color,
    };
    existing.minutes += s.durationMinutes;
    subjectMap.set(s.subject, existing);
  }
  const subjectDistribution: SubjectAllocation[] = Array.from(
    subjectMap.entries()
  ).map(([subject, data]) => ({
    subject,
    minutes: data.minutes,
    color: data.color,
  }));

  // V1 heuristic status
  let status: PlanHealthStatus;
  if (conflicts.length > 0) {
    status = "conflict";
  } else if (totalStudyMinutes < 120) {
    status = "underplanned";
  } else if (totalStudyMinutes > 480) {
    status = "overloaded";
  } else {
    status = "balanced";
  }

  return {
    status,
    totalStudyMinutes,
    sessionCount,
    breakMinutes,
    conflicts,
    subjectDistribution,
  };
}

// ── Plan Summary ───────────────────────────────────────────────────────────

export function computePlanSummary(
  sessions: PlanSession[],
  tasks: PlannedTask[]
): PlanSummary {
  const totalStudyMinutes = sessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );
  const breakMinutes = calculateBreakTime(sessions);
  const taskCount = tasks.filter((t) =>
    sessions.some((s) => s.taskId === t.id)
  ).length;

  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  return {
    totalStudyMinutes,
    sessionCount: sessions.length,
    taskCount,
    breakMinutes,
    earliestStart: sorted.length > 0 ? sorted[0].startTime : "--:--",
    latestEnd:
      sorted.length > 0 ? sorted[sorted.length - 1].endTime : "--:--",
  };
}

// ── JARVIS Insight Generation ──────────────────────────────────────────────

export function generateInsight(
  sessions: PlanSession[],
  health: PlanHealthData
): JarvisPlanInsight {
  if (sessions.length === 0) {
    return {
      message:
        "No sessions planned yet. Add study sessions to build your plan for tomorrow.",
    };
  }

  const hours = Math.floor(health.totalStudyMinutes / 60);
  const mins = health.totalStudyMinutes % 60;
  const timeStr = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;

  if (health.conflicts.length > 0) {
    return {
      message: `Your plan has ${health.conflicts.length} schedule conflict${health.conflicts.length > 1 ? "s" : ""}. Resolve overlapping sessions before locking your plan.`,
    };
  }

  if (health.status === "overloaded") {
    return {
      message: `You're planning ${timeStr} of focused study tomorrow. That's higher than a typical sustainable day. Consider reducing your workload.`,
    };
  }

  if (health.status === "underplanned") {
    return {
      message: `Only ${timeStr} of study planned for tomorrow. Consider adding more sessions to make the most of your day.`,
    };
  }

  return {
    message: `Your plan contains ${timeStr} of focused study across ${health.sessionCount} sessions with reasonable breaks between sessions.`,
  };
}
