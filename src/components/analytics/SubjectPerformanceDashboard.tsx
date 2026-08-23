"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import type { SubjectIntelligenceData } from "@/lib/analytics/types";
import { formatMinutes } from "@/lib/planner-utils";

interface SubjectPerformanceDashboardProps {
  subjects: SubjectIntelligenceData[];
  onOpenAllSubjects: () => void;
  onSelectSubject?: (subject: SubjectIntelligenceData) => void;
}

export const SubjectPerformanceDashboard: React.FC<SubjectPerformanceDashboardProps> = ({
  subjects,
  onOpenAllSubjects,
  onSelectSubject,
}) => {
  if (!subjects || subjects.length === 0) return null;

  const renderTrendIcon = (trend: SubjectIntelligenceData["trend"]) => {
    if (trend === "improving") return <TrendingUp className="h-3.5 w-3.5 text-[#22c55e]" />;
    if (trend === "declining") return <TrendingDown className="h-3.5 w-3.5 text-[#ef4444]" />;
    return <Minus className="h-3.5 w-3.5 text-[#9090a8]" />;
  };

  const getStatusBadge = (sub: SubjectIntelligenceData) => {
    if (sub.activityStatus === "INSUFFICIENT_ACTIVITY" || sub.riskLevel === null) {
      return {
        text: "No Activity",
        color: "#717188",
        bg: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.1)",
        icon: Minus,
      };
    }

    switch (sub.riskLevel) {
      case "CRITICAL":
        return {
          text: "Critical",
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
          icon: AlertCircle,
        };
      case "AT_RISK":
        return {
          text: "At Risk",
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
          icon: AlertTriangle,
        };
      case "HEALTHY":
        return {
          text: "On Track",
          color: "#22c55e",
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.3)",
          icon: CheckCircle2,
        };
      default:
        return {
          text: "Stable",
          color: "#22d3ee",
          bg: "rgba(34, 211, 238, 0.12)",
          border: "rgba(34, 211, 238, 0.3)",
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#f0f0f4]">
            Subject Performance Dashboard
          </h2>
          <p className="mt-0.5 text-xs text-[#717188]">
            Visual breakdown of subject pace, target alignment, and focus investment
          </p>
        </div>

        {subjects.length > 3 && (
          <button
            onClick={onOpenAllSubjects}
            className="flex items-center gap-1 text-xs font-semibold text-[#22d3ee] hover:underline"
          >
            View all ({subjects.length})
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.slice(0, 6).map((sub) => {
          const badge = getStatusBadge(sub);
          const BadgeIcon = badge.icon;
          const isInactive = sub.activityStatus === "INSUFFICIENT_ACTIVITY";
          const lag = sub.plannedProgressPercentage - sub.actualProgressPercentage;

          // SVG circular meter radius & circumference
          const radius = 24;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset =
            circumference - ((isInactive ? 0 : sub.actualProgressPercentage) / 100) * circumference;

          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubject?.(sub) || onOpenAllSubjects()}
              className="group relative flex flex-col justify-between rounded-2xl border p-4.5 cursor-pointer transition-all duration-200 hover:border-[#22d3ee]/40 hover:bg-[#121826]/90"
              style={{
                background: "rgba(18, 24, 38, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Top Row: Name & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: sub.color || "#22d3ee" }}
                    />
                    <h3 className="text-sm font-bold text-[#f0f0f4] group-hover:text-[#22d3ee] transition-colors">
                      {sub.name}
                    </h3>
                  </div>

                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      color: badge.color,
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                    }}
                  >
                    <BadgeIcon className="h-2.5 w-2.5" />
                    {badge.text}
                  </span>
                </div>

                {/* Progress Circle & Metrics Grid */}
                <div className="flex items-center gap-4 py-2 border-y border-white/[0.05]">
                  {/* Radial Progress */}
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 60 60">
                      <circle
                        cx="30"
                        cy="30"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="4.5"
                        fill="transparent"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r={radius}
                        stroke={badge.color}
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono text-[11px] font-bold text-[#f0f0f4]">
                      {isInactive ? "0%" : `${sub.actualProgressPercentage}%`}
                    </span>
                  </div>

                  {/* Planned vs Actual details */}
                  <div className="flex-1 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#6b6b80]">Actual vs Planned:</span>
                      <span className="font-semibold text-[#f0f0f4]">
                        {isInactive
                          ? "—"
                          : `${sub.actualProgressPercentage}% ➔ ${sub.plannedProgressPercentage}%`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#6b6b80]">Deviation:</span>
                      <span
                        className="font-bold"
                        style={{ color: lag > 0 ? "#ef4444" : "#22c55e" }}
                      >
                        {isInactive ? "—" : lag > 0 ? `-${lag}%` : `+${Math.abs(lag)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer: Study Time & Trend */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#717188]">
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className="h-3 w-3 text-[#22d3ee]" />
                  <span className="text-[#a0a0b8]">
                    {sub.studyTimeMinutes > 0 ? formatMinutes(sub.studyTimeMinutes) : "0h studied"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-semibold text-[#6b6b80]">Trend</span>
                  {renderTrendIcon(sub.trend)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
