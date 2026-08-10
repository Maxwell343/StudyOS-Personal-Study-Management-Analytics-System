// ── StudyOS Dashboard Type Definitions ──────────────────────────────────────

export type SessionStatus =
  | "upcoming"
  | "starting-soon"
  | "active"
  | "paused"
  | "completed"
  | "missed"
  | "behind-schedule"
  | "abandoned";

export interface StudySession {
  id: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  subject: string;
  topic: string;
  duration: string;
  plannedMinutes: number;
  status: SessionStatus;
  color: string;
}

export interface FocusTask {
  id: string;
  sessionId: string;
  label: string;
  done: boolean;
}

export interface DailyTask {
  id: string;
  label: string;
  subject: string;
  done: boolean;
}

export interface SubjectProgressData {
  id: string;
  name: string;
  progress: number;
  color: string;
}

export interface WeeklyDataPoint {
  day: string;
  hours: number;
  target: number;
}

export interface DailyMetric {
  label: string;
  value: string;
  sub: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
}

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
}

export interface InsightData {
  message: string;
  highlights: Array<{
    text: string;
    color?: string;
    bold?: boolean;
  }>;
}
