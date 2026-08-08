import { useState } from "react";
import Link from "next/link";
import type { StudySession, SessionStatus } from "@/types/dashboard";
import { formatMinutes } from "@/lib/planner-utils";
import { MissionCard } from "./MissionCard";

interface MissionListProps {
  sessions: StudySession[];
}

export function MissionList({ sessions }: MissionListProps) {
  const [overrides, setOverrides] = useState<Record<string, SessionStatus>>({});

  const totalPlannedMinutes = sessions.reduce(
    (acc, s) => acc + (s.plannedMinutes || 0),
    0
  );
  const formattedDuration = formatMinutes(totalPlannedMinutes);

  const getStatus = (id: string, originalStatus: SessionStatus) =>
    overrides[id] || originalStatus;

  const completedCount = sessions.filter(
    (s) => getStatus(s.id, s.status) === "completed"
  ).length;

  const cycleSessionStatus = (id: string, originalStatus: SessionStatus) => {
    const order: SessionStatus[] = [
      "upcoming",
      "starting-soon",
      "active",
      "paused",
      "completed",
    ];
    setOverrides((prev) => {
      const current = prev[id] || originalStatus;
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
            · {sessions.length} session{sessions.length !== 1 ? "s" : ""} ·{" "}
            {formattedDuration} planned
          </span>
        </div>
        <span
          className="font-mono text-[10px]"
          style={{ color: "#4a4a5a" }}
        >
          {completedCount} / {sessions.length} complete
        </span>
      </div>

      {sessions.length === 0 ? (
        <div
          className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-6 text-center text-xs"
          style={{ color: "#5a5a6a" }}
        >
          No study sessions planned for today. Use{" "}
          <Link
            href="/plan-tomorrow"
            className="text-[#22d3ee] underline underline-offset-2 hover:text-[#38bdf8]"
          >
            Plan Tomorrow
          </Link>{" "}
          to schedule your focused missions.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session, idx) => (
            <MissionCard
              key={session.id}
              session={session}
              status={getStatus(session.id, session.status)}
              isNext={idx === 0}
              onCycle={() => cycleSessionStatus(session.id, session.status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
