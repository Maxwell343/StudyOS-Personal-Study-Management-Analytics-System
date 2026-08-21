"use client";

import React from "react";
import { Brain, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import type { ExecutiveBriefing, DataQualityState, StudyHealthScore } from "@/lib/analytics/types";

interface JarvisSnapshotProps {
  briefing: ExecutiveBriefing;
  dataQuality: DataQualityState;
  healthScore: StudyHealthScore;
  onOpenAnalysis: () => void;
}

export const JarvisSnapshot: React.FC<JarvisSnapshotProps> = ({
  briefing,
  dataQuality,
  healthScore,
  onOpenAnalysis,
}) => {
  const getStatusColor = (status: ExecutiveBriefing["status"]) => {
    switch (status) {
      case "Healthy":
        return {
          text: "#22c55e",
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.3)",
          icon: ShieldCheck,
          risk: "Low",
          riskColor: "#22c55e",
        };
      case "Needs Attention":
        return {
          text: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
          icon: AlertTriangle,
          risk: "Medium",
          riskColor: "#f59e0b",
        };
      case "Critical":
        return {
          text: "#ef4444",
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
          icon: AlertCircle,
          risk: "High",
          riskColor: "#ef4444",
        };
      default:
        return {
          text: "#22d3ee",
          bg: "rgba(34, 211, 238, 0.12)",
          border: "rgba(34, 211, 238, 0.3)",
          icon: ShieldCheck,
          risk: "Low",
          riskColor: "#22d3ee",
        };
    }
  };

  const statusStyle = getStatusColor(briefing.status);
  const StatusIcon = statusStyle.icon;
  const confidencePct = Math.round(briefing.overallConfidence * 100);

  // Extract a 1-sentence punchy highlight from the message
  const shortInsight =
    briefing.message.split(". ")[0] + (briefing.message.includes(". ") ? "." : "");

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 md:p-5"
      style={{
        background: "linear-gradient(135deg, rgba(14, 20, 33, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%)",
        borderColor: "rgba(34, 211, 238, 0.22)",
        boxShadow: "0 10px 35px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-15"
        style={{ background: "radial-gradient(circle, #22d3ee 0%, #6366f1 100%)" }}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: JARVIS Identity & Status */}
        <div className="flex items-center gap-3.5 min-w-[220px]">
          <div
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(99, 102, 241, 0.2))",
              border: "1px solid rgba(34, 211, 238, 0.4)",
              boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)",
            }}
          >
            <Brain className="h-5 w-5 text-[#22d3ee]" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3ee] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22d3ee]" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-[#22d3ee] uppercase font-mono">
                JARVIS SNAPSHOT
              </span>
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                style={{
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  border: `1px solid ${statusStyle.border}`,
                }}
              >
                <StatusIcon className="h-2.5 w-2.5" />
                {briefing.status}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#717188]">
              <span>Health: <strong className="text-[#f0f0f4] font-mono">{healthScore.overallScore}/100</strong></span>
              <span>•</span>
              <span>Quality: <strong className="text-[#a0a0b8]">{dataQuality}</strong></span>
            </div>
          </div>
        </div>

        {/* Center: Punchy 1-sentence insight */}
        <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm lg:mx-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#22d3ee]" />
            <p className="text-xs font-semibold text-[#f0f0f4] leading-relaxed md:text-[13px] line-clamp-2">
              {shortInsight}
            </p>
          </div>
        </div>

        {/* Right: Metrics & Drilldown Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-[#6b6b80]">
                Confidence
              </span>
              <span className="font-mono text-sm font-bold text-[#22d3ee]">
                {confidencePct}%
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-right">
              <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-[#6b6b80]">
                Patterns
              </span>
              <span className="font-mono text-sm font-bold text-[#f0f0f4]">
                {briefing.detectedPatternsCount}
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-right">
              <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-[#6b6b80]">
                Risk
              </span>
              <span
                className="font-mono text-sm font-bold"
                style={{ color: statusStyle.riskColor }}
              >
                {statusStyle.risk}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenAnalysis}
            className="group flex items-center gap-1.5 rounded-lg border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-3 py-1.5 text-xs font-semibold text-[#22d3ee] transition-all hover:bg-[#22d3ee]/20 hover:border-[#22d3ee]/60"
          >
            <span>View analysis</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
