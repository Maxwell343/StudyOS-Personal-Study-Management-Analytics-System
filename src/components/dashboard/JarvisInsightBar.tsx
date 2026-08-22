import Link from "next/link";
import { ArrowRight, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface JarvisInsightBarProps {
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  type?: "info" | "warning" | "success" | "action";
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

  return (
    <div
      className="mb-5 flex items-center justify-between gap-4 rounded-[10px] px-4 py-2.5 transition-all duration-200"
      style={{
        background: isWarning
          ? "rgba(245,158,11,0.04)"
          : isSuccess
            ? "rgba(34,197,94,0.04)"
            : "rgba(34,211,238,0.04)",
        border: `1px solid ${
          isWarning
            ? "rgba(245,158,11,0.18)"
            : isSuccess
              ? "rgba(34,197,94,0.18)"
              : "rgba(34,211,238,0.14)"
        }`,
      }}
      role="status"
      aria-label="JARVIS Intelligence Insight"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex shrink-0 items-center gap-1.5">
          <div
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{
              background: isWarning ? "#f59e0b" : isSuccess ? "#22c55e" : "#22d3ee",
            }}
          />
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-[1px]"
            style={{
              color: isWarning ? "#f59e0b" : isSuccess ? "#22c55e" : "#22d3ee",
            }}
          >
            JARVIS
          </span>
          <span className="font-mono text-[9.5px] text-[#52525b]">
            / INSIGHT
          </span>
        </div>

        <div className="h-3 w-px shrink-0 bg-white/10" />

        <p className="m-0 text-xs text-[#d4d4d8] leading-relaxed line-clamp-1">
          {message ||
            "All systems normal. You are on track with your study plan today. Ready to begin your next focus session."}
        </p>
      </div>

      {(actionLabel || actionHref || onAction) && (
        <div className="shrink-0">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#22d3ee] hover:text-[#38bdf8] transition"
            >
              {actionLabel || "Action"} <ChevronRight size={12} />
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#22d3ee] hover:text-[#38bdf8] transition cursor-pointer"
            >
              {actionLabel || "Start"} <ChevronRight size={12} />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

