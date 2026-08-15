"use client";

import React from "react";
import { Sparkles, Brain, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import type { ExecutiveBriefing, DataQualityState } from "@/lib/analytics/types";

interface JarvisBriefingProps {
  briefing: ExecutiveBriefing;
  dataQuality: DataQualityState;
  username?: string;
}

export const JarvisBriefing: React.FC<JarvisBriefingProps> = ({
  briefing,
  dataQuality,
  username = "Maxwell",
}) => {
  const getStatusColor = (status: ExecutiveBriefing["status"]) => {
    switch (status) {
      case "Healthy":
        return { text: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", icon: ShieldCheck };
      case "Needs Attention":
        return { text: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", icon: AlertTriangle };
      case "Critical":
        return { text: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", icon: AlertTriangle };
      default:
        return { text: "#22d3ee", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.3)", icon: Activity };
    }
  };

  const statusStyle = getStatusColor(briefing.status);
  const StatusIcon = statusStyle.icon;
  const confidencePct = Math.round(briefing.overallConfidence * 100);

  // Time format helper
  const formattedTime = new Date(briefing.analyzedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5 transition-all md:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(15,23,42,0.98) 100%)",
        borderColor: "rgba(34,211,238,0.25)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Background glow accent */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #22d3ee 0%, #a78bfa 100%)" }}
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm"
            style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(167,139,250,0.2))", border: "1px solid rgba(34,211,238,0.4)" }}
          >
            <Brain className="h-5 w-5 text-[#22d3ee]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b8]">
                JARVIS Executive Briefing
              </h2>
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
              >
                <StatusIcon className="h-3 w-3" />
                {briefing.status}
              </span>
            </div>
            <p className="text-[11px] text-[#6b6b80]">
              Analysis generated at {formattedTime} • Data Quality: <span className="font-semibold text-[#d0d0e0]">{dataQuality}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="block text-[10px] uppercase text-[#6b6b80]">Confidence</span>
            <span className="font-mono font-bold text-[#22d3ee]">{confidencePct}%</span>
          </div>
          <div className="h-7 w-px bg-white/10" />
          <div className="text-right">
            <span className="block text-[10px] uppercase text-[#6b6b80]">Patterns Detected</span>
            <span className="font-mono font-bold text-[#f0f0f4]">{briefing.detectedPatternsCount}</span>
          </div>
        </div>
      </div>

      {/* Briefing Narrative Body */}
      <div className="mt-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#22d3ee] opacity-80" />
          <div className="space-y-2">
            <p className="text-sm font-medium leading-relaxed text-[#f0f0f4] md:text-base">
              &quot;Good day, <span className="text-[#22d3ee]">{username}</span>. {briefing.message}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
