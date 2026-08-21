export type DataQualityState = "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT";

export type InsightSeverity = "LOW" | "MEDIUM" | "HIGH";

export type InsightType = "POSITIVE" | "WARNING" | "BEHAVIORAL" | "TIME_BASED";

export type SubjectRiskLevel = "HEALTHY" | "STABLE" | "AT_RISK" | "CRITICAL";

export type SubjectActivityStatus = "ACTIVE" | "INSUFFICIENT_ACTIVITY";

export type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW";

export type TrendDirection = "improving" | "declining" | "stable";

export type AnalyticsTimeRange = "7d" | "30d" | "90d";

export interface MetricValue {
  current: number;
  previous: number;
  difference: number;
  percentageChange: number;
  trend: TrendDirection;
  formattedCurrent: string;
  formattedPrevious: string;
}

export interface CoreMetricsSummary {
  studyTime: MetricValue; // total study minutes
  completionRate: MetricValue; // percentage
  sessionCompletion: MetricValue; // completed / total planned
  averageSessionDuration: MetricValue; // minutes
  scheduleAdherence: MetricValue; // actual study vs target plan %
}

export interface ComparativeEvidenceDetail {
  label: string;
  primaryValue: number;
  comparisonValue: number;
  formattedPrimary: string;
  formattedComparison: string;
  unit?: string;
}

export interface InsightEvidence {
  summary: string;
  primaryMetricName: string;
  comparisonMetricName: string;
  details: ComparativeEvidenceDetail[];
  chartData?: Array<{
    name: string;
    current: number;
    baseline: number;
  }>;
}

export interface DetectedPattern {
  id: string;
  type: InsightType;
  category: string;
  title: string;
  explanation: string;
  severity: InsightSeverity;
  confidence: number; // 0.0 to 1.0
  sampleSize: number;
  effectSize: number; // magnitude of change / difference
  consistency: number; // pattern stability ratio
  evidence: InsightEvidence;
  detectedAt: string;
  subjectId?: string;
  subjectName?: string;
  impactScore: number;
  urgencyScore: number;
  actionabilityScore: number;
}

export interface JarvisInsight extends DetectedPattern {
  rankedPriority: number;
}

export interface SubjectIntelligenceData {
  id: string;
  name: string;
  color: string;
  studyTimeMinutes: number;
  completionRate: number | null; // null if 0/0
  plannedProgressPercentage: number;
  actualProgressPercentage: number;
  trend: TrendDirection;
  missedSessionsCount: number;
  topicCompletionVelocity: number; // items per week
  activityStatus: SubjectActivityStatus;
  riskLevel: SubjectRiskLevel | null; // null if INSUFFICIENT_ACTIVITY
  jarvisCommentary: string;
}

export interface TimeWindowBehavior {
  windowName: "Morning (6 AM–12 PM)" | "Afternoon (12 PM–5 PM)" | "Evening (5 PM–9 PM)" | "Night (9 PM–6 AM)";
  totalSessions: number;
  completionRate: number;
  averageDurationMinutes: number;
}

export interface DurationBucketBehavior {
  bucketLabel: "< 30 min" | "30–45 min" | "45–60 min" | "60–90 min" | "90+ min";
  totalSessions: number;
  completionRate: number;
  averageActualMinutes: number;
}

export interface DayOfWeekBehavior {
  dayName: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  dayIndex: number; // 0=Sun, 1=Mon, etc.
  totalSessions: number;
  completionRate: number;
  studyTimeMinutes: number;
}

export interface BehavioralClaimPhrasing {
  phrase: string;
  tier: "HIGH_CONFIDENCE" | "MODERATE_CONFIDENCE" | "LOW_CONFIDENCE" | "INSUFFICIENT_DATA";
}

export interface BehaviorAnalysisData {
  timeWindows: TimeWindowBehavior[];
  bestStudyTimeWindow: TimeWindowBehavior | null;
  bestStudyTimeClaim: BehavioralClaimPhrasing;
  durationBuckets: DurationBucketBehavior[];
  optimalSessionDuration: DurationBucketBehavior | null;
  optimalDurationClaim: BehavioralClaimPhrasing;
  dayOfWeekPerformance: DayOfWeekBehavior[];
  mostConsistentDay: DayOfWeekBehavior | null;
}

export interface JarvisRecommendation {
  id: string;
  title: string;
  reason: string;
  expectedBenefit: string;
  priority: RecommendationPriority;
  relatedSubjectId?: string;
  relatedSubjectName?: string;
  actionable: boolean;
}

export interface ExecutiveBriefing {
  message: string;
  status: "Healthy" | "Stable" | "Needs Attention" | "Critical";
  overallConfidence: number;
  detectedPatternsCount: number;
  analyzedAt: string;
}

export interface AnalyticsMeta {
  analyzedAt: string;
  dataQuality: DataQualityState;
  sampleSizeSessions: number;
  sampleSizePlanned: number;
  timeRangeDays: number;
  isSufficientData: boolean;
}

export interface DailyPerformancePoint {
  date: string;
  displayDate: string;
  actualMinutes: number;
  plannedMinutes: number;
  actualHours: number;
  plannedHours: number;
  completedSessions: number;
  missedSessions: number;
  totalSessions: number;
  completionRate: number;
}

export interface StudyHealthScore {
  overallScore: number;
  consistencyScore: number;
  completionScore: number;
  adherenceScore: number;
  focusScore: number;
  status: "Exceptional" | "Healthy" | "Attention Needed" | "Critical";
}

export interface PerformanceChangeIndicator {
  id: string;
  label: string;
  value: string;
  changeText: string;
  trend: TrendDirection;
  status: "positive" | "negative" | "neutral" | "warning";
  category: "metric" | "subject";
  explanation: string;
}

export interface SubjectAttentionItem {
  subjectId: string;
  subjectName: string;
  color: string;
  plannedProgress: number;
  actualProgress: number;
  lag: number;
  riskLevel: SubjectRiskLevel | null;
  studyTimeMinutes: number;
  isInactive: boolean;
}

export interface StudyHeatmapDay {
  date: string;
  dayOfWeek: number;
  dayName: string;
  studyMinutes: number;
  studyHours: number;
  sessionCount: number;
  completionRate: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

/**
 * Primary domain object containing structured intelligence payload
 * Input layer for current rule engines & future LLM reasoning models.
 */
export interface JarvisContext {
  range: AnalyticsTimeRange;
  dataQuality: DataQualityState;
  briefing: ExecutiveBriefing;
  metrics: CoreMetricsSummary;
  insights: JarvisInsight[];
  subjects: SubjectIntelligenceData[];
  behavior: BehaviorAnalysisData;
  recommendations: JarvisRecommendation[];
  dailyPerformance: DailyPerformancePoint[];
  healthScore: StudyHealthScore;
  whatChanged: PerformanceChangeIndicator[];
  subjectAttention: SubjectAttentionItem[];
  heatmap: StudyHeatmapDay[];
  meta: AnalyticsMeta;
}

export interface InsightGenerator {
  generateInsights(patterns: DetectedPattern[]): JarvisInsight[];
}

export interface RecommendationGenerator {
  generateRecommendations(patterns: DetectedPattern[], subjects: SubjectIntelligenceData[]): JarvisRecommendation[];
}
