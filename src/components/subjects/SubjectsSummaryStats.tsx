import { BookOpen, Layers, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import type { GlobalLearningSummary } from "@/types/subjects";
import { formatMinutes } from "@/lib/learning-progress";

interface SubjectsSummaryStatsProps {
  summary: GlobalLearningSummary;
}

export function SubjectsSummaryStats({ summary }: SubjectsSummaryStatsProps) {
  const cards = [
    {
      key: "subjects",
      label: "TOTAL SUBJECTS",
      value: String(summary.totalSubjects),
      sub: `${summary.totalTopics} active topic${summary.totalTopics !== 1 ? "s" : ""}`,
      icon: BookOpen,
      color: "#22d3ee",
      bg: "rgba(34,211,238,0.1)",
    },
    {
      key: "items",
      label: "TOTAL ITEMS",
      value: String(summary.totalLearningItems),
      sub: `${summary.remainingLearningItems} remaining to learn`,
      icon: Layers,
      color: "#f97316",
      bg: "rgba(249,115,22,0.1)",
    },
    {
      key: "completed",
      label: "COMPLETED",
      value: String(summary.completedLearningItems),
      sub: `${summary.overallProgressPercent}% completion rate`,
      icon: CheckCircle2,
      color: "#34d399",
      bg: "rgba(52,211,153,0.1)",
    },
    {
      key: "progress",
      label: "OVERALL PROGRESS",
      value: `${summary.overallProgressPercent}%`,
      sub: `${summary.completedLearningItems} / ${summary.totalLearningItems} items mastered`,
      icon: TrendingUp,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.1)",
    },
    {
      key: "time",
      label: "ESTIMATED REMAINING",
      value: formatMinutes(summary.estimatedRemainingMinutes),
      sub: "Across all subjects",
      icon: Clock,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-5 gap-2.5 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className="rounded-[9px] px-4 py-[14px]"
            style={{
              background: "#13131a",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="mb-2.5 flex items-start justify-between">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: c.bg, color: c.color }}
              >
                <Icon size={13} />
              </div>
            </div>
            <div
              className="mb-0.5 font-mono text-xl font-bold tracking-tight"
              style={{ color: c.color }}
            >
              {c.value}
            </div>
            <div
              className="mb-[3px] text-[11px]"
              style={{ color: "#5a5a6a" }}
            >
              {c.sub}
            </div>
            <div
              className="text-[10px] font-medium uppercase tracking-[0.5px]"
              style={{ color: "#3a3a4a" }}
            >
              {c.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
