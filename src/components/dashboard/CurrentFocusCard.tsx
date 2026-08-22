import { ArrowRight, BookOpen, Layers, Sparkles } from "lucide-react";
import type { StudySession, FocusTask } from "@/types/dashboard";

interface CurrentFocusCardProps {
  activeSession?: StudySession | null;
  nextSession?: StudySession | null;
  focusTasks?: FocusTask[];
  onSelectSession?: (session: StudySession) => void;
}

export function CurrentFocusCard({
  activeSession,
  nextSession,
  focusTasks = [],
  onSelectSession,
}: CurrentFocusCardProps) {
  const currentSession = activeSession || nextSession;

  const subjectName = currentSession?.subject || null;
  const topicName = currentSession?.topic || null;
  const hasFocus = Boolean(subjectName && topicName);

  const completedCount = focusTasks.filter((t) => t.done).length;
  const totalTasks = focusTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div
      className="mb-5 rounded-[12px] p-5 transition-all duration-200"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: activeSession ? "#22c55e" : "#22d3ee" }}
            />
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-[1px]"
              style={{ color: activeSession ? "#22c55e" : "#22d3ee" }}
            >
              {activeSession ? "Active Focus" : "Target Concentration"}
            </span>
          </div>
        </div>

        {totalTasks > 0 && (
          <span className="font-mono text-[10.5px] text-[#71717a]">
            {completedCount} / {totalTasks} items completed
          </span>
        )}
      </div>

      {!hasFocus ? (
        <div className="rounded-[8px] border border-white/[0.04] bg-white/[0.015] p-4 text-center">
          <p className="m-0 text-xs text-[#71717a]">
            No active focus topic right now. Plan a session to establish your primary learning objective.
          </p>
        </div>
      ) : (
        <div>
          {/* Subject and Topic block */}
          <div
            onClick={() => currentSession && onSelectSession?.(currentSession)}
            className={`rounded-[8px] border border-white/[0.04] bg-white/[0.015] p-3.5 transition ${
              currentSession ? "cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.025]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 font-mono text-[10.5px] font-semibold"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    color: "#22d3ee",
                    border: "1px solid rgba(34,211,238,0.2)",
                  }}
                >
                  {subjectName}
                </span>
                <span className="text-sm font-semibold text-[#f4f4f5]">
                  {topicName}
                </span>
              </div>

              {currentSession && (
                <span className="font-mono text-xs text-[#71717a] flex items-center gap-1 group-hover:text-cyan-400">
                  {currentSession.duration || "50m"} <ArrowRight size={11} />
                </span>
              )}
            </div>

            {/* Context message */}
            <p className="mt-2 mb-0 text-xs text-[#a1a1aa] leading-relaxed">
              Focus on mastering core concepts, key theorems, and completing all target learning items for this module.
            </p>
          </div>

          {/* If focus tasks exist, render interactive/visual task list */}
          {totalTasks > 0 && (
            <div className="mt-3">
              {/* Progress bar */}
              <div
                className="mb-2 h-1 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, #22d3ee, #0ea5e9)",
                  }}
                />
              </div>

              {/* Focus tasks */}
              <div className="space-y-1.5">
                {focusTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-[6px] px-2.5 py-1.5 text-xs"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <span
                      className={`line-clamp-1 ${
                        task.done ? "line-through text-[#52525b]" : "text-[#d4d4d8]"
                      }`}
                    >
                      {task.label}
                    </span>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: task.done ? "#22c55e" : "#71717a" }}
                    >
                      {task.done ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

