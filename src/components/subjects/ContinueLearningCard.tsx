"use client";

import Link from "next/link";
import { Play, Clock, Sparkles } from "lucide-react";
import type { Subject } from "@/types/subjects";
import { getSubjectStats, formatMinutes } from "@/lib/learning-progress";

interface ContinueLearningCardProps {
  subjects: Subject[];
}

export function ContinueLearningCard({ subjects }: ContinueLearningCardProps) {
  // Find subject with an active IN_PROGRESS item, or fallback to first subject with incomplete items
  let activeSubject: Subject | undefined;
  let activeTopicName = "";
  let activeItemTitle = "";
  let activeItemTime = 0;
  let activeItemPriority = "HIGH";

  for (const subject of subjects) {
    const stats = getSubjectStats(subject);
    if (stats.activeItem && stats.activeTopic) {
      activeSubject = subject;
      activeTopicName = stats.activeTopic.name;
      activeItemTitle = stats.activeItem.title;
      activeItemTime = stats.activeItem.estimatedMinutes;
      activeItemPriority = stats.activeItem.priority;
      break;
    }
  }

  if (!activeSubject) return null;

  return (
    <div
      className="mb-4 rounded-[10px] p-[18px]"
      style={{
        background: `linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(167,139,250,0.04) 100%), #13131a`,
        border: "1px solid rgba(34,211,238,0.18)",
      }}
    >
      <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
        <div className="flex-1">
          {/* Header Tag */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded px-2 py-0.5" style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}>
              <Sparkles size={10} style={{ color: "#22d3ee" }} />
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.8px]" style={{ color: "#22d3ee" }}>
                Continue Where You Left Off
              </span>
            </div>
            <span className="text-[11px]" style={{ color: "#5a5a6a" }}>
              Active Learning Session
            </span>
          </div>

          {/* Subject & Topic details */}
          <div className="mb-1 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: activeSubject.color }}
            />
            <span className="text-[12px] font-medium" style={{ color: activeSubject.color }}>
              {activeSubject.name}
            </span>
            <span className="text-[11px]" style={{ color: "#3a3a4a" }}>
              ·
            </span>
            <span className="text-[12px]" style={{ color: "#8a8a9e" }}>
              {activeTopicName}
            </span>
          </div>

          {/* Title */}
          <h2 className="m-0 text-base font-bold tracking-tight text-[#f0f0f4]">
            {activeItemTitle}
          </h2>

          {/* Metadata */}
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11.5px]" style={{ color: "#a0a0b8" }}>
              <Clock size={11} style={{ color: "#f59e0b" }} />
              <span>~{formatMinutes(activeItemTime)} estimated</span>
            </div>
            <span className="text-[10px]" style={{ color: "#3a3a4a" }}>
              ·
            </span>
            <span
              className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.5px]"
              style={{
                color:
                  activeItemPriority === "HIGH"
                    ? "#ef4444"
                    : activeItemPriority === "MEDIUM"
                    ? "#f59e0b"
                    : "#6b6b80",
              }}
            >
              {activeItemPriority} Priority
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/subjects/${activeSubject.id}`}
          className="flex cursor-pointer items-center gap-2 rounded-[7px] px-5 py-2.5 text-[12.5px] font-semibold no-underline shadow-sm transition-all"
          style={{
            background: "linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)",
            color: "#000",
          }}
        >
          <Play size={13} fill="#000" />
          Continue Learning
        </Link>
      </div>
    </div>
  );
}
