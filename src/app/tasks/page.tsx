"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  LongTermGoal,
  ShortTermGoal,
  TaskItem,
} from "@/types/tasks-goals";
import {
  getStoredLongTermGoals,
  saveStoredLongTermGoals,
  getStoredShortTermGoals,
  saveStoredShortTermGoals,
  getStoredTasks,
  saveStoredTasks,
  computeOverallWorkspaceStats,
} from "@/lib/data-access/tasks-goals";

import { OverviewDashboard } from "@/components/tasks/OverviewDashboard";
import { LongTermGoalsSection } from "@/components/tasks/LongTermGoalsSection";
import { ShortTermGoalsSection } from "@/components/tasks/ShortTermGoalsSection";
import { TaskListSection } from "@/components/tasks/TaskListSection";
import { GoalDetailDrawer } from "@/components/tasks/GoalDetailDrawer";
import { CreateGoalModal } from "@/components/tasks/CreateGoalModal";
import { CreateShortTermGoalModal } from "@/components/tasks/CreateShortTermGoalModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

import { Search, Plus, SlidersHorizontal, RefreshCw } from "lucide-react";

export default function TasksAndGoalsPage() {
  // State
  const [longTermGoals, setLongTermGoals] = useState<LongTermGoal[]>([]);
  const [shortTermGoals, setShortTermGoals] = useState<ShortTermGoal[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer & Modals state
  const [selectedGoalForDetails, setSelectedGoalForDetails] = useState<LongTermGoal | null>(null);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);

  const [isCreateShortTermModalOpen, setIsCreateShortTermModalOpen] = useState(false);
  const [defaultLtGoalIdForShortTerm, setDefaultLtGoalIdForShortTerm] = useState<string | undefined>();

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [defaultStGoalIdForTask, setDefaultStGoalIdForTask] = useState<string | undefined>();

  // Load state on mount
  useEffect(() => {
    setLongTermGoals(getStoredLongTermGoals());
    setShortTermGoals(getStoredShortTermGoals());
    setTasks(getStoredTasks());
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage whenever state updates
  useEffect(() => {
    if (!isLoaded) return;
    saveStoredLongTermGoals(longTermGoals);
  }, [longTermGoals, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveStoredShortTermGoals(shortTermGoals);
  }, [shortTermGoals, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveStoredTasks(tasks);
  }, [tasks, isLoaded]);

  // Overall Statistics
  const overallStats = useMemo(() => {
    return computeOverallWorkspaceStats(longTermGoals, shortTermGoals, tasks);
  }, [longTermGoals, shortTermGoals, tasks]);

  // Search filtering
  const filteredLongTermGoals = useMemo(() => {
    if (!searchQuery.trim()) return longTermGoals;
    const q = searchQuery.toLowerCase();
    return longTermGoals.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.subject?.toLowerCase().includes(q)
    );
  }, [longTermGoals, searchQuery]);

  const filteredShortTermGoals = useMemo(() => {
    if (!searchQuery.trim()) return shortTermGoals;
    const q = searchQuery.toLowerCase();
    return shortTermGoals.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [shortTermGoals, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  // Handlers for Long-Term Goals
  const handleCreateLongTermGoal = (
    goalData: Omit<LongTermGoal, "id" | "createdAt" | "status">
  ) => {
    const newGoal: LongTermGoal = {
      ...goalData,
      id: `lt-${Date.now()}`,
      status: "IN_PROGRESS",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLongTermGoals((prev) => [newGoal, ...prev]);
  };

  const handleDeleteLongTermGoal = (id: string) => {
    setLongTermGoals((prev) => prev.filter((g) => g.id !== id));
    // also remove orphan short term goals and tasks
    const childStIds = new Set(
      shortTermGoals.filter((st) => st.longTermGoalId === id).map((st) => st.id)
    );
    setShortTermGoals((prev) => prev.filter((st) => st.longTermGoalId !== id));
    setTasks((prev) => prev.filter((t) => !childStIds.has(t.shortTermGoalId)));
    if (selectedGoalForDetails?.id === id) {
      setSelectedGoalForDetails(null);
    }
  };

  // Handlers for Short-Term Goals
  const handleCreateShortTermGoal = (
    stData: Omit<ShortTermGoal, "id" | "createdAt" | "status">
  ) => {
    const newSt: ShortTermGoal = {
      ...stData,
      id: `st-${Date.now()}`,
      status: "IN_PROGRESS",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setShortTermGoals((prev) => [newSt, ...prev]);
  };

  const handleDeleteShortTermGoal = (id: string) => {
    setShortTermGoals((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.shortTermGoalId !== id));
  };

  // Handlers for Tasks
  const handleCreateTask = (
    taskData: Omit<TaskItem, "id" | "createdAt" | "completed" | "completedAt">
  ) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `t-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleOpenCreateShortTermModalWithParent = (ltGoalId?: string) => {
    setDefaultLtGoalIdForShortTerm(ltGoalId);
    setIsCreateShortTermModalOpen(true);
  };

  const handleOpenCreateTaskModalWithParent = (stGoalId?: string) => {
    setDefaultStGoalIdForTask(stGoalId);
    setIsCreateTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#0c0c0f] text-[#f0f0f4]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">
            {/* Top Page Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Tasks & Goals
                </h1>
                <p className="mt-1 text-xs text-[#a0a0b8] sm:text-sm">
                  Turn your long-term goals into focused actions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b80]"
                  />
                  <input
                    type="text"
                    placeholder="Search tasks or goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#13131a] py-2 pl-9 pr-3 text-xs text-white placeholder-[#5a5a6a] focus:border-[#22d3ee] outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6b6b80] hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Add Goal Button */}
                <button
                  onClick={() => setIsCreateGoalModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-lg transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)",
                    boxShadow: "0 0 16px rgba(34, 211, 238, 0.35)",
                  }}
                >
                  <Plus size={16} />
                  Add Goal
                </button>
              </div>
            </div>

            {/* Overview / Progress Section */}
            <OverviewDashboard
              activeGoalsCount={overallStats.activeGoalsCount}
              totalLongTermGoals={overallStats.totalLongTermGoals}
              completedTasks={overallStats.completedTasks}
              remainingTasks={overallStats.remainingTasks}
              totalTasks={overallStats.totalTasks}
              overallProgress={overallStats.overallProgress}
            />

            {/* Long-Term Goals Section */}
            <LongTermGoalsSection
              longTermGoals={filteredLongTermGoals}
              shortTermGoals={shortTermGoals}
              tasks={tasks}
              onOpenCreateGoalModal={() => setIsCreateGoalModalOpen(true)}
              onOpenCreateShortTermGoalModal={handleOpenCreateShortTermModalWithParent}
              onSelectGoalDetails={(goal) => setSelectedGoalForDetails(goal)}
              onDeleteGoal={handleDeleteLongTermGoal}
            />

            {/* Short-Term Goals Section */}
            <ShortTermGoalsSection
              shortTermGoals={filteredShortTermGoals}
              longTermGoals={longTermGoals}
              tasks={tasks}
              onOpenCreateShortTermGoalModal={() =>
                handleOpenCreateShortTermModalWithParent()
              }
              onOpenCreateTaskModal={handleOpenCreateTaskModalWithParent}
              onDeleteShortTermGoal={handleDeleteShortTermGoal}
            />

            {/* Checklist / My Tasks Section */}
            <TaskListSection
              tasks={filteredTasks}
              shortTermGoals={shortTermGoals}
              longTermGoals={longTermGoals}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenCreateTaskModal={() => handleOpenCreateTaskModalWithParent()}
            />
          </div>
        </main>
      </div>

      {/* Goal Details Side Panel / Drawer */}
      <GoalDetailDrawer
        goal={selectedGoalForDetails}
        shortTermGoals={shortTermGoals}
        tasks={tasks}
        onClose={() => setSelectedGoalForDetails(null)}
        onToggleTask={handleToggleTask}
        onOpenCreateShortTermGoalModal={handleOpenCreateShortTermModalWithParent}
        onOpenCreateTaskModal={handleOpenCreateTaskModalWithParent}
      />

      {/* Create Long-Term Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateGoalModalOpen}
        onClose={() => setIsCreateGoalModalOpen(false)}
        onSubmit={handleCreateLongTermGoal}
      />

      {/* Create Short-Term Goal Modal */}
      <CreateShortTermGoalModal
        isOpen={isCreateShortTermModalOpen}
        defaultLongTermGoalId={defaultLtGoalIdForShortTerm}
        longTermGoals={longTermGoals}
        onClose={() => setIsCreateShortTermModalOpen(false)}
        onSubmit={handleCreateShortTermGoal}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        defaultShortTermGoalId={defaultStGoalIdForTask}
        shortTermGoals={shortTermGoals}
        longTermGoals={longTermGoals}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
