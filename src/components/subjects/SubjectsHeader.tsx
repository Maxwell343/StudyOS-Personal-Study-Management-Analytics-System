"use client";

import { Plus } from "lucide-react";

interface SubjectsHeaderProps {
  onAddSubject: () => void;
}

export function SubjectsHeader({ onAddSubject }: SubjectsHeaderProps) {
  return (
    <header className="flex shrink-0 items-start justify-between px-9 pt-[26px]">
      <div>
        <div className="mb-[3px] flex items-center gap-2.5">
          <h1 className="m-0 text-2xl font-bold tracking-tight text-[#f0f0f4]">
            Subjects
          </h1>
          <div
            className="flex items-center gap-1 rounded px-2 py-[3px]"
            style={{
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            <span
              className="font-mono text-[9.5px] font-bold uppercase tracking-[0.8px]"
              style={{ color: "#22d3ee" }}
            >
              Curriculum Workspace
            </span>
          </div>
        </div>
        <p className="m-0 text-[13px]" style={{ color: "#6b6b80" }}>
          Organize what you&apos;re learning, track your progress, and continue where you left off.
        </p>
      </div>

      <div className="mt-0.5 flex items-center gap-2.5">
        <button
          onClick={onAddSubject}
          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-4 py-2 text-[12px] font-semibold"
          style={{
            border: "1px solid rgba(34,211,238,0.35)",
            background: "rgba(34,211,238,0.1)",
            color: "#22d3ee",
            transition: "all 0.15s ease",
          }}
        >
          <Plus size={13} />
          Add Subject
        </button>
      </div>
    </header>
  );
}
