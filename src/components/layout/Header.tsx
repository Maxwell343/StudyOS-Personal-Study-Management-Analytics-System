import { Bell } from "lucide-react";

export function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex shrink-0 items-start justify-between px-9 pt-[26px]">
      <div>
        <div className="mb-[3px] flex items-center gap-2">
          <h1 className="m-0 text-2xl font-bold tracking-tight text-[#f0f0f4]">
            Good morning, Maxwell.
          </h1>
          <span className="text-xl">☀️</span>
        </div>
        <p className="m-0 text-[13px]" style={{ color: "#6b6b80" }}>
          I&apos;ve prepared your study plan for today.
        </p>
      </div>
      <div className="mt-0.5 flex items-center gap-2.5">
        <div
          className="font-mono text-[11.5px]"
          style={{ color: "#5a5a6a" }}
        >
          {today}
        </div>
        <button
          className="relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[7px]"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#7a7a8e",
          }}
          aria-label="Notifications"
        >
          <Bell size={14} />
          <span
            className="absolute top-[7px] right-[7px] h-[5px] w-[5px] rounded-full"
            style={{ background: "#22d3ee" }}
          />
        </button>
        <div
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[7px] text-xs font-bold text-black"
          style={{
            background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
          }}
          role="img"
          aria-label="User avatar"
        >
          M
        </div>
      </div>
    </header>
  );
}
