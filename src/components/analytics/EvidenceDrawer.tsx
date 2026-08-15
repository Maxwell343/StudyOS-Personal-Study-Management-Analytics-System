"use client";

import React from "react";
import { X, Sparkles, BarChart2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { JarvisInsight } from "@/lib/analytics/types";

interface EvidenceDrawerProps {
  insight: JarvisInsight | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ insight, isOpen, onClose }) => {
  if (!isOpen || !insight) return null;

  const { evidence } = insight;
  const chartData = evidence.chartData || evidence.details.map((d) => ({
    name: d.label,
    current: d.primaryValue,
    baseline: d.comparisonValue,
  }));

  const getTypeIcon = (type: JarvisInsight["type"]) => {
    switch (type) {
      case "POSITIVE":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <Clock className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l p-6 shadow-2xl transition-transform"
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #090d16 100%)",
          borderColor: "rgba(34, 211, 238, 0.2)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(34, 211, 238, 0.1)", border: "1px solid rgba(34, 211, 238, 0.3)" }}
            >
              <Sparkles className="h-4 w-4 text-[#22d3ee]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#22d3ee]">
                WHY JARVIS THINKS THIS
              </span>
              <h3 className="text-base font-bold text-[#f0f0f4]">Evidence Breakdown</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9090a8] hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Insight Header Summary */}
        <div className="mt-5 rounded-xl border p-4" style={{ background: "rgba(18, 24, 38, 0.8)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {getTypeIcon(insight.type)}
              <span className="text-xs font-semibold text-[#a0a0b8]">{insight.category}</span>
            </div>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
              style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.3)" }}
            >
              Confidence: {Math.round(insight.confidence * 100)}%
            </span>
          </div>

          <h4 className="mt-2 text-base font-bold text-[#f0f0f4]">{insight.title}</h4>
          <p className="mt-1 text-xs text-[#a0a0b8] leading-relaxed">{insight.explanation}</p>
        </div>

        {/* Evidence Data Details */}
        <div className="mt-6">
          <h5 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6b6b80]">
            <BarChart2 className="h-4 w-4 text-[#22d3ee]" />
            Empirical Evidence Comparison
          </h5>

          <p className="mt-2 text-xs font-medium text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/20 p-3 rounded-lg">
            {evidence.summary}
          </p>

          <div className="mt-4 space-y-2">
            {evidence.details.map((detail, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border p-3 text-xs"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span className="font-medium text-[#d0d0e0]">{detail.label}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-[10px] text-[#6b6b80]">{evidence.primaryMetricName || "Current"}</span>
                    <span className="font-mono font-bold text-[#22d3ee]">{detail.formattedPrimary}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-[#6b6b80]">{evidence.comparisonMetricName || "Baseline"}</span>
                    <span className="font-mono font-semibold text-[#9090a8]">{detail.formattedComparison}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Visualization */}
        {chartData && chartData.length > 0 && (
          <div className="mt-6">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#6b6b80] mb-3">
              Comparative Chart
            </h5>
            <div
              className="h-56 w-full rounded-xl border p-3"
              style={{ background: "rgba(10, 14, 24, 0.8)", borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#6b6b80" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b6b80" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      borderColor: "rgba(34,211,238,0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="current" fill="#22d3ee" radius={[4, 4, 0, 0]} name={evidence.primaryMetricName || "Current"} />
                  <Bar dataKey="baseline" fill="#a78bfa" radius={[4, 4, 0, 0]} name={evidence.comparisonMetricName || "Baseline"} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
          >
            Close Evidence Panel
          </button>
        </div>
      </div>
    </div>
  );
};
