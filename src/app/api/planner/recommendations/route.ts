import { NextRequest, NextResponse } from "next/server";
import { fetchSubjectsForUser } from "@/lib/data-access/subjects";
import { generateAutoPlanRecommendation } from "@/lib/recommendation/engine";
import { supabase } from "@/lib/supabase/client";
import { getTomorrowDateString } from "@/lib/data-access/planner";
import type { AutoPlannerOptions } from "@/types/auto-planner";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const targetDate = searchParams.get("date") || getTomorrowDateString();
    const availableMinutes = parseInt(searchParams.get("availableMinutes") || "240", 10);
    const preferredStartTime = searchParams.get("startTime") || "09:00";

    if (!userId) {
      return NextResponse.json({ error: "Missing required parameter: userId" }, { status: 400 });
    }

    // 1. Fetch user subjects with topics and learning items
    const subjects = await fetchSubjectsForUser(userId);

    // 2. Fetch past 30 days study history for neglect/frequency calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: studySessions } = await supabase
      .from("study_sessions")
      .select("id, started_at, status, learning_item_id")
      .eq("user_id", userId)
      .gte("started_at", thirtyDaysAgo.toISOString());

    const historyLogs = (studySessions || []).map((s) => ({
      startedAt: s.started_at,
      status: s.status,
    }));

    // 3. Generate recommendation
    const options: AutoPlannerOptions = {
      userId,
      targetDate,
      availableMinutes,
      preferredStartTime,
    };

    const recommendation = generateAutoPlanRecommendation(subjects, options, historyLogs);

    return NextResponse.json(recommendation, { status: 200 });
  } catch (error: unknown) {
    console.error("Error generating auto plan recommendations:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to generate plan recommendation" },
      { status: 500 }
    );
  }
}
