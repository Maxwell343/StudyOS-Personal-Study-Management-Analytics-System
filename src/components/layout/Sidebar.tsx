"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ListTodo,
  BookOpen,
  CheckSquare,
  Timer,
  Calendar,
  BarChart3,
  Target,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutGrid,
  ListTodo,
  BookOpen,
  CheckSquare,
  Timer,
  Calendar,
  BarChart3,
  Target,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const displayName = profile?.name || "Maxwell";

  return (
    <aside
      className="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col border-r max-md:hidden z-30"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-[18px] pt-[22px] pb-[18px]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]"
            style={{
              background: "linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[#f0f0f4]">
              StudyOS
            </div>
            <div
              className="mt-px text-[9.5px] uppercase tracking-[0.8px]"
              style={{ color: "#4a4a5a" }}
            >
              Command Center
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2.5">
        <div
          className="px-2.5 pt-1.5 pb-1.5 text-[9.5px] font-medium uppercase tracking-[0.8px]"
          style={{ color: "#3a3a4a" }}
        >
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const active = item.href
            ? item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
            : false;
          const Icon = ICON_MAP[item.iconName];
          const hasRoute = !!item.href;

          const itemClasses = cn(
            "nav-item flex w-full items-center gap-2.5 rounded-md border-none px-2.5 py-[7.5px] text-left text-[12.5px] mb-px",
            active ? "active font-medium" : "font-normal",
            hasRoute ? "cursor-pointer" : "cursor-default"
          );

          const itemStyle = {
            background: active ? "rgba(34,211,238,0.08)" : "transparent",
            color: active ? "#22d3ee" : hasRoute ? "#6a6a7e" : "#3a3a4a",
          };

          if (hasRoute) {
            return (
              <Link
                key={item.id}
                href={item.href!}
                className={cn(itemClasses, "no-underline")}
                style={itemStyle}
              >
                <span style={{ opacity: active ? 1 : 0.65 }}>
                  {Icon && <Icon size={14} />}
                </span>
                {item.label}
                {active && (
                  <span
                    className="ml-auto h-1 w-1 rounded-full"
                    style={{ background: "#22d3ee" }}
                  />
                )}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              className={itemClasses}
              style={itemStyle}
            >
              <span style={{ opacity: 0.4 }}>
                {Icon && <Icon size={14} />}
              </span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom: Personal User Profile ──────────────────────────────── */}
      <div
        className="mt-auto shrink-0 p-2"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "var(--sidebar)",
        }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2 pt-2 pb-1 no-underline cursor-pointer hover:bg-white/[0.04] transition-colors"
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black"
            style={{
              background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium" style={{ color: "#d0d0e0" }}>
              {displayName}
            </div>
            <div className="truncate text-[10px]" style={{ color: "#5a5a6a" }}>
              Personal Workspace
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
