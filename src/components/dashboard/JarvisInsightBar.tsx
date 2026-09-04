import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface JarvisInsightBarProps {
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  type?: "info" | "warning" | "success" | "action";
}

function getTimeOfDayInsight(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Peak morning cognitive readiness. Focus on high-friction problem sets and core conceptual theory.";
  }
  if (hour >= 12 && hour < 17) {
    return "Afternoon energy window. Maintain momentum with structured 45-minute focus intervals and short recovery pauses.";
  }
  if (hour >= 17 && hour < 22) {
    return "Optimal evening review window. Ideal for spaced repetition practice and consolidating today's notes.";
  }
  return "Late evening study session. Prioritize synthesis or wrap up your scheduled target to allow memory consolidation.";
}

export function JarvisInsightBar({
  message,
  actionLabel,
  actionHref,
  onAction,
  type = "info",
}: JarvisInsightBarProps) {
  const isWarning = type === "warning";
  const isSuccess = type === "success";
  const displayMessage = message || getTimeOfDayInsight();

  return (
    <div
      className={`mb-5 flex items-center justify-between gap-4 rounded-[10px] px-4 py-2.5 transition-all duration-200 border ${
        isWarning
          ? "bg-amber-500/[0.06] border-amber-500/25 text-amber-900 dark:text-amber-200"
          : isSuccess
            ? "bg-emerald-500/[0.06] border-emerald-500/25 text-emerald-900 dark:text-emerald-200"
            : "bg-cyan-500/[0.06] border-cyan-500/20 text-slate-800 dark:text-slate-200"
      }`}
      role="status"
      aria-label="JARVIS Intelligence Insight"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex shrink-0 items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full animate-pulse ${
              isWarning
                ? "bg-amber-500"
                : isSuccess
                  ? "bg-emerald-500"
                  : "bg-cyan-500"
            }`}
          />
          <span
            className={`font-mono text-[10px] font-bold uppercase tracking-[1px] ${
              isWarning
                ? "text-amber-600 dark:text-amber-400"
                : isSuccess
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-cyan-700 dark:text-cyan-300"
            }`}
          >
            JARVIS
          </span>
          <span className="font-mono text-[9.5px] text-muted-foreground/70">
            / INSIGHT
          </span>
        </div>

        <div className="h-3 w-px shrink-0 bg-border" />

        <p className="m-0 text-xs text-foreground/90 leading-relaxed line-clamp-1 font-normal">
          {displayMessage}
        </p>
      </div>

      {(actionLabel || actionHref || onAction) && (
        <div className="shrink-0">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition"
            >
              {actionLabel || "Action"} <ChevronRight size={12} />
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition cursor-pointer"
            >
              {actionLabel || "Start"} <ChevronRight size={12} />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}


