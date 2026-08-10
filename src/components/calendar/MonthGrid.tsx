"use client";

import type { CalendarDayData, CalendarSession, CalendarFilterOptions } from "@/types/calendar";
import { CalendarDay } from "./CalendarDay";

interface MonthGridProps {
  days: CalendarDayData[];
  selectedDateStr: string;
  filters: CalendarFilterOptions;
  onSelectDay: (day: CalendarDayData) => void;
  onSelectSession: (session: CalendarSession, day: CalendarDayData) => void;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function MonthGrid({
  days,
  selectedDateStr,
  filters,
  onSelectDay,
  onSelectSession,
}: MonthGridProps) {
  return (
    <div
      className="flex-1 overflow-hidden rounded-[10px] p-3"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* 7-column Weekday Header */}
      <div className="mb-2 grid grid-cols-7 border-b border-white/5 pb-2 text-center font-mono text-[11px] font-bold text-[#6b6b80]">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      {/* 42-cell Month Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          // Apply status & subject filters to day sessions for display
          let filteredSessions = day.sessions;

          if (filters.status !== "all") {
            if (filters.status === "completed") {
              filteredSessions = filteredSessions.filter((s) => s.status === "completed");
            } else if (filters.status === "missed") {
              filteredSessions = filteredSessions.filter((s) => s.status === "missed");
            } else if (filters.status === "planned") {
              filteredSessions = filteredSessions.filter(
                (s) => s.status === "upcoming" || s.status === "starting-soon" || s.status === "active"
              );
            }
          }

          if (filters.subjectId !== "all") {
            filteredSessions = filteredSessions.filter((s) => s.subject === filters.subjectId);
          }

          const filteredDay: CalendarDayData = {
            ...day,
            sessions: filteredSessions,
          };

          return (
            <CalendarDay
              key={day.dateStr}
              day={filteredDay}
              isSelected={day.dateStr === selectedDateStr}
              onSelectDay={onSelectDay}
              onSelectSession={onSelectSession}
            />
          );
        })}
      </div>
    </div>
  );
}
