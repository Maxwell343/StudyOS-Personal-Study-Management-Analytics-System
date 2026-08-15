import type { DataQualityState, SubjectRiskLevel } from "./types";

export const ANALYTICS_CONFIG = {
  // Data Quality Thresholds based on total sessions in selected window
  DATA_QUALITY_THRESHOLDS: {
    HIGH_MIN_SESSIONS: 15,
    MODERATE_MIN_SESSIONS: 8,
    LOW_MIN_SESSIONS: 1,
  },

  // Minimum required sessions to generate ANY behavioral pattern or insight
  MIN_SESSIONS_FOR_INSIGHTS: 1,
  MIN_SESSIONS_FOR_TIME_WINDOW: 1,
  MIN_SESSIONS_FOR_DURATION_BUCKET: 1,

  // Duration Buckets (in minutes)
  DURATION_BUCKETS: [
    { label: "< 30 min" as const, min: 0, max: 29 },
    { label: "30–45 min" as const, min: 30, max: 45 },
    { label: "45–60 min" as const, min: 46, max: 60 },
    { label: "60–90 min" as const, min: 61, max: 90 },
    { label: "90+ min" as const, min: 91, max: Infinity },
  ],

  // Subject Risk Level Thresholds
  SUBJECT_RISK: {
    CRITICAL_COMPLETION_BELOW: 55, // % completion
    CRITICAL_PROGRESS_LAG: 20, // percentage points actual behind planned
    AT_RISK_COMPLETION_BELOW: 75,
    AT_RISK_PROGRESS_LAG: 10,
    HEALTHY_COMPLETION_ABOVE: 85,
  },

  // Multi-Factor Confidence Weights
  CONFIDENCE_WEIGHTS: {
    SAMPLE_SIZE_WEIGHT: 0.4,
    EFFECT_SIZE_WEIGHT: 0.35,
    CONSISTENCY_WEIGHT: 0.25,
  },

  // Insight Ranking Score Weights
  RANKING_WEIGHTS: {
    IMPACT: 0.35,
    CONFIDENCE: 0.25,
    URGENCY: 0.2,
    ACTIONABILITY: 0.15,
    RECENCY: 0.05,
  },

  // Max insights to display on JARVIS UI
  MAX_DISPLAYED_INSIGHTS: 5,
  MAX_DISPLAYED_RECOMMENDATIONS: 4,
};

export function classifyDataQuality(totalSessions: number): DataQualityState {
  if (totalSessions >= ANALYTICS_CONFIG.DATA_QUALITY_THRESHOLDS.HIGH_MIN_SESSIONS) {
    return "HIGH";
  }
  if (totalSessions >= ANALYTICS_CONFIG.DATA_QUALITY_THRESHOLDS.MODERATE_MIN_SESSIONS) {
    return "MODERATE";
  }
  if (totalSessions >= ANALYTICS_CONFIG.DATA_QUALITY_THRESHOLDS.LOW_MIN_SESSIONS) {
    return "LOW";
  }
  return "INSUFFICIENT";
}

export function classifySubjectRisk(
  completionRate: number,
  plannedProgress: number,
  actualProgress: number
): SubjectRiskLevel {
  const progressLag = Math.max(0, plannedProgress - actualProgress);

  if (
    completionRate < ANALYTICS_CONFIG.SUBJECT_RISK.CRITICAL_COMPLETION_BELOW ||
    progressLag >= ANALYTICS_CONFIG.SUBJECT_RISK.CRITICAL_PROGRESS_LAG
  ) {
    return "CRITICAL";
  }

  if (
    completionRate < ANALYTICS_CONFIG.SUBJECT_RISK.AT_RISK_COMPLETION_BELOW ||
    progressLag >= ANALYTICS_CONFIG.SUBJECT_RISK.AT_RISK_PROGRESS_LAG
  ) {
    return "AT_RISK";
  }

  if (
    completionRate >= ANALYTICS_CONFIG.SUBJECT_RISK.HEALTHY_COMPLETION_ABOVE &&
    progressLag < 5
  ) {
    return "HEALTHY";
  }

  return "STABLE";
}
