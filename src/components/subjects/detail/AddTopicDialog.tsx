"use client";

import { useState } from "react";
import { X, Plus, Layers } from "lucide-react";
import type { Topic } from "@/types/subjects";

interface AddTopicDialogProps {
  open: boolean;
  subjectId: string;
  subjectColor: string;
  editingTopic?: Topic | null;
  onClose: () => void;
  onSave: (topic: Topic) => void;
}

export function AddTopicDialog({
  open,
  subjectId,
  subjectColor,
  editingTopic,
  onClose,
  onSave,
}: AddTopicDialogProps) {
  if (!open) return null;

  return (
    <AddTopicDialogInner
      key={editingTopic ? editingTopic.id : "new-topic"}
      subjectId={subjectId}
      subjectColor={subjectColor}
      editingTopic={editingTopic}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AddTopicDialogInner({
  subjectId,
  subjectColor,
  editingTopic,
  onClose,
  onSave,
}: {
  subjectId: string;
  subjectColor: string;
  editingTopic?: Topic | null;
  onClose: () => void;
  onSave: (topic: Topic) => void;
}) {
  const [name, setName] = useState(editingTopic?.name || "");
  const [description, setDescription] = useState(editingTopic?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const topicToSave: Topic = {
      id: editingTopic?.id || `top-${Date.now()}`,
      subjectId,
      name: name.trim(),
      description: description.trim() || undefined,
      order: editingTopic?.order || 99,
      learningItems: editingTopic?.learningItems || [],
    };

    onSave(topicToSave);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[440px] rounded-[10px] p-6 shadow-2xl"
        style={{
          background: "#13131a",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} style={{ color: subjectColor }} />
            <h3 className="m-0 text-base font-bold text-[#f0f0f4]">
              {editingTopic ? "Edit Topic" : "Add New Topic"}
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
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Topic Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Binary Search, Dynamic Programming"
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
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of concepts in this topic..."
              className="w-full resize-none rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none"
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
              {editingTopic ? "Save Changes" : "Create Topic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
