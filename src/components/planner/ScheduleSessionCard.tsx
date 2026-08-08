"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { PlanSession } from "@/types/planner";
import type { PlannedTask } from "@/types/planner";
import { formatMinutes } from "@/data/mock-planner";

interface ScheduleSessionCardProps {
  session: PlanSession;
  task?: PlannedTask;
  isLocked: boolean;
  hasConflict: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ScheduleSessionCard({
  session,
  task,
  isLocked,
  hasConflict,
  onEdit,
  onDelete,
}: ScheduleSessionCardProps) {
  return (
    <div
      className="session-card relative grid items-center gap-3.5 rounded-[7px] px-3 py-2.5"
      style={{
        gridTemplateColumns: "100px 1fr auto",
        border: `1px solid ${
          hasConflict
            ? "rgba(239,68,68,0.3)"
            : "rgba(255,255,255,0.04)"
        }`,
        background: hasConflict
          ? "rgba(239,68,68,0.04)"
          : "transparent",
      }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-r-sm"
        style={{
          background: hasConflict ? "#ef4444" : session.color,
          opacity: 0.7,
        }}
      />

      {/* Time column */}
      <div className="pl-1.5">
        <div
          className="mb-1 whitespace-nowrap font-mono text-[10.5px]"
          style={{ color: "#c0c0d0" }}
        >
          {session.startTime} — {session.endTime}
        </div>
        <div
          className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-0.5"
          style={{
            background: hasConflict
              ? "rgba(239,68,68,0.1)"
              : "rgba(255,255,255,0.05)",
          }}
        >
          {hasConflict && (
            <div
              className="pulse-dot h-1 w-1 rounded-full"
              style={{ background: "#ef4444" }}
            />
          )}
          <span
            className="font-mono text-[9px] font-bold tracking-[0.5px]"
            style={{
              color: hasConflict ? "#ef4444" : "#6b6b80",
            }}
          >
            {hasConflict ? "CONFLICT" : "PLANNED"}
          </span>
        </div>
      </div>

      {/* Subject + topic */}
      <div>
        <div className="mb-0.5 flex items-center gap-[7px]">
          <div
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: session.color }}
          />
          <span
            className="text-[13px] font-semibold tracking-tight"
            style={{ color: "#f0f0f4" }}
          >
            {session.subject}
          </span>
          <span className="text-[11px]" style={{ color: "#3a3a4a" }}>
            ·
          </span>
          <span className="text-xs" style={{ color: "#8a8a9e" }}>
            {session.topic}
          </span>
        </div>
        <div className="flex items-center gap-2 pl-[13px]">
          <span
            className="font-mono text-[10.5px]"
            style={{ color: "#4a4a5a" }}
          >
            {formatMinutes(session.durationMinutes)} planned
          </span>
          {task && (
            <>
              <span className="text-[9px]" style={{ color: "#3a3a4a" }}>
                ·
              </span>
              <span className="text-[10.5px]" style={{ color: "#5a5a6a" }}>
                {task.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isLocked && (
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[5px]"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "#5a5a6a",
              transition: "all 0.12s ease",
            }}
            aria-label={`Edit ${session.subject} session`}
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[5px]"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "#5a5a6a",
              transition: "all 0.12s ease",
            }}
            aria-label={`Delete ${session.subject} session`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {isLocked && (
        <div
          className="font-mono text-[9px] font-bold uppercase tracking-[0.5px]"
          style={{ color: "#3a3a4a" }}
        >
          Locked
        </div>
      )}
    </div>
  );
}
