import React from "react";
import { X, Lightbulb, Ban } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type {
  JarvisInsight,
  SubjectIntelligenceData,
  JarvisRecommendation,
  BehaviorAnalysisData,
} from "@/lib/analytics/types";

// --- 1. All Insights Drawer ---
interface AllInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insights: JarvisInsight[];
  onSelectEvidence: (insight: JarvisInsight) => void;
}

export const AllInsightsDrawer: React.FC<AllInsightsDrawerProps> = ({
  isOpen,
  onClose,
  insights,
  onSelectEvidence,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col bg-[#0d121e] border-l border-white/10 text-[#f0f0f4] shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-bold text-[#f0f0f4]">All JARVIS Insights</h2>
            <p className="text-xs text-[#9090a8]">{insights.length} detected behavioral patterns</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9090a8] hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
              style={{
                background: "rgba(18, 24, 38, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-[#22d3ee]/10 px-2 py-0.5 text-[10px] font-bold text-[#22d3ee] uppercase">
                  {insight.category}
                </span>
                <span className="text-xs text-[#9090a8]">
                  {Math.round(insight.confidence * 100)}% Confidence
                </span>
              </div>

              <h3 className="mt-2 text-base font-bold text-[#f0f0f4]">{insight.title}</h3>
              <p className="mt-1 text-xs text-[#a0a0b8] leading-relaxed">{insight.explanation}</p>

              <button
                onClick={() => {
                  onClose();
                  onSelectEvidence(insight);
                }}
                className="mt-3 text-xs font-semibold text-[#22d3ee] hover:underline"
              >
                View evidence →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 2. All Subjects Drawer ---
interface AllSubjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectIntelligenceData[];
}

export const AllSubjectsDrawer: React.FC<AllSubjectsDrawerProps> = ({
  isOpen,
  onClose,
  subjects,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col bg-[#0d121e] border-l border-white/10 text-[#f0f0f4] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-bold text-[#f0f0f4]">Complete Subject Intelligence</h2>
            <p className="text-xs text-[#9090a8]">{subjects.length} active subjects evaluated</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9090a8] hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {subjects.map((sub) => {
            const isInactive = sub.activityStatus === "INSUFFICIENT_ACTIVITY";

            return (
              <div
                key={sub.id}
                className="rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
                style={{
                  background: "rgba(18, 24, 38, 0.7)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: sub.color }}
                    />
                    <h3 className="text-base font-bold text-[#f0f0f4]">{sub.name}</h3>
                  </div>
                  {isInactive ? (
                    <span className="inline-flex items-center gap-1 rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#9090a8]">
                      <Ban className="h-3 w-3" />
                      NO RECENT ACTIVITY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2 py-0.5 text-[10px] font-semibold text-[#22d3ee]">
                      {sub.riskLevel}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-y py-2.5 text-xs" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div>
                    <div className="text-[10px] text-[#9090a8]">Actual</div>
                    <div className="font-semibold text-[#f0f0f4]">
                      {isInactive ? "—" : `${sub.actualProgressPercentage}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#9090a8]">Planned</div>
                    <div className="font-semibold text-[#f0f0f4]">
                      {isInactive ? "—" : `${sub.plannedProgressPercentage}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#9090a8]">Velocity</div>
                    <div className="font-semibold text-[#f0f0f4]">
                      {sub.topicCompletionVelocity} items
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#a0a0b8] leading-relaxed">
                  {sub.jarvisCommentary}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 3. All Recommendations Drawer ---
interface AllRecommendationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: JarvisRecommendation[];
}

export const AllRecommendationsDrawer: React.FC<AllRecommendationsDrawerProps> = ({
  isOpen,
  onClose,
  recommendations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col bg-[#0d121e] border-l border-white/10 text-[#f0f0f4] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-bold text-[#f0f0f4]">JARVIS Action Recommendations</h2>
            <p className="text-xs text-[#9090a8]">{recommendations.length} prioritized recommendations</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9090a8] hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl border p-4 transition-all hover:border-[#22d3ee]/40"
              style={{
                background: "rgba(18, 24, 38, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#22d3ee]">
                  <Lightbulb className="h-4 w-4" />
                  {rec.priority} PRIORITY
                </span>
                <span className="rounded bg-[#22d3ee]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22d3ee]">
                  Preview Action
                </span>
              </div>

              <h3 className="mt-2 text-base font-bold text-[#f0f0f4]">{rec.title}</h3>
              <p className="mt-1 text-xs text-[#a0a0b8] leading-relaxed">{rec.reason}</p>
              <p className="mt-2 text-xs font-semibold text-[#22d3ee]">
                Expected benefit: {rec.expectedBenefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 4. Detailed Behavior Drawer ---
interface DetailedBehaviorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  behavior: BehaviorAnalysisData;
}

export const DetailedBehaviorDrawer: React.FC<DetailedBehaviorDrawerProps> = ({
  isOpen,
  onClose,
  behavior,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col bg-[#0d121e] border-l border-white/10 text-[#f0f0f4] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-bold text-[#f0f0f4]">Detailed Study Behavior Analysis</h2>
            <p className="text-xs text-[#9090a8]">Time-of-day, duration buckets, and weekly distribution</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9090a8] hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Chart 1: Time Window Performance */}
          <div className="rounded-xl border p-4" style={{ background: "rgba(18, 24, 38, 0.7)", borderColor: "rgba(255,255,255,0.08)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
              Time Window Completion Rate (%)
            </h3>
            <div className="mt-4 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={behavior.timeWindows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="windowName" tick={{ fill: "#9090a8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9090a8", fontSize: 10 }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: "#0d121e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="completionRate" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Session Duration Performance */}
          <div className="rounded-xl border p-4" style={{ background: "rgba(18, 24, 38, 0.7)", borderColor: "rgba(255,255,255,0.08)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
              Session Duration Bucket Performance (%)
            </h3>
            <div className="mt-4 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={behavior.durationBuckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="bucketLabel" tick={{ fill: "#9090a8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9090a8", fontSize: 10 }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: "#0d121e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="completionRate" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Day of Week Distribution */}
          <div className="rounded-xl border p-4" style={{ background: "rgba(18, 24, 38, 0.7)", borderColor: "rgba(255,255,255,0.08)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9090a8]">
              Day of Week Completion Rate (%)
            </h3>
            <div className="mt-4 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={behavior.dayOfWeekPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="dayName" tick={{ fill: "#9090a8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9090a8", fontSize: 10 }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: "#0d121e", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="completionRate" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. Executive Briefing Drawer ---
interface ExecutiveBriefingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: {
    message: string;
    status: string;
    overallConfidence: number;
    detectedPatternsCount: number;
    analyzedAt: string;
  };
  dataQuality: string;
  username: string;
  insights: JarvisInsight[];
  onSelectEvidence: (insight: JarvisInsight) => void;
}

export const ExecutiveBriefingDrawer: React.FC<ExecutiveBriefingDrawerProps> = ({
  isOpen,
  onClose,
  briefing,
  dataQuality,
  username,
  insights,
  onSelectEvidence,
}) => {
  if (!isOpen) return null;

  const formattedTime = new Date(briefing.analyzedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col bg-[#0d121e] border-l border-white/10 text-[#f0f0f4] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#22d3ee]">
              JARVIS INTELLIGENCE ANALYSIS
            </span>
            <h2 className="text-lg font-bold text-[#f0f0f4]">Executive Briefing & Reasoning</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9090a8] hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main Statement */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
              borderColor: "rgba(34, 211, 238, 0.25)",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="rounded bg-[#22d3ee]/20 px-2 py-0.5 text-[10px] font-bold text-[#22d3ee] uppercase">
                Status: {briefing.status}
              </span>
              <span className="text-xs font-mono text-[#9090a8]">
                Generated at {formattedTime}
              </span>
            </div>

            <p className="text-sm font-medium leading-relaxed text-[#f0f0f4]">
              &quot;Good day, <span className="text-[#22d3ee] font-semibold">{username}</span>. {briefing.message}&quot;
            </p>
          </div>

          {/* Diagnostics summary */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="text-[#6b6b80] block text-[10px] uppercase">Confidence</span>
              <span className="text-base font-bold text-[#22d3ee]">
                {Math.round(briefing.overallConfidence * 100)}%
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="text-[#6b6b80] block text-[10px] uppercase">Data Quality</span>
              <span className="text-base font-bold text-[#f0f0f4]">{dataQuality}</span>
            </div>
          </div>

          {/* Contributing Pattern Evidence */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9090a8] mb-3">
              Contributing Pattern Evidence ({insights.length})
            </h3>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition-all hover:border-[#22d3ee]/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f0f0f4]">{insight.title}</span>
                    <span className="text-[10px] font-mono text-[#22d3ee]">
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#a0a0b8]">{insight.explanation}</p>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectEvidence(insight);
                    }}
                    className="mt-2 text-xs font-semibold text-[#22d3ee] hover:underline flex items-center gap-1"
                  >
                    View empirical evidence →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

