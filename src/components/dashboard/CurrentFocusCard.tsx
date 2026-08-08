import { ArrowRight } from "lucide-react";
import type { FocusTask } from "@/types/dashboard";

interface CurrentFocusCardProps {
  tasks: FocusTask[];
}

export function CurrentFocusCard({ tasks }: CurrentFocusCardProps) {
  const completedCount = tasks.filter((t) => t.done).length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const nextTask = tasks.find((t) => !t.done);

  return (
    <div
      className="rounded-[10px] px-[18px] py-3.5"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-[5px]">
            <div
              className="pulse-dot h-1 w-1 rounded-full"
              style={{ background: "#22d3ee" }}
            />
            <span
              className="font-mono text-[9.5px] font-bold uppercase tracking-[1px]"
              style={{ color: "#22d3ee" }}
            >
              Current Focus
            </span>
          </div>
          <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
            · DSA · Recursion
          </span>
        </div>
        <span
          className="font-mono text-[10.5px]"
          style={{ color: "#6b6b80" }}
        >
          {completedCount} / {tasks.length} tasks
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="mb-2.5 h-[5px] overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #22d3ee, #0ea5e9)",
            transition: "width 0.4s ease",
            boxShadow: "0 0 8px rgba(34,211,238,0.4)",
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="mb-3 grid grid-cols-4 gap-1 max-sm:grid-cols-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="h-1 rounded-sm"
            style={{
              background: task.done
                ? "#22d3ee"
                : "rgba(255,255,255,0.06)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* Next task */}
      {nextTask && (
        <div
          className="flex items-center gap-2 rounded-md px-2.5 py-2"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <ArrowRight size={11} />
          <div>
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.8px]"
              style={{ color: "#4a4a5a" }}
            >
              Next:{" "}
            </span>
            <span className="text-xs" style={{ color: "#b0b0c8" }}>
              {nextTask.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
