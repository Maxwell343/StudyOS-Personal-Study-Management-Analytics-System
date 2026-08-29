import type { CalendarDayData } from "@/types/calendar";

/**
 * Formats a local date and time string (e.g. "2026-08-29", "09:00:00" or "09:00") into iCal timestamp
 */
function formatICalDateTime(dateStr: string, timeStr?: string): string {
  const cleanDate = dateStr.replace(/-/g, "");
  if (!timeStr) {
    return `${cleanDate}T090000`;
  }
  const cleanTime = timeStr.replace(/:/g, "").slice(0, 6).padEnd(6, "0");
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Escapes characters for iCalendar text values (RFC 5545)
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generates an iCalendar (.ics) string from calendar days data
 */
export function generateICalContent(
  days: CalendarDayData[],
  calendarName = "StudyOS Schedule"
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyOS//Study Management System//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    "X-WR-TIMEZONE:UTC",
  ];

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  days.forEach((day) => {
    day.sessions.forEach((session) => {
      const dtStart = formatICalDateTime(day.dateStr, session.startTime);
      const dtEnd = formatICalDateTime(day.dateStr, session.endTime);
      const uid = `studyos-${session.id}@studyos.app`;
      const summary = `${session.subject}: ${session.topic}`;
      const description = `StudyOS Session\\nSubject: ${session.subject}\\nTopic: ${session.topic}\\nDuration: ${session.plannedMinutes} mins\\nStatus: ${session.status.toUpperCase()}`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${now}`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push(`SUMMARY:${escapeICalText(summary)}`);
      lines.push(`DESCRIPTION:${description}`);
      lines.push(`STATUS:${session.status === "completed" ? "CONFIRMED" : "TENTATIVE"}`);
      lines.push("END:VEVENT");
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Exports study calendar sessions to a downloaded .ics file
 */
export function exportCalendarToICS(
  days: CalendarDayData[],
  year: number,
  month: number
): boolean {
  if (typeof window === "undefined") return false;

  const monthPadded = String(month).padStart(2, "0");
  const filename = `studyos-schedule-${year}-${monthPadded}.ics`;
  const icsContent = generateICalContent(days, `StudyOS Plan (${year}-${monthPadded})`);

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
