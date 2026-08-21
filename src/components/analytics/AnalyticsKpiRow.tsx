"use client";

import React from "react";
import { Clock, CheckCircle2, CalendarCheck, Target, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { CoreMetricsSummary, MetricValue, DailyPerformancePoint, StudyHealthScore } from "@/lib/analytics/types";

interface AnalyticsKpiRowProps {
  metrics: CoreMetricsSummary;
  dailyPerformance: DailyPerformancePoint[];
  healthScore: StudyHealthScore;
  rangeLabel: string;
}

export const AnalyticsKpiRow: React.FC<AnalyticsKpiRowProps> = ({
  metrics,
  dailyPerformance,
  healthScore,
  rangeLabel,
}) => {
  const renderTrendBadge = (metric: MetricValue, isPercentageUnit = false) => {
    const isImproving = metric.trend === "improving";
    const isDeclining = metric.trend === "declining";

    let color = "#9090a8";
    let bg = "rgba(255,255,255,0.05)";
    let Icon = Minus;

    if (isImproving) {
      color = "#22c55e";
      bg = "rgba(34,197,94,0.12)";
      Icon = TrendingUp;
    } else if (isDeclining) {
      color = "#ef4444";
      bg = "rgba(239,68,68,0.12)";
      Icon = TrendingDown;
    }

    const sign = metric.difference > 0 ? "+" : "";
    const displayDiff = isPercentageUnit
      ? `${sign}${metric.difference}%`
      : `${sign}${metric.percentageChange}%`;

    return (
      <span
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold font-mono"
        style={{ color, background: bg }}
      >
        <Icon className="h-2.5 w-2.5" />
        {displayDiff}
      </span>
    );
  };

  // Sparkline data for study time
  const sparklineData = dailyPerformance.map((d, index) => ({
    i: index,
    hours: d.actualHours,
  }));

  // Session completed vs planned dots (cap at 6 dots for clean visual)
  const completedSessions = metrics.sessionCompletion.current;
  const prevCompletedSessions = metrics.sessionCompletion.previous;
  const [curCompStr, curPlanStr] = metrics.sessionCompletion.formattedCurrent.split(" / ").map(Number);
  const totalPlannedDots = Math.min(6, curPlanStr || 1);
  const filledDots = Math.min(totalPlannedDots, curCompStr || 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* 1. Study Time with Sparkline */}
      <div
        className="relative flex flex-col justify-between overflow-hidden rounded-xl border p-3.5 transition-all hover:border-[#22d3ee]/40"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8c8ca2]">Study Time</span>
          <Clock className="h-3.5 w-3.5 text-[#22d3ee]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="font-mono text-xl font-bold tracking-tight text-[#f0f0f4]">
            {metrics.studyTime.formattedCurrent}
          </div>
          {renderTrendBadge(metrics.studyTime)}
        </div>
        {/* Sparkline */}
        <div className="mt-2 h-7 w-full -mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="timeSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#22d3ee"
                strokeWidth={1.5}
                fill="url(#timeSpark)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Completion Rate with Mini Progress Ring / Bar */}
      <div
        className="flex flex-col justify-between rounded-xl border p-3.5 transition-all hover:border-[#22d3ee]/40"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8c8ca2]">Completion</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-[#34d399]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="font-mono text-xl font-bold tracking-tight text-[#f0f0f4]">
            {metrics.completionRate.formattedCurrent}
          </div>
          {renderTrendBadge(metrics.completionRate, true)}
        </div>
        <div className="mt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, metrics.completionRate.current))}%`,
                background:
                  metrics.completionRate.current >= 80
                    ? "linear-gradient(90deg, #34d399, #10b981)"
                    : metrics.completionRate.current >= 60
                    ? "linear-gradient(90deg, #22d3ee, #06b6d4)"
                    : "linear-gradient(90deg, #ef4444, #f59e0b)",
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Session Progress with Dot Indicators */}
      <div
        className="flex flex-col justify-between rounded-xl border p-3.5 transition-all hover:border-[#22d3ee]/40"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8c8ca2]">Sessions</span>
          <CalendarCheck className="h-3.5 w-3.5 text-[#a78bfa]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="font-mono text-xl font-bold tracking-tight text-[#f0f0f4]">
            {metrics.sessionCompletion.formattedCurrent}
          </div>
          {renderTrendBadge(metrics.sessionCompletion)}
        </div>
        {/* Dot matrix */}
        <div className="mt-2.5 flex items-center gap-1.5">
          {Array.from({ length: totalPlannedDots }).map((_, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full transition-all"
              style={{
                background:
                  i < filledDots
                    ? "#a78bfa"
                    : "rgba(255, 255, 255, 0.15)",
                boxShadow: i < filledDots ? "0 0 6px rgba(167, 139, 250, 0.5)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. Planned vs Actual Adherence */}
      <div
        className="flex flex-col justify-between rounded-xl border p-3.5 transition-all hover:border-[#22d3ee]/40"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8c8ca2]">Adherence</span>
          <Target className="h-3.5 w-3.5 text-[#f59e0b]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="font-mono text-xl font-bold tracking-tight text-[#f0f0f4]">
            {metrics.scheduleAdherence.current}%
          </div>
          {renderTrendBadge(metrics.scheduleAdherence, true)}
        </div>
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[9.5px] text-[#6b6b80] mb-1">
            <span>Actual vs Plan</span>
            <span className="font-mono text-[#a0a0b8]">{metrics.averageSessionDuration.formattedCurrent} avg</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#f59e0b]"
              style={{
                width: `${Math.min(100, Math.max(0, metrics.scheduleAdherence.current))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 5. Study Consistency / Health */}
      <div
        className="col-span-2 sm:col-span-1 flex flex-col justify-between rounded-xl border p-3.5 transition-all hover:border-[#22d3ee]/40"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8c8ca2]">Consistency</span>
          <Zap className="h-3.5 w-3.5 text-[#22d3ee]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="font-mono text-xl font-bold tracking-tight text-[#f0f0f4]">
            {healthScore.consistencyScore}%
          </div>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase font-mono"
            style={{
              color: healthScore.consistencyScore >= 70 ? "#22c55e" : "#f59e0b",
              background: healthScore.consistencyScore >= 70 ? "rgba(34, 197, 94, 0.12)" : "rgba(245, 158, 11, 0.12)",
            }}
          >
            {healthScore.consistencyScore >= 70 ? "Stable" : "Declining"}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1">
          {dailyPerformance.slice(-7).map((day, idx) => (
            <div
              key={idx}
              className="h-2 flex-1 rounded-sm transition-all"
              style={{
                background:
                  day.actualMinutes >= 60
                    ? "#22d3ee"
                    : day.actualMinutes > 0
                    ? "rgba(34, 211, 238, 0.4)"
                    : "rgba(255, 255, 255, 0.08)",
              }}
              title={`${day.displayDate}: ${day.actualHours}h`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
