import type {
  Subject,
  Topic,
  LearningItem,
  TopicStats,
  SubjectStats,
  GlobalLearningSummary,
} from "@/types/subjects";

// ── Percentage Formatter ───────────────────────────────────────────────────

export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  const val = (completed / total) * 100;
  return Math.round(val * 10) / 10; // 1 decimal place
}

// ── Time Formatter ─────────────────────────────────────────────────────────

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── Topic Statistics (Derived) ─────────────────────────────────────────────

export function getTopicStats(topic: Topic): TopicStats {
  const items = topic.learningItems || [];
  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === "COMPLETED").length;
  const inProgressItems = items.filter(
    (i) => i.status === "IN_PROGRESS"
  ).length;
  const remainingItems = totalItems - completedItems;

  const estimatedRemainingMinutes = items
    .filter((i) => i.status !== "COMPLETED")
    .reduce((sum, item) => sum + (item.estimatedMinutes || 0), 0);

  const progressPercent = calculatePercentage(completedItems, totalItems);

  return {
    totalItems,
    completedItems,
    inProgressItems,
    remainingItems,
    progressPercent,
    estimatedRemainingMinutes,
  };
}

// ── Subject Statistics (Derived) ───────────────────────────────────────────

export function getSubjectStats(subject: Subject): SubjectStats {
  const topics = subject.topics || [];
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  let estimatedRemainingMinutes = 0;
  let activeTopic: Topic | undefined;
  let activeItem: LearningItem | undefined;

  for (const topic of topics) {
    const tStats = getTopicStats(topic);
    totalItems += tStats.totalItems;
    completedItems += tStats.completedItems;
    inProgressItems += tStats.inProgressItems;
    estimatedRemainingMinutes += tStats.estimatedRemainingMinutes;

    // Detect active in-progress item or first topic with incomplete items
    for (const item of topic.learningItems || []) {
      if (item.status === "IN_PROGRESS" && !activeItem) {
        activeItem = item;
        activeTopic = topic;
      }
    }
  }

  // If no item is explicitly IN_PROGRESS, find first incomplete topic
  if (!activeTopic && topics.length > 0) {
    activeTopic = topics.find((t) => {
      const stats = getTopicStats(t);
      return stats.remainingItems > 0;
    }) || topics[0];
  }

  const remainingItems = totalItems - completedItems;
  const progressPercent = calculatePercentage(completedItems, totalItems);

  return {
    topicCount: topics.length,
    totalItems,
    completedItems,
    inProgressItems,
    remainingItems,
    progressPercent,
    estimatedRemainingMinutes,
    activeTopic,
    activeItem,
  };
}

// ── Global Learning Summary (Derived) ──────────────────────────────────────

export function getGlobalLearningSummary(
  subjects: Subject[]
): GlobalLearningSummary {
  let totalTopics = 0;
  let totalLearningItems = 0;
  let completedLearningItems = 0;
  let estimatedRemainingMinutes = 0;

  for (const subject of subjects) {
    if (subject.archived) continue;
    const stats = getSubjectStats(subject);
    totalTopics += stats.topicCount;
    totalLearningItems += stats.totalItems;
    completedLearningItems += stats.completedItems;
    estimatedRemainingMinutes += stats.estimatedRemainingMinutes;
  }

  const remainingLearningItems = totalLearningItems - completedLearningItems;
  const overallProgressPercent = calculatePercentage(
    completedLearningItems,
    totalLearningItems
  );

  return {
    totalSubjects: subjects.filter((s) => !s.archived).length,
    totalTopics,
    totalLearningItems,
    completedLearningItems,
    remainingLearningItems,
    overallProgressPercent,
    estimatedRemainingMinutes,
  };
}

// ── Incomplete Items Query (Plan Tomorrow Integration) ─────────────────────

export function getIncompleteLearningItems(subject: Subject): LearningItem[] {
  const incomplete: LearningItem[] = [];
  for (const topic of subject.topics || []) {
    for (const item of topic.learningItems || []) {
      if (item.status !== "COMPLETED") {
        incomplete.push(item);
      }
    }
  }
  return incomplete;
}
