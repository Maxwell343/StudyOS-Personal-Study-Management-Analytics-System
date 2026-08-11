"use client";

import { Play, Trash2, Calendar, Clock } from "lucide-react";
import type { StudySession, SessionStatus } from "@/types/dashboard";
import { STATUS_CONFIG } from "@/lib/constants";

interface MissionCardProps {
  session: StudySession;
  status: SessionStatus;
  isNext: boolean;
  onCycle: () => void;
  onStartSession?: () => void;
  onDelete?: () => void;
  onMoveToTomorrow?: () => void;
  onReschedule?: () => void;
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;

  return (
    <div
      className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-0.5"
      style={{ background: cfg.bg }}
    >
      {cfg.dot && (
        <div
          className="pulse-dot h-1 w-1 rounded-full"
          style={{ background: cfg.dot }}
        />
      )}
      <span
        className="font-mono text-[9px] font-bold tracking-[0.5px]"
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

export function MissionCard({
  session,
  status,
  isNext,
  onCycle,
  onStartSession,
  onDelete,
  onMoveToTomorrow,
  onReschedule,
}: MissionCardProps) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isPaused = status === "paused";
  const isMissed = status === "missed";
  const isBehind = status === "behind-schedule";

  let borderColor = "rgba(255,255,255,0.04)";
  let bgColor = "transparent";

  if (isCompleted) {
    borderColor = "rgba(255,255,255,0.03)";
  } else if (isMissed) {
    borderColor = "rgba(239,68,68,0.25)";
    bgColor = "rgba(239,68,68,0.03)";
  } else if (isBehind) {
    borderColor = "rgba(245,158,11,0.25)";
    bgColor = "rgba(245,158,11,0.03)";
  } else if (isNext) {
    borderColor = "rgba(34,211,238,0.14)";
    bgColor = "rgba(34,211,238,0.03)";
  }

  const handleAction = () => {
    if (onStartSession) {
      onStartSession();
    } else {
      onCycle();
    }
  };

  return (
    <div
      className="session-card relative grid items-center gap-3.5 rounded-[7px] px-3 py-2.5"
      style={{
        gridTemplateColumns: "90px 1fr auto",
        border: `1px solid ${borderColor}`,
        background: bgColor,
        opacity: isCompleted ? 0.55 : 1,
      }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-r-sm"
        style={{
          background: isMissed ? "#ef4444" : isBehind ? "#f59e0b" : session.color,
          opacity: isNext || isMissed || isBehind ? 0.9 : 0.3,
        }}
      />

      {/* Time column */}
      <div className="pl-1.5">
        <div
          className="mb-1 whitespace-nowrap font-mono text-[10.5px]"
          style={{ color: isMissed ? "#f87171" : isNext ? "#c0c0d0" : "#6b6b80" }}
        >
          {session.startTime} — {session.endTime}
        </div>
        <StatusBadge status={status} />
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
            style={{
              color: isCompleted ? "#6b6b80" : "#f0f0f4",
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {session.subject}
          </span>
          <span className="text-[11px]" style={{ color: "#3a3a4a" }}>
            ·
          </span>
          <span
            className="text-xs"
            style={{ color: isCompleted ? "#4a4a5a" : "#8a8a9e" }}
          >
            {session.topic}
          </span>
        </div>
        <div
          className="pl-[13px] font-mono text-[10.5px]"
          style={{ color: isMissed ? "#ef4444" : "#4a4a5a" }}
        >
          {session.duration} {isMissed && "· Time slot passed"}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {(isMissed || isBehind) && onMoveToTomorrow && (
          <button
            type="button"
            onClick={onMoveToTomorrow}
            title="Move to Tomorrow's Plan"
            className="flex cursor-pointer items-center gap-1 rounded-[5px] border border-[#22d3ee]/20 bg-[#22d3ee]/10 px-2.5 py-[5px] text-[11px] font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
          >
            <Calendar size={10} />
            Tomorrow
          </button>
        )}

        {(isMissed || isBehind) && onReschedule && (
          <button
            type="button"
            onClick={onReschedule}
            title="Reschedule session"
            className="flex cursor-pointer items-center gap-1 rounded-[5px] border border-amber-500/20 bg-amber-500/10 px-2.5 py-[5px] text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20 transition"
          >
            <Clock size={10} />
            Reschedule
          </button>
        )}

        {!isCompleted && (() => {
          const isWorkable = isActive || isPaused || status === "starting-soon" || status === "behind-schedule";
          let tooltip = "Start session";
          if (status === "upcoming") {
            tooltip = `Available during time slot (${session.startTime} - ${session.endTime})`;
          } else if (status === "missed") {
            tooltip = "Time slot passed. Reschedule or move to tomorrow.";
          }

          return (
            <button
              onClick={handleAction}
              disabled={!isWorkable}
              title={tooltip}
              className={`flex items-center gap-[5px] whitespace-nowrap rounded-[5px] px-3 py-[5px] text-[11px] font-semibold transition-all duration-150 ${
                !isWorkable ? "cursor-not-allowed opacity-35" : "cursor-pointer"
              }`}
              style={{
                border: isWorkable
                  ? "1px solid rgba(34,211,238,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
                background: isActive
                  ? "rgba(34,211,238,0.08)"
                  : "transparent",
                color: isWorkable ? "#22d3ee" : "#5a5a6a",
              }}
            >
              {isActive ? (
                <>
                  <span className="text-[8px]">⏸</span> Pause
                </>
              ) : isPaused ? (
                <>
                  <Play size={9} />
                  Resume
                </>
              ) : (
                <>
                  <Play size={9} />
                  Start
                </>
              )}
            </button>
          );
        })()}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Delete mission"
            aria-label="Delete mission"
            className="flex h-[27px] w-[27px] cursor-pointer items-center justify-center rounded-[5px]"
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444",
              transition: "all 0.12s ease",
            }}
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
