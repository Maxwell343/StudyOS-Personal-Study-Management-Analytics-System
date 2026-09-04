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
      className="mb-5 rounded-[12px] p-5 transition-all duration-200 bg-card border border-border shadow-xs"
    >
      {/* Header row */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[1px] text-cyan-600 dark:text-cyan-400">
            Today&apos;s Execution
          </span>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground">
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
          className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: isTargetMet
                ? "linear-gradient(90deg, #16a34a, #10b981)"
                : "linear-gradient(90deg, #0891b2, #0ea5e9)",
              boxShadow: percent > 0 ? "0 0 10px rgba(8,145,178,0.25)" : "none",
            }}
          />
        </div>
      </div>

      {/* Micro-metrics 4-column summary */}
      <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        <div className="rounded-[8px] border border-border bg-secondary/40 px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
            <Clock size={11} className="text-cyan-600 dark:text-cyan-400" /> Actual Time
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-foreground">
            {formatMinutes(actualMinutes)}
          </div>
        </div>

        <div className="rounded-[8px] border border-border bg-secondary/40 px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
            <Target size={11} className="text-sky-600 dark:text-sky-400" /> Planned Target
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-foreground/80">
            {formatMinutes(targetMinutes)}
          </div>
        </div>

        <div className="rounded-[8px] border border-border bg-secondary/40 px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" /> Sessions
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-foreground">
            {completedSessions} / {totalSessions} completed
          </div>
        </div>

        <div className="rounded-[8px] border border-border bg-secondary/40 px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
            <Flame size={11} className="text-amber-600 dark:text-amber-400" /> Remaining
          </div>
          <div
            className="mt-1 font-mono text-sm font-bold"
            style={{ color: isTargetMet ? "#16a34a" : "#d97706" }}
          >
            {isTargetMet ? "0m (Goal Met)" : `${formatMinutes(remainingMinutes)} left`}
          </div>
        </div>
      </div>
    </div>
  );
}

