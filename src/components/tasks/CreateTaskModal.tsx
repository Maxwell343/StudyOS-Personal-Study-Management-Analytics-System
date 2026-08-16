"use client";

import React, { useState, useEffect } from "react";
import {
  TaskItem,
  ShortTermGoal,
  LongTermGoal,
  GoalPriority,
} from "@/types/tasks-goals";
import { X, CheckSquare } from "lucide-react";

interface CreateTaskModalProps {
  isOpen: boolean;
  defaultShortTermGoalId?: string;
  shortTermGoals: ShortTermGoal[];
  longTermGoals: LongTermGoal[];
  onClose: () => void;
  onSubmit: (
    task: Omit<TaskItem, "id" | "createdAt" | "completed" | "completedAt">
  ) => void;
}

export function CreateTaskModal({
  isOpen,
  defaultShortTermGoalId,
  shortTermGoals,
  longTermGoals,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [shortTermGoalId, setShortTermGoalId] = useState(
    defaultShortTermGoalId || (shortTermGoals[0]?.id ?? "")
  );
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("DSA");
  const [dueDate, setDueDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [priority, setPriority] = useState<GoalPriority>("HIGH");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (defaultShortTermGoalId) {
      setShortTermGoalId(defaultShortTermGoalId);
    } else if (shortTermGoals.length > 0 && !shortTermGoalId) {
      setShortTermGoalId(shortTermGoals[0].id);
    }
  }, [defaultShortTermGoalId, shortTermGoals, shortTermGoalId]);

  // Sync subject automatically with parent goal if matched
  useEffect(() => {
    if (shortTermGoalId) {
      const st = shortTermGoals.find((s) => s.id === shortTermGoalId);
      if (st) {
        const lt = longTermGoals.find((l) => l.id === st.longTermGoalId);
        if (lt?.subject) {
          setSubject(lt.subject);
        }
      }
    }
  }, [shortTermGoalId, shortTermGoals, longTermGoals]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortTermGoalId) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      shortTermGoalId,
      title: title.trim(),
      subject: subject.trim(),
      dueDate,
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      notes: notes.trim(),
      tags,
    });

    setTitle("");
    setNotes("");
    setTagsInput("");
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a78bfa]/10 text-[#a78bfa]">
              <CheckSquare size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f0f0f4]">Add Checklist Task</h3>
              <p className="text-xs text-[#6b6b80]">
                Create a focused actionable step assigned to a short-term goal.
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
              Short-Term Goal (Parent) *
            </label>
            <select
              required
              value={shortTermGoalId}
              onChange={(e) => setShortTermGoalId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#a78bfa] outline-none"
            >
              {shortTermGoals.map((st) => {
                const lt = longTermGoals.find((l) => l.id === st.longTermGoalId);
                return (
                  <option key={st.id} value={st.id}>
                    {st.title} {lt ? `(${lt.title})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Solve 5 Two Pointer problems on LeetCode"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white placeholder-[#5a5a6a] focus:border-[#a78bfa] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#a78bfa] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Estimated Time (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#a78bfa] outline-none"
              />
            </div>
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
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#a78bfa] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white focus:border-[#a78bfa] outline-none"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
              Notes / Key Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Focus on sliding window approach for variable length array..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-white placeholder-[#5a5a6a] focus:border-[#a78bfa] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a0a0b8] mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. LeetCode, Theory, Revision"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1a1a24] px-3 py-2 text-xs text-[#d0d0e0] placeholder-[#5a5a6a] focus:border-[#a78bfa] outline-none"
            />
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
              className="rounded-lg bg-[#a78bfa] px-4 py-2 text-xs font-bold text-black hover:bg-[#a78bfa]/90 transition-colors shadow-[0_0_12px_rgba(167,139,250,0.3)]"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
