"use client";

import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Calendar, Layers, Clock, Plus } from "lucide-react";
import type { Subject } from "@/types/subjects";
import { getSubjectStats, formatMinutes } from "@/lib/learning-progress";

interface SubjectDetailHeaderProps {
  subject: Subject;
  onEditSubject: () => void;
  onDeleteSubject: () => void;
  onAddTopic: () => void;
}

export function SubjectDetailHeader({
  subject,
  onEditSubject,
  onDeleteSubject,
  onAddTopic,
}: SubjectDetailHeaderProps) {
  const stats = getSubjectStats(subject);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/subjects"
          className="flex cursor-pointer items-center gap-1.5 font-mono text-[12px] no-underline transition-colors hover:text-[#22d3ee]"
          style={{ color: "#7a7a8e" }}
        >
          <ArrowLeft size={13} />
          <span>Back to Subjects</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditSubject}
            className="flex cursor-pointer items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[11.5px] font-medium"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#a0a0b8",
            }}
          >
            <Pencil size={11} />
            Edit Subject
          </button>
          <button
            onClick={onDeleteSubject}
            className="flex cursor-pointer items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[11.5px] font-medium"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444",
            }}
          >
            <Trash2 size={11} />
            Delete
          </button>
          <button
            onClick={onAddTopic}
            className="flex cursor-pointer items-center gap-1.5 rounded-[6px] px-3.5 py-1.5 text-[11.5px] font-semibold"
            style={{
              background: subject.color,
              color: "#000",
            }}
          >
            <Plus size={12} />
            Add Topic
          </button>
        </div>
      </div>

      {/* Main Subject Banner */}
      <div
        className="rounded-[10px] p-[22px]"
        style={{
          background: "#13131a",
          border: `1px solid ${subject.color}30`,
          boxShadow: `0 0 20px ${subject.color}10`,
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4 max-md:flex-col">
          <div>
            <div className="mb-1.5 flex items-center gap-2.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: subject.color }}
              />
              <h1 className="m-0 text-2xl font-bold tracking-tight text-[#f0f0f4]">
                {subject.name}
              </h1>
              <div
                className="rounded px-2 py-0.5"
                style={{
                  background: `${subject.color}15`,
                  border: `1px solid ${subject.color}30`,
                }}
              >
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.6px]"
                  style={{ color: subject.color }}
                >
                  {subject.category}
                </span>
              </div>
            </div>
            <p className="m-0 text-[13px] text-[#8a8a9e]">
              {subject.description}
            </p>
          </div>

          {/* Target Date */}
          {subject.targetDate && (
            <div
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#a0a0b8",
              }}
            >
              <Calendar size={12} style={{ color: subject.color }} />
              <span>Target: {subject.targetDate}</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          <div
            className="rounded-md p-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#5a5a6a" }}>
              Overall Progress
            </div>
            <div className="font-mono text-xl font-bold" style={{ color: subject.color }}>
              {stats.progressPercent}%
            </div>
          </div>

          <div
            className="rounded-md p-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#5a5a6a" }}>
              Mastery Count
            </div>
            <div className="font-mono text-xl font-bold text-[#f0f0f4]">
              {stats.completedItems}{" "}
              <span className="text-sm font-normal" style={{ color: "#6b6b80" }}>
                / {stats.totalItems} items
              </span>
            </div>
          </div>

          <div
            className="rounded-md p-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#5a5a6a" }}>
              Curriculum Topics
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xl font-bold text-[#f0f0f4]">
              <Layers size={15} style={{ color: "#22d3ee" }} />
              <span>{stats.topicCount}</span>
            </div>
          </div>

          <div
            className="rounded-md p-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#5a5a6a" }}>
              Estimated Remaining
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xl font-bold" style={{ color: "#f59e0b" }}>
              <Clock size={15} />
              <span>{formatMinutes(stats.estimatedRemainingMinutes)}</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3.5">
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${stats.progressPercent}%`,
                background: subject.color,
                boxShadow: `0 0 10px ${subject.color}60`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
