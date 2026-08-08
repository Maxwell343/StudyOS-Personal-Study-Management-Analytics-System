import type { SessionStatus } from "@/types/dashboard";

// ── Status Configuration ───────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  dot?: string;
}

export const STATUS_CONFIG: Record<SessionStatus, StatusConfig> = {
  upcoming: {
    label: "UPCOMING",
    color: "#6b6b80",
    bg: "rgba(255,255,255,0.05)",
  },
  "starting-soon": {
    label: "STARTING SOON",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    dot: "#22d3ee",
  },
  active: {
    label: "● ACTIVE",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    dot: "#22c55e",
  },
  paused: {
    label: "⏸ PAUSED",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  completed: {
    label: "✓ COMPLETED",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
  },
  missed: {
    label: "MISSED",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
  },
  "behind-schedule": {
    label: "⚠ BEHIND",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
};

// ── Navigation Items ───────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", iconName: "LayoutGrid" },
  { id: "plan", label: "Plan Tomorrow", iconName: "ListTodo" },
  { id: "subjects", label: "Subjects", iconName: "BookOpen" },
  { id: "tasks", label: "Tasks", iconName: "CheckSquare" },
  { id: "timer", label: "Study Timer", iconName: "Timer" },
  { id: "calendar", label: "Calendar", iconName: "Calendar" },
  { id: "analytics", label: "Analytics", iconName: "BarChart3" },
  { id: "goals", label: "Goals", iconName: "Target" },
] as const;
