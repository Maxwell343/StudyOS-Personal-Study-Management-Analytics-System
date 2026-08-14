"use client";

import { Bell } from "lucide-react";
import { useSessionTimer } from "@/context/TimerContext";
import { useState, useEffect } from "react";

export function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = currentTime ? currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "";

  const timeString = currentTime ? currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) : "";

  const {
    activeSession,
    isPaused,
    formattedElapsed,
  } = useSessionTimer();

  const currentHour = currentTime ? currentTime.getHours() : null;
  let greeting = "Good day";
  let emoji = "✨";

  if (currentHour !== null) {
    if (currentHour < 12) {
      greeting = "Good morning";
      emoji = "☀️";
    } else if (currentHour < 17) {
      greeting = "Good afternoon";
      emoji = "🌤️";
    } else {
      greeting = "Good evening";
      emoji = "🌙";
    }
  }

  return (
    <header className="flex shrink-0 items-start justify-between px-9 pt-[26px]">
      <div>
        <div className="mb-[3px] flex items-center gap-2">
          <h1 className="m-0 text-2xl font-bold tracking-tight text-[#f0f0f4]">
            {greeting}, Maxwell.
          </h1>
          <span className="text-xl">{emoji}</span>
        </div>
        <p className="m-0 text-[13px]" style={{ color: "#6b6b80" }}>
          I&apos;ve prepared your study plan for today.
        </p>
      </div>
      <div className="mt-0.5 flex items-center gap-4">
        
        {/* Global Compact Timer */}
        <div 
          className="flex items-center gap-3 rounded-lg px-3 py-1.5"
          style={{
            background: activeSession 
              ? isPaused 
                ? "rgba(249,115,22,0.05)" 
                : "rgba(34,197,94,0.05)"
              : "rgba(255,255,255,0.02)",
            border: `1px solid ${
              activeSession
                ? isPaused
                  ? "rgba(249,115,22,0.2)"
                  : "rgba(34,197,94,0.2)"
                : "rgba(255,255,255,0.05)"
            }`
          }}
        >
          <div className="flex flex-col items-end">
            <span 
              className="font-mono text-[13px] font-bold tracking-wider"
              style={{ 
                color: activeSession
                  ? isPaused
                    ? "#f97316"
                    : "#22c55e"
                  : "#6b6b80"
              }}
            >
              {activeSession ? formattedElapsed : "00:00:00"}
            </span>
            <span 
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: "#6b6b80" }}
            >
              {activeSession 
                ? isPaused 
                  ? "PAUSED" 
                  : `${activeSession.subjectName} · ${activeSession.topicName}`
                : "Ready"
              }
            </span>
          </div>
          {activeSession && (
            <div 
              className="h-2 w-2 rounded-full"
              style={{ 
                background: isPaused ? "#f97316" : "#22c55e",
                boxShadow: `0 0 8px ${isPaused ? "rgba(249,115,22,0.5)" : "rgba(34,197,94,0.5)"}`
              }}
            />
          )}
        </div>

        <div className="h-6 w-px bg-white/5" />

        <div className="flex flex-col items-end">
          <div
            className="font-mono text-[11.5px]"
            style={{ color: "#5a5a6a" }}
          >
            {today || "Loading..."}
          </div>
          <div
            className="font-mono text-[10.5px] tracking-wide"
            style={{ color: "#8a8a9e", marginTop: "2px" }}
          >
            {timeString}
          </div>
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
