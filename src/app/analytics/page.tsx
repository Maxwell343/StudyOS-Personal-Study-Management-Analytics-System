"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";
import type { AnalyticsTimeRange, JarvisContext, JarvisInsight, SubjectIntelligenceData, JarvisRecommendation } from "@/lib/analytics/types";
import { computeJarvisAnalytics } from "@/lib/analytics/engine";
import { JarvisSnapshot } from "@/components/analytics/JarvisSnapshot";
import { AnalyticsKpiRow } from "@/components/analytics/AnalyticsKpiRow";
import { StudyPerformanceChart } from "@/components/analytics/StudyPerformanceChart";
import { SubjectPerformanceDashboard } from "@/components/analytics/SubjectPerformanceDashboard";
import { JarvisPriorityMatrix } from "@/components/analytics/JarvisPriorityMatrix";
import { TopActionsSection } from "@/components/analytics/TopActionsSection";
import { WhatChangedAndHighlights } from "@/components/analytics/WhatChangedAndHighlights";
import { StudyHealthGauge } from "@/components/analytics/StudyHealthGauge";
import { EvidenceDrawer } from "@/components/analytics/EvidenceDrawer";
import {
  AllInsightsDrawer,
  AllSubjectsDrawer,
  AllRecommendationsDrawer,
  DetailedBehaviorDrawer,
  ExecutiveBriefingDrawer,
} from "@/components/analytics/AnalyticsDrawers";
import { JarvisLoadingState } from "@/components/analytics/JarvisLoadingState";
import { InsufficientDataState } from "@/components/analytics/InsufficientDataState";
import { AnalyticsErrorState } from "@/components/analytics/AnalyticsErrorState";
import { Brain, RefreshCw } from "lucide-react";

export default function AnalyticsPage() {
  const { user, session, profile, loading: authLoading } = useAuth();
  const [range, setRange] = useState<AnalyticsTimeRange>("7d");
  const [data, setData] = useState<JarvisContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Progressive Disclosure Drawer States
  const [selectedEvidence, setSelectedEvidence] = useState<JarvisInsight | null>(null);
  const [showBriefingDrawer, setShowBriefingDrawer] = useState<boolean>(false);
  const [showAllInsights, setShowAllInsights] = useState<boolean>(false);
  const [showAllSubjects, setShowAllSubjects] = useState<boolean>(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState<boolean>(false);
  const [showBehaviorDrawer, setShowBehaviorDrawer] = useState<boolean>(false);

  const userId = user?.id;
  const accessToken = session?.access_token;

  useEffect(() => {
    let isSubscribed = true;

    if (authLoading || !userId) {
      return;
    }

    async function load() {
      await Promise.resolve();
      if (!isSubscribed) return;

      try {
        const headers: Record<string, string> = {
          "x-user-id": userId!,
        };
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const res = await fetch(`/api/jarvis/analytics?range=${range}&userId=${userId}`, {
          headers,
        });

        if (!isSubscribed) return;

        if (res.ok) {
          const json: JarvisContext = await res.json();
          if (isSubscribed) {
            setData(json);
            setError(null);
          }
        } else {
          const fallbackData = await computeJarvisAnalytics(userId!, range, accessToken);
          if (isSubscribed) {
            setData(fallbackData);
            setError(null);
          }
        }
      } catch (err) {
        console.warn("API analytics fetch notice, falling back to direct computation:", err);
        try {
          const fallbackData = await computeJarvisAnalytics(userId!, range, accessToken);
          if (isSubscribed) {
            setData(fallbackData);
            setError(null);
          }
        } catch {
          if (isSubscribed) {
            setError("Could not complete JARVIS analysis");
          }
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isSubscribed = false;
    };
  }, [authLoading, userId, accessToken, range, refreshKey]);

  const handleRangeChange = useCallback((newRange: AnalyticsTimeRange) => {
    setLoading(true);
    setRange(newRange);
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  }, []);

  const username = profile?.name || user?.email?.split("@")[0] || "Maxwell";

  const getRangeLabel = (r: AnalyticsTimeRange) => {
    switch (r) {
      case "30d":
        return "30 Days";
      case "90d":
        return "90 Days";
      default:
        return "7 Days";
    }
  };

  const isPageLoading = authLoading || (userId && loading);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#090d16] text-[#f0f0f4]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#22d3ee]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#22d3ee] border border-[#22d3ee]/20">
                  STUDYOS ANALYTICS ENGINE
                </span>
              </div>
              <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[#f0f0f4] md:text-3xl">
                <Brain className="h-7 w-7 text-[#22d3ee]" />
                Jarvis Intelligence
              </h1>
              <p className="mt-0.5 text-xs text-[#9090a8]">
                Understand your study behavior at a glance.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center rounded-lg border p-1" style={{ background: "rgba(18, 24, 38, 0.9)", borderColor: "rgba(255,255,255,0.1)" }}>
                {(["7d", "30d", "90d"] as AnalyticsTimeRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRangeChange(r)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      range === r
                        ? "bg-[#22d3ee] text-black shadow-sm"
                        : "text-[#9090a8] hover:text-white"
                    }`}
                  >
                    {getRangeLabel(r)}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                disabled={Boolean(isPageLoading)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border text-[#9090a8] hover:bg-white/10 hover:text-white transition-colors"
                style={{ background: "rgba(18, 24, 38, 0.9)", borderColor: "rgba(255,255,255,0.1)" }}
                title="Refresh analysis"
              >
                <RefreshCw className={`h-4 w-4 ${isPageLoading ? "animate-spin text-[#22d3ee]" : ""}`} />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          {isPageLoading ? (
            <JarvisLoadingState />
          ) : error ? (
            <AnalyticsErrorState onRetry={handleRefresh} message={error} />
          ) : !data || !data.meta.isSufficientData ? (
            <InsufficientDataState />
          ) : (
            <div className="space-y-6">
              {/* LEVEL 1: 5-SECOND GLANCE HERO */}
              {/* 1. Compact JARVIS Snapshot */}
              <JarvisSnapshot
                briefing={data.briefing}
                dataQuality={data.dataQuality}
                healthScore={data.healthScore}
                onOpenAnalysis={() => setShowBriefingDrawer(true)}
              />

              {/* 2. Compact 5-card KPI row with sparklines & mini-meters */}
              <AnalyticsKpiRow
                metrics={data.metrics}
                dailyPerformance={data.dailyPerformance}
                healthScore={data.healthScore}
                rangeLabel={getRangeLabel(range)}
              />

              {/* LEVEL 2: 30-SECOND VISUAL STORYTELLING */}
              {/* 3. Primary Visual: Interactive Study Performance Chart */}
              <StudyPerformanceChart
                data={data.dailyPerformance}
                rangeLabel={getRangeLabel(range)}
              />

              {/* 4. Subject Performance Dashboard */}
              <SubjectPerformanceDashboard
                subjects={data.subjects}
                onOpenAllSubjects={() => setShowAllSubjects(true)}
              />

              {/* 6. Overall Study Health Score & What Changed */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <StudyHealthGauge healthScore={data.healthScore} />
                </div>
                <div className="lg:col-span-7">
                  <WhatChangedAndHighlights
                    whatChanged={data.whatChanged}
                    subjects={data.subjects}
                    behavior={data.behavior}
                    onExploreBehavior={() => setShowBehaviorDrawer(true)}
                  />
                </div>
              </div>

              {/* 8. JARVIS Priority Matrix (Impact × Urgency) */}
              <JarvisPriorityMatrix
                insights={data.insights}
                onSelectEvidence={(insight) => setSelectedEvidence(insight)}
                onOpenAllInsights={() => setShowAllInsights(true)}
              />

              {/* 9. Top Action Interventions */}
              <TopActionsSection
                recommendations={data.recommendations}
                onOpenAllRecommendations={() => setShowAllRecommendations(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* LEVEL 3: PROGRESSIVE DISCLOSURE DRAWERS */}
      {/* 1. Executive Briefing Drawer */}
      {data && (
        <ExecutiveBriefingDrawer
          isOpen={showBriefingDrawer}
          onClose={() => setShowBriefingDrawer(false)}
          briefing={data.briefing}
          dataQuality={data.dataQuality}
          username={username}
          insights={data.insights}
          onSelectEvidence={(insight) => {
            setShowBriefingDrawer(false);
            setSelectedEvidence(insight);
          }}
        />
      )}

      {/* 2. Evidence Drawer */}
      {selectedEvidence && (
        <EvidenceDrawer
          isOpen={Boolean(selectedEvidence)}
          onClose={() => setSelectedEvidence(null)}
          insight={selectedEvidence}
        />
      )}

      {/* 3. All Insights Drawer */}
      {data && (
        <AllInsightsDrawer
          isOpen={showAllInsights}
          onClose={() => setShowAllInsights(false)}
          insights={data.insights}
          onSelectEvidence={(insight) => {
            setShowAllInsights(false);
            setSelectedEvidence(insight);
          }}
        />
      )}

      {/* 4. All Subjects Drawer */}
      {data && (
        <AllSubjectsDrawer
          isOpen={showAllSubjects}
          onClose={() => setShowAllSubjects(false)}
          subjects={data.subjects}
        />
      )}

      {/* 5. All Recommendations Drawer */}
      {data && (
        <AllRecommendationsDrawer
          isOpen={showAllRecommendations}
          onClose={() => setShowAllRecommendations(false)}
          recommendations={data.recommendations}
        />
      )}

      {/* 6. Detailed Behavior Drawer */}
      {data && (
        <DetailedBehaviorDrawer
          isOpen={showBehaviorDrawer}
          onClose={() => setShowBehaviorDrawer(false)}
          behavior={data.behavior}
        />
      )}
    </div>
  );
}

