"use client";

import { useState } from "react";
import { Play, Clock } from "lucide-react";
import type { StudySession, SessionStatus } from "@/types/dashboard";

interface HeroNextSessionProps {
  session: StudySession;
  sessionIndex: number;
  totalSessions: number;
}

export function HeroNextSession({
  session,
  sessionIndex,
  totalSessions,
}: HeroNextSessionProps) {
  const [status, setStatus] = useState<SessionStatus>(session.status);
  const isActive = status === "active";

  const cycleStatus = () => {
    const order: SessionStatus[] = [
      "upcoming",
      "starting-soon",
      "active",
      "paused",
      "completed",
    ];
    const idx = order.indexOf(status);
    setStatus(order[(idx + 1) % order.length]);
  };

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-[10px] px-6 py-5"
      style={{
        background: "#13131a",
        border: `1px solid ${isActive ? "rgba(34,197,94,0.25)" : "rgba(34,211,238,0.18)"}`,
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 right-0 left-0 h-px"
        style={{
          background: isActive
            ? "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)"
            : "linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)",
        }}
      />

      <div className="flex items-center justify-between">
        {/* Left: session info */}
        <div className="flex-1">
          <div className="mb-2.5 flex items-center gap-2">
            <div
              className="rounded px-2 py-[3px]"
              style={{
                background: isActive
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(34,211,238,0.1)",
                border: `1px solid ${isActive ? "rgba(34,197,94,0.25)" : "rgba(34,211,238,0.2)"}`,
              }}
            >
              <span
                className="font-mono text-[9.5px] font-bold uppercase tracking-[1px]"
                style={{ color: isActive ? "#22c55e" : "#22d3ee" }}
              >
                {isActive ? "● ACTIVE" : "NEXT SESSION"}
              </span>
            </div>
            <span
              className="font-mono text-[11px]"
              style={{ color: "#4a4a5a" }}
            >
              · Session {sessionIndex + 1} of {totalSessions}
            </span>
          </div>

          <div className="mb-1.5 flex items-baseline gap-3">
            <h2 className="m-0 text-[22px] font-bold tracking-tight text-[#f0f0f4]">
              {session.subject}
            </h2>
            <span
              className="text-sm"
              style={{ color: "#8a8a9e" }}
            >
              ·
            </span>
            <span
              className="text-[15px]"
              style={{ color: "#b0b0c8" }}
            >
              {session.topic}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-[5px]"
              style={{ color: "#6b6b80" }}
            >
              <Clock size={12} />
              <span
                className="font-mono text-xs"
                style={{ color: "#a0a0b8" }}
              >
                {session.timeRange}
              </span>
            </div>
            <span className="text-[11px]" style={{ color: "#3a3a4a" }}>
              ·
            </span>
            <span
              className="font-mono text-xs"
              style={{ color: "#6b6b80" }}
            >
              {session.duration} planned
            </span>
            <span className="text-[11px]" style={{ color: "#3a3a4a" }}>
              ·
            </span>
            <span className="text-xs" style={{ color: "#6b6b80" }}>
              {isActive
                ? "In progress — 1h 47m remaining"
                : "Starts in 18 minutes"}
            </span>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            onClick={cycleStatus}
            className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[7px] px-6 py-2.5 text-[13px] font-semibold tracking-[0.2px]"
            style={{
              border: `1px solid ${isActive ? "rgba(34,197,94,0.35)" : "rgba(34,211,238,0.35)"}`,
              background: isActive
                ? "rgba(34,197,94,0.1)"
                : "rgba(34,211,238,0.1)",
              color: isActive ? "#22c55e" : "#22d3ee",
              transition: "all 0.15s ease",
            }}
          >
            {isActive ? (
              <>
                <span className="text-[10px]">⏸</span> Pause Session
              </>
            ) : (
              <>
                <Play size={11} /> Start Study Session
              </>
            )}
          </button>
          <span className="text-[10.5px]" style={{ color: "#4a4a5a" }}>
            Click to cycle status demo
          </span>
        </div>
      </div>
    </div>
  );
}
