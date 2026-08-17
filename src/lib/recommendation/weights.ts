// ── Configurable Weights & Parameters for Auto Planner Recommendation System ────

export interface RecommendationWeights {
  workloadBaseWeight: number;      // Per uncompleted item weight
  maxWorkloadScore: number;        // Max score component for workload
  priorityHighBonus: number;       // Bonus for HIGH priority
  priorityMediumBonus: number;     // Bonus for MEDIUM priority
  priorityLowBonus: number;        // Bonus for LOW priority
  deadlineUrgentBonus: number;     // Bonus for <= 7 days deadline
  deadlineMediumBonus: number;     // Bonus for <= 14 days deadline
  deadlineFarBonus: number;        // Bonus for <= 30 days deadline
  neglectHighBonus: number;        // Bonus for > 7 days since last studied
  neglectMediumBonus: number;      // Bonus for 4-7 days since last studied
  neglectLowBonus: number;         // Bonus for 2-3 days since last studied
  recentFrequencyPenalty: number;  // Penalty if studied 2+ consecutive recent days
  weeklyDeficitBonus: number;      // Bonus if falling behind weekly target
}

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  workloadBaseWeight: 8,
  maxWorkloadScore: 80,
  priorityHighBonus: 35,
  priorityMediumBonus: 15,
  priorityLowBonus: 5,
  deadlineUrgentBonus: 40,
  deadlineMediumBonus: 25,
  deadlineFarBonus: 10,
  neglectHighBonus: 40,
  neglectMediumBonus: 25,
  neglectLowBonus: 10,
  recentFrequencyPenalty: -25,
  weeklyDeficitBonus: 30,
};

export const DEFAULT_MANDATORY_SUBJECTS = ["Python", "DSA", "Data Structures", "Algorithms"];
