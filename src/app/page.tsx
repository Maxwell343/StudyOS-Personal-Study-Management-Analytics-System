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
import {
  sessions,
  focusTasks,
  dailyTasks,
  subjects,
  weeklyData,
  dailyMetrics,
} from "@/data/mock-dashboard";

export default function DashboardPage() {
  const nextSession = sessions[0];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Header />

        <div className="flex-1 px-9 pt-5 pb-10">
          {/* JARVIS Insight */}
          <JarvisInsightBar />

          {/* Hero: Next Session */}
          <HeroNextSession
            session={nextSession}
            sessionIndex={0}
            totalSessions={sessions.length}
          />

          {/* Daily Metrics */}
          <DailyMetricsGrid metrics={dailyMetrics} />

          {/* Daily Progress */}
          <DailyProgressCard />

          {/* Main Grid: Mission + Focus | Tasks + Subjects */}
          <div className="mb-4 grid gap-4 max-lg:grid-cols-1" style={{ gridTemplateColumns: "1fr 320px" }}>
            {/* Left column */}
            <div className="flex flex-col gap-3.5">
              <MissionList sessions={sessions} />
              <CurrentFocusCard tasks={focusTasks} />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3.5">
              <TaskListCard tasks={dailyTasks} />
              <SubjectProgress subjects={subjects} />
            </div>
          </div>

          {/* Weekly Analytics */}
          <WeeklyAnalytics data={weeklyData} />
        </div>
      </main>
    </div>
  );
}
