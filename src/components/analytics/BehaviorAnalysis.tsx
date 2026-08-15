"use client";

import React from "react";
import { Clock, Timer, Calendar } from "lucide-react";
import type { BehaviorAnalysisData } from "@/lib/analytics/types";

interface BehaviorAnalysisProps {
  behavior: BehaviorAnalysisData;
}

export const BehaviorAnalysis: React.FC<BehaviorAnalysisProps> = ({ behavior }) => {
  const { bestStudyTimeWindow, optimalSessionDuration, dayOfWeekPerformance } = behavior;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d0d0e0]">
          <Clock className="h-4 w-4 text-[#22d3ee]" />
          Study Behavior Analysis
        </h3>
        <span className="text-xs text-[#6b6b80]">Pattern discovery across time & duration</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* 1. Best Study Time Window */}
        <div
          className="flex flex-col justify-between rounded-xl border p-4"
          style={{
            background: "rgba(18, 24, 38, 0.75)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22d3ee]">
              <Clock className="h-4 w-4" />
              <span>Best Study Window</span>
            </div>

            {bestStudyTimeWindow ? (
              <div className="mt-3">
                <div className="text-base font-bold text-[#f0f0f4]">
                  {bestStudyTimeWindow.windowName}
                </div>
                <div className="mt-1 text-xs text-[#9090a8]">
                  Completion Rate:{" "}
                  <span className="font-semibold text-emerald-400">
                    {bestStudyTimeWindow.completionRate}%
                  </span>
                </div>
                <div className="mt-3 rounded-lg bg-[#22d3ee]/10 p-2.5 text-xs text-[#22d3ee] border border-[#22d3ee]/20">
                  <span className="font-semibold">JARVIS: </span>
                  &quot;Your strongest study window is {bestStudyTimeWindow.windowName.split(" ")[0]}.&quot;
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#6b6b80]">
                Insufficient data to determine best time window yet.
              </p>
            )}
          </div>
        </div>

        {/* 2. Optimal Session Duration */}
        <div
          className="flex flex-col justify-between rounded-xl border p-4"
          style={{
            background: "rgba(18, 24, 38, 0.75)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22d3ee]">
              <Timer className="h-4 w-4" />
              <span>Optimal Session Duration</span>
            </div>

            {optimalSessionDuration ? (
              <div className="mt-3">
                <div className="text-base font-bold text-[#f0f0f4]">
                  {optimalSessionDuration.bucketLabel}
                </div>
                <div className="mt-1 text-xs text-[#9090a8]">
                  Completion Rate:{" "}
                  <span className="font-semibold text-emerald-400">
                    {optimalSessionDuration.completionRate}%
                  </span>
                </div>
                <div className="mt-3 rounded-lg bg-[#22d3ee]/10 p-2.5 text-xs text-[#22d3ee] border border-[#22d3ee]/20">
                  <span className="font-semibold">JARVIS: </span>
                  &quot;Your most reliable sessions are {optimalSessionDuration.bucketLabel}.&quot;
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#6b6b80]">
                Insufficient data to determine optimal duration bucket yet.
              </p>
            )}
          </div>
        </div>

        {/* 3. Day of Week Performance */}
        <div
          className="flex flex-col justify-between rounded-xl border p-4"
          style={{
            background: "rgba(18, 24, 38, 0.75)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22d3ee]">
              <Calendar className="h-4 w-4" />
              <span>Day-of-Week Trends</span>
            </div>

            <div className="mt-3 flex items-end justify-between gap-1.5 pt-2">
              {dayOfWeekPerformance.map((day) => (
                <div key={day.dayName} className="flex flex-col items-center gap-1">
                  <div className="relative h-16 w-3.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="absolute bottom-0 w-full rounded-full bg-[#22d3ee] transition-all"
                      style={{ height: `${Math.max(5, day.completionRate)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#6b6b80]">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
