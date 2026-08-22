import { formatMinutes } from "@/lib/planner-utils";
import { CheckCircle2, Clock, Flame, Target } from "lucide-react";

interface DailyProgressCardProps {
  targetMinutes?: number;
  actualMinutes?: number;
  completedSessions?: number;
  totalSessions?: number;
  hasMissedSessions?: boolean;
}

export function DailyProgressCard({
  targetMinutes = 0,
  actualMinutes = 0,
  completedSessions = 0,
  totalSessions = 0,
  hasMissedSessions = false,
}: DailyProgressCardProps) {
  const remainingMinutes = Math.max(0, targetMinutes - actualMinutes);
  const percent =
    targetMinutes > 0
      ? Math.min(100, Math.round((actualMinutes / targetMinutes) * 100))
      : 0;

  const isTargetMet = actualMinutes >= targetMinutes && targetMinutes > 0;
  const hasPlan = targetMinutes > 0 || totalSessions > 0;

  let badgeText = "No Plan Set";
  let badgeColor = "#71717a";
  let badgeBg = "rgba(255,255,255,0.04)";
  let badgeBorder = "rgba(255,255,255,0.08)";

  if (isTargetMet) {
    badgeText = "Target Met";
    badgeColor = "#22c55e";
    badgeBg = "rgba(34,197,94,0.1)";
    badgeBorder = "rgba(34,197,94,0.25)";
  } else if (hasMissedSessions) {
    badgeText = "Recovery Needed";
    badgeColor = "#ef4444";
    badgeBg = "rgba(239,68,68,0.1)";
    badgeBorder = "rgba(239,68,68,0.25)";
  } else if (hasPlan) {
    if (percent >= 50) {
      badgeText = "On Track";
      badgeColor = "#22d3ee";
      badgeBg = "rgba(34,211,238,0.1)";
      badgeBorder = "rgba(34,211,238,0.25)";
    } else {
      badgeText = "In Progress";
      badgeColor = "#f59e0b";
      badgeBg = "rgba(245,158,11,0.1)";
      badgeBorder = "rgba(245,158,11,0.25)";
    }
  }

  return (
    <div
      className="mb-5 rounded-[12px] p-5 transition-all duration-200"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header row */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[1px] text-[#22d3ee]">
            Today&apos;s Execution
          </span>
          <span className="text-xs text-[#52525b]">·</span>
          <span className="text-xs text-[#a1a1aa]">
            {formatMinutes(actualMinutes)} studied of {formatMinutes(targetMinutes)} planned
          </span>
        </div>

        <div
          className="rounded-full px-2.5 py-[3px]"
          style={{
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
          }}
        >
          <span
            className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.8px]"
            style={{ color: badgeColor }}
          >
            {badgeText}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3.5">
        <div
          className="relative h-2 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: isTargetMet
                ? "linear-gradient(90deg, #22c55e, #10b981)"
                : "linear-gradient(90deg, #22d3ee, #0ea5e9)",
              boxShadow: percent > 0 ? "0 0 10px rgba(34,211,238,0.3)" : "none",
            }}
          />
        </div>
      </div>

      {/* Micro-metrics 4-column summary */}
      <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        <div className="rounded-[8px] border border-white/[0.04] bg-white/[0.015] px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[#71717a]">
            <Clock size={11} className="text-[#22d3ee]" /> Actual Time
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-[#f4f4f5]">
            {formatMinutes(actualMinutes)}
          </div>
        </div>

        <div className="rounded-[8px] border border-white/[0.04] bg-white/[0.015] px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[#71717a]">
            <Target size={11} className="text-[#38bdf8]" /> Planned Target
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-[#c0c0d8]">
            {formatMinutes(targetMinutes)}
          </div>
        </div>

        <div className="rounded-[8px] border border-white/[0.04] bg-white/[0.015] px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[#71717a]">
            <CheckCircle2 size={11} className="text-[#22c55e]" /> Sessions
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-[#f4f4f5]">
            {completedSessions} / {totalSessions} completed
          </div>
        </div>

        <div className="rounded-[8px] border border-white/[0.04] bg-white/[0.015] px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[#71717a]">
            <Flame size={11} className="text-[#f59e0b]" /> Remaining
          </div>
          <div
            className="mt-1 font-mono text-sm font-bold"
            style={{ color: isTargetMet ? "#22c55e" : "#f59e0b" }}
          >
            {isTargetMet ? "0m (Goal Met)" : `${formatMinutes(remainingMinutes)} left`}
          </div>
        </div>
      </div>
    </div>
  );
}

