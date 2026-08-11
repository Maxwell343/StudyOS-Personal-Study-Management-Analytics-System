import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Play, AlertCircle, Calendar, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { StudySession, SessionStatus } from "@/types/dashboard";
import { formatMinutes } from "@/lib/planner-utils";
import { MissionCard } from "./MissionCard";

interface MissionListProps {
  sessions: StudySession[];
  onStartSession?: (session: StudySession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onMoveToTomorrow?: (sessionId: string) => void;
  onOpenRescheduleModal?: (session: StudySession) => void;
  onMoveAllMissedToTomorrow?: () => void;
  onAddSession?: () => void;
}

export function MissionList({
  sessions,
  onStartSession,
  onDeleteSession,
  onMoveToTomorrow,
  onOpenRescheduleModal,
  onMoveAllMissedToTomorrow,
  onAddSession,
}: MissionListProps) {
  const [overrides, setOverrides] = useState<Record<string, SessionStatus>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

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

  const handlePrevSlide = () => {
    if (activeIndex > 0) {
      const nextIdx = activeIndex - 1;
      setActiveIndex(nextIdx);
      scrollToSlide(nextIdx);
    }
  };

  const handleNextSlide = () => {
    if (activeIndex < sessions.length - 1) {
      const nextIdx = activeIndex + 1;
      setActiveIndex(nextIdx);
      scrollToSlide(nextIdx);
    }
  };

  const scrollToSlide = (index: number) => {
    const container = sliderRef.current;
    if (!container) return;
    const children = container.children;
    if (children[index]) {
      children[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  // Sync scroll position with activeIndex
  const handleScroll = () => {
    const container = sliderRef.current;
    if (!container) return;
    const scrollTop = container.scrollTop;
    const itemHeight = 70; // approx height of MissionCard
    const newIdx = Math.min(sessions.length - 1, Math.max(0, Math.round(scrollTop / itemHeight)));
    if (newIdx !== activeIndex) {
      setActiveIndex(newIdx);
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-[10px] px-[18px] py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
            Today&apos;s Mission
          </h2>
          <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
            · {sessions.length} session{sessions.length !== 1 ? "s" : ""} ·{" "}
            {formattedDuration} planned
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mission Slider Nav Controls */}
          {sessions.length > 1 && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-1 py-0.5">
              <button
                type="button"
                onClick={handlePrevSlide}
                disabled={activeIndex === 0}
                className="flex h-5 w-5 items-center justify-center rounded text-[#8a8a9e] transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous session"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="font-mono text-[10px] text-[#22d3ee] px-1 font-semibold">
                {activeIndex + 1}/{sessions.length}
              </span>
              <button
                type="button"
                onClick={handleNextSlide}
                disabled={activeIndex === sessions.length - 1}
                className="flex h-5 w-5 items-center justify-center rounded text-[#8a8a9e] transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next session"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {onAddSession && (
            <button
              type="button"
              onClick={onAddSession}
              className="flex cursor-pointer items-center gap-1 rounded border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-2 py-0.5 text-[11px] font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
            >
              <Plus size={11} /> Add Session
            </button>
          )}

          <span
            className="font-mono text-[10px]"
            style={{ color: "#4a4a5a" }}
          >
            {completedCount} / {sessions.length} complete
          </span>
        </div>
      </div>

      {/* Missed Sessions Notification Alert Banner */}
      {missedSessions.length > 0 && (
        <div className="mb-3.5 shrink-0 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
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
          className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-6 text-center text-xs"
          style={{ color: "#5a5a6a" }}
        >
          <div>No study sessions planned for today yet.</div>
          <div className="flex items-center gap-3">
            {onAddSession && (
              <button
                type="button"
                onClick={onAddSession}
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#22d3ee]/35 bg-[#22d3ee]/10 px-3.5 py-1.5 text-xs font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
              >
                <Plus size={13} /> Add Today&apos;s Mission
              </button>
            )}
            <Link
              href="/plan-tomorrow"
              className="text-[#22d3ee] underline underline-offset-2 hover:text-[#38bdf8]"
            >
              Plan Tomorrow
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between min-h-0">
          {/* Scrollable / Slidable Session Container */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto pr-1.5 flex flex-col gap-2 scroll-smooth"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#22d3ee rgba(255,255,255,0.05)",
            }}
          >
            {sessions.map((session, idx) => (
              <div key={session.id} className="scroll-snap-align-start">
                <MissionCard
                  session={session}
                  status={getStatus(session.id, session.status)}
                  isNext={idx === 0}
                  onCycle={() => cycleSessionStatus(session.id, session.status)}
                  onStartSession={onStartSession ? () => onStartSession(session) : undefined}
                  onDelete={onDeleteSession ? () => onDeleteSession(session.id) : undefined}
                  onMoveToTomorrow={onMoveToTomorrow ? () => onMoveToTomorrow(session.id) : undefined}
                  onReschedule={onOpenRescheduleModal ? () => onOpenRescheduleModal(session) : undefined}
                />
              </div>
            ))}
          </div>

          {/* Slider Dots Indicator Bar */}
          {sessions.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 pt-2 border-t border-white/5 shrink-0">
              {sessions.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    scrollToSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === activeIndex
                      ? "w-5 bg-[#22d3ee]"
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

