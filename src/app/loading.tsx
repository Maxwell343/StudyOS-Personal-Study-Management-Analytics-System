export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
      <div className="flex flex-col items-center gap-4">
        {/* Animated glowing loader */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-cyan-400 border-b-transparent animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase font-semibold">
            StudyOS Core
          </p>
          <p className="text-xs text-slate-400 animate-pulse font-mono">
            Synchronizing telemetry & neural state...
          </p>
        </div>
      </div>
    </div>
  );
}
