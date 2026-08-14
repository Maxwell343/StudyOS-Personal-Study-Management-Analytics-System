"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatErrorMessage } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { JarvisInsightBar } from "@/components/dashboard/JarvisInsightBar";
import { DailyMetricsGrid } from "@/components/dashboard/DailyMetricsGrid";
import { DailyProgressCard } from "@/components/dashboard/DailyProgressCard";
import { HeroNextSession } from "@/components/dashboard/HeroNextSession";
import { MissionList } from "@/components/dashboard/MissionList";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { WeeklyAnalytics } from "@/components/dashboard/WeeklyAnalytics";
import { RescheduleSessionModal } from "@/components/dashboard/RescheduleSessionModal";
import { SessionTopicModal } from "@/components/dashboard/SessionTopicModal";
import { AddSessionDialog } from "@/components/planner/AddSessionDialog";
import { useAuth } from "@/context/AuthContext";
import { useSessionTimer } from "@/context/TimerContext";
import {
  fetchDashboardData,
  deletePlannedSessionFromDb,
  movePlannedSessionToTomorrow,
  reschedulePlannedSessionCustom,
  addPlannedSessionToToday,
  updatePlannedSessionStatusInDb,
  DashboardData,
} from "@/lib/data-access/dashboard";
import { extractAvailableTasksFromSubjects } from "@/lib/data-access/planner";
import type { DailyMetric, WeeklyDataPoint, StudySession, SessionStatus } from "@/types/dashboard";
import type { PlanSession, PlannedTask } from "@/types/planner";
import { Loader2 } from "lucide-react";

const DEFAULT_METRICS: DailyMetric[] = [
  {
    label: "TOTAL STUDY TIME",
    value: "0.0h",
    sub: "No target set",
    iconName: "Clock",
    iconColor: "#22d3ee",
    iconBg: "rgba(34,211,238,0.1)",
  },
  {
    label: "FOCUS SESSIONS",
    value: "0",
    sub: "0 planned today",
    iconName: "Target",
    iconColor: "#34d399",
    iconBg: "rgba(52,211,153,0.1)",
  },
  {
    label: "CURRENT STREAK",
    value: "0d",
    sub: "0 days streak",
    iconName: "Flame",
    iconColor: "#f97316",
    iconBg: "rgba(249,115,22,0.1)",
  },
  {
    label: "PLAN ADHERENCE",
    value: "0%",
    sub: "No target",
    iconName: "Zap",
    iconColor: "#a78bfa",
    iconBg: "rgba(167,139,250,0.1)",
  },
];

const DEFAULT_WEEKLY_DATA: WeeklyDataPoint[] = [
  { day: "Mon", hours: 0, target: 3.5 },
  { day: "Tue", hours: 0, target: 3.5 },
  { day: "Wed", hours: 0, target: 3.5 },
  { day: "Thu", hours: 0, target: 3.5 },
  { day: "Fri", hours: 0, target: 3.5 },
  { day: "Sat", hours: 0, target: 3.5 },
  { day: "Sun", hours: 0, target: 3.5 },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Reschedule Modal & Add Session Dialog States
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<StudySession | null>(null);
  const [selectedTopicSession, setSelectedTopicSession] = useState<StudySession | null>(null);
  const [addSessionDialogOpen, setAddSessionDialogOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (authLoading) return;

    if (!user) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          setData(null);
          setLoading(false);
        }
      });
      return;
    }

    fetchDashboardData(user.id)
      .then((res) => {
        if (!isCancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading dashboard data:", formatErrorMessage(err), err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [user, authLoading, refreshCount]);

  const { activeSession, abandonSession, startSession } = useSessionTimer();

  const handleStartSession = useCallback(
    async (session: StudySession) => {
      await startSession({
        plannedSessionId: session.id !== "default-session" ? session.id : undefined,
        plannedMinutes: session.plannedMinutes || 60,
        subjectName: session.subject,
        topicName: session.topic,
        title: `${session.subject}: ${session.topic}`,
      });
      setRefreshCount((c) => c + 1);
    },
    [startSession]
  );

  const availableTasks: PlannedTask[] = useMemo(() => {
    if (!data?.rawSubjects) return [];
    return extractAvailableTasksFromSubjects(data.rawSubjects);
  }, [data]);

  const availableSubjectOptions = useMemo(() => {
    if (!data?.rawSubjects) return [];
    return data.rawSubjects.map((s) => ({
      name: s.name,
      color: s.color,
    }));
  }, [data]);

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;
      if (confirm("Are you sure you want to delete this session from today's mission?")) {
        try {
          if (activeSession?.plannedSessionId === sessionId) {
            await abandonSession();
          }
          await deletePlannedSessionFromDb(user.id, sessionId);
          setRefreshCount((c) => c + 1);
        } catch (err) {
          console.error("Error deleting planned session:", err);
        }
      }
    },
    [user, activeSession, abandonSession]
  );

  const handleMoveToTomorrow = useCallback(
    async (sessionId: string) => {
      if (!user) return;
      try {
        await movePlannedSessionToTomorrow(user.id, sessionId);
        setRefreshCount((c) => c + 1);
      } catch (err) {
        console.error("Error moving session to tomorrow:", err);
        alert("Failed to move session to tomorrow.");
      }
    },
    [user]
  );

  const handleMoveAllMissedToTomorrow = useCallback(async () => {
    if (!user || !data) return;
    const missed = data.todaySessions.filter((s) => s.status === "missed");
    if (missed.length === 0) return;

    try {
      await Promise.all(
        missed.map((s) => movePlannedSessionToTomorrow(user.id, s.id))
      );
      setRefreshCount((c) => c + 1);
    } catch (err) {
      console.error("Error moving missed sessions to tomorrow:", err);
      alert("Failed to move missed sessions.");
    }
  }, [user, data]);

  const handleOpenRescheduleModal = useCallback((session: StudySession) => {
    setSessionToReschedule(session);
    setRescheduleModalOpen(true);
  }, []);

  const handleConfirmReschedule = useCallback(
    async (options: {
      targetDate: string;
      startTime: string;
      endTime: string;
      plannedMinutes: number;
      topic?: string;
    }) => {
      if (!user || !sessionToReschedule) return;
      await reschedulePlannedSessionCustom(user.id, sessionToReschedule.id, options);
      setRefreshCount((c) => c + 1);
    },
    [user, sessionToReschedule]
  );

  const handleAddSessionToToday = useCallback(
    async (newSession: PlanSession) => {
      if (!user || !data?.rawSubjects) return;
      try {
        await addPlannedSessionToToday(user.id, newSession, data.rawSubjects);
        setRefreshCount((c) => c + 1);
        setAddSessionDialogOpen(false);
      } catch (err) {
        console.error("Error adding session to today:", err);
        alert("Failed to add session to today's plan.");
      }
    },
    [user, data]
  );

  const handleUpdateSessionStatus = useCallback(
    async (sessionId: string, newStatus: SessionStatus) => {
      if (!user) return;
      try {
        await updatePlannedSessionStatusInDb(user.id, sessionId, newStatus);
        setRefreshCount((c) => c + 1);
      } catch (err) {
        console.error("Error updating planned session status:", err);
      }
    },
    [user]
  );

  const activeSessions = data?.todaySessions || [];
  const nextSession = data?.nextSession || null;
  const metrics = data?.dailyMetrics || DEFAULT_METRICS;
  const subjectProgress = data?.subjectProgress || [];
  const weeklyData = data?.weeklyData || DEFAULT_WEEKLY_DATA;
  const targetMinutes = data?.targetMinutesToday ?? 0;
  const actualMinutes = data?.actualMinutesToday ?? 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Header />

        <div className="flex-1 px-9 pt-5 pb-10">
          {loading && !data ? (
            <div className="mt-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#22d3ee]" />
              <span className="text-xs text-[#6b6b80]">Loading live dashboard data...</span>
            </div>
          ) : (
            <>
              {/* JARVIS Insight */}
              <JarvisInsightBar message={data?.jarvisInsight.message} />

              {/* Hero: Next Session */}
              <HeroNextSession
                session={nextSession}
                sessionIndex={0}
                totalSessions={activeSessions.length}
                onSelectSession={(session) => setSelectedTopicSession(session)}
                onSessionUpdated={() => setRefreshCount((c) => c + 1)}
                onDeleteSession={handleDeleteSession}
                onMoveToTomorrow={handleMoveToTomorrow}
                onOpenRescheduleModal={handleOpenRescheduleModal}
              />

              {/* Daily Metrics */}
              <DailyMetricsGrid metrics={metrics} />

              {/* Daily Progress */}
              <DailyProgressCard
                targetMinutes={targetMinutes}
                actualMinutes={actualMinutes}
              />

              {/* Main Grid: Mission | Subjects */}
              <div
                className="mb-4 grid gap-4 items-stretch max-lg:grid-cols-1"
                style={{ gridTemplateColumns: "1fr 320px" }}
              >
                {/* Left column */}
                <div className="flex flex-col h-full">
                  <MissionList
                    sessions={activeSessions}
                    onSelectSession={(session) => setSelectedTopicSession(session)}
                    onStartSession={handleStartSession}
                    onDeleteSession={handleDeleteSession}
                    onMoveToTomorrow={handleMoveToTomorrow}
                    onOpenRescheduleModal={handleOpenRescheduleModal}
                    onMoveAllMissedToTomorrow={handleMoveAllMissedToTomorrow}
                    onAddSession={() => setAddSessionDialogOpen(true)}
                    onUpdateSessionStatus={handleUpdateSessionStatus}
                  />
                </div>

                {/* Right column */}
                <div className="flex flex-col h-full">
                  <SubjectProgress subjects={subjectProgress} />
                </div>
              </div>

              {/* Weekly Analytics */}
              <WeeklyAnalytics data={weeklyData} />
            </>
          )}
        </div>
      </main>

      {/* Planned Topic & Curriculum Items Modal */}
      <SessionTopicModal
        session={selectedTopicSession}
        userId={user?.id}
        isOpen={Boolean(selectedTopicSession)}
        onClose={() => setSelectedTopicSession(null)}
        onStartSession={handleStartSession}
        onRefreshData={() => setRefreshCount((c) => c + 1)}
      />

      {/* Reschedule Session Modal */}
      <RescheduleSessionModal
        open={rescheduleModalOpen}
        session={sessionToReschedule}
        onClose={() => {
          setRescheduleModalOpen(false);
          setSessionToReschedule(null);
        }}
        onConfirm={handleConfirmReschedule}
      />

      {/* Add Session to Today Dialog */}
      <AddSessionDialog
        open={addSessionDialogOpen}
        editingSession={null}
        availableTasks={availableTasks}
        availableSubjects={availableSubjectOptions}
        onClose={() => setAddSessionDialogOpen(false)}
        onSave={handleAddSessionToToday}
      />
    </div>
  );
}
