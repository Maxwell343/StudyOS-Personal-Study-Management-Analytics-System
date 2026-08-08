export function DailyProgressCard() {
  const progressItems = [
    { label: "PLANNED", value: "5h 00m", color: "#6b6b80" },
    { label: "ACTUAL", value: "0h 00m", color: "#22d3ee" },
    { label: "REMAINING", value: "5h 00m", color: "#f59e0b" },
  ];

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
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.8px]"
            style={{ color: "#f59e0b" }}
          >
            On Track
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
              width: "0%",
              background: "linear-gradient(90deg, #22d3ee, #0ea5e9)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div className="mt-[5px] flex justify-between">
          <span
            className="font-mono text-[10px]"
            style={{ color: "#4a4a5a" }}
          >
            0%
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: "#4a4a5a" }}
          >
            Target: 5h
          </span>
        </div>
      </div>
    </div>
  );
}
