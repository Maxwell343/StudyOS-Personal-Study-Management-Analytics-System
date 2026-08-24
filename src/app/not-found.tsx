import Link from "next/link";
import { Compass, Home, BookOpen, Calendar, CheckSquare, BarChart3 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-indigo-950/40 text-indigo-400">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase font-semibold">
            [404] Sector Not Found
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Lost in Hyper-Space
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The coordinates or page you requested do not exist in the StudyOS memory bank or have been relocated.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
          >
            <Home className="w-4 h-4" />
            Command Center
          </Link>
          <Link
            href="/subjects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Subjects
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
          <Link
            href="/calendar"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Calendar</span>
          </Link>
          <Link
            href="/tasks"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Tasks</span>
          </Link>
          <Link
            href="/analytics"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
