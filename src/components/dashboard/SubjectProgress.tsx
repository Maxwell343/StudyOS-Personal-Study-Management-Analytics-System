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
      className="flex flex-col rounded-[12px] p-4 transition-all duration-200"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <BookOpen size={13} className="text-[#a78bfa]" />
          <h3 className="m-0 text-xs font-bold tracking-tight text-[#f0f0f4]">
            Curriculum Focus
          </h3>
        </div>
        <Link
          href="/subjects"
          className="text-[11px] font-mono text-[#a78bfa] hover:text-[#c4b5fd] transition flex items-center gap-0.5"
        >
          All Subjects &rarr;
        </Link>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-[8px] border border-white/[0.04] bg-white/[0.015] p-3 text-center text-xs text-[#71717a]">
          No active subjects configured.{" "}
          <Link href="/subjects" className="text-[#22d3ee] underline">
            Explore subjects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {subjectsNeedingAttention.map((sub) => (
            <Link
              key={sub.id}
              href="/subjects"
              className="block group rounded-[8px] border border-white/[0.04] bg-white/[0.015] p-2.5 hover:border-white/[0.1] hover:bg-white/[0.03] transition"
            >
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#f4f4f5] group-hover:text-cyan-300 transition truncate">
                  {sub.name}
                </span>
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: sub.color || "#22d3ee" }}
                >
                  {sub.progress}%
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sub.progress}%`,
                    background: sub.color || "#22d3ee",
                    boxShadow: `0 0 8px ${(sub.color || "#22d3ee")}40`,
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

