"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatErrorMessage } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { CalendarDayDetails } from "@/components/calendar/CalendarDayDetails";
import { RescheduleSessionModal } from "@/components/dashboard/RescheduleSessionModal";
import { useAuth } from "@/context/AuthContext";
import { useSessionTimer } from "@/context/TimerContext";
import { getTodayDateString } from "@/lib/data-access/planner";
import { fetchCalendarMonthData, CalendarMonthResult } from "@/lib/data-access/calendar";
import { fetchSubjectsForUser } from "@/lib/data-access/subjects";
import {
  movePlannedSessionToTomorrow,
  reschedulePlannedSessionCustom,
} from "@/lib/data-access/dashboard";
import type { CalendarDayData, CalendarSession, CalendarFilterOptions } from "@/types/calendar";
import type { StudySession } from "@/types/dashboard";
import type { Subject } from "@/types/subjects";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Today's year and month
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth() + 1); // 1..12

  // Selected date & data states
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [monthData, setMonthData] = useState<CalendarMonthResult | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filters state
  const [filters, setFilters] = useState<CalendarFilterOptions>({
    status: "all",
    subjectId: "all",
  });

  // Day Details Drawer State
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<CalendarDayData | null>(null);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<StudySession | null>(null);

  const { startSession } = useSessionTimer();

  // Load calendar month data & user subjects
  useEffect(() => {
    let isCancelled = false;

    if (authLoading) return;

    if (!user) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          setMonthData(null);
          setSubjects([]);
          setLoading(false);
        }
      });
      return;
    }

    async function loadData() {
      try {
        if (!user) return;
        const [calRes, userSubjects] = await Promise.all([
          fetchCalendarMonthData(user.id, currentYear, currentMonth),
          fetchSubjectsForUser(user.id),
        ]);

        if (isCancelled) return;

        setMonthData(calRes);
        setSubjects(userSubjects);

        // Update selectedDayData if drawer is open for a date
        if (selectedDateStr) {
          const updatedDay = calRes.days.find((d) => d.dateStr === selectedDateStr);
          if (updatedDay) setSelectedDayData(updatedDay);
        }
      } catch (err) {
        console.error("Error loading calendar data:", formatErrorMessage(err), err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user, authLoading, currentYear, currentMonth, refreshCount, selectedDateStr]);

  // Month navigation handlers
  const handlePrevMonth = useCallback(() => {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  }, [currentMonth, currentYear, setCurrentMonth, setCurrentYear]);

  const handleNextMonth = useCallback(() => {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  }, [currentMonth, currentYear, setCurrentMonth, setCurrentYear]);

  const handleGoToday = useCallback(() => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth() + 1);
    setSelectedDateStr(todayStr);

    if (monthData) {
      const todayDay = monthData.days.find((cell) => cell.dateStr === todayStr);
      if (todayDay) {
        setSelectedDayData(todayDay);
        setDayDrawerOpen(true);
      }
    }
  }, [todayStr, monthData, setCurrentYear, setCurrentMonth, setSelectedDateStr, setSelectedDayData, setDayDrawerOpen]);

  const handleSelectDay = useCallback((day: CalendarDayData) => {
    setSelectedDateStr(day.dateStr);
    setSelectedDayData(day);
    setDayDrawerOpen(true);
  }, []);

  const handleSelectSession = useCallback((session: CalendarSession, day: CalendarDayData) => {
    setSelectedDateStr(day.dateStr);
    setSelectedDayData(day);
    setDayDrawerOpen(true);

    if (session.status === "missed") {
      const mappedSession: StudySession = {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        timeRange: session.timeRange,
        subject: session.subject,
        topic: session.topic,
        duration: `${session.plannedMinutes}m`,
        plannedMinutes: session.plannedMinutes,
        status: session.status,
        color: session.color,
      };
      setSessionToReschedule(mappedSession);
      setRescheduleModalOpen(true);
    }
  }, []);

  // Reschedule & Move Handlers (Reusing existing StudyOS data-access)
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

  const handleOpenRescheduleFromSession = useCallback((session: CalendarSession) => {
    const mappedSession: StudySession = {
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      timeRange: session.timeRange,
      subject: session.subject,
      topic: session.topic,
      duration: `${session.plannedMinutes}m`,
      plannedMinutes: session.plannedMinutes,
      status: session.status,
      color: session.color,
    };
    setSessionToReschedule(mappedSession);
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

  const handleStartSession = useCallback(
    async (session: CalendarSession) => {
      await startSession({
        plannedSessionId: session.id,
        plannedMinutes: session.plannedMinutes,
        subjectName: session.subject,
        topicName: session.topic,
        title: `${session.subject}: ${session.topic}`,
      });
      setRefreshCount((c) => c + 1);
    },
    [startSession]
  );

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({
      id: s.name,
      name: s.name,
      color: s.color,
    }));
  }, [subjects]);

  const stats = monthData?.monthStats || {
    totalPlannedMinutes: 0,
    totalActualMinutes: 0,
    completedCount: 0,
    missedCount: 0,
    adherencePercent: 0,
  };

  const days = monthData?.days || [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Header />

        <div className="flex-1 px-9 pt-5 pb-10">
          {loading && !monthData ? (
            <div className="mt-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#22d3ee]" />
              <span className="text-xs text-[#6b6b80]">
                Loading calendar view...
              </span>
            </div>
          ) : (
            <>
              {/* Header with Month Navigation & Main Stats Bar */}
              <CalendarHeader
                currentYear={currentYear}
                currentMonth={currentMonth}
                stats={stats}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onGoToday={handleGoToday}
              />

              {/* Main Calendar View: Left Sidebar + 7-Column Grid */}
              <div className="flex flex-col gap-5 lg:flex-row">
                <CalendarSidebar
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  selectedDateStr={selectedDateStr}
                  filters={filters}
                  subjects={subjectOptions}
                  onSelectDate={(dateStr) => {
                    setSelectedDateStr(dateStr);
                    const found = days.find((d) => d.dateStr === dateStr);
                    if (found) {
                      setSelectedDayData(found);
                      setDayDrawerOpen(true);
                    }
                  }}
                  onMonthChange={(y, m) => {
                    setCurrentYear(y);
                    setCurrentMonth(m);
                  }}
                  onGoToday={handleGoToday}
                  onFilterChange={setFilters}
                />

                <MonthGrid
                  days={days}
                  selectedDateStr={selectedDateStr}
                  filters={filters}
                  onSelectDay={handleSelectDay}
                  onSelectSession={handleSelectSession}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Day Details Drawer */}
      <CalendarDayDetails
        open={dayDrawerOpen}
        day={selectedDayData}
        onClose={() => setDayDrawerOpen(false)}
        onMoveToTomorrow={handleMoveToTomorrow}
        onRescheduleSession={handleOpenRescheduleFromSession}
        onStartSession={handleStartSession}
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
    </div>
  );
}
