import type { SessionStatus } from "@/types/dashboard";

export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

export interface CalendarSession {
  id: string;
  subject: string;
  topic: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  plannedMinutes: number;
  actualMinutes: number;
  status: SessionStatus;
  color: string;
  learningItemId?: string;
}

export interface CalendarDayData {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  plannedMinutes: number;
  actualMinutes: number;
  adherencePercent: number;
  intensityLevel: IntensityLevel;
  sessions: CalendarSession[];
}

export interface MonthSummaryStats {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  completedCount: number;
  missedCount: number;
  adherencePercent: number;
}

export interface CalendarFilterOptions {
  status: "all" | "completed" | "planned" | "missed";
  subjectId: string; // "all" or specific subject ID
}
