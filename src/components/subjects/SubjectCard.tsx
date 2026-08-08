"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Clock } from "lucide-react";
import type { Subject } from "@/types/subjects";
import { getSubjectStats, formatMinutes } from "@/lib/learning-progress";

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const stats = getSubjectStats(subject);

  return (
    <div
      className="flex flex-col justify-between rounded-[10px] p-[18px]"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "border-color 0.15s ease",
      }}
    >
      {/* Top Section */}
      <div>
        {/* Header: Color Indicator, Name & Category */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{
                background: `${subject.color}15`,
                color: subject.color,
                border: `1px solid ${subject.color}30`,
              }}
            >
              <BookOpen size={15} />
            </div>
            <div>
              <h3 className="m-0 text-base font-bold tracking-tight text-[#f0f0f4]">
                {subject.name}
              </h3>
              <span
                className="text-[11px] font-medium"
                style={{ color: "#6b6b80" }}
              >
                {subject.category}
              </span>
            </div>
          </div>

          <div
            className="rounded px-2 py-0.5"
            style={{
              background: `${subject.color}10`,
              border: `1px solid ${subject.color}25`,
            }}
          >
            <span
              className="font-mono text-[10.5px] font-bold"
              style={{ color: subject.color }}
            >
              {stats.progressPercent}%
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          className="m-0 mb-4 line-clamp-2 text-[12px] leading-relaxed"
          style={{ color: "#7a7a8e" }}
        >
          {subject.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-3.5">
          <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
            <span style={{ color: "#a0a0b8" }}>
              <strong className="font-mono text-[#f0f0f4]">{stats.completedItems}</strong>
              {" / "}
              <span className="font-mono" style={{ color: "#6b6b80" }}>{stats.totalItems}</span>
              {" learning items"}
            </span>
            <span className="font-mono text-[11px]" style={{ color: "#5a5a6a" }}>
              {stats.remainingItems} left
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${stats.progressPercent}%`,
                background: subject.color,
                boxShadow: `0 0 8px ${subject.color}40`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Current Focus Topic */}
        {stats.activeTopic && (
          <div
            className="mb-4 rounded-md px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              className="mb-0.5 text-[9.5px] font-medium uppercase tracking-[0.5px]"
              style={{ color: "#5a5a6a" }}
            >
              Current Focus
            </div>
            <div
              className="truncate text-[12px] font-semibold"
              style={{ color: "#d0d0e0" }}
            >
              {stats.activeTopic.name}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div
        className="mt-1 flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-3 text-[11px]" style={{ color: "#5a5a6a" }}>
          <span className="flex items-center gap-1">
            <Layers size={11} />
            {stats.topicCount} topics
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            ~{formatMinutes(stats.estimatedRemainingMinutes)}
          </span>
        </div>

        <Link
          href={`/subjects/${subject.id}`}
          className="flex cursor-pointer items-center gap-1 text-[11.5px] font-semibold no-underline"
          style={{
            color: subject.color,
            transition: "opacity 0.15s ease",
          }}
        >
          <span>Continue</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
