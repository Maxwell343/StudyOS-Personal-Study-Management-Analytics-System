"use client";

import React from "react";
import { Clock, CheckCircle2, CalendarCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CoreMetricsSummary, MetricValue } from "@/lib/analytics/types";

interface CoreMetricsGridProps {
  metrics: CoreMetricsSummary;
  rangeLabel: string;
}

export const CoreMetricsGrid: React.FC<CoreMetricsGridProps> = ({ metrics, rangeLabel }) => {
  const renderTrendBadge = (metric: MetricValue, isPercentageUnit = false) => {
    const isImproving = metric.trend === "improving";
    const isDeclining = metric.trend === "declining";

    let color = "#a0a0b8";
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
        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium"
        style={{ color, background: bg }}
      >
        <Icon className="h-3 w-3" />
        {displayDiff} vs prev {rangeLabel}
      </span>
    );
  };

  const cards = [
    {
      id: "study_time",
      title: "Study Time",
      value: metrics.studyTime.formattedCurrent,
      icon: Clock,
      badge: renderTrendBadge(metrics.studyTime),
    },
    {
      id: "completion_rate",
      title: "Completion",
      value: metrics.completionRate.formattedCurrent,
      icon: CheckCircle2,
      badge: renderTrendBadge(metrics.completionRate, true),
    },
    {
      id: "session_completion",
      title: "Sessions",
      value: metrics.sessionCompletion.formattedCurrent,
      icon: CalendarCheck,
      badge: renderTrendBadge(metrics.sessionCompletion),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
            style={{
              background: "rgba(18, 24, 38, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#9090a8]">{card.title}</span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee" }}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-[#f0f0f4]">
                {card.value}
              </div>
              <div className="mt-2 flex items-center justify-between">
                {card.badge}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
