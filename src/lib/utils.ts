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

