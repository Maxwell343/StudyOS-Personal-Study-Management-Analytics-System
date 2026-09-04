import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { SubjectProgressData } from "@/types/dashboard";

interface SubjectProgressProps {
  subjects: SubjectProgressData[];
}

export function SubjectProgress({ subjects }: SubjectProgressProps) {
  // Sort subjects by progress ascending to highlight those needing attention, take top 3
  const subjectsNeedingAttention = [...subjects]
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3);

  return (
    <div
      className="flex flex-col rounded-[12px] p-4 transition-all duration-200 bg-card border border-border shadow-xs"
    >
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <BookOpen size={13} className="text-purple-600 dark:text-[#a78bfa]" />
          <h3 className="m-0 text-xs font-bold tracking-tight text-foreground">
            Curriculum Focus
          </h3>
        </div>
        <Link
          href="/subjects"
          className="text-[11px] font-mono text-purple-600 dark:text-[#a78bfa] hover:text-purple-700 dark:hover:text-[#c4b5fd] transition flex items-center gap-0.5"
        >
          All Subjects &rarr;
        </Link>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-[8px] border border-border bg-secondary/30 p-3 text-center text-xs text-muted-foreground">
          No active subjects configured.{" "}
          <Link href="/subjects" className="text-cyan-700 dark:text-cyan-400 underline">
            Explore subjects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {subjectsNeedingAttention.map((sub) => (
            <Link
              key={sub.id}
              href="/subjects"
              className="block group rounded-[8px] border border-border bg-secondary/30 p-2.5 hover:border-cyan-500/30 hover:bg-secondary/60 transition shadow-2xs"
            >
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition truncate">
                  {sub.name}
                </span>
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: sub.color || "#0891b2" }}
                >
                  {sub.progress}%
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sub.progress}%`,
                    background: sub.color || "#0891b2",
                    boxShadow: `0 0 8px ${(sub.color || "#0891b2")}35`,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

