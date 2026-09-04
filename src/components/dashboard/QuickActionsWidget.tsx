import Link from "next/link";
import { Plus, Calendar, CheckSquare, BookOpen, BarChart3, CalendarDays } from "lucide-react";

interface QuickActionsWidgetProps {
  onAddSession?: () => void;
}

export function QuickActionsWidget({ onAddSession }: QuickActionsWidgetProps) {
  return (
    <div
      className="mb-4 rounded-[12px] p-4 transition-all duration-200 bg-card border border-border shadow-xs"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[1px] text-cyan-600 dark:text-cyan-400">
          Quick Actions
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">Fast Access</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {onAddSession ? (
          <button
            type="button"
            onClick={onAddSession}
            className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-cyan-500/35 bg-cyan-500/10 px-3 py-2.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition active:scale-95 text-left shadow-xs"
            aria-label="Add study session"
          >
            <Plus size={13} className="shrink-0" />
            <span className="truncate">Add Session</span>
          </button>
        ) : (
          <Link
            href="/planner"
            className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-cyan-500/35 bg-cyan-500/10 px-3 py-2.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition active:scale-95 text-left shadow-xs"
            aria-label="Launch study planner"
          >
            <Plus size={13} className="shrink-0" />
            <span className="truncate">Plan Session</span>
          </Link>
        )}

        <Link
          href="/plan-tomorrow"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-secondary/40 px-3 py-2.5 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:border-border transition active:scale-95 shadow-xs"
          aria-label="Plan tomorrow's study schedule"
        >
          <Calendar size={13} className="shrink-0 text-purple-600 dark:text-[#a78bfa]" />
          <span className="truncate">Plan Tomorrow</span>
        </Link>

        <Link
          href="/tasks"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-secondary/40 px-3 py-2.5 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:border-border transition active:scale-95 shadow-xs"
          aria-label="View tasks and goals"
        >
          <CheckSquare size={13} className="shrink-0 text-emerald-600 dark:text-[#34d399]" />
          <span className="truncate">Tasks & Goals</span>
        </Link>

        <Link
          href="/subjects"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-secondary/40 px-3 py-2.5 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:border-border transition active:scale-95 shadow-xs"
          aria-label="View subject curricula"
        >
          <BookOpen size={13} className="shrink-0 text-amber-600 dark:text-[#f59e0b]" />
          <span className="truncate">Curricula</span>
        </Link>

        <Link
          href="/calendar"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-secondary/40 px-3 py-2.5 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:border-border transition active:scale-95 shadow-xs"
          aria-label="Open study calendar"
        >
          <CalendarDays size={13} className="shrink-0 text-sky-600 dark:text-[#38bdf8]" />
          <span className="truncate">Calendar</span>
        </Link>

        <Link
          href="/analytics"
          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-secondary/40 px-3 py-2.5 text-xs font-medium text-foreground/80 hover:bg-secondary hover:text-foreground hover:border-border transition active:scale-95 shadow-xs"
          aria-label="Open study analytics"
        >
          <BarChart3 size={13} className="shrink-0 text-pink-600 dark:text-[#ec4899]" />
          <span className="truncate">Analytics</span>
        </Link>
      </div>
    </div>
  );
}

