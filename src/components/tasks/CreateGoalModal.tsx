"use client";

import React, { useState } from "react";
import { LongTermGoal, GoalPriority } from "@/types/tasks-goals";
import { X, Target, Calendar, Tag } from "lucide-react";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<LongTermGoal, "id" | "createdAt" | "status">) => void;
}

export function CreateGoalModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateGoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("DSA");
  const [category, setCategory] = useState("Placement Prep");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  });
  const [priority, setPriority] = useState<GoalPriority>("HIGH");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      category: category.trim(),
      targetDate,
      priority,
      color: "#22d3ee",
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22d3ee]/10 text-[#22d3ee]">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f0f0f4]">Create Long-Term Goal</h3>
              <p className="text-xs text-[#6b6b80]">Define a major objective for your study roadmap.</p>
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
              Goal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Data Structures & Algorithms for Placements"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white placeholder-[#5a5a6a] focus:border-[#22d3ee] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Describe what success looks like for this goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white placeholder-[#5a5a6a] focus:border-[#22d3ee] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Subject / Topic
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#22d3ee] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Placement / Core / Semester"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#22d3ee] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Target Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#22d3ee] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#22d3ee] outline-none"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
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
              className="rounded-lg bg-[#22d3ee] px-4 py-2 text-xs font-bold text-black hover:bg-[#22d3ee]/90 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.3)]"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
