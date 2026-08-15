"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AnalyticsErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export const AnalyticsErrorState: React.FC<AnalyticsErrorStateProps> = ({
  onRetry,
  message = "JARVIS couldn't complete the analysis.",
}) => {
  return (
    <div
      className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border p-8 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)",
        borderColor: "rgba(239, 68, 68, 0.25)",
      }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>

      <h3 className="mt-4 text-base font-bold text-[#f0f0f4]">{message}</h3>

      <p className="mt-1 max-w-sm text-xs text-[#9090a8]">
        An unexpected error occurred while analyzing your study records. Please try again.
      </p>

      <button
        onClick={onRetry}
        className="mt-5 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Retry Analysis
      </button>
    </div>
  );
};
