"use client";

import { Check, Clock, Pencil, Trash2, BookOpen, Video, Code, ExternalLink } from "lucide-react";
import type { LearningItem } from "@/types/subjects";
import { formatMinutes } from "@/lib/learning-progress";
import { sanitizeResourceUrl } from "@/lib/utils";

interface LearningItemRowProps {
  item: LearningItem;
  subjectColor: string;
  onToggleCompletion: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const RESOURCE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  notes: BookOpen,
  video: Video,
  practice: Code,
  link: ExternalLink,
};

export function LearningItemRow({
  item,
  subjectColor,
  onToggleCompletion,
  onEdit,
  onDelete,
}: LearningItemRowProps) {
  const isCompleted = item.status === "COMPLETED";
  const isInProgress = item.status === "IN_PROGRESS";

  return (
    <div
      className="group relative flex items-center justify-between gap-3 rounded-[7px] px-3.5 py-2.5 transition-all"
      style={{
        background: isCompleted
          ? "rgba(255,255,255,0.015)"
          : isInProgress
          ? "rgba(34,211,238,0.03)"
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${
          isInProgress
            ? "rgba(34,211,238,0.2)"
            : isCompleted
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.05)"
        }`,
      }}
    >
      {/* Left indicator accent for In-Progress */}
      {isInProgress && (
        <div
          className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-r-sm"
          style={{ background: subjectColor }}
        />
      )}

      {/* Checkbox + Title + Description */}
      <div className="flex items-start gap-3">
        {/* Custom Accessible Checkbox */}
        <button
          type="button"
          onClick={onToggleCompletion}
          aria-label={isCompleted ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as completed`}
          className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] transition-all"
          style={{
            background: isCompleted
              ? "#22c55e"
              : "rgba(255,255,255,0.05)",
            border: isCompleted
              ? "1px solid #22c55e"
              : "1px solid rgba(255,255,255,0.2)",
            boxShadow: isCompleted ? "0 0 8px rgba(34,197,94,0.4)" : "none",
          }}
        >
          {isCompleted && <Check size={11} strokeWidth={3} className="text-black" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-[13px] font-medium tracking-tight transition-all"
              style={{
                color: isCompleted ? "#6b6b80" : "#f0f0f4",
                textDecoration: isCompleted ? "line-through" : "none",
              }}
            >
              {item.title}
            </span>

            {/* In Progress Badge */}
            {isInProgress && (
              <span
                className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.5px]"
                style={{
                  background: "rgba(34,211,238,0.1)",
                  color: "#22d3ee",
                  border: "1px solid rgba(34,211,238,0.25)",
                }}
              >
                <div className="pulse-dot h-1 w-1 rounded-full" style={{ background: "#22d3ee" }} />
                Active Focus
              </span>
            )}
          </div>

          {item.description && (
            <p
              className="m-0 mt-0.5 text-[11.5px]"
              style={{ color: isCompleted ? "#4a4a5a" : "#7a7a8e" }}
            >
              {item.description}
            </p>
          )}

          {/* Resources */}
          {item.resources && item.resources.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {item.resources.map((res) => {
                const Icon = RESOURCE_ICONS[res.type] || BookOpen;
                const safeUrl = sanitizeResourceUrl(res.url);

                if (safeUrl) {
                  return (
                    <a
                      key={res.id}
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] hover:text-white transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "#9090a8",
                      }}
                    >
                      <Icon size={9} />
                      <span>{res.title}</span>
                    </a>
                  );
                }

                return (
                  <div
                    key={res.id}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#9090a8",
                    }}
                  >
                    <Icon size={9} />
                    <span>{res.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Priority, Time, Actions */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Estimated Time */}
        <div
          className="flex items-center gap-1 font-mono text-[11px]"
          style={{ color: "#7a7a8e" }}
        >
          <Clock size={11} />
          <span>{formatMinutes(item.estimatedMinutes)}</span>
        </div>

        {/* Priority Badge */}
        <div
          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.5px]"
          style={{
            background:
              item.priority === "HIGH"
                ? "rgba(239,68,68,0.1)"
                : item.priority === "MEDIUM"
                ? "rgba(245,158,11,0.1)"
                : "rgba(255,255,255,0.04)",
            border: `1px solid ${
              item.priority === "HIGH"
                ? "rgba(239,68,68,0.25)"
                : item.priority === "MEDIUM"
                ? "rgba(245,158,11,0.25)"
                : "rgba(255,255,255,0.08)"
            }`,
            color:
              item.priority === "HIGH"
                ? "#ef4444"
                : item.priority === "MEDIUM"
                ? "#f59e0b"
                : "#6b6b80",
          }}
        >
          {item.priority}
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#8a8a9e",
            }}
            title="Edit item"
          >
            <Pencil size={11} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded"
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444",
            }}
            title="Delete item"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
