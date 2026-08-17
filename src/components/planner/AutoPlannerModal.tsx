"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  BarChart3,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import type { Subject } from "@/types/subjects";
import type { PlanSession } from "@/types/planner";
import type {
  AutoPlannerOptions,
  AutoPlannerRecommendation,
  RecommendedSessionItem,
} from "@/types/auto-planner";
import { generateAutoPlanRecommendation } from "@/lib/recommendation/engine";
import { formatMinutes } from "@/lib/planner-utils";

interface AutoPlannerModalProps {
  isOpen: boolean;
  targetDate: string;
  subjects: Subject[];
  onClose: () => void;
  onApplyPlan: (newSessions: PlanSession[]) => void;
}

export function AutoPlannerModal({
  isOpen,
  targetDate,
  subjects,
  onClose,
  onApplyPlan,
}: AutoPlannerModalProps) {
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [pythonMandatory, setPythonMandatory] = useState<boolean>(true);
  const [dsaMandatory, setDsaMandatory] = useState<boolean>(true);
  const [regenerateKey, setRegenerateKey] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"recommendation" | "weekly" | "settings">("recommendation");

  // Custom overrides / adjustments
  const [sessionDurations, setSessionDurations] = useState<Record<string, number>>({});

  // Compute mandatory subjects list based on toggles
  const mandatorySubjectNames = useMemo(() => {
    const list: string[] = [];
    if (pythonMandatory) list.push("Python");
    if (dsaMandatory) list.push("DSA", "Data Structures", "Algorithms");
    return list;
  }, [pythonMandatory, dsaMandatory]);

  // Generate Recommendation using local engine
  const recommendation: AutoPlannerRecommendation = useMemo(() => {
    const options: AutoPlannerOptions = {
      targetDate,
      availableMinutes: availableHours * 60,
      preferredStartTime: "09:00",
      mandatorySubjectNames,
    };
    return generateAutoPlanRecommendation(subjects, options, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, targetDate, availableHours, mandatorySubjectNames, regenerateKey]);

  // Initialize session durations when recommendation changes
  useEffect(() => {
    const initDurations: Record<string, number> = {};
    recommendation.recommendedSessions.forEach((s) => {
      initDurations[s.subjectId] = s.allocatedMinutes;
    });
    setSessionDurations(initDurations);
  }, [recommendation]);

  if (!isOpen) return null;

  const handleApply = () => {
    // Map RecommendedSessionItem array into PlanSession array
    const mappedSessions: PlanSession[] = recommendation.recommendedSessions.map((rs, idx) => {
      const dur = sessionDurations[rs.subjectId] || rs.allocatedMinutes;
      const topicName = rs.topics.length > 0
        ? rs.topics.map((t) => t.title).join(", ")
        : "General Topic & Practice";

      const firstTopic = rs.topics[0];

      return {
        id: `auto-${rs.subjectId}-${idx}-${Date.now()}`,
        subject: rs.subjectName,
        topic: topicName,
        learningItemId: firstTopic?.learningItemId,
        startTime: rs.startTime,
        endTime: rs.endTime,
        durationMinutes: dur,
        color: rs.color,
        priority: rs.priority === "HIGH" ? "high" : rs.priority === "MEDIUM" ? "medium" : "low",
      };
    });

    onApplyPlan(mappedSessions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#12131a] p-6 shadow-2xl text-foreground flex flex-col max-h-[90vh]"
        style={{
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(34, 211, 238, 0.15)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles size={20} className="animate-pulse text-[#22d3ee]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  StudyOS Auto Planner
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#22d3ee] border border-cyan-500/20">
                  {recommendation.confidenceScore}% Match
                </span>
              </div>
              <p className="text-xs text-[#8a8a9e] mt-0.5">
                Intelligent daily study plan for {targetDate} based on priorities, workload & rotation rules.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6b6b80] hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Controls Bar */}
        <div className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#22d3ee]" />
            <span className="text-xs font-medium text-[#c0c0d0]">Daily Available Time:</span>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
              {[2, 3, 4, 5, 6].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => setAvailableHours(hrs)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    availableHours === hrs
                      ? "bg-[#22d3ee] text-black shadow"
                      : "text-[#8a8a9e] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRegenerateKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition"
            >
              <RefreshCw size={13} className="text-[#22d3ee]" />
              Regenerate
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("recommendation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "recommendation"
                ? "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30"
                : "text-[#8a8a9e] hover:text-white"
            }`}
          >
            <Sparkles size={13} />
            Recommended Plan ({recommendation.recommendedSessions.length} Sessions)
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "weekly"
                ? "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30"
                : "text-[#8a8a9e] hover:text-white"
            }`}
          >
            <BarChart3 size={13} />
            Weekly Balance
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "settings"
                ? "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30"
                : "text-[#8a8a9e] hover:text-white"
            }`}
          >
            <SlidersHorizontal size={13} />
            Mandatory & Priorities
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === "recommendation" && (
            <div className="space-y-3.5">
              {/* Insight summary */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3.5 text-xs text-cyan-200 flex items-start gap-2.5">
                <Sparkles size={16} className="text-[#22d3ee] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#22d3ee]">Auto Planner Insight:</div>
                  <div className="mt-0.5 text-cyan-100">{recommendation.summaryInsight}</div>
                </div>
              </div>

              {/* Recommended Sessions List */}
              <div className="space-y-3">
                {recommendation.recommendedSessions.map((session, idx) => (
                  <div
                    key={session.subjectId}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20"
                    style={{
                      borderLeft: `4px solid ${session.color}`,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold"
                          style={{
                            backgroundColor: `${session.color}20`,
                            color: session.color,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white">{session.subjectName}</h3>
                            {session.isMandatory && (
                              <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase text-emerald-400">
                                Daily Mandatory
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-[#8a8a9e] border border-white/10 rounded px-1.5 py-0.5">
                              {session.priority} Priority
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#8a8a9e] mt-0.5">
                            <Clock size={12} className="text-[#22d3ee]" />
                            <span>
                              {session.startTime} - {session.endTime} ({formatMinutes(session.allocatedMinutes)})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#22d3ee] font-semibold bg-[#22d3ee]/10 border border-[#22d3ee]/20 px-2 py-1 rounded-md">
                          {session.allocatedMinutes} min
                        </span>
                      </div>
                    </div>

                    {/* Explanation Badge */}
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/5 p-2.5 text-xs text-[#b0b0c5] border border-white/5">
                      <CheckCircle2 size={14} className="text-[#22d3ee] shrink-0 mt-0.5" />
                      <span>{session.explanationReason}</span>
                    </div>

                    {/* Topic Picks */}
                    {session.topics.length > 0 && (
                      <div className="mt-3 pl-2 border-l-2 border-white/10 space-y-1">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b80]">
                          Recommended Topics:
                        </div>
                        {session.topics.map((topic) => (
                          <div key={topic.learningItemId} className="flex items-center justify-between text-xs text-[#d0d0e0]">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
                              <span className="font-medium text-white">{topic.topicName}</span>
                              <span className="text-[#8a8a9e]">({topic.title})</span>
                            </span>
                            <span className="font-mono text-[10.5px] text-[#6b6b80]">
                              ~{topic.estimatedMinutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Buffer / Unallocated time note */}
              {recommendation.bufferMinutes > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-400" />
                    <span>
                      <strong>{recommendation.bufferMinutes} minutes buffer / revision time</strong> remaining in your available {availableHours}h.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "weekly" && (
            <div className="space-y-3">
              <p className="text-xs text-[#8a8a9e]">
                Subject frequency balance across the current week. Mandatory subjects run 7 days/week; optional subjects rotate to keep overall progress steady.
              </p>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/5 text-[#8a8a9e] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Weekly Target</th>
                      <th className="p-3">Planned / Completed</th>
                      <th className="p-3 text-right">Balance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#d0d0e0]">
                    {recommendation.weeklyBalance.map((wb) => (
                      <tr key={wb.subjectId} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-semibold text-white flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: wb.color }} />
                          {wb.subjectName}
                        </td>
                        <td className="p-3 font-mono">{wb.weeklyTargetDays} days/wk</td>
                        <td className="p-3 font-mono">
                          {wb.completedDaysThisWeek} done + {wb.plannedDaysThisWeek - wb.completedDaysThisWeek} planned
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {wb.status === "on-track" && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-400 font-mono text-[10.5px]">
                              <Check size={11} /> On Track
                            </span>
                          )}
                          {wb.status === "behind" && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-amber-400 font-mono text-[10.5px]">
                              Behind Target
                            </span>
                          )}
                          {wb.status === "exceeded" && (
                            <span className="inline-flex items-center gap-1 rounded bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-cyan-400 font-mono text-[10.5px]">
                              Exceeded
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Mandatory Core Daily Subjects
                </h3>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between rounded-lg bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition">
                    <div>
                      <div className="font-semibold text-white">Python (Every Day)</div>
                      <div className="text-[11px] text-[#8a8a9e]">Always recommend Python in daily study plan</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pythonMandatory}
                      onChange={(e) => setPythonMandatory(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#22d3ee] focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition">
                    <div>
                      <div className="font-semibold text-white">DSA / Algorithms (Every Day)</div>
                      <div className="text-[11px] text-[#8a8a9e]">Always recommend Data Structures & Algorithms</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dsaMandatory}
                      onChange={(e) => setDsaMandatory(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#22d3ee] focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#8a8a9e]">
            Total Allocated: <strong className="text-white">{formatMinutes(recommendation.totalAllocatedMinutes)}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-[#a0a0b8] hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-black hover:opacity-90 shadow-lg transition"
              style={{
                boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)",
              }}
            >
              <Sparkles size={14} />
              Accept & Apply Recommended Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
