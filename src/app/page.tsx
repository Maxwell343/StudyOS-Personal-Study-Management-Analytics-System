"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { JarvisInsightBar } from "@/components/dashboard/JarvisInsightBar";
import { DailyMetricsGrid } from "@/components/dashboard/DailyMetricsGrid";
import { DailyProgressCard } from "@/components/dashboard/DailyProgressCard";
import { HeroNextSession } from "@/components/dashboard/HeroNextSession";
import { MissionList } from "@/components/dashboard/MissionList";
import { CurrentFocusCard } from "@/components/dashboard/CurrentFocusCard";
import { TaskListCard } from "@/components/dashboard/TaskListCard";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { WeeklyAnalytics } from "@/components/dashboard/WeeklyAnalytics";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboardData, DashboardData } from "@/lib/data-access/dashboard";
import { toggleLearningItemCompletionInDb } from "@/lib/data-access/subjects";
import type { DailyMetric, WeeklyDataPoint } from "@/types/dashboard";
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
        console.error("Error loading dashboard data:", err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [user, authLoading, refreshCount]);

  const handleToggleTask = useCallback(
    async (taskId: string, done: boolean) => {
      if (!user) return;
      try {
        const currentStatus = done ? "NOT_STARTED" : "COMPLETED";
        await toggleLearningItemCompletionInDb(taskId, currentStatus, user.id);
        // Refresh metrics quietly in background
        setRefreshCount((c) => c + 1);
      } catch (err) {
        console.error("Error toggling task completion:", err);
      }
    },
    [user]
  );

  const activeSessions = data?.todaySessions || [];
  const nextSession = data?.nextSession || null;
  const metrics = data?.dailyMetrics || DEFAULT_METRICS;
  const focusTasks = data?.focusTasks || [];
  const dailyTasks = data?.dailyTasks || [];
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
                onSessionUpdated={() => setRefreshCount((c) => c + 1)}
              />

              {/* Daily Metrics */}
              <DailyMetricsGrid metrics={metrics} />

              {/* Daily Progress */}
              <DailyProgressCard
                targetMinutes={targetMinutes}
                actualMinutes={actualMinutes}
              />

              {/* Main Grid: Mission + Focus | Tasks + Subjects */}
              <div
                className="mb-4 grid gap-4 max-lg:grid-cols-1"
                style={{ gridTemplateColumns: "1fr 320px" }}
              >
                {/* Left column */}
                <div className="flex flex-col gap-3.5">
                  <MissionList sessions={activeSessions} />
                  <CurrentFocusCard tasks={focusTasks} />
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-3.5">
                  <TaskListCard
                    tasks={dailyTasks}
                    onToggleTask={handleToggleTask}
                  />
                  <SubjectProgress subjects={subjectProgress} />
                </div>
              </div>

              {/* Weekly Analytics */}
              <WeeklyAnalytics data={weeklyData} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
