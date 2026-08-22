import Link from "next/link";
import { useSessionTimer } from "@/context/TimerContext";
import {
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Clock,
  Calendar,
  Trash2,
  Pencil,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { StudySession } from "@/types/dashboard";

interface HeroNextSessionProps {
  session: StudySession | null;
  sessionIndex: number;
  totalSessions: number;
  onSelectSession?: (session: StudySession) => void;
  onSessionUpdated?: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onMoveToTomorrow?: (sessionId: string) => void;
  onOpenRescheduleModal?: (session: StudySession) => void;
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
  onSelectSession,
  onSessionUpdated,
  onDeleteSession,
  onMoveToTomorrow,
  onOpenRescheduleModal,
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
  const hasNoPlan = !isRunning && !session && totalSessions === 0;

  const currentSubject = isRunning
    ? activeSession?.subjectName || session?.subject || "Focus Session"
    : isDayComplete
      ? "Day Complete"
      : hasNoPlan
        ? "No Plan for Today"
        : session?.subject || "Next Session";

  const rawTopic = isRunning
    ? activeSession?.topicName ||
      activeSession?.title ||
      session?.topic ||
      "Deep Focus Execution"
    : isDayComplete
      ? `All ${totalSessions} planned sessions completed`
      : hasNoPlan
        ? "Create a schedule in Plan Tomorrow to start structured tracking."
        : session?.topic || "Ready to execute";

  const currentTopic = isDayComplete || hasNoPlan
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
        startTime: session.startTime,
      });
    } else {
      // Ad-hoc 30m focus session
      await startSession({
        plannedMinutes: 30,
        subjectName: "General Study",
        topicName: "Deep Focus Session",
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
    if (window.confirm("Are you sure you want to abandon this session? Progress will be saved but marked as abandoned.")) {
      await abandonSession();
      if (onSessionUpdated) onSessionUpdated();
    }
  };

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-[12px] p-6 transition-all duration-200"
      style={{
        background: isRunning
          ? "linear-gradient(135deg, #13131c 0%, #171824 100%)"
          : isDayComplete
            ? "linear-gradient(135deg, #101918 0%, #131d1a 100%)"
            : "#13131a",
        border: `1px solid ${
          isRunning
            ? isPaused
              ? "rgba(249,115,22,0.35)"
              : "rgba(34,197,94,0.35)"
            : isDayComplete
              ? "rgba(34,197,94,0.25)"
              : "rgba(34,211,238,0.2)"
        }`,
        boxShadow: isRunning
          ? isPaused
            ? "0 4px 20px -2px rgba(249,115,22,0.12)"
            : "0 4px 20px -2px rgba(34,197,94,0.12)"
          : "none",
      }}
    >
      {/* Top ambient glow line */}
      <div
        className="absolute top-0 right-0 left-0 h-[2px]"
        style={{
          background: isRunning
            ? isPaused
              ? "linear-gradient(90deg, transparent, rgba(249,115,22,0.8), transparent)"
              : "linear-gradient(90deg, transparent, rgba(34,197,94,0.8), transparent)"
            : isDayComplete
              ? "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)"
              : "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)",
        }}
      />

      <div className="flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        {/* Left: Session metadata & state */}
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="mb-2.5 flex items-center gap-2">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px]"
              style={{
                background: isRunning
                  ? isPaused
                    ? "rgba(249,115,22,0.12)"
                    : "rgba(34,197,94,0.12)"
                  : isDayComplete
                    ? "rgba(34,197,94,0.12)"
                    : hasNoPlan
                      ? "rgba(107,114,128,0.12)"
                      : session?.status === "missed"
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(34,211,238,0.12)",
                border: `1px solid ${
                  isRunning
                    ? isPaused
                      ? "rgba(249,115,22,0.3)"
                      : "rgba(34,197,94,0.3)"
                    : isDayComplete
                      ? "rgba(34,197,94,0.3)"
                      : hasNoPlan
                        ? "rgba(107,114,128,0.2)"
                        : session?.status === "missed"
                          ? "rgba(239,68,68,0.3)"
                          : "rgba(34,211,238,0.25)"
                }`,
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{
                  background: isRunning
                    ? isPaused
                      ? "#f97316"
                      : "#22c55e"
                    : isDayComplete
                      ? "#22c55e"
                      : hasNoPlan
                        ? "#6b7280"
                        : session?.status === "missed"
                          ? "#ef4444"
                          : "#22d3ee",
                }}
              />
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-[1px]"
                style={{
                  color: isRunning
                    ? isPaused
                      ? "#f97316"
                      : isOvertime
                        ? "#f87171"
                        : "#22c55e"
                    : isDayComplete
                      ? "#22c55e"
                      : hasNoPlan
                        ? "#9ca3af"
                        : session?.status === "missed"
                          ? "#ef4444"
                          : "#22d3ee",
                }}
              >
                {isRunning
                  ? isPaused
                    ? "PAUSED"
                    : showTargetReachedToast
                      ? "TARGET REACHED"
                      : isOvertime
                        ? "OVERTIME"
                        : "IN PROGRESS"
                  : isDayComplete
                    ? "DAY COMPLETE"
                    : hasNoPlan
                      ? "NO SCHEDULE"
                      : session?.status === "missed"
                        ? "MISSED SESSION"
                        : session?.status === "behind-schedule"
                          ? "BEHIND SCHEDULE"
                          : session?.status === "starting-soon"
                            ? "STARTING SOON"
                            : "NEXT UP"}
              </span>
            </div>

            {totalSessions > 0 && (
              <span
                className="font-mono text-[11px]"
                style={{ color: "#6b6b80" }}
              >
                {isDayComplete
                  ? `· ${totalSessions} / ${totalSessions} sessions finished`
                  : `· Session ${sessionIndex + 1} of ${totalSessions}`}
              </span>
            )}
          </div>

          {/* Title & Topic */}
          <div
            onClick={() => session && onSelectSession?.(session)}
            title={session ? "Click to view planned topic items" : undefined}
            className={`mb-2 flex flex-wrap items-baseline gap-2.5 transition ${
              session ? "cursor-pointer group" : ""
            }`}
          >
            <h2 className="m-0 text-xl font-bold tracking-tight text-[#f0f0f4] group-hover:text-cyan-300 transition">
              {currentSubject}
            </h2>
            {currentTopic && (
              <>
                <span className="text-sm text-[#4a4a5a] font-normal">/</span>
                <span
                  className="text-[15px] font-medium text-[#c0c0d8] group-hover:text-white transition line-clamp-1"
                >
                  {currentTopic}
                </span>
              </>
            )}
            {session && (
              <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-0.5">
                View curriculum <ArrowRight size={11} />
              </span>
            )}
          </div>

          {/* Time & Duration Micro-metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-[#8a8a9e]">
              <Clock size={13} className="text-[#6b6b80]" />
              <span
                className="font-mono font-semibold"
                style={{
                  color: isRunning || isDayComplete
                    ? "#22c55e"
                    : session?.status === "missed"
                      ? "#ef4444"
                      : "#a0a0b8",
                }}
              >
                {isRunning
                  ? formattedElapsed
                  : isDayComplete
                    ? "Completed"
                    : session
                      ? session.timeRange
                      : "No slot"}
              </span>
            </div>

            <span className="text-[#3a3a4a]">·</span>

            <span className="font-mono text-[#8a8a9e]">
              {isRunning
                ? `${activeSession?.plannedMinutes || 60}m target`
                : isDayComplete
                  ? `${totalSessions} sessions completed`
                  : session
                    ? `${session.duration || "50m"} planned`
                    : "0m planned"}
            </span>

            <span className="text-[#3a3a4a]">·</span>

            <span
              className="text-[11.5px]"
              style={{
                color: session?.status === "missed" ? "#f87171" : "#71717a",
              }}
            >
              {isRunning
                ? isOvertime
                  ? `Overtime by ${formattedRemaining}`
                  : `${formattedRemaining} remaining (${progressPercent}%)`
                : isDayComplete
                  ? "Great job on completing your plan!"
                  : session?.status === "missed"
                    ? "Scheduled slot passed. Reschedule or start now."
                    : session
                      ? "Ready to start"
                      : "Use Plan Tomorrow to create your schedule."}
            </span>
          </div>

          {/* Running Progress Bar */}
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

        {/* Right: Dynamic CTAs */}
        <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:justify-end">
          {isRunning ? (
            <>
              <button
                type="button"
                onClick={handleTogglePause}
                className="flex cursor-pointer items-center gap-1.5 rounded-[8px] px-4 py-2.5 text-xs font-semibold tracking-wide transition active:scale-95"
                style={{
                  border: `1px solid ${
                    isPaused ? "rgba(34,197,94,0.35)" : "rgba(249,115,22,0.35)"
                  }`,
                  background: isPaused
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(249,115,22,0.12)",
                  color: isPaused ? "#22c55e" : "#f97316",
                }}
              >
                {isPaused ? <Play size={13} /> : <Pause size={13} />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="flex cursor-pointer items-center gap-1.5 rounded-[8px] px-5 py-2.5 text-xs font-semibold tracking-wide transition active:scale-95"
                style={{
                  border: "1px solid rgba(34,197,94,0.45)",
                  background: "rgba(34,197,94,0.18)",
                  color: "#22c55e",
                }}
              >
                <CheckCircle2 size={14} />
                <span>Finish</span>
              </button>

              <button
                type="button"
                onClick={handleAbandon}
                title="Abandon session"
                className="flex cursor-pointer items-center justify-center rounded-[8px] p-2.5 text-xs text-[#71717a] hover:text-red-400 transition"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <RotateCcw size={13} />
              </button>
            </>
          ) : isDayComplete ? (
            <div className="flex items-center gap-2">
              <Link
                href="/analytics"
                className="flex items-center gap-1.5 rounded-[8px] px-4 py-2.5 text-xs font-medium text-[#c0c0d8] hover:text-white transition"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <TrendingUp size={13} /> View Analytics
              </Link>
              <Link
                href="/plan-tomorrow"
                className="flex items-center gap-1.5 rounded-[8px] px-5 py-2.5 text-xs font-semibold text-[#22c55e] transition"
                style={{
                  border: "1px solid rgba(34,197,94,0.35)",
                  background: "rgba(34,197,94,0.12)",
                }}
              >
                <Calendar size={13} /> Plan Tomorrow
              </Link>
            </div>
          ) : session ? (
            <div className="flex flex-wrap items-center gap-2">
              {onOpenRescheduleModal && (
                <button
                  type="button"
                  onClick={() => onOpenRescheduleModal(session)}
                  title="Reschedule session"
                  aria-label="Reschedule session"
                  className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[8px] transition active:scale-95"
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    color: "#f59e0b",
                  }}
                >
                  <Pencil size={13} />
                </button>
              )}

              {session.status === "missed" && onMoveToTomorrow && (
                <button
                  type="button"
                  onClick={() => onMoveToTomorrow(session.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#22d3ee]/35 bg-[#22d3ee]/10 px-4 py-2.5 text-xs font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
                >
                  <Calendar size={13} /> Move Tomorrow
                </button>
              )}

              <button
                type="button"
                onClick={handleStart}
                className="flex cursor-pointer items-center gap-2 rounded-[8px] px-5 py-2.5 text-xs font-bold tracking-wide transition active:scale-95"
                style={{
                  border: "1px solid rgba(34,211,238,0.45)",
                  background: "rgba(34,211,238,0.15)",
                  color: "#22d3ee",
                }}
              >
                <Play size={13} className="fill-[#22d3ee]" /> Start Session
              </button>

              {onDeleteSession && (
                <button
                  type="button"
                  onClick={() => onDeleteSession(session.id)}
                  title="Delete session"
                  aria-label="Delete session"
                  className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[8px] text-[#71717a] hover:text-red-400 transition"
                  style={{
                    background: "rgba(239,68,68,0.04)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/plan-tomorrow"
              className="flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-xs font-bold text-[#22d3ee] transition active:scale-95"
              style={{
                border: "1px solid rgba(34,211,238,0.4)",
                background: "rgba(34,211,238,0.12)",
              }}
            >
              <Sparkles size={13} /> Plan Today&apos;s Schedule
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

