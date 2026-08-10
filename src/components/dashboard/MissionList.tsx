import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import type { StudySession, SessionStatus } from "@/types/dashboard";
import { formatMinutes } from "@/lib/planner-utils";
import { MissionCard } from "./MissionCard";

interface MissionListProps {
  sessions: StudySession[];
  onDeleteSession?: (sessionId: string) => void;
  onMoveToTomorrow?: (sessionId: string) => void;
  onOpenRescheduleModal?: (session: StudySession) => void;
  onMoveAllMissedToTomorrow?: () => void;
}

export function MissionList({
  sessions,
  onDeleteSession,
  onMoveToTomorrow,
  onOpenRescheduleModal,
  onMoveAllMissedToTomorrow,
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
    setOverrides((prev) => {
      const current = prev[id] || originalStatus;
      const idx = order.indexOf(current);
      const next = order[(idx + 1) % order.length];
      return { ...prev, [id]: next };
    });
  };

  return (
    <div
      className="rounded-[10px] px-[18px] py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
            Today&apos;s Mission
          </h2>
          <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
            · {sessions.length} session{sessions.length !== 1 ? "s" : ""} ·{" "}
            {formattedDuration} planned
          </span>
        </div>
        <span
          className="font-mono text-[10px]"
          style={{ color: "#4a4a5a" }}
        >
          {completedCount} / {sessions.length} complete
        </span>
      </div>

      {/* Missed Sessions Notification Alert Banner */}
      {missedSessions.length > 0 && (
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <div>
              <span className="font-semibold text-red-400">
                {missedSessions.length} Missed Session{missedSessions.length !== 1 ? "s" : ""}:
              </span>{" "}
              <span className="text-red-200">
                {missedSessions.map((s) => s.subject).join(", ")} time slot has passed.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onMoveAllMissedToTomorrow && (
              <button
                type="button"
                onClick={onMoveAllMissedToTomorrow}
                className="flex cursor-pointer items-center gap-1 rounded bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-200 hover:bg-red-500/30 transition border border-red-500/30"
              >
                <Calendar size={11} /> Move All to Tomorrow
              </button>
            )}
            {onOpenRescheduleModal && (
              <button
                type="button"
                onClick={() => onOpenRescheduleModal(missedSessions[0])}
                className="flex cursor-pointer items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30 transition border border-amber-500/30"
              >
                <Clock size={11} /> Reschedule
              </button>
            )}
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div
          className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-6 text-center text-xs"
          style={{ color: "#5a5a6a" }}
        >
          No study sessions planned for today. Use{" "}
          <Link
            href="/plan-tomorrow"
            className="text-[#22d3ee] underline underline-offset-2 hover:text-[#38bdf8]"
          >
            Plan Tomorrow
          </Link>{" "}
          to schedule your focused missions.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session, idx) => (
            <MissionCard
              key={session.id}
              session={session}
              status={getStatus(session.id, session.status)}
              isNext={idx === 0}
              onCycle={() => cycleSessionStatus(session.id, session.status)}
              onDelete={onDeleteSession ? () => onDeleteSession(session.id) : undefined}
              onMoveToTomorrow={onMoveToTomorrow ? () => onMoveToTomorrow(session.id) : undefined}
              onReschedule={onOpenRescheduleModal ? () => onOpenRescheduleModal(session) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
