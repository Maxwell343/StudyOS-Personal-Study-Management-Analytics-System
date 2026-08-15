"use client";

import React from "react";
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Minus, ChevronRight, Ban } from "lucide-react";
import type { SubjectIntelligenceData } from "@/lib/analytics/types";

interface SubjectIntelligenceProps {
  subjects: SubjectIntelligenceData[];
  onOpenAllSubjects: () => void;
}

export const SubjectIntelligence: React.FC<SubjectIntelligenceProps> = ({
  subjects,
  onOpenAllSubjects,
}) => {
  if (!subjects || subjects.length === 0) {
    return null;
  }

  // Filter and prioritize max 3 subjects inline (Critical -> At Risk -> Declining -> Active -> Insufficient)
  const sortedSubjects = [...subjects].sort((a, b) => {
    const priorityMap: Record<string, number> = {
      CRITICAL: 4,
      AT_RISK: 3,
      STABLE: 2,
      HEALTHY: 1,
    };
    const pA = a.riskLevel ? priorityMap[a.riskLevel] || 0 : 0;
    const pB = b.riskLevel ? priorityMap[b.riskLevel] || 0 : 0;
    return pB - pA;
  });

  const displayedSubjects = sortedSubjects.slice(0, 3);
  const totalCount = subjects.length;

  const renderStatusBadge = (sub: SubjectIntelligenceData) => {
    if (sub.activityStatus === "INSUFFICIENT_ACTIVITY" || sub.riskLevel === null) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#9090a8]">
          <Ban className="h-3 w-3" />
          NO RECENT ACTIVITY
        </span>
      );
    }

    switch (sub.riskLevel) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-400">
            <AlertCircle className="h-3 w-3" />
            CRITICAL
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            <AlertCircle className="h-3 w-3" />
            AT RISK
          </span>
        );
      case "HEALTHY":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            ON TRACK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2 py-0.5 text-[10px] font-semibold text-[#22d3ee]">
            STABLE
          </span>
        );
    }
  };

  const renderTrendIcon = (trend: SubjectIntelligenceData["trend"]) => {
    if (trend === "improving") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
    if (trend === "declining") return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
    return <Minus className="h-3.5 w-3.5 text-[#9090a8]" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
          JARVIS Subject Focus
        </h2>
        {totalCount > 3 && (
          <button
            onClick={onOpenAllSubjects}
            className="flex items-center gap-1 text-xs font-medium text-[#22d3ee] hover:underline"
          >
            View all subjects ({totalCount})
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {displayedSubjects.map((sub) => {
          const isInactive = sub.activityStatus === "INSUFFICIENT_ACTIVITY";

          return (
            <div
              key={sub.id}
              className="flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
              style={{
                background: "rgba(18, 24, 38, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: sub.color }}
                    />
                    <h3 className="text-sm font-bold text-[#f0f0f4]">{sub.name}</h3>
                  </div>
                  {renderStatusBadge(sub)}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-y py-2.5 text-xs" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div>
                    <div className="text-[10px] text-[#9090a8]">Actual Progress</div>
                    <div className="mt-0.5 font-semibold text-[#f0f0f4]">
                      {isInactive ? "—" : `${sub.actualProgressPercentage}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#9090a8]">Planned Target</div>
                    <div className="mt-0.5 font-semibold text-[#f0f0f4]">
                      {isInactive ? "—" : `${sub.plannedProgressPercentage}%`}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#a0a0b8] leading-relaxed">
                  {sub.jarvisCommentary}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[#9090a8]">
                <span className="flex items-center gap-1">
                  Trend: {renderTrendIcon(sub.trend)}
                </span>
                <span>
                  {sub.studyTimeMinutes > 0
                    ? `${Math.floor(sub.studyTimeMinutes / 60)}h ${sub.studyTimeMinutes % 60}m`
                    : "No study time"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
