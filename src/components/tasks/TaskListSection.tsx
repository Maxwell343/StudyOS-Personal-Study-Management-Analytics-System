"use client";

import React, { useState, useMemo } from "react";
import {
  TaskItem,
  ShortTermGoal,
  LongTermGoal,
  TaskFilterTab,
  GoalPriority,
} from "@/types/tasks-goals";
import { getTaskContextTrace } from "@/lib/data-access/tasks-goals";
import {
  Plus,
  CheckSquare,
  Square,
  Clock,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Trash2,
  Tag,
} from "lucide-react";

interface TaskListSectionProps {
  tasks: TaskItem[];
  shortTermGoals: ShortTermGoal[];
  longTermGoals: LongTermGoal[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateTaskModal: () => void;
}

export function TaskListSection({
  tasks,
  shortTermGoals,
  longTermGoals,
  onToggleTask,
  onDeleteTask,
  onOpenCreateTaskModal,
}: TaskListSectionProps) {
  const [activeTab, setActiveTab] = useState<TaskFilterTab>("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [goalFilter, setGoalFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "recent">("dueDate");

  // Get today's ISO date string
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  // Filter subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Tab Filter
      if (activeTab === "TODAY") {
        if (t.dueDate !== todayStr) return false;
      } else if (activeTab === "UPCOMING") {
        if (t.dueDate <= todayStr || t.completed) return false;
      } else if (activeTab === "OVERDUE") {
        if (t.dueDate >= todayStr || t.completed) return false;
      } else if (activeTab === "COMPLETED") {
        if (!t.completed) return false;
      }

      // 2. Subject Filter
      if (subjectFilter !== "ALL" && t.subject !== subjectFilter) {
        return false;
      }

      // 3. Priority Filter
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) {
        return false;
      }

      // 4. Goal Filter
      if (goalFilter !== "ALL" && t.shortTermGoalId !== goalFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "dueDate") {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === "priority") {
        const pOrder: Record<GoalPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      if (sortBy === "recent") {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      }
      return 0;
    });
  }, [tasks, activeTab, subjectFilter, priorityFilter, goalFilter, sortBy, todayStr]);

  const getPriorityStyle = (priority: GoalPriority) => {
    switch (priority) {
      case "HIGH":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "MEDIUM":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "LOW":
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <section className="mb-10">
      {/* Header & Main Quick Action */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f0f0f4] flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#a78bfa] inline-block shadow-[0_0_8px_#a78bfa]" />
            My Tasks & Checklist
          </h2>
          <p className="text-xs text-[#6b6b80]">
            Actionable daily checklist items with complete goal context.
          </p>
        </div>
        <button
          onClick={onOpenCreateTaskModal}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-black transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)" }}
        >
          <Plus size={15} />
          Add Task
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="mb-4 flex flex-col gap-3 rounded-xl border p-3 md:flex-row md:items-center md:justify-between"
        style={{
          background: "var(--card, #13131a)",
          borderColor: "var(--sos-border-card, rgba(255, 255, 255, 0.06))",
        }}
      >
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {(["ALL", "TODAY", "UPCOMING", "OVERDUE", "COMPLETED"] as TaskFilterTab[]).map(
            (tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/30 font-semibold"
                      : "text-[#6b6b80] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab === "ALL" && "All Tasks"}
                  {tab === "TODAY" && "Today"}
                  {tab === "UPCOMING" && "Upcoming"}
                  {tab === "OVERDUE" && "Overdue"}
                  {tab === "COMPLETED" && "Completed"}
                </button>
              );
            }
          )}
        </div>

        {/* Dropdown Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1a1a24] px-2.5 py-1 text-xs text-[#d0d0e0] focus:border-[#22d3ee] outline-none"
          >
            <option value="ALL">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1a1a24] px-2.5 py-1 text-xs text-[#d0d0e0] focus:border-[#22d3ee] outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Short-Term Goal Filter */}
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1a1a24] px-2.5 py-1 text-xs text-[#d0d0e0] focus:border-[#22d3ee] outline-none max-w-[150px]"
          >
            <option value="ALL">All Goals</option>
            {shortTermGoals.map((st) => (
              <option key={st.id} value={st.id}>
                {st.title}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <div className="flex items-center gap-1 text-xs text-[#6b6b80] pl-1 border-l border-white/10">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "dueDate" | "priority" | "recent")
              }
              className="bg-transparent text-xs text-[#a0a0b8] focus:outline-none cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Items */}
      {filteredTasks.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-8 text-center"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(19, 19, 26, 0.3)",
          }}
        >
          <p className="text-xs text-[#6b6b80]">
            No tasks found matching your active filter.
          </p>
          <button
            onClick={onOpenCreateTaskModal}
            className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#22d3ee] hover:bg-white/10 transition-colors"
          >
            + Create A Task
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const context = getTaskContextTrace(task, shortTermGoals, longTermGoals);

            return (
              <div
                key={task.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-3.5 transition-all duration-200 gap-3 ${
                  task.completed
                    ? "bg-white/[0.01] border-white/5 opacity-60"
                    : "bg-[#13131a] border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Left: Checkbox + Title + Goal Context Trace */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 shrink-0 text-[#6b6b80] hover:text-[#22d3ee] transition-colors cursor-pointer"
                  >
                    {task.completed ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#22c55e] text-black">
                        <CheckSquare size={14} className="stroke-[3]" />
                      </div>
                    ) : (
                      <Square size={20} className="text-[#5a5a6a] hover:text-[#22d3ee]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Context Trace Breadcrumb: Task -> Short Term Goal -> Long Term Goal */}
                    {(context.shortTermGoal || context.longTermGoal) && (
                      <div className="flex flex-wrap items-center gap-1 text-[10.5px] font-medium text-[#6b6b80] mb-0.5">
                        {context.longTermGoal && (
                          <span className="truncate text-[#22d3ee] max-w-[140px]">
                            {context.longTermGoal.title}
                          </span>
                        )}
                        {context.longTermGoal && context.shortTermGoal && (
                          <ChevronRight size={10} className="text-[#4a4a5a]" />
                        )}
                        {context.shortTermGoal && (
                          <span className="truncate text-[#a0a0b8] max-w-[140px]">
                            {context.shortTermGoal.title}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Task Title */}
                    <div
                      onClick={() => onToggleTask(task.id)}
                      className={`text-sm font-medium cursor-pointer transition-colors ${
                        task.completed
                          ? "line-through text-[#6b6b80]"
                          : "text-[#f0f0f4] hover:text-[#22d3ee]"
                      }`}
                    >
                      {task.title}
                    </div>

                    {/* Notes / Tags */}
                    {task.notes && (
                      <p className="mt-0.5 text-xs text-[#5a5a6a] line-clamp-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Badges, Date, Time & Delete */}
                <div className="flex items-center gap-2.5 sm:self-center self-end shrink-0">
                  {task.subject && (
                    <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-medium text-[#a0a0b8]">
                      {task.subject}
                    </span>
                  )}

                  <span
                    className={`rounded border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ${getPriorityStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>

                  {task.estimatedMinutes && (
                    <span className="flex items-center gap-1 text-[11px] text-[#6b6b80]">
                      <Clock size={12} />
                      {task.estimatedMinutes}m
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-[11px] text-[#a0a0b8] bg-black/20 px-2 py-0.5 rounded border border-white/5">
                    <Calendar size={12} className="text-[#6b6b80]" />
                    {task.dueDate}
                  </span>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#5a5a6a] hover:text-rose-400 transition-all cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
