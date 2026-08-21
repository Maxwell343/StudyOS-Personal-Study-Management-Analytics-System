"use client";

import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { SubjectAttentionItem } from "@/lib/analytics/types";

interface SubjectAttentionChartProps {
  attentionItems: SubjectAttentionItem[];
  onSelectSubject?: (subjectId: string) => void;
}

export const SubjectAttentionChart: React.FC<SubjectAttentionChartProps> = ({
  attentionItems,
  onSelectSubject,
}) => {
  if (!attentionItems || attentionItems.length === 0) return null;

  // Max lag to scale bar width
  const maxLag = Math.max(25, ...attentionItems.map((item) => item.lag));

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
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
              Which Subjects Need Attention?
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[#717188]">
            Ranked by syllabus deficit and schedule deviation (Behind Plan)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {attentionItems.map((item) => {
          let statusColor = "#22c55e";
          let statusLabel = "On Track";
          let StatusIcon = CheckCircle2;

          if (item.isInactive) {
            statusColor = "#717188";
            statusLabel = "No Activity";
          } else if (item.riskLevel === "CRITICAL" || item.lag >= 20) {
            statusColor = "#ef4444";
            statusLabel = "Critical";
            StatusIcon = AlertCircle;
          } else if (item.riskLevel === "AT_RISK" || item.lag >= 10) {
            statusColor = "#f59e0b";
            statusLabel = "At Risk";
            StatusIcon = AlertTriangle;
          }

          // Width percentage of deviation bar
          const barWidth = item.isInactive
            ? 5
            : item.lag > 0
            ? Math.max(12, Math.round((item.lag / maxLag) * 100))
            : 8;

          return (
            <div
              key={item.subjectId}
              onClick={() => onSelectSubject?.(item.subjectId)}
              className="group flex flex-col gap-2 rounded-xl border border-white/[0.03] bg-white/[0.015] p-3 transition-all hover:border-[#22d3ee]/30 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Subject identifier */}
              <div className="flex items-center gap-2.5 min-w-[140px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: item.color || "#22d3ee" }}
                />
                <span className="text-xs font-bold text-[#f0f0f4] group-hover:text-[#22d3ee] transition-colors truncate">
                  {item.subjectName}
                </span>
              </div>

              {/* Visual Deviation Bar */}
              <div className="flex-1 px-0 sm:px-4">
                <div className="h-3.5 w-full overflow-hidden rounded-md bg-white/[0.04] p-0.5">
                  <div
                    className="h-full rounded-sm transition-all duration-500 flex items-center justify-end pr-1.5 text-[9px] font-mono font-bold text-white shadow-sm"
                    style={{
                      width: `${barWidth}%`,
                      background:
                        item.lag >= 20
                          ? "linear-gradient(90deg, #ef4444, #dc2626)"
                          : item.lag >= 10
                          ? "linear-gradient(90deg, #f59e0b, #d97706)"
                          : "linear-gradient(90deg, #22c55e, #16a34a)",
                    }}
                  >
                    {item.lag > 0 && <span>{item.lag}%</span>}
                  </div>
                </div>
              </div>

              {/* Status Badge & Lag Text */}
              <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[150px]">
                <span className="font-mono text-xs text-[#a0a0b8]">
                  {item.isInactive ? "0% done" : `${item.actualProgress}% / ${item.plannedProgress}%`}
                </span>

                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    color: statusColor,
                    background: `${statusColor}18`,
                    border: `1px solid ${statusColor}40`,
                  }}
                >
                  <StatusIcon className="h-2.5 w-2.5" />
                  {statusLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
