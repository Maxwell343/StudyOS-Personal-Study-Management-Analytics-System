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
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<ActiveSessionDetails | null>(null);
  const [, setTick] = useState(0);
  const notifiedFinishedRef = useRef(false);

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

      // Check if target planned duration reached for notification
      const secs = calculateElapsedSeconds(
        activeSession.startedAt,
        activeSession.pausedAt,
        activeSession.totalPausedSeconds
      );
      const plannedSecs = (activeSession.plannedMinutes || 60) * 60;
      if (
        secs >= plannedSecs &&
        !notifiedFinishedRef.current &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        notifiedFinishedRef.current = true;
        try {
          new Notification("🎯 StudyOS Target Reached!", {
            body: `You've completed your planned ${activeSession.plannedMinutes}m on ${activeSession.subjectName}: ${activeSession.topicName}.`,
            icon: "/favicon.ico",
          });
        } catch {
          // Ignore notification display errors
        }
      }
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
  }, [activeSession]);

  const plannedSecs = (activeSession?.plannedMinutes || 60) * 60;
  const remainingSecs = Math.max(0, plannedSecs - elapsedSeconds);
  const formattedElapsed = useMemo(() => formatTimerSeconds(elapsedSeconds), [elapsedSeconds]);
  const formattedRemaining = useMemo(() => formatTimerSeconds(remainingSecs), [remainingSecs]);
  const progressPercent = useMemo(() => {
    if (!plannedSecs) return 0;
    return Math.min(100, Math.round((elapsedSeconds / plannedSecs) * 100));
  }, [elapsedSeconds, plannedSecs]);

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
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useSessionTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useSessionTimer must be used within a TimerProvider");
  }
  return context;
}
