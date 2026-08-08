import {
  Target,
  Timer,
  CheckSquare,
  Flame,
} from "lucide-react";
import type { DailyMetric } from "@/types/dashboard";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Target,
  Timer,
  CheckSquare,
  Flame,
};

function StatCard({ metric }: { metric: DailyMetric }) {
  const Icon = ICON_MAP[metric.iconName];

  return (
    <div
      className="rounded-[9px] px-4 py-[14px]"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-2.5 flex items-start justify-between">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: metric.iconBg, color: metric.iconColor }}
        >
          {Icon && <Icon size={13} />}
        </div>
      </div>
      <div
        className="mb-0.5 font-mono text-xl font-bold tracking-tight"
        style={{ color: metric.iconColor }}
      >
        {metric.value}
      </div>
      <div className="mb-[3px] text-[11px]" style={{ color: "#5a5a6a" }}>
        {metric.sub}
      </div>
      <div
        className="text-[10px] font-medium uppercase tracking-[0.5px]"
        style={{ color: "#3a3a4a" }}
      >
        {metric.label}
      </div>
    </div>
  );
}

export function DailyMetricsGrid({
  metrics,
}: {
  metrics: DailyMetric[];
}) {
  return (
    <div className="mb-4 grid grid-cols-4 gap-2.5 max-lg:grid-cols-2">
      {metrics.map((metric) => (
        <StatCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
