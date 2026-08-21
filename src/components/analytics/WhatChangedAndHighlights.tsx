"use client";

import React from "react";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Award,
  AlertTriangle,
  Sun,
  Clock,
  ArrowRight,
} from "lucide-react";
import type {
  PerformanceChangeIndicator,
  SubjectIntelligenceData,
  BehaviorAnalysisData,
} from "@/lib/analytics/types";
import { formatMinutes } from "@/lib/planner-utils";

interface WhatChangedAndHighlightsProps {
  whatChanged: PerformanceChangeIndicator[];
  subjects: SubjectIntelligenceData[];
  behavior: BehaviorAnalysisData;
  onExploreBehavior?: () => void;
}

export const WhatChangedAndHighlights: React.FC<WhatChangedAndHighlightsProps> = ({
  whatChanged,
  subjects,
  behavior,
  onExploreBehavior,
}) => {
  // Best Subject: highest completion or least lag
  const activeSubs = subjects.filter((s) => s.activityStatus === "ACTIVE");
  const bestSubject = activeSubs.find((s) => s.riskLevel === "HEALTHY") || activeSubs[0] || null;
  const worstSubject =
    activeSubs.find((s) => s.riskLevel === "CRITICAL") ||
    activeSubs.find((s) => s.riskLevel === "AT_RISK") ||
    null;

  const bestWindow = behavior.bestStudyTimeWindow
    ? behavior.bestStudyTimeWindow.windowName.split(" ")[0]
    : "Morning";
  const bestDuration = behavior.optimalSessionDuration
    ? behavior.optimalSessionDuration.bucketLabel
    : "30–45 min";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left Column: What Changed? (Pills / Cards) */}
      <div
        className="flex flex-col justify-between rounded-2xl border p-5 transition-all lg:col-span-6"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div>
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-3">
            <Sparkles className="h-4 w-4 text-[#22d3ee]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
              What Changed?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {whatChanged.slice(0, 6).map((item) => {
              const isPositive = item.status === "positive";
              const isNegative = item.status === "negative";
              const TrendIcon = isPositive ? TrendingUp : TrendingDown;

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5 transition-all hover:border-[#22d3ee]/30"
                >
                  <span className="text-[10px] font-semibold text-[#8c8ca2] truncate">
                    {item.label}
                  </span>

                  <div className="mt-1 flex items-baseline justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-[#f0f0f4] truncate">
                      {item.value}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold"
                      style={{ color: isPositive ? "#22c55e" : isNegative ? "#ef4444" : "#9090a8" }}
                    >
                      <TrendIcon className="h-2.5 w-2.5" />
                      {item.changeText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-[#717188] border-t border-white/[0.04] pt-2">
          Automatic delta detection compared to preceding baseline period
        </p>
      </div>

      {/* Right Column: Best / Worst & Behavioral Peaks */}
      <div
        className="flex flex-col justify-between rounded-2xl border p-5 transition-all lg:col-span-6"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
              Performance & Behavioral Insights
            </h2>
            {onExploreBehavior && (
              <button
                onClick={onExploreBehavior}
                className="flex items-center gap-1 text-xs font-semibold text-[#22d3ee] hover:underline"
              >
                Explore behavior
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {/* 1. Best Performance */}
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#34d399]">
                <Award className="h-3.5 w-3.5 text-[#34d399]" />
                Top Subject
              </div>
              <div className="mt-1 font-bold text-xs text-[#f0f0f4] truncate">
                {bestSubject?.name || "DBMS"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[#34d399]">
                {bestSubject ? `${bestSubject.actualProgressPercentage}% done` : "On Track"}
              </div>
            </div>

            {/* 2. Biggest Concern */}
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#ef4444]">
                <AlertTriangle className="h-3.5 w-3.5 text-[#ef4444]" />
                Biggest Concern
              </div>
              <div className="mt-1 font-bold text-xs text-[#f0f0f4] truncate">
                {worstSubject?.name || "DSA"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[#ef4444]">
                {worstSubject
                  ? `${worstSubject.plannedProgressPercentage - worstSubject.actualProgressPercentage}% behind`
                  : "Needs focus"}
              </div>
            </div>

            {/* 3. Strongest Study Window */}
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#22d3ee]">
                <Sun className="h-3.5 w-3.5 text-[#22d3ee]" />
                Peak Window
              </div>
              <div className="mt-1 font-bold text-xs text-[#f0f0f4] truncate">
                {bestWindow}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[#22d3ee]">
                {behavior.bestStudyTimeWindow
                  ? `${behavior.bestStudyTimeWindow.completionRate}% completion`
                  : "Highest focus"}
              </div>
            </div>

            {/* 4. Optimal Duration */}
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#a78bfa]">
                <Clock className="h-3.5 w-3.5 text-[#a78bfa]" />
                Best Length
              </div>
              <div className="mt-1 font-bold text-xs text-[#f0f0f4] truncate">
                {bestDuration}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[#a78bfa]">
                {behavior.optimalSessionDuration
                  ? `${behavior.optimalSessionDuration.completionRate}% rate`
                  : "Optimal stamina"}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-[#717188] border-t border-white/[0.04] pt-2">
          Calculated from your historical completion velocities and study duration buckets
        </p>
      </div>
    </div>
  );
};
