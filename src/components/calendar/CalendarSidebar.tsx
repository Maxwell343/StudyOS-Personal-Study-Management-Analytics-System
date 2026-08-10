"use client";

import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { MiniCalendar } from "./MiniCalendar";
import type { CalendarFilterOptions } from "@/types/calendar";

interface SubjectOption {
  id: string;
  name: string;
  color: string;
}

interface CalendarSidebarProps {
  currentYear: number;
  currentMonth: number;
  selectedDateStr: string;
  filters: CalendarFilterOptions;
  subjects: SubjectOption[];
  onSelectDate: (dateStr: string) => void;
  onMonthChange: (year: number, month: number) => void;
  onGoToday: () => void;
  onFilterChange: (filters: CalendarFilterOptions) => void;
}

export function CalendarSidebar({
  currentYear,
  currentMonth,
  selectedDateStr,
  filters,
  subjects,
  onSelectDate,
  onMonthChange,
  onGoToday,
  onFilterChange,
}: CalendarSidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-4 lg:w-[240px] shrink-0">
      {/* Mini Calendar Widget */}
      <div
        className="rounded-[10px] p-3.5"
        style={{
          background: "#13131a",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">
            Navigator
          </span>
          <button
            type="button"
            onClick={onGoToday}
            className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#22d3ee] hover:underline"
          >
            <CalendarIcon size={11} /> Today
          </button>
        </div>

        <MiniCalendar
          currentYear={currentYear}
          currentMonth={currentMonth}
          selectedDateStr={selectedDateStr}
          onSelectDate={onSelectDate}
          onMonthChange={onMonthChange}
        />
      </div>

      {/* Filters Card */}
      <div
        className="rounded-[10px] p-3.5"
        style={{
          background: "#13131a",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">
          <Filter size={12} className="text-[#22d3ee]" />
          Filters
        </div>

        {/* Status Filter */}
        <div className="mb-3 space-y-1">
          <label className="block text-[11px] font-medium text-[#8a8a9e]">
            Session Status
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["all", "completed", "planned", "missed"] as const).map((st) => {
              const active = filters.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, status: st })}
                  className={`rounded px-2 py-1 text-[11px] font-semibold capitalize transition ${
                    active
                      ? st === "completed"
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                        : st === "missed"
                        ? "bg-red-500/20 border border-red-500/40 text-red-400"
                        : st === "planned"
                        ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400"
                        : "bg-white/15 border border-white/30 text-white"
                      : "bg-white/5 border border-transparent text-[#6b6b80] hover:text-[#b0b0c8]"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Filter */}
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-[#8a8a9e]">
            Subject Filter
          </label>
          <select
            value={filters.subjectId}
            onChange={(e) => onFilterChange({ ...filters, subjectId: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-[#0d0d12] px-2.5 py-1.5 text-xs text-[#f0f0f4] outline-none focus:border-[#22d3ee]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}
