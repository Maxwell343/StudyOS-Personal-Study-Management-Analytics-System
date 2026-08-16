"use client";

import React from "react";
import { Target, CheckCircle2, ListTodo, TrendingUp } from "lucide-react";

interface OverviewDashboardProps {
  activeGoalsCount: number;
  totalLongTermGoals: number;
  completedTasks: number;
  remainingTasks: number;
  totalTasks: number;
  overallProgress: number;
}

export function OverviewDashboard({
  activeGoalsCount,
  completedTasks,
  remainingTasks,
  totalTasks,
  overallProgress,
}: OverviewDashboardProps) {
  return (
    <div
      className="mb-8 rounded-xl border p-4.5 sm:p-5 transition-all"
      style={{
        background: "linear-gradient(135deg, rgba(19, 19, 26, 0.9) 0%, rgba(26, 26, 36, 0.6) 100%)",
        borderColor: "var(--sos-border-card, rgba(255, 255, 255, 0.08))",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:flex md:items-center md:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22d3ee]/10 text-[#22d3ee]">
              <Target size={18} />
            </div>
            <div>
              <div className="text-[11px] font-medium tracking-wide text-[#6b6b80] uppercase">
                Active Goals
              </div>
              <div className="text-base font-bold text-[#f0f0f4]">
                {activeGoalsCount} <span className="text-xs font-normal text-[#5a5a6a]">active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-[11px] font-medium tracking-wide text-[#6b6b80] uppercase">
                Tasks Completed
              </div>
              <div className="text-base font-bold text-[#f0f0f4]">
                {completedTasks}{" "}
                <span className="text-xs font-normal text-[#5a5a6a]">/ {totalTasks}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f59e0b]/10 text-[#f59e0b]">
              <ListTodo size={18} />
            </div>
            <div>
              <div className="text-[11px] font-medium tracking-wide text-[#6b6b80] uppercase">
                Remaining
              </div>
              <div className="text-base font-bold text-[#f0f0f4]">
                {remainingTasks} <span className="text-xs font-normal text-[#5a5a6a]">tasks</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a78bfa]/10 text-[#a78bfa]">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-[11px] font-medium tracking-wide text-[#6b6b80] uppercase">
                Overall Progress
              </div>
              <div className="text-base font-bold text-[#22d3ee]">{overallProgress}%</div>
            </div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full md:w-64 flex flex-col justify-center gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#a0a0b8] font-medium">Completion Rate</span>
            <span className="font-mono font-bold text-[#22d3ee]">{overallProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 p-0.5 border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${overallProgress}%`,
                background: "linear-gradient(90deg, #22d3ee 0%, #34d399 100%)",
                boxShadow: "0 0 10px rgba(34, 211, 238, 0.4)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
