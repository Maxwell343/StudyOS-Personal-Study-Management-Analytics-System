"use client";

import React from "react";
import { Clock, Sun, Calendar, ChevronRight } from "lucide-react";
import type { BehaviorAnalysisData } from "@/lib/analytics/types";

interface BehaviorAnalysisProps {
  behavior: BehaviorAnalysisData;
  onExploreBehavior: () => void;
}

export const BehaviorAnalysis: React.FC<BehaviorAnalysisProps> = ({
  behavior,
  onExploreBehavior,
}) => {
  const bestDurationLabel = behavior.optimalSessionDuration
    ? behavior.optimalSessionDuration.bucketLabel
    : "30–45 min";

  const bestWindowLabel = behavior.bestStudyTimeWindow
    ? behavior.bestStudyTimeWindow.windowName.split(" ")[0]
    : "Daytime";

  const bestDayLabel = behavior.mostConsistentDay
    ? behavior.mostConsistentDay.dayName
    : "Weekdays";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
          Study Behavior Summary
        </h2>
        <button
          onClick={onExploreBehavior}
          className="flex items-center gap-1 text-xs font-medium text-[#22d3ee] hover:underline"
        >
          Explore behavior
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-3 transition-all hover:border-[#22d3ee]/40"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* 1. Best session length */}
        <div className="flex items-start gap-3 border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 pr-0 sm:pr-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(34, 211, 238, 0.08)", color: "#22d3ee" }}
          >
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-[#9090a8]">
              Optimal Session Length
            </div>
            <div className="mt-0.5 text-base font-bold text-[#f0f0f4]">
              {bestDurationLabel}
            </div>
            <p className="mt-1 text-xs text-[#a0a0b8]">
              {behavior.optimalDurationClaim.phrase}
            </p>
          </div>
        </div>

        {/* 2. Strongest study window */}
        <div className="flex items-start gap-3 border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 pr-0 sm:pr-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(34, 211, 238, 0.08)", color: "#22d3ee" }}
          >
            <Sun className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-[#9090a8]">
              Strongest Study Window
            </div>
            <div className="mt-0.5 text-base font-bold text-[#f0f0f4]">
              {bestWindowLabel}
            </div>
            <p className="mt-1 text-xs text-[#a0a0b8]">
              {behavior.bestStudyTimeClaim.phrase}
            </p>
          </div>
        </div>

        {/* 3. Most consistent day */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(34, 211, 238, 0.08)", color: "#22d3ee" }}
          >
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-[#9090a8]">
              Most Consistent Day
            </div>
            <div className="mt-0.5 text-base font-bold text-[#f0f0f4]">
              {bestDayLabel}
            </div>
            <p className="mt-1 text-xs text-[#a0a0b8]">
              {behavior.mostConsistentDay
                ? `${behavior.mostConsistentDay.completionRate}% session completion rate.`
                : "Active across regular study days."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
