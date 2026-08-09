"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import {
  ActiveSessionDetails,
  fetchActiveSession,
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  completeStudySession,
  abandonStudySession,
  calculateElapsedSeconds,
  formatTimerSeconds,
} from "@/lib/data-access/timer";

interface TimerContextValue {
  activeSession: ActiveSessionDetails | null;
  isActive: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  remainingSeconds: number;
  formattedElapsed: string;
  formattedRemaining: string;
  progressPercent: number;
  startSession: (input: {
    plannedSessionId?: string;
    learningItemId?: string;
    plannedMinutes: number;
    subjectName?: string;
    topicName?: string;
    title?: string;
  }) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: (markItemCompleted?: boolean) => Promise<number>;
  abandonSession: () => Promise<void>;
  refreshActiveSession: () => Promise<void>;
  isOvertime: boolean;
  showTargetReachedToast: boolean;
  dismissToast: () => void;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<ActiveSessionDetails | null>(null);
  const [tick, setTick] = useState(0);
  const notifiedFinishedRef = useRef(false);
  const previousElapsedRef = useRef(-1);
  const [showTargetReachedToast, setShowTargetReachedToast] = useState(false);

  // ── Sync with DB on mount / user change ────────────────────────────────────
  const refreshActiveSession = useCallback(async () => {
    if (!user) {
      setActiveSession(null);
      return;
    }

    try {
      const session = await fetchActiveSession(user.id);
      setActiveSession(session);
    } catch (err) {
      console.error("Error refreshing active study session:", err);
    }
  }, [user]);

  useEffect(() => {
    let isCancelled = false;
    if (user) {
      fetchActiveSession(user.id)
        .then((session) => {
          if (!isCancelled) {
            setActiveSession(session);
          }
        })
        .catch((err) => {
          console.error("Error loading active study session:", err);
        });
    } else {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          setActiveSession(null);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [user]);

  // ── Timestamp-based Clock Loop ─────────────────────────────────────────────
  // Runs every second purely to trigger re-renders of the derived elapsed time
  useEffect(() => {
    if (!activeSession || activeSession.status === "PAUSED") {
      return;
    }

    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000000);

      // Check if target planned duration reached for notification exactly once
      const secs = calculateElapsedSeconds(
        activeSession.startedAt,
        activeSession.pausedAt,
        activeSession.totalPausedSeconds
      );
      const plannedSecs = (activeSession.plannedMinutes || 60) * 60;
      
      const prevSecs = previousElapsedRef.current;
      
      // Threshold crossing detection
      if (
        prevSecs !== -1 && 
        prevSecs < plannedSecs && 
        secs >= plannedSecs &&
        !notifiedFinishedRef.current
      ) {
        notifiedFinishedRef.current = true;
        setShowTargetReachedToast(true);
        
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("🎯 StudyOS Target Reached!", {
              body: `You've completed your planned ${activeSession.plannedMinutes}m on ${activeSession.subjectName}: ${activeSession.topicName}.`,
              icon: "/favicon.ico",
            });
          } catch {
            // Ignore notification display errors
          }
        }
      }
      
      previousElapsedRef.current = secs;
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const startSession = useCallback(
    async (input: {
      plannedSessionId?: string;
      learningItemId?: string;
      plannedMinutes: number;
      subjectName?: string;
      topicName?: string;
      title?: string;
    }) => {
      if (!user) return;

      // Request browser notification permission gently if default
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        try {
          Notification.requestPermission();
        } catch {
          // ignore
        }
      }

      notifiedFinishedRef.current = false;
      previousElapsedRef.current = -1;
      setShowTargetReachedToast(false);
      const newSession = await startStudySession(user.id, input);
      setActiveSession(newSession);
    },
    [user]
  );

  const pauseSession = useCallback(async () => {
    if (!activeSession) return;
    const pausedAt = await pauseStudySession(activeSession.id);
    setActiveSession((prev) =>
      prev ? { ...prev, status: "PAUSED", pausedAt } : null
    );
  }, [activeSession]);

  const resumeSession = useCallback(async () => {
    if (!activeSession || !activeSession.pausedAt) return;
    const newTotalPaused = await resumeStudySession(
      activeSession.id,
      activeSession.pausedAt,
      activeSession.totalPausedSeconds
    );
    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            status: "ACTIVE",
            pausedAt: null,
            totalPausedSeconds: newTotalPaused,
          }
        : null
    );
  }, [activeSession]);

  const completeSession = useCallback(
    async (markItemCompleted = true): Promise<number> => {
      if (!activeSession || !user) return 0;

      const actualMinutes = await completeStudySession(activeSession.id, {
        userId: user.id,
        startedAt: activeSession.startedAt,
        pausedAt: activeSession.pausedAt,
        totalPausedSeconds: activeSession.totalPausedSeconds,
        learningItemId: activeSession.learningItemId,
        plannedSessionId: activeSession.plannedSessionId,
        markItemCompleted,
        title: activeSession.title,
      });

      setActiveSession(null);
      return actualMinutes;
    },
    [activeSession, user]
  );

  const abandonSession = useCallback(async () => {
    if (!activeSession) return;
    await abandonStudySession(activeSession.id);
    setActiveSession(null);
  }, [activeSession]);

  // ── Formatted Computations (purely derived from timestamps) ─────────────────
  const elapsedSeconds = useMemo(() => {
    if (!activeSession) return 0;
    return calculateElapsedSeconds(
      activeSession.startedAt,
      activeSession.pausedAt,
      activeSession.totalPausedSeconds
    );
  }, [activeSession, tick]);

  const plannedSecs = (activeSession?.plannedMinutes || 60) * 60;
  const isOvertime = elapsedSeconds > plannedSecs;
  const remainingSecs = Math.max(0, plannedSecs - Math.min(elapsedSeconds, plannedSecs));
  const formattedElapsed = useMemo(() => formatTimerSeconds(elapsedSeconds), [elapsedSeconds]);
  const formattedRemaining = useMemo(() => formatTimerSeconds(Math.abs(plannedSecs - elapsedSeconds)), [elapsedSeconds, plannedSecs]);
  const progressPercent = useMemo(() => {
    if (!plannedSecs) return 0;
    return Math.min(100, Math.round((elapsedSeconds / plannedSecs) * 100));
  }, [elapsedSeconds, plannedSecs]);

  const dismissToast = useCallback(() => setShowTargetReachedToast(false), []);

  const value: TimerContextValue = {
    activeSession,
    isActive: activeSession !== null && activeSession.status === "ACTIVE",
    isPaused: activeSession !== null && activeSession.status === "PAUSED",
    elapsedSeconds,
    remainingSeconds: remainingSecs,
    formattedElapsed,
    formattedRemaining,
    progressPercent,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    abandonSession,
    refreshActiveSession,
    isOvertime,
    showTargetReachedToast,
    dismissToast,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
      
      {/* Target Reached In-App Toast */}
      {showTargetReachedToast && activeSession && (
        <div 
          className="fixed right-6 top-6 z-50 animate-in slide-in-from-right-4 fade-in duration-300"
          style={{ width: "320px" }}
        >
          <div 
            className="flex flex-col rounded-lg p-4 shadow-xl"
            style={{ 
              background: "#1e1e28",
              border: "1px solid rgba(34,211,238,0.3)",
              borderLeft: "4px solid #22d3ee"
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="m-0 text-[14px] font-bold text-white">Target Reached</h3>
                <p className="m-0 mt-1 text-[13px]" style={{ color: "#a0a0b8" }}>
                  You&apos;ve completed your planned {activeSession.plannedMinutes}m on {activeSession.subjectName}: {activeSession.topicName}.
                </p>
              </div>
              <button 
                onClick={dismissToast}
                className="ml-4 cursor-pointer rounded text-[#6b6b80] hover:text-white"
                style={{ background: "transparent", border: "none" }}
              >
                ✕
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={dismissToast}
                className="flex-1 cursor-pointer rounded-[5px] py-1.5 text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f4" }}
              >
                Continue (Overtime)
              </button>
            </div>
          </div>
        </div>
      )}
    </TimerContext.Provider>
  );
}

export function useSessionTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useSessionTimer must be used within a TimerProvider");
  }
  return context;
}
