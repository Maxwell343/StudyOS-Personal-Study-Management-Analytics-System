import type { Subject } from "@/types/subjects";
import type {
  AutoPlannerOptions,
  AutoPlannerRecommendation,
  RecommendedSessionItem,
  RecommendedTopicItem,
  WeeklySubjectBalance,
  SubjectPriority,
} from "@/types/auto-planner";
import {
  DEFAULT_RECOMMENDATION_WEIGHTS,
  DEFAULT_MANDATORY_SUBJECTS,
} from "./weights";

export interface StudyHistoryEntry {
  subjectId?: string;
  subjectName?: string;
  startedAt: string; // ISO or YYYY-MM-DD
  status: string;
}

/**
 * Format minutes into clean time string HH:MM
 */
function addMinutesToTimeString(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = (h || 9) * 60 + (m || 0) + minutes;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/**
 * Calculate difference in days between two YYYY-MM-DD or ISO strings
 */
function diffInDays(dateStrA: string, dateStrB: string): number {
  const dA = new Date(dateStrA);
  const dB = new Date(dateStrB);
  const diffMs = Math.abs(dB.getTime() - dA.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Auto Planner Recommendation Engine
 * Recommends an optimal daily study plan balancing mandatory subjects, rotating optional subjects,
 * workload, priorities, deadlines, days since last studied, and daily available time.
 */
export function generateAutoPlanRecommendation(
  subjects: Subject[],
  options: AutoPlannerOptions,
  history: StudyHistoryEntry[] = []
): AutoPlannerRecommendation {
  const targetDate = options.targetDate;
  const availableMinutes = options.availableMinutes || 240; // Default 4 hours
  let currentStartTime = options.preferredStartTime || "09:00";

  const mandatoryNames = (options.mandatorySubjectNames || DEFAULT_MANDATORY_SUBJECTS).map((n) =>
    n.toLowerCase().trim()
  );

  // Map user overrides
  const overrideMap = new Map<string, { isMandatory?: boolean; priority?: SubjectPriority; weeklyTargetDays?: number }>();
  if (options.overrides) {
    for (const ov of options.overrides) {
      overrideMap.set(ov.subjectId, ov);
    }
  }

  // 1. Analyze and score each active subject
  const scoredSubjects = subjects
    .filter((s) => !s.archived)
    .map((subject) => {
      const ov = overrideMap.get(subject.id);

      // Mandatory check: Python & DSA or explicit override
      const nameLower = subject.name.toLowerCase().trim();
      const isMandatory =
        ov?.isMandatory !== undefined
          ? ov.isMandatory
          : subject.isMandatory !== undefined
          ? subject.isMandatory
          : mandatoryNames.some((m) => nameLower.includes(m));

      // Priority check
      const priority: SubjectPriority =
        ov?.priority ||
        subject.priority ||
        (isMandatory ? "HIGH" : "MEDIUM");

      // Incomplete workload & topics
      const uncompletedItems: RecommendedTopicItem[] = [];
      for (const topic of subject.topics) {
        for (const item of topic.learningItems) {
          if (item.status !== "COMPLETED") {
            uncompletedItems.push({
              learningItemId: item.id,
              topicId: topic.id,
              topicName: topic.name,
              title: item.title,
              estimatedMinutes: item.estimatedMinutes || 30,
              priority: item.priority || priority,
            });
          }
        }
      }

      // Days since last studied
      let daysSinceLastStudied = 999;
      const subHistory = history.filter(
        (h) =>
          (h.subjectId && h.subjectId === subject.id) ||
          (h.subjectName && h.subjectName.toLowerCase() === nameLower)
      );

      if (subHistory.length > 0) {
        const sortedDates = subHistory
          .map((h) => new Date(h.startedAt).getTime())
          .sort((a, b) => b - a);
        const lastMs = sortedDates[0];
        daysSinceLastStudied = Math.floor(
          (new Date(targetDate).getTime() - lastMs) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastStudied < 0) daysSinceLastStudied = 0;
      }

      // Check deadline proximity
      let deadlineDays = 999;
      if (subject.targetDate) {
        deadlineDays = diffInDays(targetDate, subject.targetDate);
      }

      // Weekly Target Days
      const weeklyTargetDays =
        ov?.weeklyTargetDays ||
        subject.weeklyTargetDays ||
        (isMandatory ? 7 : priority === "HIGH" ? 4 : 2);

      const daysStudiedThisWeek = subHistory.filter((h) => {
        const d = new Date(h.startedAt);
        const t = new Date(targetDate);
        const diff = Math.floor((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
      }).length;

      // Calculate Recommendation Score
      let score = 0;

      // Base boost for mandatory daily subjects
      if (isMandatory) {
        score += 200;
      }

      // Workload score
      const workloadScore = Math.min(
        DEFAULT_RECOMMENDATION_WEIGHTS.maxWorkloadScore,
        uncompletedItems.length * DEFAULT_RECOMMENDATION_WEIGHTS.workloadBaseWeight
      );
      score += workloadScore;

      // Priority bonus
      if (priority === "HIGH") score += DEFAULT_RECOMMENDATION_WEIGHTS.priorityHighBonus;
      else if (priority === "MEDIUM") score += DEFAULT_RECOMMENDATION_WEIGHTS.priorityMediumBonus;
      else score += DEFAULT_RECOMMENDATION_WEIGHTS.priorityLowBonus;

      // Deadline bonus
      if (deadlineDays <= 7) score += DEFAULT_RECOMMENDATION_WEIGHTS.deadlineUrgentBonus;
      else if (deadlineDays <= 14) score += DEFAULT_RECOMMENDATION_WEIGHTS.deadlineMediumBonus;
      else if (deadlineDays <= 30) score += DEFAULT_RECOMMENDATION_WEIGHTS.deadlineFarBonus;

      // Neglect bonus
      if (daysSinceLastStudied > 7) score += DEFAULT_RECOMMENDATION_WEIGHTS.neglectHighBonus;
      else if (daysSinceLastStudied >= 4) score += DEFAULT_RECOMMENDATION_WEIGHTS.neglectMediumBonus;
      else if (daysSinceLastStudied >= 2) score += DEFAULT_RECOMMENDATION_WEIGHTS.neglectLowBonus;

      // Recent frequency penalty (for non-mandatory, non-high priority if studied yesterday & day before)
      if (!isMandatory && priority !== "HIGH" && daysSinceLastStudied === 1) {
        score += DEFAULT_RECOMMENDATION_WEIGHTS.recentFrequencyPenalty;
      }

      // Weekly deficit bonus
      if (daysStudiedThisWeek < weeklyTargetDays) {
        score += DEFAULT_RECOMMENDATION_WEIGHTS.weeklyDeficitBonus;
      }

      // Formulate Explanation Reason
      let explanation = "";
      if (isMandatory) {
        explanation = `${subject.name} is one of your daily mandatory core subjects.`;
      } else if (deadlineDays <= 7) {
        explanation = `${subject.name} is recommended: Exam/deadline is approaching in ${deadlineDays} days with ${uncompletedItems.length} unfinished items.`;
      } else if (daysSinceLastStudied >= 4 && daysSinceLastStudied < 900) {
        explanation = `${subject.name} recommended: You haven't studied ${subject.name} in ${daysSinceLastStudied} days (${uncompletedItems.length} topics remaining).`;
      } else if (daysStudiedThisWeek < weeklyTargetDays) {
        explanation = `${subject.name} recommended: Behind weekly target (${daysStudiedThisWeek}/${weeklyTargetDays} days planned).`;
      } else if (uncompletedItems.length > 0) {
        explanation = `${subject.name} recommended: Has ${uncompletedItems.length} remaining topics and high learning priority.`;
      } else {
        explanation = `${subject.name} recommended for periodic review and practice.`;
      }

      return {
        subject,
        isMandatory,
        priority,
        uncompletedItems,
        daysSinceLastStudied,
        deadlineDays,
        weeklyTargetDays,
        daysStudiedThisWeek,
        score,
        explanation,
      };
    });

  // 2. Separate Mandatory and Optional Subjects
  const mandatoryList = scoredSubjects.filter((s) => s.isMandatory);
  const optionalList = scoredSubjects
    .filter((s) => !s.isMandatory)
    .sort((a, b) => b.score - a.score);

  // Determine target max subjects for today (2 to 4 subjects)
  let maxSubjectsForToday = 3;
  if (availableMinutes >= 300) maxSubjectsForToday = 4;
  if (availableMinutes <= 180) maxSubjectsForToday = 2;

  const selectedSubjects = [...mandatoryList];

  // Fill remaining slots with top optional subjects
  for (const opt of optionalList) {
    if (selectedSubjects.length >= maxSubjectsForToday) break;
    // Only pick if has workload or needs study
    if (opt.uncompletedItems.length > 0 || opt.score > 30) {
      selectedSubjects.push(opt);
    }
  }

  // If we still have space and only 1 mandatory subject exists, add next best optional
  if (selectedSubjects.length < 2 && optionalList.length > 0) {
    const nextOpt = optionalList.find((o) => !selectedSubjects.includes(o));
    if (nextOpt) selectedSubjects.push(nextOpt);
  }

  // 3. Allocate Available Minutes across selected subjects
  let totalAllocatedMinutes = 0;
  const recommendedSessions: RecommendedSessionItem[] = [];

  // Calculate base weights for time distribution
  let totalWeight = selectedSubjects.reduce((sum, s) => {
    const weight = s.isMandatory ? 1.5 : s.priority === "HIGH" ? 1.2 : 1.0;
    return sum + weight;
  }, 0);

  if (totalWeight <= 0) totalWeight = 1;

  // Leave ~15-30 min buffer if availableMinutes > 120
  const bufferTarget = availableMinutes >= 240 ? 30 : availableMinutes >= 180 ? 15 : 0;
  const minutesToDistribute = availableMinutes - bufferTarget;

  selectedSubjects.forEach((item) => {
    const weight = item.isMandatory ? 1.5 : item.priority === "HIGH" ? 1.2 : 1.0;
    const rawMins = (weight / totalWeight) * minutesToDistribute;
    // Round to nearest 15 minutes increment (min 30 mins, max 120 mins)
    let allocatedMins = Math.max(30, Math.round(rawMins / 15) * 15);

    // If Python / DSA, default to solid 45-90 mins
    if (item.subject.name.toLowerCase().includes("python") && allocatedMins < 45) {
      allocatedMins = 45;
    }
    if (item.subject.name.toLowerCase().includes("dsa") && allocatedMins < 60 && availableMinutes >= 180) {
      allocatedMins = 60;
    }

    // Select specific uncompleted topics for this session
    const chosenTopics: RecommendedTopicItem[] = [];
    let accumulatedMins = 0;

    for (const topItem of item.uncompletedItems) {
      if (accumulatedMins >= allocatedMins && chosenTopics.length >= 2) break;
      chosenTopics.push(topItem);
      accumulatedMins += topItem.estimatedMinutes;
    }

    const startTime = currentStartTime;
    const endTime = addMinutesToTimeString(startTime, allocatedMins);
    currentStartTime = endTime;

    totalAllocatedMinutes += allocatedMins;

    recommendedSessions.push({
      subjectId: item.subject.id,
      subjectName: item.subject.name,
      color: item.subject.color || "#22d3ee",
      priority: item.priority,
      isMandatory: item.isMandatory,
      startTime,
      endTime,
      allocatedMinutes: allocatedMins,
      recommendationScore: item.score,
      explanationReason: item.explanation,
      topics: chosenTopics,
    });
  });

  const bufferMinutes = Math.max(0, availableMinutes - totalAllocatedMinutes);

  // 4. Construct Weekly Subject Balance Overview
  const weeklyBalance: WeeklySubjectBalance[] = scoredSubjects.map((s) => {
    const plannedCount = s.daysStudiedThisWeek + (recommendedSessions.some((rs) => rs.subjectId === s.subject.id) ? 1 : 0);
    let status: "on-track" | "behind" | "exceeded" = "on-track";
    if (plannedCount < s.weeklyTargetDays) status = "behind";
    if (plannedCount > s.weeklyTargetDays) status = "exceeded";

    return {
      subjectId: s.subject.id,
      subjectName: s.subject.name,
      color: s.subject.color,
      weeklyTargetDays: s.weeklyTargetDays,
      plannedDaysThisWeek: plannedCount,
      completedDaysThisWeek: s.daysStudiedThisWeek,
      status,
    };
  });

  // 5. Calculate Confidence Score and Summary Insight
  const confidenceScore = Math.min(
    98,
    Math.max(75, 80 + (recommendedSessions.length >= 3 ? 10 : 5) + (bufferMinutes >= 15 ? 5 : 0))
  );

  const subjectNamesList = recommendedSessions.map((s) => s.subjectName).join(", ");
  const summaryInsight = `Auto Planner recommended ${recommendedSessions.length} balanced sessions (${subjectNamesList}) totaling ${Math.round(totalAllocatedMinutes / 60 * 10) / 10}h for ${targetDate}.`;

  return {
    targetDate,
    totalAvailableMinutes: availableMinutes,
    totalAllocatedMinutes,
    bufferMinutes,
    confidenceScore,
    summaryInsight,
    recommendedSessions,
    weeklyBalance,
  };
}
