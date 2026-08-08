import { CheckCircle2, PlayCircle, Clock } from "lucide-react";
import type { RecentActivityItem } from "@/types/subjects";

interface RecentActivityListProps {
  activities: RecentActivityItem[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <div
      className="rounded-[10px] p-[18px]"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
          Recent Learning Activity
        </h3>
        <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
          Live Log
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {activities.map((act) => {
          const isCompleted = act.type === "completed";
          return (
            <div
              key={act.id}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                  style={{
                    background: isCompleted
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(34,211,238,0.1)",
                    color: isCompleted ? "#22c55e" : "#22d3ee",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <PlayCircle size={12} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.5px]"
                      style={{ color: act.subjectColor }}
                    >
                      {act.subjectName}
                    </span>
                    <span className="text-[9px]" style={{ color: "#3a3a4a" }}>
                      ·
                    </span>
                    <span className="text-[11px]" style={{ color: "#7a7a8e" }}>
                      {act.topicName}
                    </span>
                  </div>
                  <div className="text-[12.5px] font-medium text-[#e0e0ec]">
                    {act.learningItemTitle}
                  </div>
                </div>
              </div>

              <div
                className="flex shrink-0 items-center gap-1 font-mono text-[10.5px]"
                style={{ color: "#5a5a6a" }}
              >
                <Clock size={10} />
                <span>{act.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
