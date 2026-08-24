import { NextRequest, NextResponse } from "next/server";
import { fetchSubjectsForUser } from "@/lib/data-access/subjects";
import { generateAutoPlanRecommendation } from "@/lib/recommendation/engine";
import { getSupabaseClient, getAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getTomorrowDateString } from "@/lib/data-access/planner";
import type { AutoPlannerOptions } from "@/types/auto-planner";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Authenticate request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const requestedUserId = searchParams.get("userId");

    const supabase = getSupabaseClient();
    let authenticatedUserId: string | null = null;

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        authenticatedUserId = data.user.id;
      }
    }

    if (!authenticatedUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        authenticatedUserId = sessionData.session.user.id;
      }
    }

    // In local development fallback to requestedUserId if provided
    if (!authenticatedUserId && requestedUserId && process.env.NODE_ENV !== "production") {
      authenticatedUserId = requestedUserId;
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Unauthorized: Active user session required" },
        { status: 401 }
      );
    }

    const userId = authenticatedUserId;

    // 2. Validate and sanitize parameters
    const targetDateParam = searchParams.get("date");
    const targetDate = targetDateParam && DATE_REGEX.test(targetDateParam)
      ? targetDateParam
      : getTomorrowDateString();

    const rawMinutes = parseInt(searchParams.get("availableMinutes") || "240", 10);
    const availableMinutes = Number.isFinite(rawMinutes)
      ? Math.max(15, Math.min(1440, rawMinutes))
      : 240;

    const startTimeParam = searchParams.get("startTime") || "09:00";
    const preferredStartTime = TIME_REGEX.test(startTimeParam) ? startTimeParam : "09:00";

    const authenticatedClient = getAuthenticatedSupabaseClient(token);

    // 3. Fetch user subjects with topics and learning items
    const subjects = await fetchSubjectsForUser(userId);

    // 4. Fetch past 30 days study history for neglect/frequency calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: studySessions, error: sessionError } = await authenticatedClient
      .from("study_sessions")
      .select("id, started_at, status, learning_item_id")
      .eq("user_id", userId)
      .gte("started_at", thirtyDaysAgo.toISOString());

    if (sessionError) {
      console.warn("Could not fetch historical study sessions for planner:", sessionError.message);
    }

    const historyLogs = (studySessions || []).map((s) => ({
      startedAt: s.started_at,
      status: s.status,
    }));

    // 5. Generate recommendation
    const options: AutoPlannerOptions = {
      userId,
      targetDate,
      availableMinutes,
      preferredStartTime,
    };

    const recommendation = generateAutoPlanRecommendation(subjects, options, historyLogs);

    return NextResponse.json(recommendation, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating auto plan recommendations:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to generate plan recommendation" },
      { status: 500 }
    );
  }
}
