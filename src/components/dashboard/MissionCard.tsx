"use client";

import { Play, Trash2, Calendar, Pencil, CheckCircle2, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import type { StudySession, SessionStatus } from "@/types/dashboard";

interface MissionCardProps {
  session: StudySession;
  status: SessionStatus;
  isNext: boolean;
  onCycle: () => void;
  onSelectSession?: (session: StudySession) => void;
  onStartSession?: () => void;
  onDelete?: () => void;
  onMoveToTomorrow?: () => void;
  onReschedule?: () => void;
}

export function MissionCard({
  session,
  status,
  isNext,
  onCycle,
  onSelectSession,
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
  const isStartingSoon = status === "starting-soon";

  // Visual status configurations
  let statusBadge = (
    <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold text-[#71717a]">
      ○ UPCOMING
    </span>
  );

  if (isCompleted) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold text-[#22c55e]">
        ✓ COMPLETED
      </span>
    );
  } else if (isActive) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#22c55e]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
        ACTIVE
      </span>
    );
  } else if (isPaused) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#f97316]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
        PAUSED
      </span>
    );
  } else if (isMissed) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#ef4444]">
        <AlertTriangle size={10} />
        MISSED
      </span>
    );
  } else if (isBehind) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#f59e0b]">
        BEHIND
      </span>
    );
  } else if (isStartingSoon) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#22d3ee]">
        SOON
      </span>
    );
  }

  return (
    <div
      onClick={() => onSelectSession?.(session)}
      title="Click to view curriculum topics"
      className={`group relative flex items-center justify-between gap-3 rounded-[9px] px-3.5 py-3 transition-all duration-150 cursor-pointer ${
        isCompleted
          ? "border border-white/[0.03] bg-white/[0.01] opacity-60"
          : isActive || isPaused
            ? "border border-emerald-500/30 bg-emerald-500/[0.04] shadow-[0_0_15px_rgba(34,197,94,0.05)]"
            : isMissed
              ? "border border-red-500/25 bg-red-500/[0.02]"
              : isNext
                ? "border border-cyan-500/30 bg-cyan-500/[0.03]"
                : "border border-white/[0.05] bg-white/[0.015] hover:border-white/[0.12] hover:bg-white/[0.025]"
      }`}
    >
      {/* Accent left indicator bar */}
      <div
        className="absolute left-0 top-[18%] bottom-[18%] w-[3px] rounded-r-full transition-all group-hover:w-[4px]"
        style={{
          background: isCompleted
            ? "#22c55e"
            : isMissed
              ? "#ef4444"
              : isBehind
                ? "#f59e0b"
                : isActive
                  ? "#22c55e"
                  : session.color || "#22d3ee",
        }}
      />

      {/* Left info: Time & Subject/Topic */}
      <div className="flex items-center gap-4 min-w-0 flex-1 pl-1">
        {/* Time slot column */}
        <div className="w-24 shrink-0 flex flex-col">
          <span
            className="font-mono text-xs font-semibold"
            style={{
              color: isCompleted
                ? "#71717a"
                : isMissed
                  ? "#f87171"
                  : isNext || isActive
                    ? "#f4f4f5"
                    : "#a1a1aa",
            }}
          >
            {session.startTime}
          </span>
          <div className="mt-0.5">{statusBadge}</div>
        </div>

        {/* Subject & Topic Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold tracking-tight text-[#f4f4f5] group-hover:text-cyan-300 transition"
              style={{
                textDecoration: isCompleted ? "line-through" : "none",
              }}
            >
              {session.subject}
            </span>
            <span className="text-xs text-[#52525b]">/</span>
            <span
              className="text-xs text-[#d4d4d8] font-medium truncate group-hover:text-white transition"
              style={{
                textDecoration: isCompleted ? "line-through" : "none",
              }}
            >
              {session.topic}
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-[11px] font-mono text-[#71717a]">
            <span>{session.duration || "50m"}</span>
            {isMissed && <span className="text-[#ef4444]">· Time slot passed</span>}
            <span className="text-cyan-400/0 group-hover:text-cyan-400 transition font-sans text-[10.5px]">
              View topics &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div
        className="flex items-center gap-1.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {!isCompleted && onReschedule && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReschedule();
            }}
            title="Edit schedule"
            aria-label="Edit schedule"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] text-[#f59e0b] hover:bg-amber-500/10 transition border border-amber-500/20"
          >
            <Pencil size={11} />
          </button>
        )}

        {(isMissed || isBehind) && onMoveToTomorrow && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveToTomorrow();
            }}
            title="Move to tomorrow"
            className="flex cursor-pointer items-center gap-1 rounded-[6px] border border-[#22d3ee]/25 bg-[#22d3ee]/10 px-2 py-1 text-[10.5px] font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
          >
            <Calendar size={10} /> Tomorrow
          </button>
        )}

        {!isCompleted && onStartSession && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartSession();
            }}
            title={isActive ? "Active in timer" : "Start session timer"}
            className="flex cursor-pointer items-center gap-1 rounded-[6px] border border-[#22d3ee]/35 bg-[#22d3ee]/15 px-2.5 py-1 text-xs font-bold text-[#22d3ee] hover:bg-[#22d3ee]/25 transition active:scale-95"
          >
            <Play size={10} className="fill-[#22d3ee]" /> Start
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Remove session"
            aria-label="Remove session"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] text-[#71717a] hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

