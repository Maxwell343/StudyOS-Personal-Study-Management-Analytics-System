import type { SubjectProgressData } from "@/types/dashboard";

interface SubjectProgressProps {
  subjects: SubjectProgressData[];
}

export function SubjectProgress({ subjects }: SubjectProgressProps) {
  return (
    <div
      className="rounded-[10px] px-[18px] py-4"
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
          Subject Progress
        </h2>
        <span className="text-[11px]" style={{ color: "#4a4a5a" }}>
          Semester
        </span>
      </div>
      <div className="flex flex-col gap-[13px]">
        {subjects.map((sub) => (
          <div key={sub.id}>
            <div className="mb-[5px] flex items-center justify-between">
              <span
                className="text-[12.5px] font-medium"
                style={{ color: "#c0c0d0" }}
              >
                {sub.name}
              </span>
              <span
                className="font-mono text-[11px] font-semibold"
                style={{ color: sub.color }}
              >
                {sub.progress}%
              </span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${sub.progress}%`,
                  background: sub.color,
                  boxShadow: `0 0 6px ${sub.color}50`,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
