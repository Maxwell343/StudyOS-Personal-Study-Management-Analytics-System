"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatErrorMessage } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { PlanHeader } from "@/components/planner/PlanHeader";
import { PlanSummaryStats } from "@/components/planner/PlanSummaryStats";
import { ScheduleBuilder } from "@/components/planner/ScheduleBuilder";
import { AddSessionDialog } from "@/components/planner/AddSessionDialog";
import { PlanHealth } from "@/components/planner/PlanHealth";
import { PlanInsight } from "@/components/planner/PlanInsight";
import { PlanLockState } from "@/components/planner/PlanLockState";
import { useAuth } from "@/context/AuthContext";
import type { PlanSession, PlannedTask } from "@/types/planner";
import type { Subject } from "@/types/subjects";
import {
  computePlanHealth,
  computePlanSummary,
  generateInsight,
} from "@/lib/planner-utils";
import {
  getTomorrowDateString,
  fetchPlanForDate,
  savePlanInDb,
  extractAvailableTasksFromSubjects,
} from "@/lib/data-access/planner";
import { fetchSubjectsForUser } from "@/lib/data-access/subjects";
import { Loader2, Save } from "lucide-react";

export default function PlanTomorrowPage() {
  const { user, loading: authLoading } = useAuth();
  const tomorrowDate = useMemo(() => getTomorrowDateString(), []);

  // ── State ──────────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<PlanSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PlanSession | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      if (!user) {
        if (!isCancelled) {
          setSessions([]);
          setSubjects([]);
          setLoading(false);
        }
        return;
      }

      try {
        const [planRes, userSubjects] = await Promise.all([
          fetchPlanForDate(user.id, tomorrowDate),
          fetchSubjectsForUser(user.id),
        ]);

        if (isCancelled) return;

        setSubjects(userSubjects);
        setIsLocked(planRes.isLocked);
        setSessions(planRes.sessions);
        setIsDirty(false);
      } catch (err) {
        console.error("Error loading plan:", formatErrorMessage(err), err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    if (!authLoading) {
      load();
    }

    return () => {
      isCancelled = true;
    };
  }, [user, authLoading, tomorrowDate]);

  // Derived tasks & subjects from DB data
  const availableTasks: PlannedTask[] = useMemo(() => {
    return extractAvailableTasksFromSubjects(subjects);
  }, [subjects]);

  const availableSubjectOptions = useMemo(() => {
    return subjects.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
    }));
  }, [subjects]);

  // Derived computations
  const summary = useMemo(
    () => computePlanSummary(sessions, availableTasks),
    [sessions, availableTasks]
  );
  const health = useMemo(() => computePlanHealth(sessions), [sessions]);
  const insight = useMemo(
    () => generateInsight(sessions, health),
    [sessions, health]
  );

  // ── Auto-save (Only when user makes changes) ──────────────────────────────
  useEffect(() => {
    if (loading || !user || !isDirty) return;

    const timeout = setTimeout(async () => {
      try {
        await savePlanInDb(user.id, tomorrowDate, sessions, isLocked, subjects);
        setIsDirty(false);
      } catch (err) {
        console.error("Auto-save error:", err);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timeout);
  }, [sessions, isLocked, user, tomorrowDate, subjects, loading, isDirty]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const saveDraft = useCallback(async () => {
    if (!user) return;
    try {
      await savePlanInDb(user.id, tomorrowDate, sessions, isLocked, subjects);
      setIsDirty(false);
      setSaveMessage("Draft saved to cloud.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: unknown) {
      console.error("Error saving draft:", err);
      const e = err as Error;
      alert(`Failed to save plan: ${e.message || "Unknown error"}`);
    }
  }, [user, tomorrowDate, sessions, isLocked, subjects, setIsDirty]);

  const toggleLock = useCallback(async () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    setIsDirty(true);
    if (user) {
      try {
        await savePlanInDb(user.id, tomorrowDate, sessions, nextLocked, subjects);
        setIsDirty(false);
        setSaveMessage(nextLocked ? "Plan committed & locked." : "Plan unlocked.");
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (err) {
        console.error("Error updating lock status:", err);
      }
    }
  }, [user, tomorrowDate, sessions, isLocked, subjects, setIsDirty]);

  const handleAddSession = useCallback(() => {
    setEditingSession(null);
    setDialogOpen(true);
  }, []);

  const handleEditSession = useCallback((session: PlanSession) => {
    setEditingSession(session);
    setDialogOpen(true);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setIsDirty(true);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, [setIsDirty]);

  const handleSaveSession = useCallback(
    (savedSession: PlanSession) => {
      setIsDirty(true);
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === savedSession.id);
        let next: PlanSession[];
        if (idx >= 0) {
          next = [...prev];
          next[idx] = savedSession;
        } else {
          next = [...prev, savedSession];
        }
        return next.sort((a, b) => a.startTime.localeCompare(b.startTime));
      });
      setDialogOpen(false);
      setEditingSession(null);
    },
    [setIsDirty]
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingSession(null);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <PlanHeader
          isLocked={isLocked}
          onSaveDraft={saveDraft}
          onToggleLock={toggleLock}
        />

        <div className="flex-1 px-9 pt-5 pb-10">
          {saveMessage && (
            <div
              className="mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium"
              style={{
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.25)",
                color: "#22d3ee",
              }}
            >
              <Save size={13} />
              <span>{saveMessage}</span>
            </div>
          )}

          {loading ? (
            /* Loading State */
            <div className="mt-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#22d3ee]" />
              <span className="text-xs text-[#6b6b80]">Loading plan for tomorrow ({tomorrowDate})...</span>
            </div>
          ) : (
            <>
              {/* Lock state banner */}
              {isLocked && (
                <div className="mb-5">
                  <PlanLockState summary={summary} onUnlock={toggleLock} />
                </div>
              )}

              {/* JARVIS Insight */}
              <div className="mb-5">
                <PlanInsight insight={insight} />
              </div>

              {/* Summary stats */}
              <PlanSummaryStats summary={summary} />

              {/* Main grid: Schedule + Plan Health */}
              <div
                className="grid gap-4 max-lg:grid-cols-1"
                style={{ gridTemplateColumns: "1fr 360px" }}
              >
                {/* Left: Schedule */}
                <ScheduleBuilder
                  sessions={sessions}
                  tasks={availableTasks}
                  conflicts={health.conflicts}
                  isLocked={isLocked}
                  onAddSession={handleAddSession}
                  onEditSession={handleEditSession}
                  onDeleteSession={handleDeleteSession}
                />

                {/* Right: Plan Health */}
                <div className="flex flex-col gap-3.5">
                  <PlanHealth
                    health={health}
                    earliestStart={summary.earliestStart}
                    latestEnd={summary.latestEnd}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Add/Edit Session Dialog ────────────────────────────────── */}
      <AddSessionDialog
        open={dialogOpen}
        editingSession={editingSession}
        availableTasks={availableTasks}
        availableSubjects={availableSubjectOptions}
        onClose={handleCloseDialog}
        onSave={handleSaveSession}
      />
    </div>
  );
}
