"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
import type { SubjectIntelligenceData } from "@/lib/analytics/types";

interface PlannedVsActualChartProps {
  subjects: SubjectIntelligenceData[];
  onOpenSubjectDetails?: () => void;
}

export const PlannedVsActualChart: React.FC<PlannedVsActualChartProps> = ({
  subjects,
  onOpenSubjectDetails,
}) => {
  if (!subjects || subjects.length === 0) return null;

  return (
    <div
      className="rounded-2xl border p-5 transition-all"
      style={{
        background: "rgba(18, 24, 38, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
            Planned vs Actual
          </h2>
          <p className="mt-0.5 text-xs text-[#717188]">
            Curriculum completion pace compared to scheduled targets
          </p>
        </div>

        {onOpenSubjectDetails && (
          <button
            onClick={onOpenSubjectDetails}
            className="flex items-center gap-1 text-xs font-semibold text-[#22d3ee] hover:underline"
          >
            All subjects ({subjects.length})
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {subjects.map((sub) => {
          const isInactive = sub.activityStatus === "INSUFFICIENT_ACTIVITY";
          const lag = sub.plannedProgressPercentage - sub.actualProgressPercentage;

          let statusColor = "#22c55e";
          let statusText = "On Track";
          let StatusIcon = CheckCircle2;

          if (isInactive) {
            statusColor = "#717188";
            statusText = "Inactive";
            StatusIcon = AlertCircle;
          } else if (sub.riskLevel === "CRITICAL" || lag >= 20) {
            statusColor = "#ef4444";
            statusText = "Critical";
            StatusIcon = AlertCircle;
          } else if (sub.riskLevel === "AT_RISK" || lag >= 10) {
            statusColor = "#f59e0b";
            statusText = "At Risk";
            StatusIcon = AlertTriangle;
          }

          return (
            <div
              key={sub.id}
              className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5 transition-all hover:border-[#22d3ee]/30"
            >
              {/* Subject Title and Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: sub.color || "#22d3ee" }}
                  />
                  <span className="text-sm font-bold text-[#f0f0f4]">{sub.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  {!isInactive && lag > 0 && (
                    <span className="font-mono text-xs text-[#ef4444] font-semibold">
                      -{lag}% lag
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      color: statusColor,
                      background: `${statusColor}18`,
                      border: `1px solid ${statusColor}40`,
                    }}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusText}
                  </span>
                </div>
              </div>

              {/* Horizontal Comparison Bars */}
              <div className="space-y-2">
                {/* Planned bar */}
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-16 text-[11px] text-[#6b6b80] shrink-0">Planned</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-md bg-white/[0.05]">
                    <div
                      className="h-full rounded-md transition-all duration-500 bg-[#a78bfa]"
                      style={{ width: `${isInactive ? 0 : sub.plannedProgressPercentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-semibold text-[#a78bfa]">
                    {isInactive ? "—" : `${sub.plannedProgressPercentage}%`}
                  </span>
                </div>

                {/* Actual bar */}
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-16 text-[11px] text-[#6b6b80] shrink-0">Actual</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-md bg-white/[0.05]">
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{
                        width: `${isInactive ? 0 : sub.actualProgressPercentage}%`,
                        background: isInactive ? "#717188" : statusColor,
                      }}
                    />
                  </div>
                  <span
                    className="w-10 text-right font-bold"
                    style={{ color: isInactive ? "#717188" : statusColor }}
                  >
                    {isInactive ? "—" : `${sub.actualProgressPercentage}%`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
