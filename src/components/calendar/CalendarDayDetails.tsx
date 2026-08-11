"use client";

import { X, Calendar, Clock, CheckCircle2, AlertCircle, Play, Sparkles } from "lucide-react";
import type { CalendarDayData, CalendarSession } from "@/types/calendar";
import { formatMinutes } from "@/lib/planner-utils";

interface CalendarDayDetailsProps {
  open: boolean;
  day: CalendarDayData | null;
  onClose: () => void;
  onMoveToTomorrow: (sessionId: string) => Promise<void>;
  onRescheduleSession: (session: CalendarSession) => void;
  onStartSession?: (session: CalendarSession) => void;
}

function isSessionStartable(day: CalendarDayData, session: CalendarSession): boolean {
  if (!day.isToday) return false;

  if (
    session.status === "active" ||
    session.status === "paused" ||
    session.status === "starting-soon" ||
    session.status === "behind-schedule"
  ) {
    return true;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const startTimeStr = session.startTime || session.timeRange.split("-")[0]?.trim() || "00:00";
  const endTimeStr = session.endTime || session.timeRange.split("-")[1]?.trim() || "23:59";

  const [sh, sm] = startTimeStr.slice(0, 5).split(":").map(Number);
  const startMinutes = (sh || 0) * 60 + (sm || 0);

  const [eh, em] = endTimeStr.slice(0, 5).split(":").map(Number);
  const endMinutes = (eh || 0) * 60 + (em || 0);

  return nowMinutes >= startMinutes - 15 && nowMinutes <= endMinutes;
}

export function CalendarDayDetails({
  open,
  day,
  onClose,
  onMoveToTomorrow,
  onRescheduleSession,
  onStartSession,
}: CalendarDayDetailsProps) {
  if (!open || !day) return null;

  // Group sessions by status category
  const completedSessions = day.sessions.filter((s) => s.status === "completed");
  const activeSessions = day.sessions.filter((s) => s.status === "active" || s.status === "paused");
  const missedSessions = day.sessions.filter((s) => s.status === "missed");
  const upcomingSessions = day.sessions.filter((s) => s.status === "upcoming" || s.status === "starting-soon" || s.status === "behind-schedule");
  const abandonedSessions = day.sessions.filter((s) => s.status === "abandoned");

  // Format Date (e.g. August 10, 2026)
  const d = new Date(day.dateStr + "T00:00:00");
  const dateTitle = d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div
        className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 shadow-2xl transition-all animate-in slide-in-from-right duration-200"
        style={{ background: "#13131a" }}
      >
        {/* Top Glow Accent */}
        <div
          className="absolute top-0 right-0 left-0 h-1"
          style={{
            background: "linear-gradient(90deg, #22d3ee, #22c55e, #f59e0b, #ef4444)",
          }}
        />

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="m-0 text-base font-bold text-[#f0f0f4]">
                {dateTitle}
              </h3>
              {day.isToday && (
                <span className="rounded bg-[#22d3ee]/15 border border-[#22d3ee]/30 px-2 py-0.5 text-[10px] font-bold text-[#22d3ee]">
                  TODAY
                </span>
              )}
            </div>
            <p className="m-0 text-xs text-[#8a8a9e]">
              Day overview &amp; session log
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b6b80] hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Header Card */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3.5">
            <div>
              <span className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">
                Daily Adherence
              </span>
              <div className="font-mono text-xl font-bold text-[#22d3ee]">
                {day.adherencePercent}%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">
                Planned / Actual
              </span>
              <div className="font-mono text-xs font-semibold text-[#f0f0f4]">
                {formatMinutes(day.plannedMinutes)} planned · <span className="text-[#22c55e]">{formatMinutes(day.actualMinutes)} actual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Groups Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {day.sessions.length === 0 && (
            <div className="py-12 text-center text-xs text-[#5a5a6a]">
              No study sessions scheduled for this date.
            </div>
          )}

          {/* ACTIVE / PAUSED SESSIONS */}
          {activeSessions.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#22c55e] uppercase tracking-wider">
                <Sparkles size={13} /> Active Session
              </div>
              <div className="space-y-2">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#f0f0f4]">
                          {session.subject}
                        </span>
                        <span className="mx-1 text-white/20">·</span>
                        <span className="text-xs text-[#b0b0c8]">
                          {session.topic}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#22c55e]">
                        {session.status === "paused" ? "PAUSED" : "ACTIVE"}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[#8a8a9e]">
                      {session.timeRange} ({formatMinutes(session.plannedMinutes)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPLETED SESSIONS */}
          {completedSessions.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 size={13} /> Completed ({completedSessions.length})
              </div>
              <div className="space-y-2">
                {completedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#f0f0f4]">
                        ✓ {session.subject} — {session.topic}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {formatMinutes(session.actualMinutes || session.plannedMinutes)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-[#8a8a9e]">
                      <span>Slot: {session.timeRange}</span>
                      <span>Planned: {formatMinutes(session.plannedMinutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MISSED SESSIONS */}
          {missedSessions.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                <AlertCircle size={13} /> Missed ({missedSessions.length})
              </div>
              <div className="space-y-2">
                {missedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-red-500/25 bg-red-500/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-200">
                        ✕ {session.subject} — {session.topic}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-red-400 uppercase">
                        MISSED
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[#8a8a9e]">
                      Time slot: {session.timeRange} ({formatMinutes(session.plannedMinutes)})
                    </div>
                    {/* Action buttons */}
                    <div className="mt-2.5 flex items-center gap-2 pt-1 border-t border-red-500/15">
                      <button
                        type="button"
                        onClick={() => onMoveToTomorrow(session.id)}
                        className="flex cursor-pointer items-center gap-1 rounded bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2.5 py-1 text-[11px] font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
                      >
                        <Calendar size={11} /> Move to Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => onRescheduleSession(session)}
                        className="flex cursor-pointer items-center gap-1 rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                      >
                        <Clock size={11} /> Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING / PLANNED SESSIONS */}
          {upcomingSessions.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#22d3ee] uppercase tracking-wider">
                <Clock size={13} /> Upcoming ({upcomingSessions.length})
              </div>
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#f0f0f4]">
                        {session.subject} — {session.topic}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#22d3ee]">
                        {session.timeRange}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-1">
                      <span className="font-mono text-[11px] text-[#8a8a9e]">
                        {formatMinutes(session.plannedMinutes)} planned
                      </span>
                      {onStartSession && isSessionStartable(day, session) && (
                        <button
                          type="button"
                          onClick={() => onStartSession(session)}
                          className="flex cursor-pointer items-center gap-1 rounded border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-2.5 py-1 text-[11px] font-semibold text-[#22d3ee] hover:bg-[#22d3ee]/20 transition"
                        >
                          <Play size={10} /> Start
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABANDONED SESSIONS */}
          {abandonedSessions.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-bold text-[#6b6b80] uppercase tracking-wider">
                Abandoned ({abandonedSessions.length})
              </div>
              <div className="space-y-2 opacity-60">
                {abandonedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-white/5 bg-white/[0.01] p-3"
                  >
                    <span className="text-xs font-bold text-[#8a8a9e] line-through">
                      {session.subject} — {session.topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Summary Footer */}
        <div className="border-t border-white/10 p-5 bg-[#0d0d12]">
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[#8a8a9e]">
              <span>Planned Study</span>
              <span>{formatMinutes(day.plannedMinutes)}</span>
            </div>
            <div className="flex items-center justify-between text-[#f0f0f4]">
              <span>Actual Logged</span>
              <span className="text-[#22c55e] font-bold">{formatMinutes(day.actualMinutes)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[#22d3ee] font-bold">
              <span>Plan Adherence</span>
              <span>{day.adherencePercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
