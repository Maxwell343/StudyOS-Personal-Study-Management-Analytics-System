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
  const { user, profile } = useAuth();

  const displayName = profile?.name || user?.user_metadata?.full_name || (user?.email?.split("@")[0] ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1) : "Student");
  const isDemo = user?.email === "demo@studyos.local" || displayName.toLowerCase().includes("demo");

  return (
    <aside
      className="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground max-md:hidden z-30 transition-colors"
    >
      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-[18px] pt-[22px] pb-[18px] border-b border-sidebar-border"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] shadow-xs"
            style={{
              background: "linear-gradient(135deg, #0891b2 0%, #0284c7 100%)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-sidebar-foreground">
              StudyOS
            </div>
            <div
              className="mt-px text-[9.5px] uppercase tracking-[0.8px] text-muted-foreground"
            >
              Command Center
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2.5">
        <div
          className="px-2.5 pt-1.5 pb-1.5 text-[9.5px] font-medium uppercase tracking-[0.8px] text-muted-foreground/70"
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
            "nav-item flex w-full items-center gap-2.5 rounded-md border-none px-2.5 py-[7.5px] text-left text-[12.5px] mb-px transition-colors",
            active
              ? "active font-medium bg-sidebar-accent text-sidebar-primary"
              : hasRoute
                ? "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted/50 cursor-pointer"
                : "text-muted-foreground/40 cursor-default"
          );

          if (hasRoute) {
            return (
              <Link
                key={item.id}
                href={item.href!}
                className={cn(itemClasses, "no-underline")}
              >
                <span className={active ? "opacity-100" : "opacity-70"}>
                  {Icon && <Icon size={14} />}
                </span>
                <span>{item.label}</span>
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary"
                  />
                )}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              className={itemClasses}
            >
              <span className="opacity-40">
                {Icon && <Icon size={14} />}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* ── Bottom: Personal User Profile ──────────────────────────────── */}
      <div
        className="mt-auto shrink-0 p-2 border-t border-sidebar-border bg-sidebar"
      >
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2 pt-2 pb-1 no-underline cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-xs"
            style={{
              background: "linear-gradient(135deg, #0891b2, #7c3aed)",
            }}
            suppressHydrationWarning
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1" suppressHydrationWarning>
            <div className="truncate text-xs font-medium text-sidebar-foreground" suppressHydrationWarning>
              {displayName}
            </div>
            <div className="truncate text-[10px] text-muted-foreground" suppressHydrationWarning>
              {isDemo ? "Demo Workspace" : "Personal Workspace"}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

