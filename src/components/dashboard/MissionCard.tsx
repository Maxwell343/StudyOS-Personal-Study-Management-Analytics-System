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
    <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold text-muted-foreground">
      ○ UPCOMING
    </span>
  );

  if (isCompleted) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
        ✓ COMPLETED
      </span>
    );
  } else if (isActive) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        ACTIVE
      </span>
    );
  } else if (isPaused) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        PAUSED
      </span>
    );
  } else if (isMissed) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-red-600 dark:text-red-400">
        <AlertTriangle size={10} />
        MISSED
      </span>
    );
  } else if (isBehind) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400">
        BEHIND
      </span>
    );
  } else if (isStartingSoon) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-cyan-700 dark:text-cyan-300">
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
          ? "border border-border bg-secondary/30 opacity-60"
          : isActive || isPaused
            ? "border border-emerald-500/40 bg-emerald-500/[0.08] shadow-xs"
            : isMissed
              ? "border border-red-500/30 bg-red-500/[0.06]"
              : isNext
                ? "border border-cyan-500/35 bg-cyan-500/[0.06] shadow-xs"
                : "border border-border bg-card hover:border-cyan-500/30 hover:bg-secondary/50 shadow-xs"
      }`}
    >
      {/* Accent left indicator bar */}
      <div
        className="absolute left-0 top-[18%] bottom-[18%] w-[3px] rounded-r-full transition-all group-hover:w-[4px]"
        style={{
          background: isCompleted
            ? "#16a34a"
            : isMissed
              ? "#dc2626"
              : isBehind
                ? "#d97706"
                : isActive
                  ? "#16a34a"
                  : session.color || "#0891b2",
        }}
      />

      {/* Left info: Time & Subject/Topic */}
      <div className="flex items-center gap-4 min-w-0 flex-1 pl-1">
        {/* Time slot column */}
        <div className="w-24 shrink-0 flex flex-col">
          <span
            className={`font-mono text-xs font-semibold ${
              isCompleted
                ? "text-muted-foreground"
                : isMissed
                  ? "text-red-600 dark:text-red-400"
                  : isNext || isActive
                    ? "text-foreground"
                    : "text-foreground/80"
            }`}
          >
            {session.startTime}
          </span>
          <div className="mt-0.5">{statusBadge}</div>
        </div>

        {/* Subject & Topic Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold tracking-tight text-foreground group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition"
              style={{
                textDecoration: isCompleted ? "line-through" : "none",
              }}
            >
              {session.subject}
            </span>
            <span className="text-xs text-muted-foreground/60">/</span>
            <span
              className="text-xs text-foreground/80 font-medium truncate group-hover:text-foreground transition"
              style={{
                textDecoration: isCompleted ? "line-through" : "none",
              }}
            >
              {session.topic}
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span>{session.duration || "50m"}</span>
            {isMissed && <span className="text-red-600 dark:text-red-400">· Time slot passed</span>}
            <span className="text-cyan-600/0 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition font-sans text-[10.5px]">
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
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 transition border border-amber-500/25"
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
            className="flex cursor-pointer items-center gap-1 rounded-[6px] border border-cyan-500/35 bg-cyan-500/10 px-2 py-1 text-[10.5px] font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition"
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
            className="flex cursor-pointer items-center gap-1 rounded-[6px] border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25 transition active:scale-95 shadow-xs"
          >
            <Play size={10} className="fill-cyan-600 dark:fill-cyan-400" /> Start
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
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

