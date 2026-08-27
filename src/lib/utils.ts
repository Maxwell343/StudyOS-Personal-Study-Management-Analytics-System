import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const err = error as Record<string, unknown>;
    const parts: string[] = [];
    if (err.message && typeof err.message === "string" && err.message.trim()) {
      parts.push(err.message);
    }
    if (err.details && typeof err.details === "string" && err.details.trim()) {
      parts.push(`Details: ${err.details}`);
    }
    if (err.hint && typeof err.hint === "string" && err.hint.trim()) {
      parts.push(`Hint: ${err.hint}`);
    }
    if (err.code && typeof err.code === "string" && err.code.trim()) {
      parts.push(`Code: ${err.code}`);
    }
    if (parts.length > 0) return parts.join(" | ");
    try {
      const str = JSON.stringify(error, Object.getOwnPropertyNames(error));
      return str !== "{}" ? str : String(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

export function sanitizeResourceUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clamps a number between a minimum and maximum boundary.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Formats duration in minutes into a readable string (e.g., "1 hr 30 mins", "45 mins", "0 mins").
 */
export function formatDurationHuman(minutes: number): string {
  if (!minutes || minutes <= 0) return "0 mins";
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins} min${mins === 1 ? "" : "s"}`;
  if (mins === 0) return `${hrs} hr${hrs === 1 ? "" : "s"}`;
  return `${hrs} hr${hrs === 1 ? "" : "s"} ${mins} min${mins === 1 ? "" : "s"}`;
}

/**
 * Truncates a string to a given length and appends an ellipsis if truncated.
 */
export function truncateText(text: string, maxLength: number, suffix = "..."): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}${suffix}`;
}

/**
 * Formats a ratio or percentage number to a formatted string (e.g., "85%", "85.5%").
 */
export function formatPercentage(value: number, decimals = 0): string {
  if (isNaN(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

