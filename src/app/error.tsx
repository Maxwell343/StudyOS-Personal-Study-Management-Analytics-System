"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StudyOS Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-900/60 shadow-xl shadow-rose-950/50 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono tracking-widest text-rose-400 uppercase font-semibold">
            System Alert
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Encountered an Unexpected Exception
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error.message || "An unforeseen system anomaly occurred while rendering this interface."}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-500 bg-slate-900 py-1 px-2.5 rounded-md inline-block">
              Digest ID: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Action
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
