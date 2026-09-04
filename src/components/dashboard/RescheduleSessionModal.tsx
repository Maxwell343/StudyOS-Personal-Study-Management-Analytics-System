"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import type { StudySession } from "@/types/dashboard";
import { getTodayDateString, getTomorrowDateString } from "@/lib/data-access/planner";

interface RescheduleSessionModalProps {
  open: boolean;
  session: StudySession | null;
  onClose: () => void;
  onConfirm: (options: {
    targetDate: string;
    startTime: string;
    endTime: string;
    plannedMinutes: number;
    topic?: string;
  }) => Promise<void>;
}

export function RescheduleSessionModal({
  open,
  session,
  onClose,
  onConfirm,
}: RescheduleSessionModalProps) {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const [targetDate, setTargetDate] = useState<string>(tomorrow);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [topic, setTopic] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      let isMounted = true;
      Promise.resolve().then(() => {
        if (isMounted) {
          setTargetDate(today);
          setStartTime(session.startTime || "09:00");
          setEndTime(session.endTime || "10:00");
          setTopic(session.topic || "");
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [session, today]);

  if (!open || !session) return null;

  const handleApplyPreset = (preset: "tomorrow-same" | "today-now" | "today-tonight") => {
    if (preset === "tomorrow-same") {
      setTargetDate(tomorrow);
      setStartTime(session.startTime || "09:00");
      setEndTime(session.endTime || "10:00");
    } else if (preset === "today-now") {
      setTargetDate(today);
      const d = new Date();
      // start 5 mins from now rounded up to 5 min interval
      const nowMs = d.getTime() + 5 * 60 * 1000;
      const startDate = new Date(nowMs);
      const sh = String(startDate.getHours()).padStart(2, "0");
      const sm = String(Math.ceil(startDate.getMinutes() / 5) * 5 % 60).padStart(2, "0");
      
      const dur = session.plannedMinutes || 60;
      const endDate = new Date(startDate.getTime() + dur * 60 * 1000);
      const eh = String(endDate.getHours()).padStart(2, "0");
      const em = String(endDate.getMinutes()).padStart(2, "0");

      setStartTime(`${sh}:${sm}`);
      setEndTime(`${eh}:${em}`);
    } else if (preset === "today-tonight") {
      setTargetDate(today);
      setStartTime("22:00");
      setEndTime("23:00");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const plannedMinutes = Math.max(15, (eh * 60 + em) - (sh * 60 + sm));

      await onConfirm({
        targetDate,
        startTime,
        endTime,
        plannedMinutes,
        topic,
      });
      onClose();
    } catch (err) {
      console.error("Failed to reschedule session:", err);
      alert("Failed to save session schedule. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 shadow-2xl text-foreground"
      >
        {/* Top Glow Accent */}
        <div
          className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500"
        />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400"
            >
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="m-0 text-base font-bold text-foreground">
                Edit / Reschedule Session
              </h3>
              <p className="m-0 text-xs text-muted-foreground">
                {session.subject} — {session.topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Presets */}
        <div className="mb-5 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset("tomorrow-same")}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/40 p-2.5 text-center text-xs font-medium transition hover:border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer shadow-2xs"
            >
              <Sparkles size={14} className="mb-1 text-cyan-600 dark:text-cyan-400" />
              <span className="text-foreground">Tomorrow</span>
              <span className="text-[10px] text-muted-foreground">Same Time</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("today-now")}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/40 p-2.5 text-center text-xs font-medium transition hover:border-emerald-500/40 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
            >
              <Clock size={14} className="mb-1 text-emerald-600 dark:text-emerald-400" />
              <span className="text-foreground">Today</span>
              <span className="text-[10px] text-muted-foreground">Start Now</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("today-tonight")}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/40 p-2.5 text-center text-xs font-medium transition hover:border-purple-500/40 hover:bg-purple-500/10 cursor-pointer shadow-2xs"
            >
              <ArrowRight size={14} className="mb-1 text-purple-600 dark:text-purple-400" />
              <span className="text-foreground">Tonight</span>
              <span className="text-[10px] text-muted-foreground">22:00 - 23:00</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/80">
              Target Schedule Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetDate(today)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                  targetDate === today
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                    : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Today ({today})
              </button>

              <button
                type="button"
                onClick={() => setTargetDate(tomorrow)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                  targetDate === tomorrow
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                    : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Tomorrow ({tomorrow})
              </button>
            </div>
          </div>

          {/* Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground/80">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Topic Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/80">
              Topic / Note
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. DBMS Foundations"
              className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground outline-none focus:border-cyan-500 placeholder:text-muted-foreground/50 transition"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-5 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 transition hover:bg-cyan-500/30 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {submitting ? "Rescheduling..." : "Save Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
