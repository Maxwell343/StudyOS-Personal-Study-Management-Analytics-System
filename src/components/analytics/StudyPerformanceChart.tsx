"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import { BarChart2, Layers } from "lucide-react";
import type { DailyPerformancePoint } from "@/lib/analytics/types";
import { formatMinutes } from "@/lib/planner-utils";

interface StudyPerformanceChartProps {
  data: DailyPerformancePoint[];
  rangeLabel: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: DailyPerformancePoint }>;
  label?: string;
}

function PerformanceTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div
      className="rounded-xl p-3 shadow-2xl backdrop-blur-md"
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(34, 211, 238, 0.3)",
      }}
    >
      <div className="border-b border-white/10 pb-2 mb-2 flex items-center justify-between gap-4">
        <span className="font-mono text-xs font-bold text-[#f0f0f4]">
          {point.date} ({point.displayDate})
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[9.5px] font-bold font-mono"
          style={{
            background:
              point.completionRate >= 80
                ? "rgba(34, 197, 94, 0.15)"
                : point.completionRate > 0
                ? "rgba(34, 211, 238, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            color:
              point.completionRate >= 80
                ? "#22c55e"
                : point.completionRate > 0
                ? "#22d3ee"
                : "#ef4444",
          }}
        >
          {point.completionRate}% Done
        </span>
      </div>

      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-[#9090a8]">
            <span className="h-2 w-2 rounded-sm bg-[#22d3ee]" />
            Actual Study Time:
          </span>
          <span className="font-bold text-[#22d3ee]">
            {formatMinutes(point.actualMinutes)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-[#9090a8]">
            <span className="h-2 w-2 rounded-full bg-[#a78bfa]" />
            Planned Target:
          </span>
          <span className="font-bold text-[#a78bfa]">
            {formatMinutes(point.plannedMinutes)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-white/5 pt-1.5 text-[11px]">
          <span className="text-[#6b6b80]">Completed Sessions:</span>
          <span className="font-semibold text-[#f0f0f4]">{point.completedSessions}</span>
        </div>

        {point.missedSessions > 0 && (
          <div className="flex items-center justify-between gap-6 text-[11px]">
            <span className="text-[#ef4444]">Missed Sessions:</span>
            <span className="font-semibold text-[#ef4444]">{point.missedSessions}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const StudyPerformanceChart: React.FC<StudyPerformanceChartProps> = ({
  data,
  rangeLabel,
}) => {
  const [viewMode, setViewMode] = useState<"hours" | "sessions">("hours");

  const totalActualMinutes = data.reduce((acc, d) => acc + d.actualMinutes, 0);
  const totalPlannedMinutes = data.reduce((acc, d) => acc + d.plannedMinutes, 0);
  const totalCompletedSessions = data.reduce((acc, d) => acc + d.completedSessions, 0);
  const totalMissedSessions = data.reduce((acc, d) => acc + d.missedSessions, 0);

  return (
    <div
      className="rounded-2xl border p-5 transition-all"
      style={{
        background: "rgba(18, 24, 38, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#22d3ee]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
              Study Performance — Last {rangeLabel}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[#717188]">
            Actual study time logged vs scheduled plan with completion tracking
          </p>
        </div>

        {/* Mode switcher & totals */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 text-xs font-mono text-[#9090a8] mr-2">
            <span className="hidden sm:inline">
              Actual: <strong className="text-[#22d3ee]">{formatMinutes(totalActualMinutes)}</strong>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Planned: <strong className="text-[#a78bfa]">{formatMinutes(totalPlannedMinutes)}</strong>
            </span>
          </div>

          <div
            className="flex items-center rounded-lg border p-0.5"
            style={{ background: "rgba(10, 14, 24, 0.8)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <button
              onClick={() => setViewMode("hours")}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "hours"
                  ? "bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30"
                  : "text-[#9090a8] hover:text-white"
              }`}
            >
              Hours
            </button>
            <button
              onClick={() => setViewMode("sessions")}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "sessions"
                  ? "bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30"
                  : "text-[#9090a8] hover:text-white"
              }`}
            >
              Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-64 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="actualBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b6b80", fontSize: 11, fontFamily: "monospace" }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b6b80", fontSize: 11, fontFamily: "monospace" }}
              tickFormatter={(v: number) => (viewMode === "hours" ? `${v}h` : `${v}`)}
            />

            <Tooltip content={<PerformanceTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

            {viewMode === "hours" ? (
              <>
                <Bar
                  dataKey="actualHours"
                  name="Actual Study Time"
                  fill="url(#actualBarGrad)"
                  radius={[4, 4, 0, 0]}
                  barSize={data.length > 14 ? 12 : 28}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.actualHours >= entry.plannedHours && entry.plannedHours > 0 ? "#22d3ee" : "url(#actualBarGrad)"}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="plannedHours"
                  name="Planned Target"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#a78bfa", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#c4b5fd" }}
                />
              </>
            ) : (
              <>
                <Bar
                  dataKey="completedSessions"
                  name="Completed Sessions"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                  barSize={data.length > 14 ? 12 : 28}
                />
                <Line
                  type="monotone"
                  dataKey="totalSessions"
                  name="Total Planned"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#a78bfa" }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & quick insight */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.04] pt-3 text-[11px] text-[#717188]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#22d3ee]" />
            <span className="text-[#a0a0b8]">Actual Study Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#a78bfa]" />
            <span className="text-[#a0a0b8]">Planned Target</span>
          </div>
        </div>

        <div className="font-mono text-[11px]">
          {totalCompletedSessions} completed sessions • {totalMissedSessions} missed
        </div>
      </div>
    </div>
  );
};
