"use client";

import React from "react";
import {
  ShortTermGoal,
  LongTermGoal,
  TaskItem,
} from "@/types/tasks-goals";
import { computeShortTermGoalStats } from "@/lib/data-access/tasks-goals";
import {
  Plus,
  Calendar,
  CheckSquare,
  Link2,
  Trash2,
} from "lucide-react";

interface ShortTermGoalsSectionProps {
  shortTermGoals: ShortTermGoal[];
  longTermGoals: LongTermGoal[];
  tasks: TaskItem[];
  onOpenCreateShortTermGoalModal: () => void;
  onOpenCreateTaskModal: (shortTermGoalId: string) => void;
  onDeleteShortTermGoal: (id: string) => void;
}

export function ShortTermGoalsSection({
  shortTermGoals,
  longTermGoals,
  tasks,
  onOpenCreateShortTermGoalModal,
  onOpenCreateTaskModal,
  onDeleteShortTermGoal,
}: ShortTermGoalsSectionProps) {
  const getParentGoal = (longTermGoalId: string) => {
    return longTermGoals.find((g) => g.id === longTermGoalId);
  };

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f0f0f4] flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#34d399] inline-block shadow-[0_0_8px_#34d399]" />
            Short-Term Goals
          </h2>
          <p className="text-xs text-[#6b6b80]">
            Targeted milestones achievable within a few days to weeks.
          </p>
        </div>
        <button
          onClick={onOpenCreateShortTermGoalModal}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#f0f0f4] hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <Plus size={15} className="text-[#34d399]" />
          Add Short-Term Goal
        </button>
      </div>

      {shortTermGoals.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-6 text-center"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(19, 19, 26, 0.3)",
          }}
        >
          <p className="text-xs text-[#6b6b80]">
            No short-term goals active right now. Add a short-term goal to break down your long-term objectives!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortTermGoals.map((stGoal) => {
            const parentGoal = getParentGoal(stGoal.longTermGoalId);
            const { total, completed, progress } = computeShortTermGoalStats(
              stGoal.id,
              tasks
            );

            return (
              <div
                key={stGoal.id}
                className="flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:border-white/20"
                style={{
                  background: "var(--card, #13131a)",
                  borderColor: "var(--sos-border-card, rgba(255, 255, 255, 0.06))",
                }}
              >
                <div>
                  {/* Top Bar: Parent Goal & Priority */}
                  <div className="flex items-center justify-between gap-2 text-[11px] mb-2">
                    {parentGoal ? (
                      <div className="flex items-center gap-1 text-[#22d3ee] font-medium truncate max-w-[70%]">
                        <Link2 size={12} className="shrink-0" />
                        <span className="truncate">Parent: {parentGoal.title}</span>
                      </div>
                    ) : (
                      <span className="text-[#6b6b80]">Standalone Goal</span>
                    )}
                    <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 font-mono text-[10px] text-[#a0a0b8] uppercase">
                      {stGoal.priority} Priority
                    </span>
                  </div>

                  {/* Goal Title */}
                  <h3 className="text-sm font-semibold text-[#f0f0f4] line-clamp-1">
                    {stGoal.title}
                  </h3>

                  {stGoal.description && (
                    <p className="mt-1 text-xs text-[#6b6b80] line-clamp-2">
                      {stGoal.description}
                    </p>
                  )}
                </div>

                {/* Footer Metrics & Actions */}
                <div className="mt-4 border-t border-white/5 pt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 text-[#a0a0b8]">
                      <Calendar size={13} className="text-[#6b6b80]" />
                      <span>Due {stGoal.dueDate}</span>
                    </div>
                    <span className="text-[#6b6b80] font-mono text-[11px]">
                      {completed}/{total} Tasks Completed
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        background:
                          progress === 100 ? "#22c55e" : "#34d399",
                      }}
                    />
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onOpenCreateTaskModal(stGoal.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#22d3ee] hover:underline cursor-pointer"
                    >
                      <Plus size={13} /> Add Task
                    </button>
                    <button
                      onClick={() => onDeleteShortTermGoal(stGoal.id)}
                      className="text-[#6b6b80] hover:text-rose-400 p-1 transition-colors"
                      title="Delete Short-Term Goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
