"use client";

import { Plus, AlertTriangle } from "lucide-react";
import type { PlanSession, PlanConflict } from "@/types/planner";
import type { PlannedTask } from "@/types/planner";
import { ScheduleSessionCard } from "./ScheduleSessionCard";
import { timeToMinutes } from "@/lib/planner-utils";

interface ScheduleBuilderProps {
  sessions: PlanSession[];
  tasks: PlannedTask[];
  conflicts: PlanConflict[];
  isLocked: boolean;
  onAddSession: () => void;
  onEditSession: (session: PlanSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function ScheduleBuilder({
  sessions,
  tasks,
  conflicts,
  isLocked,
  onAddSession,
  onEditSession,
  onDeleteSession,
}: ScheduleBuilderProps) {
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const conflictSessionIds = new Set(
    conflicts.flatMap((c) => [c.sessionA.id, c.sessionB.id])
  );

  return (
    <div
      className="rounded-[10px] px-[18px] py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
            Tomorrow&apos;s Schedule
          </h2>
          <div
            className="rounded px-2 py-[3px]"
            style={{
              background: isLocked
                ? "rgba(34,197,94,0.1)"
                : "rgba(245,158,11,0.1)",
              border: isLocked
                ? "1px solid rgba(34,197,94,0.2)"
                : "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span
              className="font-mono text-[9px] font-bold uppercase tracking-[0.8px]"
              style={{ color: isLocked ? "#22c55e" : "#f59e0b" }}
            >
              {isLocked ? "Locked" : "Draft Plan"}
            </span>
          </div>
        </div>
        <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Conflict warning */}
      {conflicts.length > 0 && (
        <div
          className="mb-3 flex items-start gap-2.5 rounded-md px-3 py-2.5"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
          role="alert"
        >
          <AlertTriangle
            size={13}
            className="mt-0.5 shrink-0"
            style={{ color: "#ef4444" }}
          />
          <div>
            <div
              className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.5px]"
              style={{ color: "#ef4444" }}
            >
              Schedule Conflict
            </div>
            {conflicts.map((c, i) => (
              <div
                key={i}
                className="text-[11px]"
                style={{ color: "#a0a0b8" }}
              >
                {c.sessionA.startTime}–{c.sessionA.endTime}{" "}
                <span style={{ color: "#5a5a6a" }}>{c.sessionA.subject}</span>
                {" overlaps with "}
                {c.sessionB.startTime}–{c.sessionB.endTime}{" "}
                <span style={{ color: "#5a5a6a" }}>{c.sessionB.subject}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session list */}
      {sorted.length === 0 ? (
        <div
          className="py-8 text-center text-[12.5px]"
          style={{ color: "#4a4a5a" }}
        >
          No sessions planned yet. Add your first study session below.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((session) => (
            <ScheduleSessionCard
              key={session.id}
              session={session}
              task={tasks.find((t) => t.id === session.taskId)}
              isLocked={isLocked}
              hasConflict={conflictSessionIds.has(session.id)}
              onEdit={() => onEditSession(session)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))}
        </div>
      )}

      {/* Add session button */}
      {!isLocked && (
        <button
          onClick={onAddSession}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[7px] py-2.5 text-[12px] font-medium"
          style={{
            border: "1px dashed rgba(34,211,238,0.2)",
            background: "rgba(34,211,238,0.03)",
            color: "#22d3ee",
            transition: "all 0.15s ease",
          }}
        >
          <Plus size={13} />
          Add Study Session
        </button>
      )}
    </div>
  );
}
