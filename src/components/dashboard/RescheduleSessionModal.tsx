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
          setTargetDate(tomorrow);
          setStartTime(session.startTime || "09:00");
          setEndTime(session.endTime || "10:00");
          setTopic(session.topic || "");
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [session, tomorrow]);

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
      alert("Failed to reschedule session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 p-6 shadow-2xl"
        style={{ background: "#13131a" }}
      >
        {/* Top Glow Accent */}
        <div
          className="absolute top-0 right-0 left-0 h-1"
          style={{
            background: "linear-gradient(90deg, #ef4444, #f59e0b, #22d3ee)",
          }}
        />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
            >
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="m-0 text-base font-bold text-[#f0f0f4]">
                Reschedule Session
              </h3>
              <p className="m-0 text-xs text-[#8a8a9e]">
                {session.subject} — {session.topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b6b80] hover:bg-white/5 hover:text-[#f0f0f4]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Presets */}
        <div className="mb-5 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">
            Quick Actions
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset("tomorrow-same")}
              className="flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-center text-xs font-medium transition hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/5"
            >
              <Sparkles size={14} className="mb-1 text-[#22d3ee]" />
              <span className="text-[#f0f0f4]">Tomorrow</span>
              <span className="text-[10px] text-[#6b6b80]">Same Time</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("today-now")}
              className="flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-center text-xs font-medium transition hover:border-[#34d399]/40 hover:bg-[#34d399]/5"
            >
              <Clock size={14} className="mb-1 text-[#34d399]" />
              <span className="text-[#f0f0f4]">Today</span>
              <span className="text-[10px] text-[#6b6b80]">Start Now</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("today-tonight")}
              className="flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-center text-xs font-medium transition hover:border-[#a78bfa]/40 hover:bg-[#a78bfa]/5"
            >
              <ArrowRight size={14} className="mb-1 text-[#a78bfa]" />
              <span className="text-[#f0f0f4]">Tonight</span>
              <span className="text-[10px] text-[#6b6b80]">22:00 - 23:00</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#b0b0c8]">
              Target Schedule Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetDate(today)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  targetDate === today
                    ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]"
                    : "border-white/10 bg-white/5 text-[#8a8a9e] hover:bg-white/10"
                }`}
              >
                Today ({today})
              </button>

              <button
                type="button"
                onClick={() => setTargetDate(tomorrow)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  targetDate === tomorrow
                    ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]"
                    : "border-white/10 bg-white/5 text-[#8a8a9e] hover:bg-white/10"
                }`}
              >
                Tomorrow ({tomorrow})
              </button>
            </div>
          </div>

          {/* Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#b0b0c8]">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 py-2 text-xs text-[#f0f0f4] outline-none focus:border-[#22d3ee]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#b0b0c8]">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 py-2 text-xs text-[#f0f0f4] outline-none focus:border-[#22d3ee]"
              />
            </div>
          </div>

          {/* Topic Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#b0b0c8]">
              Topic / Note
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. DBMS Foundations"
              className="w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 py-2 text-xs text-[#f0f0f4] outline-none focus:border-[#22d3ee]"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-[#8a8a9e] transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg border border-[#22d3ee]/40 bg-[#22d3ee]/15 px-5 py-2 text-xs font-bold text-[#22d3ee] transition hover:bg-[#22d3ee]/25 disabled:opacity-50"
            >
              {submitting ? "Rescheduling..." : "Save Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
