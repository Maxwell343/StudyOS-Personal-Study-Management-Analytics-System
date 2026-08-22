import Link from "next/link";
import { AlertCircle, Calendar, Clock, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import type { StudySession, SubjectProgressData } from "@/types/dashboard";

interface NeedsAttentionSectionProps {
  missedSessions: StudySession[];
  subjectsNeedingAttention?: SubjectProgressData[];
  onRescheduleSession?: (session: StudySession) => void;
  onMoveToTomorrow?: (sessionId: string) => void;
}

export function NeedsAttentionSection({
  missedSessions,
  subjectsNeedingAttention = [],
  onRescheduleSession,
  onMoveToTomorrow,
}: NeedsAttentionSectionProps) {
  const hasMissed = missedSessions.length > 0;
  const hasLaggingSubjects = subjectsNeedingAttention.length > 0;
  const hasIssues = hasMissed || hasLaggingSubjects;

  if (!hasIssues) {
    return (
      <div
        className="rounded-[10px] p-3.5 flex items-center justify-between border border-white/[0.04] bg-white/[0.015]"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={13} className="text-[#22c55e]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
            Schedule Nominal
          </span>
          <span className="text-xs text-[#71717a]">· No overdue or interrupted sessions</span>
        </div>
        <span className="font-mono text-[10px] text-[#52525b]">100% On-Time</span>
      </div>
    );
  }

  return (
    <div
      className="mb-5 rounded-[12px] p-5 transition-all duration-200"
      style={{
        background: "#13131a",
        border: "1px solid rgba(239,68,68,0.2)",
      }}
    >
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-[#ef4444]" />
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[1px] text-[#ef4444]">
            Needs Attention
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-[#f87171]">
          {missedSessions.length} action item{missedSessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Missed Sessions List */}
      {hasMissed && (
        <div className="space-y-2">
          {missedSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-[8px] border border-red-500/20 bg-red-500/[0.04] p-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-2 w-2 rounded-full bg-[#ef4444] shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f4f4f5]">{session.subject}</span>
                    <span className="text-[#71717a]">/</span>
                    <span className="text-[#d4d4d8] truncate">{session.topic}</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-[#f87171]">
                    Scheduled {session.startTime} — {session.endTime} (Passed)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onRescheduleSession && (
                  <button
                    type="button"
                    onClick={() => onRescheduleSession(session)}
                    className="flex cursor-pointer items-center gap-1 rounded-[6px] border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition active:scale-95"
                  >
                    <Clock size={11} /> Reschedule
                  </button>
                )}

                {onMoveToTomorrow && (
                  <button
                    type="button"
                    onClick={() => onMoveToTomorrow(session.id)}
                    className="flex cursor-pointer items-center gap-1 rounded-[6px] border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition active:scale-95"
                  >
                    <Calendar size={11} /> Move Tomorrow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
