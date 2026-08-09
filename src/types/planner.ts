// ── StudyOS Plan Tomorrow Type Definitions ─────────────────────────────────

export type PlanStatus = "draft" | "locked";

export type PlanHealthStatus =
  | "balanced"
  | "underplanned"
  | "overloaded"
  | "conflict";

export interface PlanSession {
  id: string;
  subject: string;
  topic: string;
  taskId?: string;
  learningItemId?: string;
  learningItemIds?: string[];
  taskIds?: string[];
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  durationMinutes: number;
  color: string;
  priority?: "high" | "medium" | "low";
}

export interface PlannedTask {
  id: string;
  label: string;
  subject: string;
  sessionId?: string;
  learningItemId?: string;
  topicName?: string;
  itemTitle?: string;
}

export interface PlanConflict {
  sessionA: PlanSession;
  sessionB: PlanSession;
}

export interface SubjectAllocation {
  subject: string;
  minutes: number;
  color: string;
}

export interface PlanHealthData {
  status: PlanHealthStatus;
  totalStudyMinutes: number;
  sessionCount: number;
  breakMinutes: number;
  conflicts: PlanConflict[];
  subjectDistribution: SubjectAllocation[];
}

export interface PlanSummary {
  totalStudyMinutes: number;
  sessionCount: number;
  taskCount: number;
  breakMinutes: number;
  earliestStart: string;
  latestEnd: string;
}

export interface JarvisPlanInsight {
  message: string;
}
