"use client";

import React from "react";
import { AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react";
import type { JarvisInsight } from "@/lib/analytics/types";

interface JarvisPriorityCardProps {
  insights: JarvisInsight[];
  onSelectEvidence: (insight: JarvisInsight) => void;
  onOpenAllInsights: () => void;
}

export const JarvisPriorityCard: React.FC<JarvisPriorityCardProps> = ({
  insights,
  onSelectEvidence,
  onOpenAllInsights,
}) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
          JARVIS Priority
        </h2>
        <div
          className="rounded-xl border p-5 text-sm text-[#9090a8]"
          style={{ background: "rgba(18, 24, 38, 0.7)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          No urgent priority patterns detected for this time period.
        </div>
      </div>
    );
  }

  const primaryInsight = insights[0];
  const otherCount = insights.length - 1;

  const getSeverityBadge = () => {
    switch (primaryInsight.severity) {
      case "HIGH":
        return {
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
          icon: AlertTriangle,
        };
      case "MEDIUM":
        return {
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
          icon: AlertTriangle,
        };
      default:
        return primaryInsight.type === "POSITIVE"
          ? {
              color: "#22c55e",
              bg: "rgba(34, 197, 94, 0.12)",
              border: "rgba(34, 197, 94, 0.3)",
              icon: CheckCircle,
            }
          : {
              color: "#22d3ee",
              bg: "rgba(34, 211, 238, 0.12)",
              border: "rgba(34, 211, 238, 0.3)",
              icon: Info,
            };
    }
  };

  const badge = getSeverityBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
          JARVIS Priority
        </h2>
        {otherCount > 0 && (
          <button
            onClick={onOpenAllInsights}
            className="flex items-center gap-1 text-xs font-medium text-[#22d3ee] hover:underline"
          >
            View all insights ({insights.length})
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div
        className="relative overflow-hidden rounded-xl border p-5 transition-all hover:border-[#22d3ee]/40"
        style={{
          background: "linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(13, 18, 30, 0.9) 100%)",
          borderColor: badge.border,
        }}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold"
                style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}
              >
                <BadgeIcon className="h-3.5 w-3.5" />
                {primaryInsight.category}
              </span>
              <span className="text-[11px] text-[#9090a8]">
                {Math.round(primaryInsight.confidence * 100)}% Confidence
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#f0f0f4]">
              {primaryInsight.title}
            </h3>

            <p className="text-sm text-[#a0a0b8] leading-relaxed max-w-3xl">
              {primaryInsight.explanation}
            </p>
          </div>

          <button
            onClick={() => onSelectEvidence(primaryInsight)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/10 transition-colors"
            style={{
              background: "rgba(34, 211, 238, 0.05)",
              borderColor: "rgba(34, 211, 238, 0.3)",
            }}
          >
            View evidence
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
