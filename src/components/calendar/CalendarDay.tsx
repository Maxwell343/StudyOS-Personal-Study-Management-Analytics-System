"use client";

import type { CalendarDayData, CalendarSession } from "@/types/calendar";
import { formatMinutes } from "@/lib/planner-utils";

interface CalendarDayProps {
  day: CalendarDayData;
  isSelected: boolean;
  onSelectDay: (day: CalendarDayData) => void;
  onSelectSession: (session: CalendarSession, day: CalendarDayData) => void;
}

function getIntensityBackground(intensity: number): string {
  switch (intensity) {
    case 1:
      return "rgba(34, 211, 238, 0.02)";
    case 2:
      return "rgba(34, 211, 238, 0.05)";
    case 3:
      return "rgba(34, 211, 238, 0.09)";
    case 4:
      return "rgba(34, 197, 94, 0.08)";
    default:
      return "transparent";
  }
}

export function CalendarDay({
  day,
  isSelected,
  onSelectDay,
  onSelectSession,
}: CalendarDayProps) {
  const maxDisplaySessions = 3;
  const visibleSessions = day.sessions.slice(0, maxDisplaySessions);
  const hiddenCount = Math.max(0, day.sessions.length - maxDisplaySessions);

  const intensityBg = getIntensityBackground(day.intensityLevel);

  return (
    <div
      onClick={() => onSelectDay(day)}
      className={`group relative flex min-h-[110px] cursor-pointer flex-col justify-between rounded-lg p-2 transition-all hover:border-[#22d3ee]/40 ${
        !day.isCurrentMonth ? "opacity-45 bg-white/[0.005]" : ""
      }`}
      style={{
        background: isSelected ? "rgba(34,211,238,0.06)" : intensityBg,
        border: isSelected
          ? "1px solid rgba(34,211,238,0.4)"
          : day.isToday
          ? "1px solid rgba(34,211,238,0.3)"
          : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Top Header: Date number & Intensity dot */}
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span
            className={`font-mono text-xs font-bold ${
              day.isToday
                ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#22d3ee] text-[#0d0d12]"
                : day.isCurrentMonth
                ? "text-[#f0f0f4]"
                : "text-[#5a5a6a]"
            }`}
          >
            {day.dayNumber}
          </span>
          {day.isToday && !day.isCurrentMonth && (
            <span className="text-[9px] text-[#22d3ee] font-semibold">TODAY</span>
          )}
        </div>

        {/* Dynamic Study Time / Adherence indicator */}
        {day.actualMinutes > 0 && (
          <span className="font-mono text-[9.5px] font-semibold text-[#22c55e]">
            {formatMinutes(day.actualMinutes)}
          </span>
        )}
      </div>

      {/* Sessions list */}
      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        {visibleSessions.map((session) => {
          const isCompleted = session.status === "completed";
          const isMissed = session.status === "missed";
          const isBehind = session.status === "behind-schedule";
          const isActive = session.status === "active";

          let statusSymbol = "•";
          let pillBg = "rgba(255,255,255,0.04)";
          let pillBorder = "rgba(255,255,255,0.06)";
          let textColor = "#c0c0d0";

          if (isCompleted) {
            statusSymbol = "✓";
            pillBg = "rgba(34,197,94,0.08)";
            pillBorder = "rgba(34,197,94,0.2)";
            textColor = "#4ade80";
          } else if (isMissed) {
            statusSymbol = "✕";
            pillBg = "rgba(239,68,68,0.1)";
            pillBorder = "rgba(239,68,68,0.25)";
            textColor = "#f87171";
          } else if (isBehind) {
            statusSymbol = "⚠";
            pillBg = "rgba(245,158,11,0.1)";
            pillBorder = "rgba(245,158,11,0.25)";
            textColor = "#fbbf24";
          } else if (isActive) {
            statusSymbol = "●";
            pillBg = "rgba(34,211,238,0.15)";
            pillBorder = "rgba(34,211,238,0.35)";
            textColor = "#22d3ee";
          }

          return (
            <div
              key={session.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSession(session, day);
              }}
              title={`${session.subject}: ${session.topic} (${session.timeRange})`}
              className="flex cursor-pointer items-center justify-between rounded border px-1.5 py-0.5 text-[10.5px] transition hover:brightness-125"
              style={{
                background: pillBg,
                borderColor: pillBorder,
                color: textColor,
              }}
            >
              <div className="flex items-center gap-1 truncate">
                <span className="font-bold">{statusSymbol}</span>
                <span className="truncate font-semibold">{session.subject}</span>
                <span className="text-white/30">·</span>
                <span className="truncate text-[#a0a0b8]">{session.topic}</span>
              </div>
              <span className="ml-1 shrink-0 font-mono text-[9px] opacity-75">
                {isCompleted ? formatMinutes(session.actualMinutes || session.plannedMinutes) : formatMinutes(session.plannedMinutes)}
              </span>
            </div>
          );
        })}

        {hiddenCount > 0 && (
          <div className="pl-1 font-mono text-[9.5px] font-semibold text-[#8a8a9e]">
            + {hiddenCount} more session{hiddenCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Bottom subtle progress line */}
      {day.plannedMinutes > 0 && (
        <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, day.adherencePercent)}%`,
              background:
                day.adherencePercent >= 100
                  ? "#22c55e"
                  : day.adherencePercent > 0
                  ? "#22d3ee"
                  : "rgba(255,255,255,0.1)",
            }}
          />
        </div>
      )}
    </div>
  );
}
