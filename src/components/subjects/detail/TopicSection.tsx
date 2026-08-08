"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Clock } from "lucide-react";
import type { Topic, LearningItem } from "@/types/subjects";
import { getTopicStats, formatMinutes } from "@/lib/learning-progress";
import { LearningItemRow } from "./LearningItemRow";

interface TopicSectionProps {
  topic: Topic;
  subjectColor: string;
  onToggleItem: (itemId: string) => void;
  onEditTopic: () => void;
  onDeleteTopic: () => void;
  onAddLearningItem: () => void;
  onEditLearningItem: (item: LearningItem) => void;
  onDeleteLearningItem: (itemId: string) => void;
}

export function TopicSection({
  topic,
  subjectColor,
  onToggleItem,
  onEditTopic,
  onDeleteTopic,
  onAddLearningItem,
  onEditLearningItem,
  onDeleteLearningItem,
}: TopicSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const stats = getTopicStats(topic);

  return (
    <div
      className="rounded-[9px] p-4 transition-all"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Accordion Toggle + Topic Details */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-1 cursor-pointer items-start gap-2.5 text-left"
        >
          <div className="mt-0.5 text-[#7a7a8e]">
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <h3 className="m-0 text-sm font-bold text-[#f0f0f4]">
                {topic.name}
              </h3>
              <div
                className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                style={{
                  background: `${subjectColor}15`,
                  color: subjectColor,
                }}
              >
                {stats.progressPercent}%
              </div>
            </div>

            {topic.description && (
              <p className="m-0 mt-0.5 text-[11.5px] text-[#7a7a8e]">
                {topic.description}
              </p>
            )}
          </div>
        </button>

        {/* Right Info: Progress Numbers & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-right max-sm:hidden">
            <div className="font-mono text-[11px] text-[#a0a0b8]">
              <span className="font-bold text-[#f0f0f4]">{stats.completedItems}</span>
              {" / "}
              <span style={{ color: "#6b6b80" }}>{stats.totalItems} items</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] text-[#f59e0b]">
              <Clock size={11} />
              <span>{formatMinutes(stats.estimatedRemainingMinutes)}</span>
            </div>
          </div>

          {/* Topic Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onEditTopic}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#7a7a8e",
              }}
              title="Edit Topic"
            >
              <Pencil size={11} />
            </button>
            <button
              type="button"
              onClick={onDeleteTopic}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded"
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "#ef4444",
              }}
              title="Delete Topic"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar under topic */}
      <div className="mt-2.5 mb-3">
        <div
          className="h-1 overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${stats.progressPercent}%`,
              background: subjectColor,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Accordion Content: Learning Items */}
      {isOpen && (
        <div className="mt-3 flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {topic.learningItems.length === 0 ? (
            <div className="py-4 text-center text-[12px] text-[#5a5a6a]">
              No learning items yet. Add your first item below.
            </div>
          ) : (
            topic.learningItems.map((item) => (
              <LearningItemRow
                key={item.id}
                item={item}
                subjectColor={subjectColor}
                onToggleCompletion={() => onToggleItem(item.id)}
                onEdit={() => onEditLearningItem(item)}
                onDelete={() => onDeleteLearningItem(item.id)}
              />
            ))
          )}

          {/* Add Learning Item Button */}
          <button
            type="button"
            onClick={onAddLearningItem}
            className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[6px] py-2 text-[11.5px] font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.1)",
              color: "#a0a0b8",
            }}
          >
            <Plus size={12} />
            Add Learning Item
          </button>
        </div>
      )}
    </div>
  );
}
