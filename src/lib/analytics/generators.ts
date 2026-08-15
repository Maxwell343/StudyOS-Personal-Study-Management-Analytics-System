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
    const seenTitles = new Set<string>();

    // 1. Process warnings & behavioral patterns first
    for (const pattern of patterns) {
      if (recommendations.length >= ANALYTICS_CONFIG.MAX_DISPLAYED_RECOMMENDATIONS) {
        break;
      }

      if (pattern.id.startsWith("subject_behind_") && pattern.subjectName) {
        const title = `Add recovery sessions for ${pattern.subjectName}`;
        if (!seenTitles.has(title)) {
          seenTitles.add(title);
          recommendations.push({
            id: `rec_${pattern.id}`,
            title,
            reason: `${pattern.subjectName} is lagging behind planned progress by ${pattern.evidence.summary}.`,
            expectedBenefit: `Brings ${pattern.subjectName} back on track and reduces exam readiness risk.`,
            priority: pattern.severity === "HIGH" ? "HIGH" : "MEDIUM",
            relatedSubjectId: pattern.subjectId,
            relatedSubjectName: pattern.subjectName,
            actionable: true,
          });
        }
      } else if (pattern.id.startsWith("evening_drop_")) {
        const title = "Schedule complex topics earlier in the day";
        if (!seenTitles.has(title)) {
          seenTitles.add(title);
          recommendations.push({
            id: `rec_${pattern.id}`,
            title,
            reason: `Your evening session completion rate is significantly lower than daytime sessions.`,
            expectedBenefit: "Higher session completion and reduced missed session rate.",
            priority: "MEDIUM",
            actionable: true,
          });
        }
      } else if (pattern.id.startsWith("optimal_duration_")) {
        const optimalLabel = pattern.evidence.primaryMetricName;
        const title = `Set target study sessions to ${optimalLabel}`;
        if (!seenTitles.has(title)) {
          seenTitles.add(title);
          recommendations.push({
            id: `rec_${pattern.id}`,
            title,
            reason: `Sessions in the ${optimalLabel} bucket yield your highest completion rate.`,
            expectedBenefit: "Optimizes focus stamina and minimizes abandoned sessions.",
            priority: "LOW",
            actionable: true,
          });
        }
      } else if (pattern.id.startsWith("streak_decline_")) {
        const title = "Focus on short 30-minute daily micro-sessions";
        if (!seenTitles.has(title)) {
          seenTitles.add(title);
          recommendations.push({
            id: `rec_${pattern.id}`,
            title,
            reason: "Your recent session completion rate has dropped compared to the previous period.",
            expectedBenefit: "Restores habit momentum without cognitive burnout.",
            priority: "HIGH",
            actionable: true,
          });
        }
      }
    }

    // 2. If subject risks exist, ensure top critical subject has a recommendation
    const criticalSubjects = subjects.filter((s) => s.riskLevel === "CRITICAL" || s.riskLevel === "AT_RISK");
    for (const sub of criticalSubjects) {
      if (recommendations.length >= ANALYTICS_CONFIG.MAX_DISPLAYED_RECOMMENDATIONS) {
        break;
      }
      const title = `Rebalance weekly schedule toward ${sub.name}`;
      if (!seenTitles.has(title)) {
        seenTitles.add(title);
        recommendations.push({
          id: `rec_subject_risk_${sub.id}`,
          title,
          reason: `${sub.name} is currently flagged as ${sub.riskLevel} with ${sub.completionRate}% completion rate.`,
          expectedBenefit: `Prevents backlog accumulation and improves topic velocity.`,
          priority: sub.riskLevel === "CRITICAL" ? "HIGH" : "MEDIUM",
          relatedSubjectId: sub.id,
          relatedSubjectName: sub.name,
          actionable: true,
        });
      }
    }

    // 3. Fallback healthy recommendation if empty
    if (recommendations.length === 0) {
      recommendations.push({
        id: "rec_maintain_pace",
        title: "Maintain current study momentum",
        reason: "Your study patterns show solid consistency and steady completion rates across active subjects.",
        expectedBenefit: "Sustains steady progress towards learning milestones.",
        priority: "LOW",
        actionable: false,
      });
    }

    return recommendations;
  }
}
