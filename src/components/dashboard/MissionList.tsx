"use client";

import { useState } from "react";
import type { StudySession, SessionStatus } from "@/types/dashboard";
import { MissionCard } from "./MissionCard";

interface MissionListProps {
  sessions: StudySession[];
}

export function MissionList({ sessions }: MissionListProps) {
  const [sessionStatuses, setSessionStatuses] = useState<
    Record<string, SessionStatus>
  >(Object.fromEntries(sessions.map((s) => [s.id, s.status])));

  const completedCount = Object.values(sessionStatuses).filter(
    (s) => s === "completed"
  ).length;

  const cycleSessionStatus = (id: string) => {
    const order: SessionStatus[] = [
      "upcoming",
      "starting-soon",
      "active",
      "paused",
      "completed",
    ];
    setSessionStatuses((prev) => {
      const current = prev[id];
      const idx = order.indexOf(current);
      const next = order[(idx + 1) % order.length];
      return { ...prev, [id]: next };
    });
  };

  return (
    <div
      className="rounded-[10px] px-[18px] py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
            Today&apos;s Mission
          </h2>
          <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
            · {sessions.length} sessions · 5h planned
          </span>
        </div>
        <span
          className="font-mono text-[10px]"
          style={{ color: "#4a4a5a" }}
        >
          {completedCount} / {sessions.length} complete
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {sessions.map((session, idx) => (
          <MissionCard
            key={session.id}
            session={session}
            status={sessionStatuses[session.id]}
            isNext={idx === 0}
            onCycle={() => cycleSessionStatus(session.id)}
          />
        ))}
      </div>
    </div>
  );
}
