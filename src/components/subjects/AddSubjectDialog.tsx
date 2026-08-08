"use client";

import { useState } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import type { Subject } from "@/types/subjects";

interface AddSubjectDialogProps {
  open: boolean;
  editingSubject?: Subject | null;
  onClose: () => void;
  onSave: (subject: Subject) => void;
}

const PRESET_COLORS = [
  { label: "Cyan", value: "#22d3ee" },
  { label: "Orange", value: "#f97316" },
  { label: "Purple", value: "#a78bfa" },
  { label: "Emerald", value: "#34d399" },
  { label: "Pink", value: "#ec4899" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Blue", value: "#3b82f6" },
];

const PRESET_CATEGORIES = [
  "Computer Science",
  "Backend Engineering",
  "AI & Data Science",
  "Databases",
  "Frontend Engineering",
  "DevOps & Systems",
  "Mathematics",
  "General",
];

export function AddSubjectDialog({
  open,
  editingSubject,
  onClose,
  onSave,
}: AddSubjectDialogProps) {
  if (!open) return null;

  return (
    <AddSubjectDialogInner
      key={editingSubject ? editingSubject.id : "new-subject"}
      editingSubject={editingSubject}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function AddSubjectDialogInner({
  editingSubject,
  onClose,
  onSave,
}: {
  editingSubject?: Subject | null;
  onClose: () => void;
  onSave: (subject: Subject) => void;
}) {
  const [name, setName] = useState(editingSubject?.name || "");
  const [description, setDescription] = useState(editingSubject?.description || "");
  const [category, setCategory] = useState(editingSubject?.category || "Computer Science");
  const [color, setColor] = useState(editingSubject?.color || "#22d3ee");
  const [targetDate, setTargetDate] = useState(editingSubject?.targetDate || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subjectToSave: Subject = {
      id: editingSubject?.id || `sub-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `${name.trim()} learning track`,
      category: category.trim(),
      color,
      targetDate: targetDate || undefined,
      topics: editingSubject?.topics || [],
    };

    onSave(subjectToSave);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[480px] rounded-[10px] p-6 shadow-2xl"
        style={{
          background: "#13131a",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color }} />
            <h3 className="m-0 text-base font-bold text-[#f0f0f4]">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
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
              Subject Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DSA, System Design, Operating Systems"
              className="w-full rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what you will master in this subject..."
              className="w-full resize-none rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-[6px] px-3 py-2 text-[13px] text-[#f0f0f4] outline-none"
              style={{
                background: "#1c1c24",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ background: "#1c1c24", color: "#f0f0f4" }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Color Picker */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c.value,
                    border: color === c.value ? "2px solid #fff" : "1px solid rgba(0,0,0,0.3)",
                    boxShadow: color === c.value ? `0 0 10px ${c.value}80` : "none",
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]" style={{ color: "#7a7a8e" }}>
              Target Mastery Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
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
                background: color,
                color: "#000",
              }}
            >
              <Plus size={13} />
              {editingSubject ? "Save Changes" : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
