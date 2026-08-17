// ── StudyOS Auto Planner Recommendation System Type Definitions ────────────────

export type SubjectPriority = "HIGH" | "MEDIUM" | "LOW";

export interface SubjectPreferenceOverride {
  subjectId: string;
  isMandatory?: boolean;
  priority?: SubjectPriority;
  weeklyTargetDays?: number;
}

export interface AutoPlannerOptions {
  userId?: string;
  targetDate: string; // YYYY-MM-DD
  availableMinutes: number; // e.g. 240 (4 hours)
  preferredStartTime?: string; // HH:MM, default "09:00"
  overrides?: SubjectPreferenceOverride[];
  mandatorySubjectNames?: string[]; // Default: ["Python", "DSA"]
}

export interface RecommendedTopicItem {
  learningItemId: string;
  topicId: string;
  topicName: string;
  title: string;
  estimatedMinutes: number;
  priority: SubjectPriority;
}

export interface RecommendedSessionItem {
  subjectId: string;
  subjectName: string;
  color: string;
  priority: SubjectPriority;
  isMandatory: boolean;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  allocatedMinutes: number;
  recommendationScore: number;
  explanationReason: string;
  topics: RecommendedTopicItem[];
}

export interface WeeklySubjectBalance {
  subjectId: string;
  subjectName: string;
  color: string;
  weeklyTargetDays: number;
  plannedDaysThisWeek: number;
  completedDaysThisWeek: number;
  status: "on-track" | "behind" | "exceeded";
}

export interface AutoPlannerRecommendation {
  targetDate: string;
  totalAvailableMinutes: number;
  totalAllocatedMinutes: number;
  bufferMinutes: number;
  confidenceScore: number; // 0-100
  summaryInsight: string;
  recommendedSessions: RecommendedSessionItem[];
  weeklyBalance: WeeklySubjectBalance[];
}
