"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTodayDateString, getLocalYYYYMMDD } from "@/lib/data-access/planner";

interface MiniCalendarProps {
  currentYear: number;
  currentMonth: number; // 1..12
  selectedDateStr: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function MiniCalendar({
  currentYear,
  currentMonth,
  selectedDateStr,
  onSelectDate,
  onMonthChange,
}: MiniCalendarProps) {
  const todayStr = getTodayDateString();
  const [navYear, setNavYear] = useState(currentYear);
  const [navMonth, setNavMonth] = useState(currentMonth);

  const [prevProps, setPrevProps] = useState({ currentYear, currentMonth });
  if (prevProps.currentYear !== currentYear || prevProps.currentMonth !== currentMonth) {
    setPrevProps({ currentYear, currentMonth });
    setNavYear(currentYear);
    setNavMonth(currentMonth);
  }

  const handlePrev = () => {
    let m = navMonth - 1;
    let y = navYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setNavMonth(m);
    setNavYear(y);
    onMonthChange(y, m);
  };

  const handleNext = () => {
    let m = navMonth + 1;
    let y = navYear;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setNavMonth(m);
    setNavYear(y);
    onMonthChange(y, m);
  };

  // Generate 35 or 42 grid cells
  const firstOfMonth = new Date(navYear, navMonth - 1, 1);
  const dayOfWeek = firstOfMonth.getDay();
  const isoDay = (dayOfWeek + 6) % 7;

  const startDate = new Date(firstOfMonth);
  startDate.setDate(startDate.getDate() - isoDay);

  const gridCells: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
  const iter = new Date(startDate);

  for (let i = 0; i < 35; i++) {
    gridCells.push({
      dateStr: getLocalYYYYMMDD(iter),
      dayNum: iter.getDate(),
      isCurrentMonth: iter.getMonth() === navMonth - 1,
    });
    iter.setDate(iter.getDate() + 1);
  }

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Mini Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-[#f0f0f4]">
          {MONTH_NAMES[navMonth - 1]} {navYear}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-5 w-5 items-center justify-center rounded text-[#8a8a9e] hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-5 w-5 items-center justify-center rounded text-[#8a8a9e] hover:bg-white/10 hover:text-white"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#6b6b80]">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="mt-1.5 grid grid-cols-7 gap-1 text-center text-[11px]">
        {gridCells.map((cell) => {
          const isSelected = cell.dateStr === selectedDateStr;
          const isToday = cell.dateStr === todayStr;

          let textColor = cell.isCurrentMonth ? "#b0b0c8" : "#4a4a5a";
          let bgColor = "transparent";

          if (isSelected) {
            bgColor = "rgba(34,211,238,0.2)";
            textColor = "#22d3ee";
          } else if (isToday) {
            textColor = "#22d3ee";
          }

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => onSelectDate(cell.dateStr)}
              className="flex h-6 w-full cursor-pointer items-center justify-center rounded text-[11px] font-medium transition"
              style={{
                background: bgColor,
                color: textColor,
                border: isToday && !isSelected ? "1px solid rgba(34,211,238,0.4)" : "none",
              }}
            >
              {cell.dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
