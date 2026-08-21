"use client";

import React from "react";
import { Lightbulb, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import type { JarvisRecommendation } from "@/lib/analytics/types";

interface TopActionsSectionProps {
  recommendations: JarvisRecommendation[];
  onOpenAllRecommendations: () => void;
  onSelectRecommendation?: (rec: JarvisRecommendation) => void;
}

export const TopActionsSection: React.FC<TopActionsSectionProps> = ({
  recommendations,
  onOpenAllRecommendations,
  onSelectRecommendation,
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  const top3 = recommendations.slice(0, 3);

  const getPriorityStyle = (priority: JarvisRecommendation["priority"], idx: number) => {
    if (priority === "HIGH" || idx === 0) {
      return {
        label: "Priority 1",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.12)",
        border: "rgba(239, 68, 68, 0.3)",
      };
    }
    if (priority === "MEDIUM" || idx === 1) {
      return {
        label: "Priority 2",
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.12)",
        border: "rgba(245, 158, 11, 0.3)",
      };
    }
    return {
      label: "Priority 3",
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.12)",
      border: "rgba(34, 197, 94, 0.3)",
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
            Top Actions
          </h2>
          <p className="mt-0.5 text-xs text-[#717188]">
            JARVIS prioritized interventions to recover pace and boost study health
          </p>
        </div>

        {recommendations.length > 3 && (
          <button
            onClick={onOpenAllRecommendations}
            className="flex items-center gap-1 text-xs font-semibold text-[#22d3ee] hover:underline"
          >
            All actions ({recommendations.length})
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {top3.map((rec, idx) => {
          const style = getPriorityStyle(rec.priority, idx);

          return (
            <div
              key={rec.id}
              onClick={() => onSelectRecommendation?.(rec) || onOpenAllRecommendations()}
              className="group flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all hover:border-[#22d3ee]/40 hover:bg-[#121826]/90"
              style={{
                background: "rgba(18, 24, 38, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase font-mono"
                    style={{
                      color: style.color,
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                    {style.label}
                  </span>

                  <span className="text-[10px] text-[#22d3ee] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Actionable
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#f0f0f4] group-hover:text-[#22d3ee] transition-colors leading-snug">
                  {rec.title}
                </h3>

                <p className="mt-1 text-xs text-[#a0a0b8] line-clamp-2 leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2.5 text-xs text-[#22d3ee] font-semibold">
                <span className="text-[11px] text-[#717188] truncate max-w-[150px]">
                  {rec.expectedBenefit}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View action
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
