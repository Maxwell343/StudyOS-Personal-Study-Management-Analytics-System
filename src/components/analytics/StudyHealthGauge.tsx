"use client";

import React from "react";
import { Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import type { StudyHealthScore } from "@/lib/analytics/types";

interface StudyHealthGaugeProps {
  healthScore: StudyHealthScore;
}

export const StudyHealthGauge: React.FC<StudyHealthGaugeProps> = ({ healthScore }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore.overallScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#22d3ee";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const pillars = [
    { label: "Consistency", score: healthScore.consistencyScore, color: "#22d3ee" },
    { label: "Completion", score: healthScore.completionScore, color: "#34d399" },
    { label: "Planning", score: healthScore.adherenceScore, color: "#f59e0b" },
    { label: "Focus", score: healthScore.focusScore, color: "#a78bfa" },
  ];

  return (
    <div
      className="flex flex-col justify-between rounded-2xl border p-5 transition-all"
      style={{
        background: "rgba(18, 24, 38, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#22d3ee]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
            Overall Study Health
          </h2>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase font-mono"
          style={{
            color: getScoreColor(healthScore.overallScore),
            background: `${getScoreColor(healthScore.overallScore)}18`,
            border: `1px solid ${getScoreColor(healthScore.overallScore)}40`,
          }}
        >
          {healthScore.status}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Radial Gauge */}
        <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={getScoreColor(healthScore.overallScore)}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute text-center">
            <div className="font-mono text-2xl font-bold text-[#f0f0f4]">
              {healthScore.overallScore}
            </div>
            <div className="text-[10px] font-semibold uppercase text-[#6b6b80]">
              out of 100
            </div>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="flex-1 w-full space-y-2.5">
          {pillars.map((pillar) => (
            <div key={pillar.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8c8ca2]">{pillar.label}</span>
                <span className="font-bold text-[#f0f0f4]">{pillar.score}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(0, pillar.score))}%`,
                    background: pillar.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
