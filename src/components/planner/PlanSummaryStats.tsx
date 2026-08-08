import { Target, Layers, CheckSquare, Coffee } from "lucide-react";
import type { PlanSummary } from "@/types/planner";
import { formatMinutes } from "@/lib/planner-utils";

interface PlanSummaryStatsProps {
  summary: PlanSummary;
}

const STAT_CONFIG = [
  {
    key: "target",
    label: "Tomorrow's Target",
    iconName: "Target",
    iconColor: "#22d3ee",
    iconBg: "rgba(34,211,238,0.1)",
  },
  {
    key: "sessions",
    label: "Sessions",
    iconName: "Layers",
    iconColor: "#f97316",
    iconBg: "rgba(249,115,22,0.1)",
  },
  {
    key: "tasks",
    label: "Tasks",
    iconName: "CheckSquare",
    iconColor: "#34d399",
    iconBg: "rgba(52,211,153,0.1)",
  },
  {
    key: "breaks",
    label: "Break Time",
    iconName: "Coffee",
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.1)",
  },
] as const;

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Target,
  Layers,
  CheckSquare,
  Coffee,
};

export function PlanSummaryStats({ summary }: PlanSummaryStatsProps) {
  const values: Record<string, string> = {
    target: formatMinutes(summary.totalStudyMinutes),
    sessions: String(summary.sessionCount),
    tasks: String(summary.taskCount),
    breaks: formatMinutes(summary.breakMinutes),
  };

  const subs: Record<string, string> = {
    target: `${formatMinutes(summary.totalStudyMinutes)} planned tomorrow`,
    sessions: `${summary.sessionCount} study session${summary.sessionCount !== 1 ? "s" : ""}`,
    tasks: `${summary.taskCount} task${summary.taskCount !== 1 ? "s" : ""} assigned`,
    breaks: `${formatMinutes(summary.breakMinutes)} total breaktime`,
  };

  return (
    <div className="mb-4 grid grid-cols-4 gap-2.5 max-lg:grid-cols-2">
      {STAT_CONFIG.map((stat) => {
        const Icon = ICON_MAP[stat.iconName];
        return (
          <div
            key={stat.key}
            className="rounded-[9px] px-4 py-[14px]"
            style={{
              background: "#13131a",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="mb-2.5 flex items-start justify-between">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: stat.iconBg, color: stat.iconColor }}
              >
                {Icon && <Icon size={13} />}
              </div>
            </div>
            <div
              className="mb-0.5 font-mono text-xl font-bold tracking-tight"
              style={{ color: stat.iconColor }}
            >
              {values[stat.key]}
            </div>
            <div
              className="mb-[3px] text-[11px]"
              style={{ color: "#5a5a6a" }}
            >
              {subs[stat.key]}
            </div>
            <div
              className="text-[10px] font-medium uppercase tracking-[0.5px]"
              style={{ color: "#3a3a4a" }}
            >
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
