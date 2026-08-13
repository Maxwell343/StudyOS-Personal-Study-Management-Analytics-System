"use client";

import { useRef, useEffect, useState, useId } from "react";
import { X } from "lucide-react";
import type { PlanSession, PlannedTask } from "@/types/planner";
import {
  calculateDuration,
  formatMinutes,
} from "@/lib/planner-utils";

// Fallback subject colors when no DB subjects are available
const SUBJECT_COLORS: Record<string, string> = {
  DSA: "#22d3ee",
  Java: "#f97316",
  "Machine Learning": "#a78bfa",
  SQL: "#34d399",
  "Object Oriented Programming": "#ec4899",
  OOP: "#ec4899",
  "Operating Systems": "#3b82f6",
  OS: "#3b82f6",
  "Computer Networks": "#06b6d4",
  CN: "#06b6d4",
};

interface AddSessionDialogProps {
  open: boolean;
  editingSession: PlanSession | null;
  availableTasks: PlannedTask[];
  availableSubjects?: { name: string; color: string }[];
  onClose: () => void;
  onSave: (session: PlanSession) => void;
}

let sessionCounter = 0;
function generateSessionId(): string {
  sessionCounter += 1;
  return `plan-session-new-${sessionCounter}`;
}

function AddSessionDialogInner({
  open,
  editingSession,
  availableTasks,
  availableSubjects,
  onClose,
  onSave,
}: AddSessionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();

  const subjectsList =
    availableSubjects && availableSubjects.length > 0
      ? availableSubjects.map((s) => s.name)
      : Object.keys(SUBJECT_COLORS);

  // Form state — initialized from editingSession on mount
  const initialTaskIds: string[] = editingSession?.learningItemIds
    ? editingSession.learningItemIds
    : editingSession?.learningItemId
    ? [editingSession.learningItemId]
    : editingSession?.taskId
    ? [editingSession.taskId]
    : [];

  const [subject, setSubject] = useState(
    editingSession?.subject || subjectsList[0] || "DSA"
  );
  const [topic, setTopic] = useState(editingSession?.topic || "");
  const [startTime, setStartTime] = useState(
    editingSession?.startTime || "09:00"
  );
  const [endTime, setEndTime] = useState(editingSession?.endTime || "10:00");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(initialTaskIds);
  const [priority, setPriority] = useState<"high" | "medium" | "low" | "">(
    editingSession?.priority || ""
  );

  // Manage native dialog open/close (DOM side effect only)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Handle native dialog close (Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Computed duration
  const duration = calculateDuration(startTime, endTime);
  const isValidDuration = duration > 0;

  const handleToggleTask = (task: PlannedTask) => {
    const isSelected = selectedTaskIds.includes(task.id);
    const nextIds = isSelected
      ? selectedTaskIds.filter((id) => id !== task.id)
      : [...selectedTaskIds, task.id];

    setSelectedTaskIds(nextIds);

    // Auto-populate Topic field with Module Name and specific sub-topics/tasks
    const selectedTaskObjs = availableTasks.filter((t) => nextIds.includes(t.id));
    if (selectedTaskObjs.length > 0) {
      const byModule: Record<string, string[]> = {};
      selectedTaskObjs.forEach((t) => {
        const modName = t.topicName || t.label.split(" — ")[0] || "Module";
        const rawItemTitle = t.itemTitle || t.label.split(" — ").slice(1).join(" — ") || t.label;
        const itemTitle = rawItemTitle.replace(new RegExp(`^${modName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*—\\s*`, "i"), "").trim();
        if (!byModule[modName]) byModule[modName] = [];
        byModule[modName].push(itemTitle);
      });

      const formattedParts = Object.entries(byModule).map(([mod, items]) => {
        return `${mod}: ${items.join(", ")}`;
      });

      setTopic(formattedParts.join(" | "));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic || !isValidDuration) return;

    const matchedSubjectColor =
      availableSubjects?.find((s) => s.name === subject)?.color ||
      SUBJECT_COLORS[subject] ||
      "#22d3ee";

    const matchedTask = availableTasks.find((t) => selectedTaskIds.includes(t.id));

    const session: PlanSession = {
      id: editingSession?.id || generateSessionId(),
      subject,
      topic: topic.trim(),
      taskId: selectedTaskIds[0],
      learningItemId: matchedTask?.learningItemId || editingSession?.learningItemId,
      learningItemIds: selectedTaskIds,
      taskIds: selectedTaskIds,
      startTime,
      endTime,
      durationMinutes: duration,
      color: matchedSubjectColor,
      ...(priority ? { priority: priority as "high" | "medium" | "low" } : {}),
    };

    onSave(session);
    onClose();
  };

  const filteredTasks = availableTasks.filter(
    (t) => t.subject === subject || !subject
  );

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[10px] p-0 backdrop:bg-black/60"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#f0f0f4",
      }}
      aria-label={editingSession ? "Edit study session" : "Add study session"}
    >
      <form onSubmit={handleSubmit}>
        {/* Dialog header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3 className="m-0 text-[14px] font-semibold text-[#f0f0f4]">
            {editingSession ? "Edit Study Session" : "Add Study Session"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-md"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "#6b6b80",
            }}
            aria-label="Close dialog"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form body */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Subject */}
          <div>
            <label
              htmlFor={`${formId}-subject`}
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]"
              style={{ color: "#6b6b80" }}
            >
              Subject
            </label>
            <select
              id={`${formId}-subject`}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setSelectedTaskIds([]);
              }}
              className="w-full rounded-md px-3 py-2 text-[13px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f0f0f4",
                outline: "none",
              }}
              required
            >
              {subjectsList.map((s) => (
                <option key={s} value={s} style={{ background: "#1a1a24" }}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label
              htmlFor={`${formId}-topic`}
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]"
              style={{ color: "#6b6b80" }}
            >
              Topic
            </label>
            <input
              id={`${formId}-topic`}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Binary Trees, Spring Boot..."
              className="w-full rounded-md px-3 py-2 text-[13px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f0f0f4",
                outline: "none",
              }}
              required
            />
          </div>

          {/* Time row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor={`${formId}-start`}
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]"
                style={{ color: "#6b6b80" }}
              >
                Start Time
              </label>
              <input
                id={`${formId}-start`}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-[13px]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f0f0f4",
                  outline: "none",
                  colorScheme: "dark",
                }}
                required
              />
            </div>
            <div>
              <label
                htmlFor={`${formId}-end`}
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]"
                style={{ color: "#6b6b80" }}
              >
                End Time
              </label>
              <input
                id={`${formId}-end`}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-[13px]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f0f0f4",
                  outline: "none",
                  colorScheme: "dark",
                }}
                required
              />
            </div>
            <div>
              <div
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]"
                style={{ color: "#6b6b80" }}
              >
                Duration
              </div>
              <div
                className="flex items-center rounded-md px-3 py-2 font-mono text-[13px] font-semibold"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: isValidDuration ? "#22d3ee" : "#ef4444",
                  height: "38px",
                }}
              >
                {isValidDuration ? formatMinutes(duration) : "Invalid"}
              </div>
            </div>
          </div>

          {/* Task selection */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <div
                  className="text-[11px] font-medium uppercase tracking-[0.5px]"
                  style={{ color: "#6b6b80" }}
                >
                  Add from existing tasks
                </div>
                {selectedTaskIds.length > 0 && (
                  <span className="font-mono text-[10px] font-bold text-[#22d3ee]">
                    {selectedTaskIds.length} task{selectedTaskIds.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
              <div className="flex max-h-[180px] flex-col gap-1 overflow-y-auto pr-1">
                {filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left transition-all"
                      style={{
                        background: isSelected
                          ? "rgba(34,211,238,0.06)"
                          : "transparent",
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded"
                        style={{
                          border: `1.5px solid ${
                            isSelected
                              ? "#22d3ee"
                              : "rgba(255,255,255,0.12)"
                          }`,
                          background: isSelected
                            ? "#22d3ee"
                            : "transparent",
                          transition: "all 0.12s",
                        }}
                      >
                        {isSelected && (
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#000"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-[12.5px]"
                        style={{ color: isSelected ? "#f0f0f4" : "#c0c0d0" }}
                      >
                        {task.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Priority (optional) */}
          <div>
            <label
              htmlFor={`${formId}-priority`}
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.5px]"
              style={{ color: "#6b6b80" }}
            >
              Priority{" "}
              <span style={{ color: "#3a3a4a" }}>(optional)</span>
            </label>
            <select
              id={`${formId}-priority`}
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value as "high" | "medium" | "low" | ""
                )
              }
              className="w-full rounded-md px-3 py-2 text-[13px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f0f0f4",
                outline: "none",
              }}
            >
              <option value="" style={{ background: "#1a1a24" }}>
                No priority
              </option>
              <option value="high" style={{ background: "#1a1a24" }}>
                High
              </option>
              <option value="medium" style={{ background: "#1a1a24" }}>
                Medium
              </option>
              <option value="low" style={{ background: "#1a1a24" }}>
                Low
              </option>
            </select>
          </div>
        </div>

        {/* Dialog footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[7px] px-4 py-2 text-[12px] font-medium"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "#a0a0b8",
              transition: "all 0.15s ease",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!subject || !topic || !isValidDuration}
            className="cursor-pointer rounded-[7px] px-4 py-2 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              border: "1px solid rgba(34,211,238,0.35)",
              background: "rgba(34,211,238,0.1)",
              color: "#22d3ee",
              transition: "all 0.15s ease",
            }}
          >
            {editingSession ? "Update Session" : "Add Session"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

/**
 * Wrapper that remounts the inner dialog on each open, so the form
 * state is always fresh without needing to reset via effects or refs.
 */
export function AddSessionDialog(props: AddSessionDialogProps) {
  const [mountKey, setMountKey] = useState(0);

  // Increment key when dialog opens to remount with fresh state
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (props.open && !prevOpenRef.current) {
      setMountKey((k) => k + 1);
    }
    prevOpenRef.current = props.open;
  }, [props.open]);

  if (!props.open) return null;

  return <AddSessionDialogInner key={mountKey} {...props} />;
}
