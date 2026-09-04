"use client";

import { Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useSessionTimer } from "@/context/TimerContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";

export function Header() {
  const { profile } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const displayName = profile?.name || "Maxwell";
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
          <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {displayName}.
          </h1>
          <span className="text-xl">{emoji}</span>
        </div>
        <p className="m-0 text-[13px] text-muted-foreground">
          Here&apos;s your focus for today.
        </p>
      </div>
      <div className="mt-0.5 flex items-center gap-3.5">
        
        {/* Global Compact Timer */}
        <div 
          className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-colors"
          style={{
            background: activeSession 
              ? isPaused 
                ? "rgba(249,115,22,0.08)" 
                : "rgba(34,197,94,0.08)"
              : isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(0,0,0,0.03)",
            border: `1px solid ${
              activeSession
                ? isPaused
                  ? "rgba(249,115,22,0.25)"
                  : "rgba(34,197,94,0.25)"
                : isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.07)"
            }`
          }}
        >
          <div className="flex flex-col items-end">
            <span 
              className="font-mono text-[13px] font-bold tracking-wider"
              style={{ 
                color: activeSession
                  ? isPaused
                    ? isDark ? "#f97316" : "#ea580c"
                    : isDark ? "#22c55e" : "#16a34a"
                  : isDark ? "#6b6b80" : "#64748b"
              }}
            >
              {activeSession ? formattedElapsed : "00:00:00"}
            </span>
            <span 
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
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

        <div className="h-6 w-px bg-border" />

        {/* Date and Time */}
        <div className="flex flex-col items-end">
          <div className="font-mono text-[11.5px] text-muted-foreground">
            {today || "Loading..."}
          </div>
          <div className="font-mono text-[10.5px] tracking-wide text-foreground/75 mt-0.5">
            {timeString}
          </div>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-95 shadow-xs"
        >
          {isDark ? (
            <Sun size={15} className="text-amber-400 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon size={15} className="text-slate-700 transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-95 shadow-xs"
          aria-label="Notifications"
        >
          <Bell size={14} />
          <span
            className="absolute top-[7px] right-[7px] h-[5px] w-[5px] rounded-full"
            style={{ background: isDark ? "#22d3ee" : "#0891b2" }}
          />
        </button>

        {/* User Avatar */}
        <Link
          href="/settings"
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[7px] text-xs font-bold text-white no-underline transition hover:opacity-90 shadow-xs"
          style={{
            background: "linear-gradient(135deg, #0891b2, #7c3aed)",
          }}
          aria-label="User avatar settings"
        >
          {displayName.charAt(0).toUpperCase()}
        </Link>
      </div>
    </header>
  );
}

