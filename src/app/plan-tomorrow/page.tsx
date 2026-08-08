"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PlanHeader } from "@/components/planner/PlanHeader";
import { PlanSummaryStats } from "@/components/planner/PlanSummaryStats";
import { ScheduleBuilder } from "@/components/planner/ScheduleBuilder";
import { AddSessionDialog } from "@/components/planner/AddSessionDialog";
import { PlanHealth } from "@/components/planner/PlanHealth";
import { PlanInsight } from "@/components/planner/PlanInsight";
import { PlanLockState } from "@/components/planner/PlanLockState";
import type { PlanSession } from "@/types/planner";
import {
  initialPlanSessions,
  availableTasks,
  computePlanHealth,
  computePlanSummary,
  generateInsight,
} from "@/data/mock-planner";

const DRAFT_STORAGE_KEY = "studyos-plan-draft";
const LOCK_STORAGE_KEY = "studyos-plan-locked";

export default function PlanTomorrowPage() {
  // ── State (initialized with server-safe defaults) ──────────────────────────
  const [sessions, setSessions] = useState<PlanSession[]>(initialPlanSessions);
  const [isLocked, setIsLocked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PlanSession | null>(
    null
  );

  // ── Hydrate from localStorage after mount (external store sync) ────────────
  /* eslint-disable react-hooks/set-state-in-effect -- Legitimate one-time sync with localStorage on mount */
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as PlanSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
        }
      }
      const savedLock = localStorage.getItem(LOCK_STORAGE_KEY);
      if (savedLock === "true") {
        setIsLocked(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── Derived state ──────────────────────────────────────────────────────────
  const health = useMemo(() => computePlanHealth(sessions), [sessions]);
  const summary = useMemo(
    () => computePlanSummary(sessions, availableTasks),
    [sessions]
  );
  const insight = useMemo(
    () => generateInsight(sessions, health),
    [sessions, health]
  );

  // ── Actions ────────────────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore localStorage errors
    }
  }, [sessions]);

  const toggleLock = useCallback(() => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    try {
      localStorage.setItem(LOCK_STORAGE_KEY, String(newLocked));
      if (newLocked) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(sessions));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isLocked, sessions]);

  const handleAddSession = useCallback(() => {
    setEditingSession(null);
    setDialogOpen(true);
  }, []);

  const handleEditSession = useCallback((session: PlanSession) => {
    setEditingSession(session);
    setDialogOpen(true);
  }, []);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const handleSaveSession = useCallback((session: PlanSession) => {
    setSessions((prev) => {
      const exists = prev.find((s) => s.id === session.id);
      if (exists) {
        return prev.map((s) => (s.id === session.id ? session : s));
      }
      return [...prev, session];
    });
  }, []);

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
        </div>
      </main>

      {/* ── Add/Edit Session Dialog ────────────────────────────────── */}
      <AddSessionDialog
        open={dialogOpen}
        editingSession={editingSession}
        availableTasks={availableTasks}
        onClose={handleCloseDialog}
        onSave={handleSaveSession}
      />
    </div>
  );
}
