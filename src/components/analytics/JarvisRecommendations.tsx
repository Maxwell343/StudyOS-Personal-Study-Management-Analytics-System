"use client";

import React from "react";
import { Sparkles, Target } from "lucide-react";
import type { JarvisRecommendation } from "@/lib/analytics/types";

interface JarvisRecommendationsProps {
  recommendations: JarvisRecommendation[];
}

export const JarvisRecommendations: React.FC<JarvisRecommendationsProps> = ({
  recommendations,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getPriorityTag = (priority: JarvisRecommendation["priority"]) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
            HIGH PRIORITY
          </span>
        );
      case "MEDIUM":
        return (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
            MEDIUM PRIORITY
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
            SUGGESTION
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d0d0e0]">
          <Target className="h-4 w-4 text-[#22d3ee]" />
          JARVIS Recommendations
        </h3>
        <span className="text-xs text-[#6b6b80]">Derived directly from detected study patterns</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
            style={{
              background: "rgba(18, 24, 38, 0.75)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#22d3ee]" />
                  {rec.relatedSubjectName && (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {rec.relatedSubjectName}
                    </span>
                  )}
                </div>
                {getPriorityTag(rec.priority)}
              </div>

              <h4 className="mt-2 text-sm font-bold text-[#f0f0f4]">{rec.title}</h4>

              <div className="mt-2 text-xs text-[#a0a0b8] leading-relaxed">
                <span className="font-semibold text-[#d0d0e0]">Reason: </span>
                {rec.reason}
              </div>

              <div className="mt-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-300 border border-emerald-500/20">
                <span className="font-semibold">Expected Benefit: </span>
                {rec.expectedBenefit}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] text-[#6b6b80]">Action Engine</span>
              <button
                disabled
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1 text-xs font-semibold text-[#6b6b80] cursor-not-allowed opacity-75"
              >
                Coming soon
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
