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
      className={`relative mb-5 overflow-hidden rounded-[12px] p-6 transition-all duration-200 border ${
        isRunning
          ? isPaused
            ? "bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.08] dark:from-[#13131c] dark:to-[#1a1714] border-amber-500/35 shadow-sm"
            : "bg-gradient-to-br from-emerald-500/[0.05] to-teal-500/[0.08] dark:from-[#13131c] dark:to-[#171824] border-emerald-500/35 shadow-sm"
          : isDayComplete
            ? "bg-gradient-to-br from-emerald-500/[0.04] to-teal-500/[0.06] dark:from-[#101918] dark:to-[#131d1a] border-emerald-500/25 shadow-xs"
            : "bg-card border-border shadow-xs"
      }`}
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
              : "linear-gradient(90deg, transparent, rgba(8,145,178,0.6), transparent)",
        }}
      />

      <div className="flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        {/* Left: Session metadata & state */}
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="mb-2.5 flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] border ${
                isRunning
                  ? isPaused
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : isDayComplete
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : hasNoPlan
                      ? "bg-muted border-border text-muted-foreground"
                      : session?.status === "missed"
                        ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                        : "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
              }`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  isRunning
                    ? isPaused
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : isDayComplete
                      ? "bg-emerald-500"
                      : hasNoPlan
                        ? "bg-slate-400"
                        : session?.status === "missed"
                          ? "bg-red-500"
                          : "bg-cyan-500"
                }`}
              />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[1px]">
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
              <span className="font-mono text-[11px] text-muted-foreground">
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
            <h2 className="m-0 text-xl font-bold tracking-tight text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
              {currentSubject}
            </h2>
            {currentTopic && (
              <>
                <span className="text-sm text-muted-foreground/60 font-normal">/</span>
                <span
                  className="text-[15px] font-medium text-foreground/80 group-hover:text-foreground transition line-clamp-1"
                >
                  {currentTopic}
                </span>
              </>
            )}
            {session && (
              <span className="text-xs text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-0.5">
                View curriculum <ArrowRight size={11} />
              </span>
            )}
          </div>

          {/* Time & Duration Micro-metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock size={13} className="text-muted-foreground/80" />
              <span
                className={`font-mono font-semibold ${
                  isRunning || isDayComplete
                    ? "text-emerald-600 dark:text-emerald-400"
                    : session?.status === "missed"
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground/80"
                }`}
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

            <span className="text-muted-foreground/40">·</span>

            <span className="font-mono text-muted-foreground">
              {isRunning
                ? `${activeSession?.plannedMinutes || 60}m target`
                : isDayComplete
                  ? `${totalSessions} sessions completed`
                  : session
                    ? `${session.duration || "50m"} planned`
                    : "0m planned"}
            </span>

            <span className="text-muted-foreground/40">·</span>

            <span
              className={`text-[11.5px] ${
                session?.status === "missed"
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-muted-foreground"
              }`}
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
            <div className="mt-3.5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted/70">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${isOvertime ? 100 : progressPercent}%`,
                  background: isPaused
                    ? "#f97316"
                    : isOvertime
                      ? "linear-gradient(90deg, #f87171, #ef4444)"
                      : "linear-gradient(90deg, #0891b2, #10b981)",
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
                className="flex cursor-pointer items-center gap-1.5 rounded-[8px] px-4 py-2.5 text-xs font-semibold tracking-wide transition active:scale-95 border"
                style={{
                  borderColor: isPaused ? "rgba(34,197,94,0.35)" : "rgba(249,115,22,0.35)",
                  background: isPaused ? "rgba(34,197,94,0.12)" : "rgba(249,115,22,0.12)",
                  color: isPaused ? "#16a34a" : "#ea580c",
                }}
              >
                {isPaused ? <Play size={13} /> : <Pause size={13} />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="flex cursor-pointer items-center gap-1.5 rounded-[8px] px-5 py-2.5 text-xs font-semibold tracking-wide transition active:scale-95 border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25"
              >
                <CheckCircle2 size={14} />
                <span>Finish</span>
              </button>

              <button
                type="button"
                onClick={handleAbandon}
                title="Abandon session"
                className="flex cursor-pointer items-center justify-center rounded-[8px] p-2.5 text-xs text-muted-foreground hover:text-red-500 transition border border-border bg-card hover:bg-red-500/10"
              >
                <RotateCcw size={13} />
              </button>
            </>
          ) : isDayComplete ? (
            <div className="flex items-center gap-2">
              <Link
                href="/analytics"
                className="flex items-center gap-1.5 rounded-[8px] px-4 py-2.5 text-xs font-medium text-foreground/80 hover:text-foreground border border-border bg-card hover:bg-secondary transition"
              >
                <TrendingUp size={13} /> View Analytics
              </Link>
              <Link
                href="/plan-tomorrow"
                className="flex items-center gap-1.5 rounded-[8px] px-5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
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
                  className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[8px] transition active:scale-95 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                >
                  <Pencil size={13} />
                </button>
              )}

              {session.status === "missed" && onMoveToTomorrow && (
                <button
                  type="button"
                  onClick={() => onMoveToTomorrow(session.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition"
                >
                  <Calendar size={13} /> Move Tomorrow
                </button>
              )}

              <button
                type="button"
                onClick={handleStart}
                className="flex cursor-pointer items-center gap-2 rounded-[8px] px-5 py-2.5 text-xs font-bold tracking-wide transition active:scale-95 border border-cyan-500/40 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25 shadow-xs"
              >
                <Play size={13} className="fill-cyan-600 dark:fill-cyan-400" /> Start Session
              </button>

              {onDeleteSession && (
                <button
                  type="button"
                  onClick={() => onDeleteSession(session.id)}
                  title="Delete session"
                  aria-label="Delete session"
                  className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition border border-border"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/plan-tomorrow"
              className="flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/35 bg-cyan-500/10 hover:bg-cyan-500/20 transition active:scale-95 shadow-xs"
            >
              <Sparkles size={13} /> Plan Today&apos;s Schedule
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

