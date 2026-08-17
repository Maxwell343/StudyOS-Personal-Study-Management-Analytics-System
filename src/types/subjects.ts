// ── StudyOS Subjects & Learning Structure Type Definitions ──────────────────

export type LearningItemStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type LearningItemPriority = "LOW" | "MEDIUM" | "HIGH";

export interface LearningItemResource {
  id: string;
  type: "notes" | "video" | "practice" | "link";
  title: string;
  url?: string;
}

export interface LearningItem {
  id: string;
  topicId: string;
  title: string;
  description?: string;
  order: number;
  status: LearningItemStatus;
  estimatedMinutes: number;
  priority: LearningItemPriority;
  resources?: LearningItemResource[];
  notes?: string;
  completedAt?: string;
  lastStudiedAt?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  order: number;
  learningItems: LearningItem[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  category: string;
  targetDate?: string;
  archived?: boolean;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  isMandatory?: boolean;
  weeklyTargetDays?: number;
  topics: Topic[];
}

export interface RecentActivityItem {
  id: string;
  type: "completed" | "started" | "planned";
  learningItemId: string;
  learningItemTitle: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topicName: string;
  timestamp: string;
}

// ── Derived Stats Interfaces ────────────────────────────────────────────────

export interface TopicStats {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  remainingItems: number;
  progressPercent: number;
  estimatedRemainingMinutes: number;
}

export interface SubjectStats {
  topicCount: number;
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  remainingItems: number;
  progressPercent: number;
  estimatedRemainingMinutes: number;
  activeTopic?: Topic;
  activeItem?: LearningItem;
}

export interface GlobalLearningSummary {
  totalSubjects: number;
  totalTopics: number;
  totalLearningItems: number;
  completedLearningItems: number;
  remainingLearningItems: number;
  overallProgressPercent: number;
  estimatedRemainingMinutes: number;
}
