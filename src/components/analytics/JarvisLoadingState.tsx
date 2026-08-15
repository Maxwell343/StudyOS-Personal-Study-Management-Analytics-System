"use client";

import React, { useState, useEffect } from "react";
import { Brain, Loader2 } from "lucide-react";

export const JarvisLoadingState: React.FC = () => {
  const steps = [
    "Analyzing study sessions...",
    "Checking subject performance...",
    "Detecting behavioral patterns...",
    "Calculating confidence scores...",
    "Generating JARVIS insights...",
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border p-8 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        borderColor: "rgba(34, 211, 238, 0.2)",
      }}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Pulsing outer aura */}
        <div className="absolute inset-0 rounded-full bg-[#22d3ee]/20 animate-ping" />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(167, 139, 250, 0.15))",
            borderColor: "rgba(34, 211, 238, 0.4)",
          }}
        >
          <Brain className="h-8 w-8 text-[#22d3ee] animate-pulse" />
        </div>
      </div>

      <h3 className="mt-6 text-base font-bold uppercase tracking-wider text-[#22d3ee]">
        JARVIS ANALYZING
      </h3>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-[#d0d0e0]">
        <Loader2 className="h-4 w-4 animate-spin text-[#22d3ee]" />
        <span>{steps[currentStepIndex]}</span>
      </div>

      {/* Progress Dots */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: idx === currentStepIndex ? "24px" : "6px",
              background: idx <= currentStepIndex ? "#22d3ee" : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
};
