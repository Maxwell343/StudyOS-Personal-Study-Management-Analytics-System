import { formatMinutes } from "@/lib/planner-utils";

interface DailyProgressCardProps {
  targetMinutes?: number;
  actualMinutes?: number;
}

export function DailyProgressCard({
  targetMinutes = 0,
  actualMinutes = 0,
}: DailyProgressCardProps) {
  const remainingMinutes = Math.max(0, targetMinutes - actualMinutes);
  const percent =
    targetMinutes > 0
      ? Math.min(100, Math.round((actualMinutes / targetMinutes) * 100))
      : 0;
  const isTargetMet = actualMinutes >= targetMinutes && targetMinutes > 0;
  const hasPlan = targetMinutes > 0;

  const progressItems = [
    { label: "PLANNED", value: formatMinutes(targetMinutes), color: "#6b6b80" },
    { label: "ACTUAL", value: formatMinutes(actualMinutes), color: "#22d3ee" },
    {
      label: "REMAINING",
      value: formatMinutes(remainingMinutes),
      color: isTargetMet ? "#22c55e" : "#f59e0b",
    },
  ];

  const badgeText = isTargetMet
    ? "Target Met"
    : hasPlan
      ? "On Track"
      : "No Plan Set";

  const badgeColor = isTargetMet ? "#22c55e" : hasPlan ? "#f59e0b" : "#6b6b80";
  const badgeBg = isTargetMet
    ? "rgba(34,197,94,0.1)"
    : hasPlan
      ? "rgba(245,158,11,0.1)"
      : "rgba(255,255,255,0.04)";
  const badgeBorder = isTargetMet
    ? "rgba(34,197,94,0.2)"
    : hasPlan
      ? "rgba(245,158,11,0.2)"
      : "rgba(255,255,255,0.08)";

  return (
    <div
      className="mb-5 rounded-[9px] px-5 py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-xs font-semibold tracking-tight"
          style={{ color: "#c0c0d0" }}
        >
          Daily Progress
        </span>
        <div
          className="rounded px-2.5 py-[3px]"
          style={{
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
          }}
        >
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.8px]"
            style={{ color: badgeColor }}
          >
            {badgeText}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-3.5 grid grid-cols-3 gap-4">
        {progressItems.map((item) => (
          <div
            key={item.label}
            className="rounded-md py-2.5 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              className="mb-[5px] font-mono text-[9.5px] uppercase tracking-[1px]"
              style={{ color: "#4a4a5a" }}
            >
              {item.label}
            </div>
            <div
              className="font-mono text-lg font-bold tracking-tight"
              style={{ color: item.color }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="relative h-1.5 overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${percent}%`,
              background: isTargetMet
                ? "linear-gradient(90deg, #22c55e, #10b981)"
                : "linear-gradient(90deg, #22d3ee, #0ea5e9)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div className="mt-[5px] flex justify-between">
          <span
            className="font-mono text-[10px]"
            style={{ color: "#4a4a5a" }}
          >
            {percent}%
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: "#4a4a5a" }}
          >
            Target: {formatMinutes(targetMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
