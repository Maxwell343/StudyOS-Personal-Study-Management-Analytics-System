"use client";

import { useState } from "react";
import { X, Plus, BookOpen } from "lucide-react";
import type { LearningItem, LearningItemPriority, LearningItemStatus } from "@/types/subjects";

interface AddLearningItemDialogProps {
  open: boolean;
  topicId: string;
  subjectColor: string;
  editingItem?: LearningItem | null;
  onClose: () => void;
  onSave: (item: LearningItem) => void;
}

export function AddLearningItemDialog({
  open,
  topicId,
  subjectColor,
  editingItem,
  onClose,
  onSave,
}: AddLearningItemDialogProps) {
  if (!open) return null;

  return (
    <AddLearningItemDialogInner
      key={editingItem ? editingItem.id : "new-learning-item"}
      topicId={topicId}
      subjectColor={subjectColor}
      editingItem={editingItem}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AddLearningItemDialogInner({
  topicId,
  subjectColor,
  editingItem,
  onClose,
  onSave,
}: {
  topicId: string;
  subjectColor: string;
  editingItem?: LearningItem | null;
  onClose: () => void;
  onSave: (item: LearningItem) => void;
}) {
  const [title, setTitle] = useState(editingItem?.title || "");
  const [description, setDescription] = useState(editingItem?.description || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(editingItem?.estimatedMinutes || 45);
  const [priority, setPriority] = useState<LearningItemPriority>(editingItem?.priority || "HIGH");
  const status: LearningItemStatus = editingItem?.status || "NOT_STARTED";
  const [resourceTitle, setResourceTitle] = useState(
    editingItem?.resources && editingItem.resources.length > 0 ? editingItem.resources[0].title : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const itemToSave: LearningItem = {
      id: editingItem?.id || `li-${Date.now()}`,
      topicId,
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      priority,
      status,
      order: editingItem?.order || 99,
      completedAt: editingItem?.completedAt,
      lastStudiedAt: editingItem?.lastStudiedAt,
      resources: resourceTitle.trim()
        ? [
            {
              id: `res-${Date.now()}`,
              type: "practice",
              title: resourceTitle.trim(),
            },
          ]
        : editingItem?.resources || [],
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[460px] rounded-[10px] p-6 shadow-2xl"
        style={{
          background: "#13131a",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: subjectColor }} />
            <h3 className="m-0 text-base font-bold text-[#f0f0f4]">
              {editingItem ? "Edit Learning Item" : "Add Learning Item"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "#6b6b80",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Item Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Search in Rotated Sorted Array"
              className="w-full rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Concept Summary (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key algorithms, theorems, or implementation notes..."
              className="w-full resize-none rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Row: Estimated Time & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
                Estimated Time (Min)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#f0f0f4] outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LearningItemPriority)}
                className="w-full rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none"
                style={{
                  background: "#1c1c24",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <option value="HIGH" style={{ background: "#1c1c24", color: "#ef4444" }}>High Priority</option>
                <option value="MEDIUM" style={{ background: "#1c1c24", color: "#f59e0b" }}>Medium Priority</option>
                <option value="LOW" style={{ background: "#1c1c24", color: "#6b6b80" }}>Low Priority</option>
              </select>
            </div>
          </div>

          {/* Resource / Link */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Practice Problem / Resource Tag (Optional)
            </label>
            <input
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              placeholder="e.g. LeetCode 33, Striver Lecture #5"
              className="w-full rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-2.5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-[7px] px-4 py-2 text-[12px] font-medium"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#8a8a9e",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-1.5 rounded-[7px] px-4 py-2 text-[12px] font-semibold"
              style={{
                background: subjectColor,
                color: "#000",
              }}
            >
              <Plus size={13} />
              {editingItem ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
