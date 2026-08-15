import type {
  InsightGenerator,
  RecommendationGenerator,
  DetectedPattern,
  JarvisInsight,
  JarvisRecommendation,
  SubjectIntelligenceData,
} from "./types";
import { ANALYTICS_CONFIG } from "./analyticsConfig";

export class RuleBasedInsightGenerator implements InsightGenerator {
  generateInsights(patterns: DetectedPattern[]): JarvisInsight[] {
    if (!patterns || patterns.length === 0) {
      return [];
    }

    // Rank patterns according to multi-dimensional impact score
    const ranked = patterns.map((p) => {
      const { IMPACT, CONFIDENCE, URGENCY, ACTIONABILITY } = ANALYTICS_CONFIG.RANKING_WEIGHTS;

      const priorityScore =
        p.impactScore * IMPACT +
        p.confidence * CONFIDENCE +
        p.urgencyScore * URGENCY +
        p.actionabilityScore * ACTIONABILITY;

      return {
        ...p,
        rankedPriority: Number(priorityScore.toFixed(3)),
      };
    });

    // Sort descending by rankedPriority score
    ranked.sort((a, b) => b.rankedPriority - a.rankedPriority);

    // Return top insights up to maximum configured limit
    return ranked.slice(0, ANALYTICS_CONFIG.MAX_DISPLAYED_INSIGHTS);
  }
}

export class RuleBasedRecommendationGenerator implements RecommendationGenerator {
  generateRecommendations(
    patterns: DetectedPattern[],
    subjects: SubjectIntelligenceData[]
  ): JarvisRecommendation[] {
    const recommendations: JarvisRecommendation[] = [];
    const processedSubjectIds = new Set<string>();

    // 1. Process subject risks first, consolidating duplicate recommendations per subject
    const activeRiskSubjects = subjects.filter(
      (s) => s.activityStatus === "ACTIVE" && (s.riskLevel === "CRITICAL" || s.riskLevel === "AT_RISK")
    );

    for (const sub of activeRiskSubjects) {
      if (processedSubjectIds.has(sub.id)) continue;
      processedSubjectIds.add(sub.id);

      const lag = sub.plannedProgressPercentage - sub.actualProgressPercentage;
      const title = `Recover ${sub.name} pace this week`;
      const reason = `${sub.name} is ${sub.riskLevel === "CRITICAL" ? "critically lagging" : "behind plan"} by ${Math.max(lag, 5)} percentage points.`;
      const expectedBenefit = `Bring ${sub.name} back on track and reduce exam readiness backlog.`;

      recommendations.push({
        id: `rec_subject_recover_${sub.id}`,
        title,
        reason,
        expectedBenefit,
        priority: sub.riskLevel === "CRITICAL" ? "HIGH" : "MEDIUM",
        relatedSubjectId: sub.id,
        relatedSubjectName: sub.name,
        actionable: true,
      });
    }

    // 2. Process behavioral patterns if recommendation slots remain
    for (const pattern of patterns) {
      if (recommendations.length >= ANALYTICS_CONFIG.MAX_DISPLAYED_RECOMMENDATIONS) {
        break;
      }

      if (pattern.id.startsWith("evening_drop_")) {
        const title = "Schedule complex topics during daytime windows";
        if (!recommendations.some((r) => r.id === `rec_${pattern.id}`)) {
          recommendations.push({
            id: `rec_${pattern.id}`,
            title,
            reason: `Your evening session completion rate is lower than morning sessions.`,
            expectedBenefit: "Increases overall session completion rate and minimizes missed study time.",
            priority: "MEDIUM",
            actionable: true,
          });
        }
      } else if (pattern.id.startsWith("optimal_duration_")) {
        const optimalLabel = pattern.evidence.primaryMetricName;
        const title = `Schedule study sessions around ${optimalLabel}`;
        if (!recommendations.some((r) => r.id === `rec_${pattern.id}`)) {
          recommendations.push({
            id: `rec_${pattern.id}`,
            title,
            reason: `Sessions in the ${optimalLabel} bucket yield your highest completion performance.`,
            expectedBenefit: "Sustains optimal focus stamina without cognitive fatigue.",
            priority: "LOW",
            actionable: true,
          });
        }
      }
    }

    // 3. Default fallback recommendation if no urgent issues detected
    if (recommendations.length === 0) {
      recommendations.push({
        id: "rec_maintain_pace",
        title: "Sustain your current study momentum",
        reason: "Your active subjects and planned sessions are progressing steadily.",
        expectedBenefit: "Maintains positive study momentum towards learning targets.",
        priority: "LOW",
        actionable: false,
      });
    }

    return recommendations;
  }
}
