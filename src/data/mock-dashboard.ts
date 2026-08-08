import type {
  StudySession,
  FocusTask,
  DailyTask,
  SubjectProgressData,
  WeeklyDataPoint,
  DailyMetric,
} from "@/types/dashboard";

// ── Study Sessions ─────────────────────────────────────────────────────────

export const sessions: StudySession[] = [
  {
    id: "session-1",
    startTime: "09:00",
    endTime: "11:00",
    timeRange: "09:00 — 11:00",
    subject: "DSA",
    topic: "Recursion",
    duration: "2h",
    plannedMinutes: 120,
    status: "upcoming",
    color: "#22d3ee",
  },
  {
    id: "session-2",
    startTime: "11:30",
    endTime: "12:30",
    timeRange: "11:30 — 12:30",
    subject: "Java",
    topic: "Collections Framework",
    duration: "1h",
    plannedMinutes: 60,
    status: "upcoming",
    color: "#f97316",
  },
  {
    id: "session-3",
    startTime: "15:00",
    endTime: "16:00",
    timeRange: "15:00 — 16:00",
    subject: "Machine Learning",
    topic: "Random Forest",
    duration: "1h",
    plannedMinutes: 60,
    status: "upcoming",
    color: "#a78bfa",
  },
  {
    id: "session-4",
    startTime: "19:00",
    endTime: "20:00",
    timeRange: "19:00 — 20:00",
    subject: "SQL",
    topic: "Joins & Subqueries",
    duration: "1h",
    plannedMinutes: 60,
    status: "upcoming",
    color: "#34d399",
  },
];

// ── Focus Tasks (for the current/next study session: DSA · Recursion) ──────

export const focusTasks: FocusTask[] = [
  {
    id: "ft-1",
    sessionId: "session-1",
    label: "Understand base cases and call stack",
    done: true,
  },
  {
    id: "ft-2",
    sessionId: "session-1",
    label: "Implement factorial recursively",
    done: true,
  },
  {
    id: "ft-3",
    sessionId: "session-1",
    label: "Fibonacci with memoization",
    done: true,
  },
  {
    id: "ft-4",
    sessionId: "session-1",
    label: "Reverse an array using recursion",
    done: false,
  },
  {
    id: "ft-5",
    sessionId: "session-1",
    label: "Tower of Hanoi",
    done: false,
  },
  {
    id: "ft-6",
    sessionId: "session-1",
    label: "Subsets / Subsequences",
    done: false,
  },
  {
    id: "ft-7",
    sessionId: "session-1",
    label: "String permutations",
    done: false,
  },
  {
    id: "ft-8",
    sessionId: "session-1",
    label: "Recursion vs Iteration analysis",
    done: false,
  },
];

// ── Daily Tasks ────────────────────────────────────────────────────────────

export const dailyTasks: DailyTask[] = [
  {
    id: "task-1",
    label: "Arrays — Striver A2Z Sheet",
    subject: "DSA",
    done: true,
  },
  {
    id: "task-2",
    label: "Java Collections Overview",
    subject: "Java",
    done: true,
  },
  {
    id: "task-3",
    label: "Binary Search Implementation",
    subject: "DSA",
    done: false,
  },
  {
    id: "task-4",
    label: "SQL Joins Practice",
    subject: "SQL",
    done: false,
  },
];

// ── Subject Progress ───────────────────────────────────────────────────────

export const subjects: SubjectProgressData[] = [
  { id: "sub-dsa", name: "DSA", progress: 58, color: "#22d3ee" },
  { id: "sub-java", name: "Java", progress: 68, color: "#f97316" },
  {
    id: "sub-ml",
    name: "Machine Learning",
    progress: 45,
    color: "#a78bfa",
  },
  { id: "sub-sql", name: "SQL", progress: 72, color: "#34d399" },
];

// ── Weekly Analytics ───────────────────────────────────────────────────────

export const weeklyData: WeeklyDataPoint[] = [
  { day: "Mon", hours: 4.5, target: 5 },
  { day: "Tue", hours: 3.0, target: 5 },
  { day: "Wed", hours: 5.5, target: 5 },
  { day: "Thu", hours: 6.0, target: 5 },
  { day: "Fri", hours: 2.5, target: 5 },
  { day: "Sat", hours: 4.0, target: 5 },
  { day: "Sun", hours: 0, target: 5 },
];

// ── Daily Metrics ──────────────────────────────────────────────────────────

export const dailyMetrics: DailyMetric[] = [
  {
    label: "Today's Target",
    value: "5h 00m",
    sub: "5h planned today",
    iconName: "Target",
    iconColor: "#22d3ee",
    iconBg: "rgba(34,211,238,0.1)",
  },
  {
    label: "Studied",
    value: "0h 00m",
    sub: "5h remaining",
    iconName: "Timer",
    iconColor: "#f97316",
    iconBg: "rgba(249,115,22,0.1)",
  },
  {
    label: "Tasks",
    value: "2 / 4",
    sub: "2 remaining",
    iconName: "CheckSquare",
    iconColor: "#34d399",
    iconBg: "rgba(52,211,153,0.1)",
  },
  {
    label: "Current Streak",
    value: "12 days",
    sub: "Personal best: 18 days",
    iconName: "Flame",
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.1)",
  },
];
