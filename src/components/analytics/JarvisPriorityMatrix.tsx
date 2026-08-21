"use client";

import React, { useState } from "react";
import { Crosshair, ChevronRight, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { JarvisInsight } from "@/lib/analytics/types";

interface JarvisPriorityMatrixProps {
  insights: JarvisInsight[];
  onSelectEvidence: (insight: JarvisInsight) => void;
  onOpenAllInsights: () => void;
}

export const JarvisPriorityMatrix: React.FC<JarvisPriorityMatrixProps> = ({
  insights,
  onSelectEvidence,
  onOpenAllInsights,
}) => {
  const [hoveredInsight, setHoveredInsight] = useState<JarvisInsight | null>(
    insights && insights.length > 0 ? insights[0] : null
  );

  if (!insights || insights.length === 0) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{
          background: "rgba(18, 24, 38, 0.7)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
          JARVIS Priority Matrix
        </h2>
        <p className="mt-2 text-xs text-[#9090a8]">
          No urgent priority patterns detected for this time range.
        </p>
      </div>
    );
  }

  const primaryInsight = hoveredInsight || insights[0];

  const getNodeColor = (insight: JarvisInsight) => {
    if (insight.severity === "HIGH") return "#ef4444";
    if (insight.severity === "MEDIUM") return "#f59e0b";
    if (insight.type === "POSITIVE") return "#22c55e";
    return "#22d3ee";
  };

  return (
    <div
      className="rounded-2xl border p-5 transition-all"
      style={{
        background: "rgba(18, 24, 38, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-[#22d3ee]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
              JARVIS Priority Matrix
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[#717188]">
            Multi-dimensional evaluation plotting behavioral issues by Impact × Urgency
          </p>
        </div>

        <button
          onClick={onOpenAllInsights}
          className="flex items-center gap-1 text-xs font-semibold text-[#22d3ee] hover:underline"
        >
          View all insights ({insights.length})
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
        {/* Left / Top: 2D Matrix Coordinate Grid */}
        <div className="relative h-60 w-full rounded-xl border border-white/[0.08] bg-black/40 p-4 lg:col-span-7">
          {/* Quadrant Axis Dividers */}
          <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-white/10" />
          <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-white/10" />

          {/* Quadrant Labels */}
          <div className="absolute top-2 left-2 text-[9px] font-bold uppercase text-[#6b6b80]/70">
            Strategic (High Impact / Low Urgency)
          </div>
          <div className="absolute top-2 right-2 text-[9px] font-bold uppercase text-[#ef4444]/80">
            Critical (High Impact × High Urgency)
          </div>
          <div className="absolute bottom-2 left-2 text-[9px] font-bold uppercase text-[#22c55e]/70">
            Maintain (Low Impact / Low Urgency)
          </div>
          <div className="absolute bottom-2 right-2 text-[9px] font-bold uppercase text-[#f59e0b]/80">
            Tactical (Low Impact × High Urgency)
          </div>

          {/* Plotted Insight Nodes */}
          {insights.map((insight, idx) => {
            const nodeColor = getNodeColor(insight);
            const isSelected = primaryInsight.id === insight.id;

            // X-axis is Urgency (0.1 to 0.9 -> mapped to 8% to 92%)
            const leftPct = Math.max(10, Math.min(90, Math.round(insight.urgencyScore * 100)));
            // Y-axis is Impact (High is top -> inverted: 1 - impactScore)
            const topPct = Math.max(12, Math.min(88, Math.round((1 - insight.impactScore) * 100)));

            return (
              <button
                key={insight.id}
                onClick={() => {
                  setHoveredInsight(insight);
                  onSelectEvidence(insight);
                }}
                onMouseEnter={() => setHoveredInsight(insight)}
                className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125 focus:outline-none"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                title={`${insight.title} (Impact: ${Math.round(insight.impactScore * 100)}%, Urgency: ${Math.round(insight.urgencyScore * 100)}%)`}
              >
                <div className="relative flex items-center justify-center">
                  {isSelected && (
                    <span
                      className="animate-ping absolute h-7 w-7 rounded-full opacity-60"
                      style={{ background: nodeColor }}
                    />
                  )}
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full border shadow-lg text-[10px] font-bold text-black font-mono transition-all"
                    style={{
                      background: nodeColor,
                      borderColor: "#ffffff",
                      boxShadow: `0 0 12px ${nodeColor}80`,
                    }}
                  >
                    {idx + 1}
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 border border-white/20">
                  {insight.category}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Insight Preview Card */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 lg:col-span-5 h-60">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase font-mono"
                style={{
                  color: getNodeColor(primaryInsight),
                  background: `${getNodeColor(primaryInsight)}18`,
                  border: `1px solid ${getNodeColor(primaryInsight)}40`,
                }}
              >
                {primaryInsight.category} • {primaryInsight.severity} SEVERITY
              </span>

              <span className="font-mono text-xs text-[#9090a8]">
                {Math.round(primaryInsight.confidence * 100)}% Confidence
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#f0f0f4] line-clamp-2">
              {primaryInsight.title}
            </h3>

            <p className="mt-2 text-xs text-[#a0a0b8] leading-relaxed line-clamp-3">
              {primaryInsight.explanation}
            </p>
          </div>

          <button
            onClick={() => onSelectEvidence(primaryInsight)}
            className="mt-3 flex items-center justify-between rounded-lg border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-3 py-2 text-xs font-semibold text-[#22d3ee] transition-all hover:bg-[#22d3ee]/20 hover:border-[#22d3ee]/50"
          >
            <span>Why this happened (Evidence)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
