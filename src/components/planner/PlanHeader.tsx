"use client";

import { useState } from "react";
import { Save, Lock, Unlock, Sparkles } from "lucide-react";

interface PlanHeaderProps {
  isLocked: boolean;
  onSaveDraft: () => void;
  onToggleLock: () => void;
  onOpenAutoPlanner?: () => void;
}

export function PlanHeader({
  isLocked,
  onSaveDraft,
  onToggleLock,
  onOpenAutoPlanner,
}: PlanHeaderProps) {
  const [formattedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  return (
    <header className="flex shrink-0 items-start justify-between px-9 pt-[26px]">
      <div>
        <div className="mb-[3px] flex items-center gap-2.5">
          <h1 className="m-0 text-2xl font-bold tracking-tight text-[#f0f0f4]">
            Plan Tomorrow
          </h1>
          {isLocked && (
            <div
              className="flex items-center gap-1 rounded px-2 py-[3px]"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <Lock size={9} style={{ color: "#22c55e" }} />
              <span
                className="font-mono text-[9.5px] font-bold uppercase tracking-[0.8px]"
                style={{ color: "#22c55e" }}
              >
                Locked
              </span>
            </div>
          )}
        </div>
        <p className="m-0 text-[13px]" style={{ color: "#6b6b80" }}>
          Build your study plan for tomorrow.
        </p>
        <p className="m-0 mt-0.5 text-[11px]" style={{ color: "#4a4a5a" }}>
          {formattedDate}
        </p>
      </div>
      <div className="mt-0.5 flex items-center gap-2.5">
        {onOpenAutoPlanner && !isLocked && (
          <button
            onClick={onOpenAutoPlanner}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-3.5 py-2 text-[12px] font-bold transition shadow-lg"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))",
              border: "1px solid rgba(34,211,238,0.4)",
              color: "#22d3ee",
            }}
          >
            <Sparkles size={13} className="text-[#22d3ee] animate-pulse" />
            Auto Planner
          </button>
        )}

        {!isLocked && (
          <button
            onClick={onSaveDraft}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-4 py-2 text-[12px] font-medium"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "#a0a0b8",
              transition: "all 0.15s ease",
            }}
          >
            <Save size={12} />
            Save Draft
          </button>
        )}

        <button
          onClick={onToggleLock}
          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-4 py-2 text-[12px] font-semibold"
          style={{
            border: isLocked
              ? "1px solid rgba(245,158,11,0.3)"
              : "1px solid rgba(34,211,238,0.35)",
            background: isLocked
              ? "rgba(245,158,11,0.1)"
              : "rgba(34,211,238,0.1)",
            color: isLocked ? "#f59e0b" : "#22d3ee",
            transition: "all 0.15s ease",
          }}
        >
          {isLocked ? (
            <>
              <Unlock size={12} />
              Unlock Plan
            </>
          ) : (
            <>
              <Lock size={12} />
              Lock Tomorrow&apos;s Plan
            </>
          )}
        </button>
      </div>
    </header>
  );
}
