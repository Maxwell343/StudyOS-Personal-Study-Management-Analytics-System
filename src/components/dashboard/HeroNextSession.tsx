import Link from "next/link";
import { useSessionTimer } from "@/context/TimerContext";
import { Play, Pause, CheckCircle2, RotateCcw, Clock, Calendar, Trash2 } from "lucide-react";
import type { StudySession } from "@/types/dashboard";

interface HeroNextSessionProps {
  session: StudySession | null;
  sessionIndex: number;
  totalSessions: number;
  onSessionUpdated?: () => void;
  onDeleteSession?: (sessionId: string) => void;
}

function cleanTopicTitle(topic?: string, subjectName?: string): string {
  if (!topic) return "";
  let cleaned = topic.trim();
  if (subjectName) {
    const escapedSubject = subjectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixReg = new RegExp(`^(?:${escapedSubject}\\s*:\\s*)+`, "gi");
    cleaned = cleaned.replace(prefixReg, "").trim();
  }
  cleaned = cleaned.replace(/(.+?):\s*\1(?::|\s|$)/gi, "$1").trim();
  return cleaned || topic;
}

export function HeroNextSession({
  session,
  sessionIndex,
  totalSessions,
  onSessionUpdated,
  onDeleteSession,
}: HeroNextSessionProps) {
  const {
    activeSession,
    isActive,
    isPaused,
    formattedElapsed,
    formattedRemaining,
    progressPercent,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    abandonSession,
    isOvertime,
    showTargetReachedToast,
  } = useSessionTimer();

  const isRunning = isActive || isPaused;
  const isDayComplete = !isRunning && !session && totalSessions > 0;

  const currentSubject = isRunning
    ? activeSession?.subjectName || session?.subject || "Focus Session"
    : isDayComplete
      ? "Done for the Day! 🎉"
      : session?.subject || "No Active Schedule";

  const rawTopic = isRunning
    ? activeSession?.topicName ||
      activeSession?.title ||
      session?.topic ||
      "Deep Work"
    : isDayComplete
      ? "All planned missions for today are completed."
      : session?.topic || "Plan your day to start structured tracking";

  const currentTopic = isDayComplete
    ? rawTopic
    : cleanTopicTitle(rawTopic, currentSubject);

  const handleStart = async () => {
    if (session) {
      await startSession({
        plannedSessionId:
          session.id !== "default-session" ? session.id : undefined,
        plannedMinutes: session.plannedMinutes || 60,
        subjectName: session.subject,
        topicName: session.topic,
        title: `${session.subject}: ${session.topic}`,
      });
    } else {
      // Ad-hoc 25m focus session
      await startSession({
        plannedMinutes: 25,
        subjectName: "General Study",
        topicName: "Deep Focus",
        title: "General Study: Deep Focus",
      });
    }
    if (onSessionUpdated) onSessionUpdated();
  };

  const handleTogglePause = async () => {
    if (isActive) {
      await pauseSession();
    } else if (isPaused) {
      await resumeSession();
    }
  };

  const handleComplete = async () => {
    await completeSession(true);
    if (onSessionUpdated) onSessionUpdated();
  };

  const handleAbandon = async () => {
    if (window.confirm("Are you sure you want to abandon this session? Progress will be saved but it will be marked as abandoned.")) {
      await abandonSession();
      if (onSessionUpdated) onSessionUpdated();
    }
  };

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-[10px] px-6 py-5"
      style={{
        background: "#13131a",
        border: `1px solid ${
          isRunning
            ? isPaused
              ? "rgba(249,115,22,0.3)"
              : "rgba(34,197,94,0.3)"
            : "rgba(34,211,238,0.18)"
        }`,
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 right-0 left-0 h-px"
        style={{
          background: isRunning
            ? isPaused
              ? "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)"
              : "linear-gradient(90deg, transparent, rgba(34,197,94,0.7), transparent)"
            : "linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)",
        }}
      />

      <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
        {/* Left: session info */}
        <div className="flex-1">
          <div className="mb-2.5 flex items-center gap-2">
            <div
              className="rounded px-2 py-[3px]"
              style={{
                background: isRunning
                  ? isPaused
                    ? "rgba(249,115,22,0.12)"
                    : "rgba(34,197,94,0.12)"
                  : "rgba(34,211,238,0.1)",
                border: `1px solid ${
                  isRunning
                    ? isPaused
                      ? "rgba(249,115,22,0.25)"
                      : "rgba(34,197,94,0.25)"
                    : "rgba(34,211,238,0.2)"
                }`,
              }}
            >
              <span
                className="font-mono text-[9.5px] font-bold uppercase tracking-[1px]"
                style={{
                  color: isRunning
                    ? isPaused
                      ? "#f97316"
                      : isOvertime
                        ? "#f87171" // Red for overtime
                        : "#22c55e"
                    : isDayComplete
                      ? "#22c55e"
                      : "#22d3ee",
                }}
              >
                {isRunning
                  ? isPaused
                    ? "⏸ PAUSED"
                    : showTargetReachedToast
                      ? "● TIME REACHED"
                      : isOvertime
                        ? "● OVERTIME"
                        : "● ACTIVE TIMER"
                  : isDayComplete
                    ? "✓ DAY COMPLETE 🎉"
                    : session
                      ? "NEXT SESSION"
                      : "STUDY OS"}
              </span>
            </div>
            {totalSessions > 0 && (
              <span
                className="font-mono text-[11px]"
                style={{ color: "#4a4a5a" }}
              >
                · {isDayComplete ? `${totalSessions} of ${totalSessions} completed` : `Session ${sessionIndex + 1} of ${totalSessions}`}
              </span>
            )}
          </div>

          <div className="mb-1.5 flex items-baseline gap-3">
            <h2 className="m-0 text-[22px] font-bold tracking-tight text-[#f0f0f4]">
              {currentSubject}
            </h2>
            <span className="text-sm" style={{ color: "#8a8a9e" }}>
              ·
            </span>
            <span className="text-[15px]" style={{ color: "#b0b0c8" }}>
              {currentTopic}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div
              className="flex items-center gap-[5px]"
              style={{ color: "#6b6b80" }}
            >
              <Clock size={12} />
              <span
                className="font-mono text-xs font-semibold"
                style={{ color: isRunning || isDayComplete ? "#22c55e" : "#a0a0b8" }}
              >
                {isRunning
                  ? formattedElapsed
                  : isDayComplete
                    ? "Complete"
                    : session
                      ? session.timeRange
                      : "00:00"}
              </span>
            </div>
            <span className="text-[11px]" style={{ color: "#3a3a4a" }}>
              ·
            </span>
            <span
              className="font-mono text-xs"
              style={{ color: "#6b6b80" }}
            >
              {isRunning
                ? `${activeSession?.plannedMinutes || 60}m planned`
                : isDayComplete
                  ? `${totalSessions} session${totalSessions !== 1 ? "s" : ""} done`
                  : session
                    ? `${session.duration || "1h 00m"} planned`
                    : "0m planned today"}
            </span>
            <span className="text-[11px]" style={{ color: "#3a3a4a" }}>
              ·
            </span>
            <span className="text-xs" style={{ color: "#6b6b80" }}>
              {isRunning
                ? isOvertime
                  ? `Over target duration by ${formattedRemaining}`
                  : `${formattedRemaining} remaining (${progressPercent}%)`
                : isDayComplete
                  ? "All daily planned sessions finished 🎉"
                  : session
                    ? "Ready to start"
                    : "Use Plan Tomorrow to lock your schedule"}
            </span>
          </div>

          {/* Progress bar when running */}
          {isRunning && (
            <div className="mt-3.5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${isOvertime ? 100 : progressPercent}%`,
                  background: isPaused
                    ? "#f97316"
                    : isOvertime
                      ? "linear-gradient(90deg, #f87171, #ef4444)"
                      : "linear-gradient(90deg, #22d3ee, #22c55e)",
                }}
              />
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isRunning ? (
            <>
              <button
                onClick={handleTogglePause}
                className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-4 py-2.5 text-[12.5px] font-semibold tracking-[0.2px]"
                style={{
                  border: `1px solid ${
                    isPaused ? "rgba(34,197,94,0.35)" : "rgba(249,115,22,0.35)"
                  }`,
                  background: isPaused
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(249,115,22,0.1)",
                  color: isPaused ? "#22c55e" : "#f97316",
                  transition: "all 0.15s ease",
                }}
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              <button
                onClick={handleComplete}
                className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-5 py-2.5 text-[12.5px] font-semibold tracking-[0.2px]"
                style={{
                  border: "1px solid rgba(34,197,94,0.4)",
                  background: "rgba(34,197,94,0.15)",
                  color: "#22c55e",
                  transition: "all 0.15s ease",
                }}
              >
                <CheckCircle2 size={13} />
                <span>Complete</span>
              </button>

              <button
                onClick={handleAbandon}
                title="Discard session"
                className="flex cursor-pointer items-center justify-center rounded-[7px] p-2 text-xs"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "transparent",
                  color: "#6b6b80",
                }}
              >
                <RotateCcw size={12} />
              </button>
            </>
          ) : isDayComplete ? (
            <Link
              href="/plan-tomorrow"
              className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[7px] px-5 py-2.5 text-[12.5px] font-semibold tracking-[0.2px]"
              style={{
                border: "1px solid rgba(34,197,94,0.35)",
                background: "rgba(34,197,94,0.1)",
                color: "#22c55e",
                transition: "all 0.15s ease",
              }}
            >
              <Calendar size={13} /> Plan Tomorrow&apos;s Schedule
            </Link>
          ) : session ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStart}
                className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[7px] px-6 py-2.5 text-[13px] font-semibold tracking-[0.2px]"
                style={{
                  border: "1px solid rgba(34,211,238,0.35)",
                  background: "rgba(34,211,238,0.1)",
                  color: "#22d3ee",
                  transition: "all 0.15s ease",
                }}
              >
                <Play size={11} /> Start Study Session
              </button>
              {onDeleteSession && (
                <button
                  onClick={() => onDeleteSession(session.id)}
                  title="Delete mission"
                  aria-label="Delete mission"
                  className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px]"
                  style={{
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/plan-tomorrow"
              className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[7px] px-5 py-2.5 text-[12.5px] font-semibold tracking-[0.2px]"
              style={{
                border: "1px solid rgba(34,211,238,0.35)",
                background: "rgba(34,211,238,0.1)",
                color: "#22d3ee",
                transition: "all 0.15s ease",
              }}
            >
              <Calendar size={13} /> Plan Today&apos;s Schedule
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
