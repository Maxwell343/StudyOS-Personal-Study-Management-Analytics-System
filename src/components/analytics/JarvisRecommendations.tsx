"use client";

import React from "react";
import { Lightbulb, ChevronRight, CheckCircle } from "lucide-react";
import type { JarvisRecommendation } from "@/lib/analytics/types";

interface JarvisRecommendationsProps {
  recommendations: JarvisRecommendation[];
  onOpenAllRecommendations: () => void;
}

export const JarvisRecommendations: React.FC<JarvisRecommendationsProps> = ({
  recommendations,
  onOpenAllRecommendations,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const displayedRecs = recommendations.slice(0, 2);
  const totalCount = recommendations.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
          JARVIS Recommends
        </h2>
        {totalCount > 2 && (
          <button
            onClick={onOpenAllRecommendations}
            className="flex items-center gap-1 text-xs font-medium text-[#22d3ee] hover:underline"
          >
            View all recommendations ({totalCount})
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {displayedRecs.map((rec) => (
          <div
            key={rec.id}
            className="flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
            style={{
              background: "rgba(18, 24, 38, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#22d3ee]">
                  <Lightbulb className="h-4 w-4" />
                  {rec.priority} PRIORITY
                </span>
                <span className="rounded bg-[#22d3ee]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22d3ee]">
                  Preview Action
                </span>
              </div>

              <h3 className="text-base font-bold text-[#f0f0f4]">
                {rec.title}
              </h3>

              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                {rec.reason}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-[#9090a8] truncate pr-2">
                Expected benefit: <strong className="text-[#f0f0f4]">{rec.expectedBenefit}</strong>
              </span>
              <span className="flex items-center gap-1 shrink-0 text-[11px] text-[#22d3ee]">
                <CheckCircle className="h-3 w-3" />
                Actionable
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
