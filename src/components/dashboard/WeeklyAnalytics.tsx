"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { WeeklyDataPoint } from "@/types/dashboard";

interface WeeklyAnalyticsProps {
  data: WeeklyDataPoint[];
}

function WeeklyStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-right">
      <div
        className="font-mono text-[15px] font-bold tracking-tight"
        style={{ color }}
      >
        {value}
      </div>
      <div
        className="mt-px text-[9.5px] tracking-[0.3px]"
        style={{ color: "#3a3a4a" }}
      >
        {label}
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-md px-3 py-2"
      style={{
        background: "#1a1a24",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <p
        className="mb-[3px] font-mono text-[10px] tracking-[0.5px]"
        style={{ color: "#6b6b80", margin: 0 }}
      >
        {label}
      </p>
      <p
        className="font-mono text-[13px] font-semibold"
        style={{ color: "#f0f0f4", margin: 0 }}
      >
        {payload[0].value}h studied
      </p>
    </div>
  );
}

function getWeeklyDateRangeString(): string {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);

  const startMonth = start.toLocaleString("default", { month: "short" });
  const endMonth = end.toLocaleString("default", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
}

export function WeeklyAnalytics({ data }: WeeklyAnalyticsProps) {
  const weeklyTotal = Math.round(data.reduce((s, d) => s + d.hours, 0) * 10) / 10;
  const weeklyAvg = (weeklyTotal / 7).toFixed(1);
  const weeklyTarget = 35;
  const dateRangeStr = getWeeklyDateRangeString();

  return (
    <div
      className="rounded-[10px] px-[22px] py-[18px]"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between max-sm:flex-col max-sm:gap-3">
        <div>
          <h2 className="m-0 mb-[3px] text-[13px] font-semibold text-[#f0f0f4]">
            Weekly Overview
          </h2>
          <p className="m-0 text-[11px]" style={{ color: "#5a5a6a" }}>
            {dateRangeStr}
          </p>
        </div>
        <div className="flex items-end gap-5">
          <WeeklyStat
            label="Weekly Total"
            value={`${weeklyTotal}h`}
            color="#22d3ee"
          />
          <WeeklyStat
            label="Weekly Target"
            value={`${weeklyTarget}h`}
            color="#4a4a5a"
          />
          <WeeklyStat
            label="Daily Avg"
            value={`${weeklyAvg}h`}
            color="#34d399"
          />
          <WeeklyStat
            label="Completion"
            value={`${Math.round((weeklyTotal / weeklyTarget) * 100)}%`}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barSize={26}
            margin={{ top: 4, right: 4, bottom: 0, left: -22 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#5a5a6a",
                fontSize: 10.5,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#3a3a4a",
                fontSize: 9.5,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              tickFormatter={(v: number) => `${v}h`}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.025)" }}
            />
            <ReferenceLine
              y={5}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 4"
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === 6
                      ? "rgba(255,255,255,0.05)"
                      : entry.hours >= 5
                        ? "#22d3ee"
                        : "rgba(34,211,238,0.3)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1.5">
        <div
          className="h-px w-5"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <span
          className="font-mono text-[10px]"
          style={{ color: "#3a3a4a" }}
        >
          Target line: 5h/day
        </span>
      </div>
    </div>
  );
}
