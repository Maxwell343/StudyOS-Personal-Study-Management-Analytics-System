"use client";

import React, { useState } from "react";
import { Flame } from "lucide-react";
import type { StudyHeatmapDay } from "@/lib/analytics/types";
import { formatMinutes } from "@/lib/planner-utils";

interface StudyHeatmapProps {
  heatmap: StudyHeatmapDay[];
  rangeLabel: string;
}

export const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ heatmap, rangeLabel }) => {
  const [hoveredDay, setHoveredDay] = useState<StudyHeatmapDay | null>(null);

  if (!heatmap || heatmap.length === 0) return null;

  const totalStudyMinutes = heatmap.reduce((acc, d) => acc + d.studyMinutes, 0);
  const activeDays = heatmap.filter((d) => d.studyMinutes > 0).length;

  const getCellColor = (intensity: 0 | 1 | 2 | 3 | 4) => {
    switch (intensity) {
      case 4:
        return "#22d3ee";
      case 3:
        return "#06b6d4";
      case 2:
        return "#0891b2";
      case 1:
        return "#155e75";
      default:
        return "rgba(255, 255, 255, 0.05)";
    }
  };

  return (
    <div
      className="rounded-2xl border p-5 transition-all"
      style={{
        background: "rgba(18, 24, 38, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#f97316]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
              Study Consistency Heatmap — {rangeLabel}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[#717188]">
            Daily focus density and consistency rhythm
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#9090a8]">
          <span>
            Active Days: <strong className="text-[#f0f0f4]">{activeDays} / {heatmap.length}</strong>
          </span>
          <span>•</span>
          <span>
            Total Time: <strong className="text-[#22d3ee]">{formatMinutes(totalStudyMinutes)}</strong>
          </span>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {heatmap.map((day) => {
            const isHovered = hoveredDay?.date === day.date;
            return (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className="relative h-6 w-6 sm:h-7 sm:w-7 rounded-md cursor-pointer transition-all duration-150 hover:scale-110"
                style={{
                  background: getCellColor(day.intensity),
                  border: isHovered
                    ? "1.5px solid #22d3ee"
                    : "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow:
                    day.intensity >= 3 ? "0 0 8px rgba(34, 211, 238, 0.35)" : "none",
                }}
              />
            );
          })}
        </div>

        {/* Dynamic Tooltip */}
        {hoveredDay && (
          <div
            className="mt-3 rounded-xl border border-white/10 bg-[#0d121e] p-3 text-xs shadow-xl font-mono flex items-center justify-between gap-4"
          >
            <div>
              <span className="font-bold text-[#f0f0f4]">
                {hoveredDay.date} ({hoveredDay.dayName})
              </span>
              <span className="ml-2 text-[#22d3ee]">
                {hoveredDay.studyMinutes > 0
                  ? `${formatMinutes(hoveredDay.studyMinutes)} studied`
                  : "No study activity"}
              </span>
            </div>
            <div className="text-[#a0a0b8]">
              {hoveredDay.sessionCount} sessions • {hoveredDay.completionRate}% completion
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3 text-[11px] text-[#717188]">
        <span>Less active</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: getCellColor(0) }} />
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: getCellColor(1) }} />
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: getCellColor(2) }} />
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: getCellColor(3) }} />
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: getCellColor(4) }} />
        </div>
        <span>More active</span>
      </div>
    </div>
  );
};
