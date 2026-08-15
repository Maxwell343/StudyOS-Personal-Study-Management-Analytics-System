"use client";

import React from "react";
import { BookOpen, ShieldCheck, AlertTriangle, ShieldAlert, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SubjectIntelligenceData } from "@/lib/analytics/types";

interface SubjectIntelligenceProps {
  subjects: SubjectIntelligenceData[];
}

export const SubjectIntelligence: React.FC<SubjectIntelligenceProps> = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return null;
  }

  const getRiskBadge = (risk: SubjectIntelligenceData["riskLevel"]) => {
    switch (risk) {
      case "CRITICAL":
        return {
          label: "CRITICAL",
          text: "#ef4444",
          bg: "rgba(239,68,68,0.12)",
          border: "rgba(239,68,68,0.3)",
          icon: ShieldAlert,
        };
      case "AT_RISK":
        return {
          label: "AT RISK",
          text: "#f59e0b",
          bg: "rgba(245,158,11,0.12)",
          border: "rgba(245,158,11,0.3)",
          icon: AlertTriangle,
        };
      case "HEALTHY":
        return {
          label: "HEALTHY",
          text: "#22c55e",
          bg: "rgba(34,197,94,0.12)",
          border: "rgba(34,197,94,0.3)",
          icon: ShieldCheck,
        };
      default:
        return {
          label: "STABLE",
          text: "#22d3ee",
          bg: "rgba(34,211,238,0.12)",
          border: "rgba(34,211,238,0.3)",
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d0d0e0]">
          <BookOpen className="h-4 w-4 text-[#22d3ee]" />
          Subject Intelligence
        </h3>
        <span className="text-xs text-[#6b6b80]">Deterministic progress velocity & risk model</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub) => {
          const riskStyle = getRiskBadge(sub.riskLevel);
          const RiskIcon = riskStyle.icon;

          const TrendIcon =
            sub.trend === "improving"
              ? TrendingUp
              : sub.trend === "declining"
              ? TrendingDown
              : Minus;

          return (
            <div
              key={sub.id}
              className="flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
              style={{
                background: "rgba(18, 24, 38, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <div>
                {/* Top header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: sub.color }}
                    />
                    <h4 className="text-sm font-bold text-[#f0f0f4]">{sub.name}</h4>
                  </div>

                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: riskStyle.bg,
                      color: riskStyle.text,
                      border: `1px solid ${riskStyle.border}`,
                    }}
                  >
                    <RiskIcon className="h-3 w-3" />
                    {riskStyle.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6b6b80]">Completion Rate</span>
                    <span className="font-mono font-bold text-[#f0f0f4]">
                      {sub.completionRate}%
                    </span>
                  </div>

                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sub.actualProgressPercentage}%`,
                        background: sub.color || "#22d3ee",
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[#6b6b80]">
                    <span>Planned: {sub.plannedProgressPercentage}%</span>
                    <span>Actual: {sub.actualProgressPercentage}%</span>
                  </div>
                </div>

                {/* Velocity & Missed counts */}
                <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs text-[#9090a8]" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Velocity: {sub.topicCompletionVelocity} items</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <TrendIcon className="h-3.5 w-3.5 text-[#22d3ee]" />
                    <span className="capitalize">{sub.trend}</span>
                  </div>
                </div>

                {/* JARVIS Commentary */}
                <div className="mt-3 rounded-lg bg-white/[0.03] p-2.5 text-xs text-[#d0d0e0] border border-white/[0.04]">
                  <span className="font-semibold text-[#22d3ee]">JARVIS: </span>
                  &quot;{sub.jarvisCommentary}&quot;
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
