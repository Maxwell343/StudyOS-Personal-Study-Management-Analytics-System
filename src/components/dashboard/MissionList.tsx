import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Calendar, Clock, Plus, CheckCircle2, ArrowRight } from "lucide-react";
import type { StudySession, SessionStatus } from "@/types/dashboard";
import { formatMinutes } from "@/lib/planner-utils";
import { MissionCard } from "./MissionCard";

interface MissionListProps {
  sessions: StudySession[];
  onSelectSession?: (session: StudySession) => void;
  onStartSession?: (session: StudySession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onMoveToTomorrow?: (sessionId: string) => void;
  onOpenRescheduleModal?: (session: StudySession) => void;
  onMoveAllMissedToTomorrow?: () => void;
  onAddSession?: () => void;
  onUpdateSessionStatus?: (sessionId: string, status: SessionStatus) => void;
}

export function MissionList({
  sessions,
  onSelectSession,
  onStartSession,
  onDeleteSession,
  onMoveToTomorrow,
  onOpenRescheduleModal,
  onMoveAllMissedToTomorrow,
  onAddSession,
  onUpdateSessionStatus,
}: MissionListProps) {
  const [overrides, setOverrides] = useState<Record<string, SessionStatus>>({});

  const totalPlannedMinutes = sessions.reduce(
    (acc, s) => acc + (s.plannedMinutes || 0),
    0
  );
  const formattedDuration = formatMinutes(totalPlannedMinutes);

  const getStatus = (id: string, originalStatus: SessionStatus) =>
    overrides[id] || originalStatus;

  const completedCount = sessions.filter(
    (s) => getStatus(s.id, s.status) === "completed"
  ).length;

  const missedSessions = sessions.filter(
    (s) => getStatus(s.id, s.status) === "missed"
  );

  const cycleSessionStatus = (id: string, originalStatus: SessionStatus) => {
    const order: SessionStatus[] = [
      "upcoming",
      "starting-soon",
      "active",
      "paused",
      "completed",
    ];
    const current = overrides[id] || originalStatus;
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];

    setOverrides((prev) => ({ ...prev, [id]: next }));
    if (onUpdateSessionStatus) {
      onUpdateSessionStatus(id, next);
    }
  };

  // Identify index of current active/next session
  const currentSessionIndex = sessions.findIndex(
    (s) => s.status === "active" || s.status === "paused" || s.status === "starting-soon" || s.status === "behind-schedule"
  );

  return (
    <div
      className="flex flex-col h-full rounded-[12px] p-5 transition-all duration-200"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Timeline Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-sm font-bold tracking-tight text-[#f0f0f4]">
            Today&apos;s Mission Schedule
          </h2>
          <span className="text-xs text-[#52525b]">·</span>
          <span className="text-xs font-mono text-[#a1a1aa]">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} ({formattedDuration})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onAddSession && (
            <button
              type="button"
              onClick={onAddSession}
              className="flex cursor-pointer items-center gap-1 rounded-[7px] border border-[#22d3ee]/35 bg-[#22d3ee]/10 px-2.5 py-1 text-xs font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition active:scale-95"
            >
              <Plus size={12} /> Add Session
            </button>
          )}

          <div className="rounded-full bg-white/[0.03] border border-white/[0.06] px-2.5 py-1">
            <span className="font-mono text-[10.5px] font-semibold text-[#71717a]">
              {completedCount}/{sessions.length} done
            </span>
          </div>
        </div>
      </div>

      {/* Missed Sessions Recovery Alert Banner */}
      {missedSessions.length > 0 && (
        <div className="mb-4 shrink-0 flex flex-wrap items-center justify-between gap-2.5 rounded-[9px] border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-red-400" />
            <span>
              <strong className="text-red-300">
                {missedSessions.length} session{missedSessions.length !== 1 ? "s" : ""} missed:
              </strong>{" "}
              {missedSessions.map((s) => s.subject).join(", ")} slot elapsed.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {onMoveAllMissedToTomorrow && (
              <button
                type="button"
                onClick={onMoveAllMissedToTomorrow}
                className="flex cursor-pointer items-center gap-1 rounded-[6px] bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-200 hover:bg-red-500/30 transition border border-red-500/30 active:scale-95"
              >
                <Calendar size={11} /> Move All Tomorrow
              </button>
            )}
            {onOpenRescheduleModal && (
              <button
                type="button"
                onClick={() => onOpenRescheduleModal(missedSessions[0])}
                className="flex cursor-pointer items-center gap-1 rounded-[6px] bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30 transition border border-amber-500/30 active:scale-95"
              >
                <Clock size={11} /> Reschedule
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeline Body */}
      {sessions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[9px] border border-white/[0.04] bg-white/[0.01] px-4 py-8 text-center text-xs text-[#71717a]">
          <p className="m-0">No study sessions planned for today yet.</p>
          <div className="flex items-center gap-3">
            {onAddSession && (
              <button
                type="button"
                onClick={onAddSession}
                className="flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-[#22d3ee]/35 bg-[#22d3ee]/10 px-3.5 py-1.5 text-xs font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
              >
                <Plus size={13} /> Add Quick Session
              </button>
            )}
            <Link
              href="/plan-tomorrow"
              className="text-[#22d3ee] font-semibold underline underline-offset-2 hover:text-[#38bdf8]"
            >
              Plan in Advance &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {sessions.map((session, idx) => {
            const isCurrent =
              currentSessionIndex >= 0
                ? idx === currentSessionIndex
                : idx === 0 && session.status !== "completed";

            return (
              <MissionCard
                key={session.id}
                session={session}
                status={getStatus(session.id, session.status)}
                isNext={isCurrent}
                onCycle={() => cycleSessionStatus(session.id, session.status)}
                onSelectSession={onSelectSession}
                onStartSession={onStartSession ? () => onStartSession(session) : undefined}
                onDelete={onDeleteSession ? () => onDeleteSession(session.id) : undefined}
                onMoveToTomorrow={onMoveToTomorrow ? () => onMoveToTomorrow(session.id) : undefined}
                onReschedule={onOpenRescheduleModal ? () => onOpenRescheduleModal(session) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}


