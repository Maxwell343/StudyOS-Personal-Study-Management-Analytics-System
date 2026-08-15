"use client";

import React from "react";
import { Brain, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export const InsufficientDataState: React.FC = () => {
  return (
    <div
      className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border p-8 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        borderColor: "rgba(34, 211, 238, 0.2)",
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border"
        style={{
          background: "rgba(34, 211, 238, 0.1)",
          borderColor: "rgba(34, 211, 238, 0.3)",
        }}
      >
        <Brain className="h-7 w-7 text-[#22d3ee]" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#f0f0f4]">
        JARVIS needs more study history
      </h3>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#9090a8]">
        &quot;I don&apos;t have enough behavioral data yet to identify reliable study patterns. Keep using StudyOS to record study sessions and plan your schedule, and I&apos;ll start detecting meaningful trends as your history grows.&quot;
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/plan-tomorrow"
          className="flex items-center gap-2 rounded-lg bg-[#22d3ee] px-4 py-2.5 text-xs font-bold text-black hover:bg-cyan-300 transition-colors no-underline"
        >
          <Calendar className="h-4 w-4" />
          Plan Study Sessions
        </Link>
        <Link
          href="/subjects"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors no-underline"
        >
          View Curriculum Subjects
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
