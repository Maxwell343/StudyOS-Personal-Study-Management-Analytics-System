"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Clock } from "lucide-react";
import type { Topic, LearningItem } from "@/types/subjects";
import { getTopicStats, formatMinutes } from "@/lib/learning-progress";
import { LearningItemRow } from "./LearningItemRow";

interface TopicSectionProps {
  topic: Topic;
  subjectColor: string;
  onToggleItem: (itemId: string) => void;
  onBulkToggleTopic: (topic: Topic) => void;
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
  onBulkToggleTopic,
  onEditTopic,
  onDeleteTopic,
  onAddLearningItem,
  onEditLearningItem,
  onDeleteLearningItem,
}: TopicSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const stats = getTopicStats(topic);
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Derive checkbox state from topic stats
  const isFullyComplete = stats.totalItems > 0 && stats.completedItems === stats.totalItems;
  const isPartial = stats.completedItems > 0 && stats.completedItems < stats.totalItems;
  const isEmpty = stats.totalItems === 0;

  // Set indeterminate state via DOM ref — this can't be set via JSX props
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isPartial;
    }
  }, [isPartial]);

  function handleTopicCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    // Prevent default — we control the state via Supabase
    e.preventDefault();
    if (!isEmpty) {
      onBulkToggleTopic(topic);
    }
  }

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
        {/* Topic-level Checkbox + Accordion Toggle + Topic Details */}
        <div className="flex flex-1 items-start gap-2.5 min-w-0">
          {/* Topic Checkbox — derived from learning items */}
          <div className="mt-0.5 shrink-0">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={isFullyComplete}
              disabled={isEmpty}
              onChange={handleTopicCheckbox}
              aria-label={
                isFullyComplete
                  ? `Mark all items in "${topic.name}" as not started`
                  : `Mark all items in "${topic.name}" as completed`
              }
              className="topic-checkbox"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "4px",
                cursor: isEmpty ? "not-allowed" : "pointer",
                accentColor: subjectColor,
                opacity: isEmpty ? 0.3 : 1,
              }}
            />
          </div>

          {/* Accordion Toggle button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-1 cursor-pointer items-start gap-2 text-left min-w-0"
          >
            <div className="mt-0.5 shrink-0 text-[#7a7a8e]">
              {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
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
        </div>

        {/* Right Info: Progress Numbers & Actions */}
        <div className="flex items-center gap-3 shrink-0">
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
