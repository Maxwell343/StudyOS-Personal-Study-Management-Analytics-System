"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, Zap, Download } from "lucide-react";
import { formatMinutes } from "@/lib/planner-utils";
import type { MonthSummaryStats } from "@/types/calendar";

interface CalendarHeaderProps {
  currentYear: number;
  currentMonth: number; // 1-indexed (1..12)
  stats: MonthSummaryStats;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
  onExportICS?: () => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarHeader({
  currentYear,
  currentMonth,
  stats,
  onPrevMonth,
  onNextMonth,
  onGoToday,
  onExportICS,
}: CalendarHeaderProps) {
  const monthName = MONTH_NAMES[currentMonth - 1] || "";
  const formattedStudyTime = formatMinutes(stats.totalActualMinutes);

  return (
    <div className="mb-6 flex flex-col gap-4">
      {/* Top Title & Month Navigator Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-[#f0f0f4]">
            Calendar
          </h1>
          <p className="m-0 text-xs text-[#8a8a9e]">
            Study history &amp; scheduled sessions
          </p>
        </div>

        {/* Month Navigator & Actions */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{
              background: "#13131a",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              type="button"
              onClick={onPrevMonth}
              title="Previous Month"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#8a8a9e] transition hover:bg-white/10 hover:text-[#f0f0f4]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[130px] text-center font-mono text-sm font-semibold text-[#f0f0f4]">
              {monthName} {currentYear}
            </span>
            <button
              type="button"
              onClick={onNextMonth}
              title="Next Month"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#8a8a9e] transition hover:bg-white/10 hover:text-[#f0f0f4]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onGoToday}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-3 py-1.5 text-xs font-semibold text-[#22d3ee] transition hover:bg-[#22d3ee]/20"
          >
            <CalendarIcon size={13} />
            Today
          </button>

          {onExportICS && (
            <button
              type="button"
              onClick={onExportICS}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#d4d4d8] transition hover:border-white/[0.18] hover:text-white"
              title="Export Month Schedule to iCal (.ics)"
            >
              <Download size={13} className="text-[#38bdf8]" />
              Export (.ics)
            </button>
          )}
        </div>
      </div>

      {/* Main Monthly Statistics Bar */}
      <div
        className="grid grid-cols-2 gap-3 rounded-[10px] p-3.5 sm:grid-cols-4"
        style={{
          background: "#13131a",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Study Time */}
        <div className="flex items-center gap-3 border-r border-white/5 pr-3 max-sm:border-r-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee" }}
          >
            <Clock size={18} />
          </div>
          <div>
            <div className="font-mono text-base font-bold text-[#f0f0f4]">
              {formattedStudyTime}
            </div>
            <div className="text-[11px] font-medium text-[#6b6b80] uppercase tracking-wider">
              Study Time
            </div>
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="flex items-center gap-3 border-r border-white/5 pr-3 max-sm:border-r-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
          >
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="font-mono text-base font-bold text-[#f0f0f4]">
              {stats.completedCount}
            </div>
            <div className="text-[11px] font-medium text-[#6b6b80] uppercase tracking-wider">
              Completed
            </div>
          </div>
        </div>

        {/* Plan Adherence */}
        <div className="flex items-center gap-3 border-r border-white/5 pr-3 max-sm:border-r-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}
          >
            <Zap size={18} />
          </div>
          <div>
            <div className="font-mono text-base font-bold text-[#f0f0f4]">
              {stats.adherencePercent}%
            </div>
            <div className="text-[11px] font-medium text-[#6b6b80] uppercase tracking-wider">
              Adherence
            </div>
          </div>
        </div>

        {/* Missed Sessions */}
        <div className="flex items-center gap-3 pl-1">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="font-mono text-base font-bold text-[#f0f0f4]">
              {stats.missedCount}
            </div>
            <div className="text-[11px] font-medium text-[#6b6b80] uppercase tracking-wider">
              Missed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
