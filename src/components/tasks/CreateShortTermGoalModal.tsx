"use client";

import React, { useState, useEffect } from "react";
import {
  ShortTermGoal,
  LongTermGoal,
  GoalPriority,
} from "@/types/tasks-goals";
import { X, Layers } from "lucide-react";

interface CreateShortTermGoalModalProps {
  isOpen: boolean;
  defaultLongTermGoalId?: string;
  longTermGoals: LongTermGoal[];
  onClose: () => void;
  onSubmit: (
    goal: Omit<ShortTermGoal, "id" | "createdAt" | "status">
  ) => void;
}

export function CreateShortTermGoalModal({
  isOpen,
  defaultLongTermGoalId,
  longTermGoals,
  onClose,
  onSubmit,
}: CreateShortTermGoalModalProps) {
  const [longTermGoalId, setLongTermGoalId] = useState(
    defaultLongTermGoalId || (longTermGoals[0]?.id ?? "")
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [priority, setPriority] = useState<GoalPriority>("HIGH");

  useEffect(() => {
    if (defaultLongTermGoalId) {
      setLongTermGoalId(defaultLongTermGoalId);
    } else if (longTermGoals.length > 0 && !longTermGoalId) {
      setLongTermGoalId(longTermGoals[0].id);
    }
  }, [defaultLongTermGoalId, longTermGoals, longTermGoalId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !longTermGoalId) return;

    onSubmit({
      longTermGoalId,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      color: "#34d399",
    });

    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#13131a] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34d399]/10 text-[#34d399]">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f0f0f4]">
                Create Short-Term Goal
              </h3>
              <p className="text-xs text-[#6b6b80]">
                Break down long-term goals into focused weekly milestones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#6b6b80] hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
              Parent Long-Term Goal *
            </label>
            <select
              required
              value={longTermGoalId}
              onChange={(e) => setLongTermGoalId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#34d399] outline-none"
            >
              {longTermGoals.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.title} ({lt.subject})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
              Short-Term Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Complete Arrays & Strings this week"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white placeholder-[#5a5a6a] focus:border-[#34d399] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Key sub-topics or target problem count..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white placeholder-[#5a5a6a] focus:border-[#34d399] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#34d399] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#34d399] outline-none"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs text-[#a0a0b8] hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#34d399] px-4 py-2 text-xs font-bold text-black hover:bg-[#34d399]/90 transition-colors shadow-[0_0_12px_rgba(52,211,153,0.3)]"
            >
              Create Short-Term Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
