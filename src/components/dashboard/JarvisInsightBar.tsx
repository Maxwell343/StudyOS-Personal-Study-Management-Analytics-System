interface JarvisInsightBarProps {
  message?: string;
}

export function JarvisInsightBar({ message }: JarvisInsightBarProps) {
  return (
    <div
      className="mb-5 flex items-center gap-3 rounded-lg px-4 py-[11px]"
      style={{
        background: "rgba(34,211,238,0.04)",
        border: "1px solid rgba(34,211,238,0.1)",
      }}
      role="status"
      aria-label="StudyOS insight"
    >
      <div className="flex shrink-0 items-center gap-1.5">
        <div
          className="pulse-dot h-[5px] w-[5px] rounded-full"
          style={{ background: "#22d3ee" }}
        />
        <span
          className="font-mono text-[9.5px] font-semibold uppercase tracking-[1px]"
          style={{ color: "#22d3ee" }}
        >
          StudyOS
        </span>
        <span
          className="font-mono text-[9.5px] tracking-[0.5px]"
          style={{ color: "#3a3a4a" }}
        >
          — INSIGHT
        </span>
      </div>
      <div
        className="h-[14px] w-px shrink-0"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
      <p className="m-0 text-[12.5px]" style={{ color: "#9090a8" }}>
        {message ||
          "StudyOS ready. No study sessions planned for today yet. Use Plan Tomorrow to structure your day."}
      </p>
    </div>
  );
}
