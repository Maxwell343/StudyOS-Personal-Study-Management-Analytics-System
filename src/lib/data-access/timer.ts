import { supabase } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/database.types";

export type DbStudySession = Database["public"]["Tables"]["study_sessions"]["Row"];

export interface ActiveSessionDetails {
  id: string;
  userId: string;
  plannedSessionId: string | null;
  learningItemId: string | null;
  subjectId: string | null;
  subjectName: string;
  subjectColor: string;
  topicName: string;
  title: string;
  startedAt: string;
  pausedAt: string | null;
  totalPausedSeconds: number;
  plannedMinutes: number;
  status: "ACTIVE" | "PAUSED";
}

/**
 * Calculates current elapsed seconds for a session using timestamps.
 * Survives refresh, browser sleep, background tabs.
 */
export function calculateElapsedSeconds(
  startedAt: string,
  pausedAt: string | null,
  totalPausedSeconds: number
): number {
  const startTime = new Date(startedAt).getTime();
  if (isNaN(startTime)) return 0;

  if (pausedAt) {
    const pauseTime = new Date(pausedAt).getTime();
    return Math.max(0, Math.floor((pauseTime - startTime) / 1000) - (totalPausedSeconds || 0));
  }

  const now = Date.now();
  return Math.max(0, Math.floor((now - startTime) / 1000) - (totalPausedSeconds || 0));
}

/**
 * Calculates actual minutes to persist to database.
 */
export function calculateActualMinutes(elapsedSeconds: number): number {
  return Math.max(1, Math.round(elapsedSeconds / 60));
}

/**
 * Format seconds into mm:ss or hh:mm:ss string.
 */
export function formatTimerSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Fetch any active or paused study session for user.
 */
export async function fetchActiveSession(userId: string): Promise<ActiveSessionDetails | null> {
  const { data: session, error } = await supabase
    .from("study_sessions")
    .select(`
      *,
      learning_items:learning_item_id (
        title,
        topic_id,
        topics:topic_id (
          name,
          subject_id,
          subjects:subject_id (name, color)
        )
      )
    `)
    .eq("user_id", userId)
    .in("status", ["ACTIVE", "PAUSED"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching active session:", error);
    return null;
  }

  if (!session) return null;

  interface NestedSession {
    learning_items: {
      title?: string;
      topics?: {
        name?: string;
        subjects?: { name?: string; color?: string } | { name?: string; color?: string }[] | null;
      } | {
        name?: string;
        subjects?: { name?: string; color?: string } | { name?: string; color?: string }[] | null;
      }[] | null;
    } | null;
  }

  const raw = session as unknown as DbStudySession & NestedSession;
  const li = raw.learning_items;
  const topicObj = Array.isArray(li?.topics) ? li?.topics[0] : li?.topics;
  const subObj = Array.isArray(topicObj?.subjects) ? topicObj?.subjects[0] : topicObj?.subjects;

  return {
    id: session.id,
    userId: session.user_id,
    plannedSessionId: session.planned_session_id,
    learningItemId: session.learning_item_id,
    subjectId: null,
    subjectName: subObj?.name || "Focused Study",
    subjectColor: subObj?.color || "#22d3ee",
    topicName: topicObj?.name || "Session",
    title: li?.title || "Deep Work",
    startedAt: session.started_at,
    pausedAt: session.paused_at,
    totalPausedSeconds: session.total_paused_seconds || 0,
    plannedMinutes: session.planned_minutes,
    status: session.status as "ACTIVE" | "PAUSED",
  };
}

/**
 * Start a new persistent study session.
 */
export async function startStudySession(
  userId: string,
  input: {
    plannedSessionId?: string;
    learningItemId?: string;
    plannedMinutes: number;
    subjectName?: string;
    topicName?: string;
    title?: string;
  }
): Promise<ActiveSessionDetails> {
  // If there's an existing PAUSED session for this planned session, resume it instead of starting anew
  if (input.plannedSessionId) {
    const { data: existingPaused } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("planned_session_id", input.plannedSessionId)
      .eq("status", "PAUSED")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPaused && existingPaused.paused_at) {
      await resumeStudySession(
        existingPaused.id,
        existingPaused.paused_at,
        existingPaused.total_paused_seconds || 0
      );
      const active = await fetchActiveSession(userId);
      if (active) return active;
    }
  }

  const startedAt = new Date().toISOString();

  const insertPayload: Database["public"]["Tables"]["study_sessions"]["Insert"] = {
    user_id: userId,
    planned_session_id: input.plannedSessionId || null,
    learning_item_id: input.learningItemId || null,
    planned_minutes: input.plannedMinutes || 60,
    started_at: startedAt,
    paused_at: null,
    total_paused_seconds: 0,
    status: "ACTIVE",
  };

  const { data, error } = await supabase
    .from("study_sessions")
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;

  // Update learning item status to IN_PROGRESS
  if (input.learningItemId) {
    await supabase
      .from("learning_items")
      .update({
        status: "IN_PROGRESS",
        last_studied_at: startedAt,
      })
      .eq("id", input.learningItemId);
  }

  // Update planned session status to ACTIVE
  if (input.plannedSessionId) {
    await supabase
      .from("planned_sessions")
      .update({
        status: "ACTIVE",
      })
      .eq("id", input.plannedSessionId);
  }

  // Log activity
  const meta: Json = {
    title: input.title || input.topicName || "Study Session",
    planned_minutes: input.plannedMinutes,
  };
  await supabase.from("activity_logs").insert({
    user_id: userId,
    type: "STUDY_SESSION_STARTED",
    learning_item_id: input.learningItemId || null,
    metadata: meta,
  });

  return {
    id: data.id,
    userId: data.user_id,
    plannedSessionId: data.planned_session_id,
    learningItemId: data.learning_item_id,
    subjectId: null,
    subjectName: input.subjectName || "Focused Study",
    subjectColor: "#22d3ee",
    topicName: input.topicName || "Session",
    title: input.title || "Deep Work",
    startedAt: data.started_at,
    pausedAt: null,
    totalPausedSeconds: 0,
    plannedMinutes: data.planned_minutes,
    status: "ACTIVE",
  };
}

/**
 * Pause active session.
 */
export async function pauseStudySession(sessionId: string): Promise<string> {
  const pausedAt = new Date().toISOString();
  const { error } = await supabase
    .from("study_sessions")
    .update({
      status: "PAUSED",
      paused_at: pausedAt,
    })
    .eq("id", sessionId);

  if (error) throw error;
  return pausedAt;
}

/**
 * Resume paused session.
 */
export async function resumeStudySession(
  sessionId: string,
  currentPausedAt: string,
  currentTotalPaused: number
): Promise<number> {
  const pauseStart = new Date(currentPausedAt).getTime();
  const additionalSecs = Math.max(0, Math.floor((Date.now() - pauseStart) / 1000));
  const newTotalPaused = currentTotalPaused + additionalSecs;

  const { error } = await supabase
    .from("study_sessions")
    .update({
      status: "ACTIVE",
      paused_at: null,
      total_paused_seconds: newTotalPaused,
    })
    .eq("id", sessionId);

  if (error) throw error;
  return newTotalPaused;
}

/**
 * Complete study session with accurate actual time and mark progress.
 */
export async function completeStudySession(
  sessionId: string,
  input: {
    userId: string;
    startedAt: string;
    pausedAt: string | null;
    totalPausedSeconds: number;
    learningItemId?: string | null;
    plannedSessionId?: string | null;
    markItemCompleted?: boolean;
    title?: string;
  }
): Promise<number> {
  const elapsed = calculateElapsedSeconds(
    input.startedAt,
    input.pausedAt,
    input.totalPausedSeconds
  );
  const actualMins = calculateActualMinutes(elapsed);
  const endedAt = new Date().toISOString();

  const { error } = await supabase
    .from("study_sessions")
    .update({
      status: "COMPLETED",
      ended_at: endedAt,
      actual_minutes: actualMins,
      paused_at: null,
    })
    .eq("id", sessionId);

  if (error) throw error;

  // Complete learning item if applicable
  if (input.learningItemId) {
    const itemUpdates: Database["public"]["Tables"]["learning_items"]["Update"] = {
      last_studied_at: endedAt,
    };
    if (input.markItemCompleted !== false) {
      itemUpdates.status = "COMPLETED";
      itemUpdates.completed_at = endedAt;
    }
    await supabase
      .from("learning_items")
      .update(itemUpdates)
      .eq("id", input.learningItemId);
  }

  // Complete planned session
  if (input.plannedSessionId) {
    await supabase
      .from("planned_sessions")
      .update({
        status: "COMPLETED",
      })
      .eq("id", input.plannedSessionId);
  }

  // Log activity
  const meta: Json = {
    title: input.title || "Study Session",
    actual_minutes: actualMins,
  };
  await supabase.from("activity_logs").insert({
    user_id: input.userId,
    type: "STUDY_SESSION_COMPLETED",
    learning_item_id: input.learningItemId || null,
    metadata: meta,
  });

  return actualMins;
}

/**
 * Abandon active session.
 */
export async function abandonStudySession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("study_sessions")
    .update({
      status: "ABANDONED",
      ended_at: new Date().toISOString(),
      paused_at: null,
    })
    .eq("id", sessionId);

  if (error) throw error;
}
