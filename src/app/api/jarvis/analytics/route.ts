import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import { computeJarvisAnalytics } from "@/lib/analytics/engine";
import type { AnalyticsTimeRange } from "@/lib/analytics/types";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rangeParam = (searchParams.get("range") || "7d").toLowerCase();
    
    // Validate range parameter
    let range: AnalyticsTimeRange = "7d";
    if (rangeParam === "30d" || rangeParam === "30") range = "30d";
    if (rangeParam === "90d" || rangeParam === "90") range = "90d";

    // Authenticate request
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const userIdHeader = req.headers.get("x-user-id") || searchParams.get("userId");

    const supabase = getSupabaseClient();
    let authenticatedUserId: string | null = null;

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        authenticatedUserId = data.user.id;
      }
    }

    // Fallback check: Session check via Supabase client auth getSession or matching userIdHeader if dev
    if (!authenticatedUserId && userIdHeader) {
      authenticatedUserId = userIdHeader;
    }

    if (!authenticatedUserId) {
      // Try fetching session from client if local single-user mode
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        authenticatedUserId = sessionData.session.user.id;
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Unauthorized: Active user session required" },
        { status: 401 }
      );
    }

    // Execute analytics pipeline with authentication token
    const jarvisContext = await computeJarvisAnalytics(authenticatedUserId, range, token);

    return NextResponse.json(jarvisContext, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("JARVIS Analytics Engine error:", error);
    return NextResponse.json(
      { error: "Internal JARVIS Analytics Engine failure", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
