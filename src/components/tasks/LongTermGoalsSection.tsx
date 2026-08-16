"use client";

import React, { useState } from "react";
import {
  LongTermGoal,
  ShortTermGoal,
  TaskItem,
} from "@/types/tasks-goals";
import {
  computeLongTermGoalStats,
} from "@/lib/data-access/tasks-goals";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit3,
} from "lucide-react";

interface LongTermGoalsSectionProps {
  longTermGoals: LongTermGoal[];
  shortTermGoals: ShortTermGoal[];
  tasks: TaskItem[];
  onOpenCreateGoalModal: () => void;
  onOpenCreateShortTermGoalModal: (longTermGoalId: string) => void;
  onSelectGoalDetails: (goal: LongTermGoal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function LongTermGoalsSection({
  longTermGoals,
  shortTermGoals,
  tasks,
  onOpenCreateGoalModal,
  onOpenCreateShortTermGoalModal,
  onSelectGoalDetails,
  onDeleteGoal,
}: LongTermGoalsSectionProps) {
  const [expandedGoalIds, setExpandedGoalIds] = useState<Record<string, boolean>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedGoalIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "LOW":
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ON_TRACK":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "AT_RISK":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "IN_PROGRESS":
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f0f0f4] flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#22d3ee] inline-block shadow-[0_0_8px_#22d3ee]" />
            Long-Term Goals
          </h2>
          <p className="text-xs text-[#6b6b80]">
            Major academic & career milestones spanning weeks or months.
          </p>
        </div>
        <button
          onClick={onOpenCreateGoalModal}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-black transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)" }}
        >
          <Plus size={15} />
          Add Long-Term Goal
        </button>
      </div>

      {/* Goal Cards Grid */}
      {longTermGoals.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-8 text-center"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            background: "rgba(19, 19, 26, 0.4)",
          }}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#22d3ee]/10 text-[#22d3ee]">
            <Layers size={22} />
          </div>
          <h3 className="text-sm font-semibold text-[#f0f0f4]">No long-term goals yet</h3>
          <p className="mt-1 text-xs text-[#6b6b80] max-w-sm mx-auto">
            Start with one core objective you genuinely want to master.
          </p>
          <button
            onClick={onOpenCreateGoalModal}
            className="mt-4 rounded-lg bg-[#22d3ee] px-4 py-2 text-xs font-bold text-black hover:bg-[#22d3ee]/90 transition-colors"
          >
            + Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {longTermGoals.map((goal) => {
            const stats = computeLongTermGoalStats(goal.id, shortTermGoals, tasks);
            const isExpanded = !!expandedGoalIds[goal.id];
            const childShortTerm = shortTermGoals.filter(
              (st) => st.longTermGoalId === goal.id
            );

            return (
              <div
                key={goal.id}
                className="group relative rounded-xl border p-5 transition-all duration-200"
                style={{
                  background: "var(--card, #13131a)",
                  borderColor: isExpanded
                    ? "rgba(34, 211, 238, 0.3)"
                    : "var(--sos-border-card, rgba(255, 255, 255, 0.07))",
                  boxShadow: isExpanded ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "none",
                }}
              >
                {/* Top Row: Meta Badges & Actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-md border px-2.5 py-0.5 text-[11px] font-medium"
                      style={{
                        background: "rgba(34, 211, 238, 0.08)",
                        borderColor: "rgba(34, 211, 238, 0.2)",
                        color: goal.color || "#22d3ee",
                      }}
                    >
                      {goal.subject}
                    </span>
                    {goal.category && (
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-[#a0a0b8]">
                        {goal.category}
                      </span>
                    )}
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getPriorityBadgeStyle(
                        goal.priority
                      )}`}
                    >
                      {goal.priority} Priority
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeStyle(
                        goal.status
                      )}`}
                    >
                      {goal.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Actions dropdown trigger & Detail View */}
                  <div className="flex items-center gap-1.5 relative">
                    <button
                      onClick={() => onSelectGoalDetails(goal)}
                      className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#d0d0e0] hover:bg-white/10 transition-colors"
                      title="Open Goal Details & Hierarchy"
                    >
                      <span>View Details</span>
                      <ExternalLink size={13} />
                    </button>
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === goal.id ? null : goal.id)
                      }
                      className="rounded-md p-1 text-[#6b6b80] hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Context Menu */}
                    {activeMenuId === goal.id && (
                      <div
                        className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-white/10 bg-[#1a1a24] py-1 shadow-xl"
                        onMouseLeave={() => setActiveMenuId(null)}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onOpenCreateShortTermGoalModal(goal.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#d0d0e0] hover:bg-white/5"
                        >
                          <Plus size={14} className="text-[#22d3ee]" />
                          Add Short-Term Goal
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectGoalDetails(goal);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#d0d0e0] hover:bg-white/5"
                        >
                          <Edit3 size={14} className="text-amber-400" />
                          View / Edit Details
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteGoal(goal.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 size={14} />
                          Delete Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Goal Title & Description */}
                <div className="mt-3">
                  <h3
                    onClick={() => onSelectGoalDetails(goal)}
                    className="text-base font-semibold text-[#f0f0f4] hover:text-[#22d3ee] cursor-pointer transition-colors"
                  >
                    {goal.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#a0a0b8] line-clamp-2 leading-relaxed">
                    {goal.description}
                  </p>
                </div>

                {/* Progress Bar & Sub-Metrics */}
                <div className="mt-4 rounded-lg bg-black/20 p-3 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-[#a0a0b8]">
                      <Calendar size={13} className="text-[#6b6b80]" />
                      <span>Target: <strong className="text-white">{goal.targetDate}</strong></span>
                    </div>
                    <div className="font-mono font-bold text-[#22d3ee]">
                      {stats.progressPercentage}%
                    </div>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.progressPercentage}%`,
                        background:
                          stats.progressPercentage === 100
                            ? "#22c55e"
                            : "linear-gradient(90deg, #22d3ee 0%, #a78bfa 100%)",
                      }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6b6b80]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[#d0d0e0]">
                        <Layers size={13} className="text-[#22d3ee]" />
                        <strong>{stats.shortTermGoalsCount}</strong> Short-Term Goal{stats.shortTermGoalsCount === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1 text-[#d0d0e0]">
                        <CheckCircle2 size={13} className="text-[#22c55e]" />
                        <strong>{stats.completedTasksCount}</strong> / {stats.totalTasksCount} Tasks
                      </span>
                    </div>

                    <button
                      onClick={() => toggleExpand(goal.id)}
                      className="flex items-center gap-1 text-xs text-[#22d3ee] hover:underline cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide Sub-Goals <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          Show Sub-Goals ({childShortTerm.length}) <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Inline Expanded Child Short-Term Goals */}
                {isExpanded && (
                  <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#a0a0b8] mb-1">
                      <span>Sub-Goals ({childShortTerm.length})</span>
                      <button
                        onClick={() => onOpenCreateShortTermGoalModal(goal.id)}
                        className="text-[11px] text-[#22d3ee] hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Short-Term Goal
                      </button>
                    </div>

                    {childShortTerm.length === 0 ? (
                      <p className="text-xs text-[#5a5a6a] italic py-1">
                        No short-term goals added yet. Break this goal into smaller milestones!
                      </p>
                    ) : (
                      childShortTerm.map((st) => {
                        const stTasks = tasks.filter((t) => t.shortTermGoalId === st.id);
                        const stDone = stTasks.filter((t) => t.completed).length;
                        const stProgress =
                          stTasks.length > 0
                            ? Math.round((stDone / stTasks.length) * 100)
                            : 0;

                        return (
                          <div
                            key={st.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs gap-2"
                          >
                            <div>
                              <div className="font-medium text-white">{st.title}</div>
                              <div className="text-[11px] text-[#6b6b80] flex items-center gap-2 mt-0.5">
                                <span>Due {st.dueDate}</span>
                                <span>•</span>
                                <span>
                                  {stDone}/{stTasks.length} Tasks
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 flex flex-col gap-0.5">
                                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full bg-[#22d3ee] rounded-full"
                                    style={{ width: `${stProgress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-right font-mono text-[#a0a0b8]">
                                  {stProgress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
