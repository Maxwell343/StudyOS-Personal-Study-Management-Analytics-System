"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, ArrowRight, Brain } from "lucide-react";
import type { JarvisInsight } from "@/lib/analytics/types";
import { EvidenceDrawer } from "./EvidenceDrawer";

interface JarvisInsightsProps {
  insights: JarvisInsight[];
}

export const JarvisInsights: React.FC<JarvisInsightsProps> = ({ insights }) => {
  const [selectedInsight, setSelectedInsight] = useState<JarvisInsight | null>(null);

  if (!insights || insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: JarvisInsight["type"]) => {
    switch (type) {
      case "POSITIVE":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />;
      default:
        return <Clock className="h-5 w-5 text-cyan-400 shrink-0" />;
    }
  };

  const getSeverityBadge = (severity: JarvisInsight["severity"]) => {
    switch (severity) {
      case "HIGH":
        return (
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
            HIGH SEVERITY
          </span>
        );
      case "MEDIUM":
        return (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
            MEDIUM SEVERITY
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            LOW SEVERITY
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#d0d0e0]">
          <Brain className="h-4 w-4 text-[#22d3ee]" />
          JARVIS Detected Insights
        </h3>
        <span className="text-xs text-[#6b6b80]">Ranked by priority score</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
            style={{
              background: "rgba(18, 24, 38, 0.75)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <span className="text-xs font-semibold text-[#22d3ee]">{insight.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(insight.severity)}
                  <span className="text-[11px] font-mono text-[#6b6b80]">
                    {Math.round(insight.confidence * 100)}% conf
                  </span>
                </div>
              </div>

              <h4 className="mt-2 text-sm font-bold text-[#f0f0f4]">{insight.title}</h4>
              <p className="mt-1 text-xs text-[#a0a0b8] leading-relaxed">{insight.explanation}</p>

              <div className="mt-3 rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5 text-xs text-[#d0d0e0]">
                <span className="font-semibold text-[#22d3ee]">Evidence: </span>
                {insight.evidence.summary}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] text-[#6b6b80]">Detected by Analytics Engine</span>
              <button
                onClick={() => setSelectedInsight(insight)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#22d3ee] hover:text-cyan-300 transition-colors"
              >
                View evidence
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <EvidenceDrawer
        insight={selectedInsight}
        isOpen={Boolean(selectedInsight)}
        onClose={() => setSelectedInsight(null)}
      />
    </div>
  );
};
