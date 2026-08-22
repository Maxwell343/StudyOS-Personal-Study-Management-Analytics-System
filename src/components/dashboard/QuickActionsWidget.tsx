import Link from "next/link";
import { Plus, Calendar, CheckSquare, BookOpen, BarChart3, Clock } from "lucide-react";

interface QuickActionsWidgetProps {
  onAddSession?: () => void;
}

export function QuickActionsWidget({ onAddSession }: QuickActionsWidgetProps) {
  return (
    <div
      className="mb-4 rounded-[12px] p-4 transition-all duration-200"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[1px] text-[#22d3ee]">
          Quick Actions
        </span>
        <span className="text-[10px] font-mono text-[#52525b]">Fast Access</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {onAddSession && (
          <button
            type="button"
            onClick={onAddSession}
            className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-cyan-500/25 bg-cyan-500/10 px-3 py-2.5 text-xs font-semibold text-[#22d3ee] hover:bg-cyan-500/20 transition active:scale-95 text-left"
          >
            <Plus size={13} className="shrink-0" />
            <span className="truncate">Add Session</span>
          </button>
        )}

        <Link
          href="/plan-tomorrow"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-[#d4d4d8] hover:border-white/[0.15] hover:text-white transition active:scale-95"
        >
          <Calendar size={13} className="shrink-0 text-[#a78bfa]" />
          <span className="truncate">Plan Tomorrow</span>
        </Link>

        <Link
          href="/tasks"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-[#d4d4d8] hover:border-white/[0.15] hover:text-white transition active:scale-95"
        >
          <CheckSquare size={13} className="shrink-0 text-[#34d399]" />
          <span className="truncate">Tasks & Goals</span>
        </Link>

        <Link
          href="/subjects"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-[#d4d4d8] hover:border-white/[0.15] hover:text-white transition active:scale-95"
        >
          <BookOpen size={13} className="shrink-0 text-[#f59e0b]" />
          <span className="truncate">Curricula</span>
        </Link>
      </div>
    </div>
  );
}
