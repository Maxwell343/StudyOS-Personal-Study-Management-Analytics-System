import { Lock, Unlock } from "lucide-react";
import type { PlanSummary } from "@/types/planner";
import { formatMinutes } from "@/lib/planner-utils";

interface PlanLockStateProps {
  summary: PlanSummary;
  onUnlock: () => void;
}

export function PlanLockState({ summary, onUnlock }: PlanLockStateProps) {
  return (
    <div
      className="rounded-[10px] px-[18px] py-5"
      style={{
        background: "rgba(34,197,94,0.04)",
        border: "1px solid rgba(34,197,94,0.15)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "rgba(34,197,94,0.12)" }}
        >
          <Lock size={16} style={{ color: "#22c55e" }} />
        </div>
        <div className="flex-1">
          <div
            className="mb-0.5 text-[13px] font-semibold"
            style={{ color: "#22c55e" }}
          >
            Tomorrow&apos;s Plan Locked
          </div>
          <div className="text-[11.5px]" style={{ color: "#6b6b80" }}>
            Your schedule is ready for tomorrow.{" "}
            <span style={{ color: "#5a5a6a" }}>
              {formatMinutes(summary.totalStudyMinutes)} planned · {summary.sessionCount}{" "}
              session{summary.sessionCount !== 1 ? "s" : ""} · {summary.taskCount}{" "}
              task{summary.taskCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button
          onClick={onUnlock}
          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-4 py-2 text-[11px] font-semibold"
          style={{
            border: "1px solid rgba(245,158,11,0.3)",
            background: "rgba(245,158,11,0.08)",
            color: "#f59e0b",
            transition: "all 0.15s ease",
          }}
        >
          <Unlock size={11} />
          Unlock Plan
        </button>
      </div>
    </div>
  );
}
