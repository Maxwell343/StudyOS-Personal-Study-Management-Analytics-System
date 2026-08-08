"use client";

import { useState } from "react";
import type { DailyTask } from "@/types/dashboard";

interface TaskListCardProps {
  tasks: DailyTask[];
}

export function TaskListCard({ tasks }: TaskListCardProps) {
  const [taskDone, setTaskDone] = useState<Record<string, boolean>>(
    Object.fromEntries(tasks.map((t) => [t.id, t.done]))
  );

  const completedCount = Object.values(taskDone).filter(Boolean).length;

  const toggleTask = (id: string) => {
    setTaskDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="rounded-[10px] px-[18px] py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
          Today&apos;s Tasks
        </h2>
        <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
          {completedCount}/{tasks.length} done
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {tasks.map((task) => {
          const done = taskDone[task.id];
          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left"
              style={{
                background: done ? "rgba(34,197,94,0.04)" : "transparent",
                transition: "all 0.12s",
              }}
            >
              {/* Checkbox */}
              <div
                className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded"
                style={{
                  border: `1.5px solid ${done ? "#22c55e" : "rgba(255,255,255,0.12)"}`,
                  background: done ? "#22c55e" : "transparent",
                  transition: "all 0.12s",
                }}
              >
                {done && (
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
              {/* Content */}
              <div className="min-w-0 flex-1">
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px]"
                  style={{
                    color: done ? "#4a4a5a" : "#c0c0d0",
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {task.label}
                </div>
                <div
                  className="mt-px text-[10px]"
                  style={{ color: "#3a3a4a" }}
                >
                  {task.subject}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
