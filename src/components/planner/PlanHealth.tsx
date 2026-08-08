import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { PlanHealthData, PlanHealthStatus } from "@/types/planner";
import { formatMinutes } from "@/data/mock-planner";

interface PlanHealthProps {
  health: PlanHealthData;
  earliestStart: string;
  latestEnd: string;
}

const STATUS_DISPLAY: Record<
  PlanHealthStatus,
  { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number }> }
> = {
  balanced: {
    label: "BALANCED",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    icon: CheckCircle,
  },
  underplanned: {
    label: "UNDERPLANNED",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    icon: AlertCircle,
  },
  overloaded: {
    label: "OVERLOADED",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    icon: AlertTriangle,
  },
  conflict: {
    label: "CONFLICT",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    icon: AlertTriangle,
  },
};

export function PlanHealth({
  health,
  earliestStart,
  latestEnd,
}: PlanHealthProps) {
  const statusCfg = STATUS_DISPLAY[health.status];
  const StatusIcon = statusCfg.icon;

  const maxMinutes = Math.max(
    ...health.subjectDistribution.map((s) => s.minutes),
    1
  );

  return (
    <div
      className="rounded-[10px] px-[18px] py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
          Plan Health
        </h2>
        <div
          className="flex items-center gap-1 rounded px-2 py-[3px]"
          style={{
            background: statusCfg.bg,
            border: `1px solid ${statusCfg.color}30`,
          }}
        >
          <span style={{ color: statusCfg.color }}>
            <StatusIcon size={10} />
          </span>
          <span
            className="font-mono text-[9px] font-bold uppercase tracking-[0.5px]"
            style={{ color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <CheckCircle
            size={12}
            style={{ color: health.totalStudyMinutes > 0 ? "#22c55e" : "#3a3a4a" }}
          />
          <span className="text-[12px]" style={{ color: "#c0c0d0" }}>
            {formatMinutes(health.totalStudyMinutes)} planned
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle
            size={12}
            style={{ color: health.sessionCount > 0 ? "#22c55e" : "#3a3a4a" }}
          />
          <span className="text-[12px]" style={{ color: "#c0c0d0" }}>
            {health.sessionCount} focused session
            {health.sessionCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle
            size={12}
            style={{ color: health.breakMinutes > 0 ? "#22c55e" : "#3a3a4a" }}
          />
          <span className="text-[12px]" style={{ color: "#c0c0d0" }}>
            {formatMinutes(health.breakMinutes)} total break time
          </span>
        </div>
        {health.conflicts.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle size={12} style={{ color: "#ef4444" }} />
            <span className="text-[12px]" style={{ color: "#ef4444" }}>
              {health.conflicts.length} schedule conflict
              {health.conflicts.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Subject distribution */}
      {health.subjectDistribution.length > 0 && (
        <>
          <div
            className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.5px]"
            style={{ color: "#3a3a4a" }}
          >
            Subject Distribution
          </div>
          <div className="mb-4 flex flex-col gap-[10px]">
            {health.subjectDistribution.map((sub) => (
              <div key={sub.subject}>
                <div className="mb-[4px] flex items-center justify-between">
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: "#c0c0d0" }}
                  >
                    {sub.subject}
                  </span>
                  <span
                    className="font-mono text-[11px] font-semibold"
                    style={{ color: sub.color }}
                  >
                    {formatMinutes(sub.minutes)}
                  </span>
                </div>
                <div
                  className="h-1 overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(sub.minutes / maxMinutes) * 100}%`,
                      background: sub.color,
                      boxShadow: `0 0 6px ${sub.color}50`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Time summary */}
      <div
        className="pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div
          className="mb-2 text-[10px] font-medium uppercase tracking-[0.5px]"
          style={{ color: "#3a3a4a" }}
        >
          Time Summary
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <ArrowUp size={10} style={{ color: "#22c55e" }} />
            <span className="text-[11px]" style={{ color: "#6b6b80" }}>
              Earliest
            </span>
            <span
              className="ml-auto font-mono text-[11px] font-semibold"
              style={{ color: "#c0c0d0" }}
            >
              {earliestStart}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowDown size={10} style={{ color: "#f59e0b" }} />
            <span className="text-[11px]" style={{ color: "#6b6b80" }}>
              Latest
            </span>
            <span
              className="ml-auto font-mono text-[11px] font-semibold"
              style={{ color: "#c0c0d0" }}
            >
              {latestEnd}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={10} style={{ color: "#22d3ee" }} />
            <span className="text-[11px]" style={{ color: "#6b6b80" }}>
              Study
            </span>
            <span
              className="ml-auto font-mono text-[11px] font-semibold"
              style={{ color: "#22d3ee" }}
            >
              {formatMinutes(health.totalStudyMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={10} style={{ color: "#a78bfa" }} />
            <span className="text-[11px]" style={{ color: "#6b6b80" }}>
              Breaks
            </span>
            <span
              className="ml-auto font-mono text-[11px] font-semibold"
              style={{ color: "#a78bfa" }}
            >
              {formatMinutes(health.breakMinutes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
