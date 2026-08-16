"use client";

import React from "react";
import {
  LongTermGoal,
  ShortTermGoal,
  TaskItem,
} from "@/types/tasks-goals";
import { computeLongTermGoalStats } from "@/lib/data-access/tasks-goals";
import {
  X,
  Target,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronRight,
  CheckSquare,
  Square,
  Clock,
  Plus,
} from "lucide-react";

interface GoalDetailDrawerProps {
  goal: LongTermGoal | null;
  shortTermGoals: ShortTermGoal[];
  tasks: TaskItem[];
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onOpenCreateShortTermGoalModal: (longTermGoalId: string) => void;
  onOpenCreateTaskModal: (shortTermGoalId: string) => void;
}

export function GoalDetailDrawer({
  goal,
  shortTermGoals,
  tasks,
  onClose,
  onToggleTask,
  onOpenCreateShortTermGoalModal,
  onOpenCreateTaskModal,
}: GoalDetailDrawerProps) {
  if (!goal) return null;

  const stats = computeLongTermGoalStats(goal.id, shortTermGoals, tasks);
  const childShortTerm = shortTermGoals.filter(
    (st) => st.longTermGoalId === goal.id
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-xl h-full flex flex-col bg-[#13131a] border-l border-white/10 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#13131a]/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#22d3ee]" />
            <h2 className="text-base font-bold text-[#f0f0f4]">Goal Overview & Hierarchy</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6b6b80] hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Goal Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="rounded-md border px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background: "rgba(34, 211, 238, 0.1)",
                  borderColor: "rgba(34, 211, 238, 0.3)",
                  color: goal.color || "#22d3ee",
                }}
              >
                {goal.subject}
              </span>
              {goal.category && (
                <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-[#a0a0b8]">
                  {goal.category}
                </span>
              )}
              <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400 uppercase">
                {goal.priority} Priority
              </span>
            </div>

            <h1 className="text-xl font-bold text-[#f0f0f4]">{goal.title}</h1>
            {goal.description && (
              <p className="mt-2 text-xs text-[#a0a0b8] leading-relaxed">
                {goal.description}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-[#6b6b80] block text-[11px]">Target Date</span>
                <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <Calendar size={13} className="text-[#22d3ee]" /> {goal.targetDate}
                </span>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="text-[#6b6b80] block text-[11px]">Overall Progress</span>
                <span className="font-mono font-bold text-[#22d3ee] text-sm mt-0.5 block">
                  {stats.progressPercentage}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.progressPercentage}%`,
                    background: "linear-gradient(90deg, #22d3ee 0%, #34d399 100%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Visual Context Trace */}
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6b6b80] mb-2">
              Context Hierarchy
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#d0d0e0]">
              <span className="font-semibold text-[#22d3ee]">{goal.title}</span>
              <ChevronRight size={13} className="text-[#4a4a5a]" />
              <span className="text-[#34d399] font-medium">
                {stats.shortTermGoalsCount} Short-Term Goals
              </span>
              <ChevronRight size={13} className="text-[#4a4a5a]" />
              <span className="text-[#a78bfa] font-medium">
                {stats.completedTasksCount}/{stats.totalTasksCount} Checklist Tasks
              </span>
            </div>
          </div>

          {/* Breakdown by Short-Term Goals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#f0f0f4] flex items-center gap-1.5">
                <Layers size={16} className="text-[#34d399]" /> Short-Term Milestones
              </h3>
              <button
                onClick={() => onOpenCreateShortTermGoalModal(goal.id)}
                className="text-xs text-[#22d3ee] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Short-Term Goal
              </button>
            </div>

            {childShortTerm.length === 0 ? (
              <p className="text-xs text-[#5a5a6a] italic">
                No short-term goals added yet. Add one to break down this long-term objective.
              </p>
            ) : (
              <div className="space-y-4">
                {childShortTerm.map((st) => {
                  const stTasks = tasks.filter((t) => t.shortTermGoalId === st.id);
                  const stCompleted = stTasks.filter((t) => t.completed).length;
                  const stProgress =
                    stTasks.length > 0
                      ? Math.round((stCompleted / stTasks.length) * 100)
                      : 0;

                  return (
                    <div
                      key={st.id}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-[#f0f0f4]">
                            {st.title}
                          </h4>
                          <span className="text-[11px] text-[#6b6b80] block mt-0.5">
                            Due {st.dueDate} • {stCompleted}/{stTasks.length} Tasks ({stProgress}%)
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenCreateTaskModal(st.id)}
                          className="text-xs text-[#22d3ee] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Plus size={13} /> Task
                        </button>
                      </div>

                      {/* Tasks under this Short Term Goal */}
                      <div className="mt-3 space-y-2 border-t border-white/5 pt-2">
                        {stTasks.length === 0 ? (
                          <p className="text-[11px] text-[#5a5a6a] italic py-1">
                            No tasks created under this goal yet.
                          </p>
                        ) : (
                          stTasks.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => onToggleTask(t.id)}
                              className="flex items-center justify-between rounded-lg bg-black/20 p-2 text-xs border border-white/5 hover:border-white/10 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {t.completed ? (
                                  <CheckCircle2 size={15} className="text-[#22c55e] shrink-0" />
                                ) : (
                                  <Square size={15} className="text-[#5a5a6a] shrink-0" />
                                )}
                                <span
                                  className={`truncate ${
                                    t.completed ? "line-through text-[#6b6b80]" : "text-[#d0d0e0]"
                                  }`}
                                >
                                  {t.title}
                                </span>
                              </div>
                              {t.estimatedMinutes && (
                                <span className="text-[10px] text-[#6b6b80] shrink-0 flex items-center gap-1">
                                  <Clock size={11} /> {t.estimatedMinutes}m
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
