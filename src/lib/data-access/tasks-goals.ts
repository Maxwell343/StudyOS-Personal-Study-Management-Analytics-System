import type {
  LongTermGoal,
  ShortTermGoal,
  TaskItem,
  ComputedGoalStats,
  TaskGoalContext,
} from "@/types/tasks-goals";

const LOCAL_STORAGE_KEY_LONG_TERM = "studyos_long_term_goals_v2";
const LOCAL_STORAGE_KEY_SHORT_TERM = "studyos_short_term_goals_v2";
const LOCAL_STORAGE_KEY_TASKS = "studyos_tasks_v2";

// ── Default Seed Data (Empty Clean State) ──────────────────────────────────

const DEFAULT_LONG_TERM_GOALS: LongTermGoal[] = [];
const DEFAULT_SHORT_TERM_GOALS: ShortTermGoal[] = [];
const DEFAULT_TASKS: TaskItem[] = [];

// ── Persistence Helpers ─────────────────────────────────────────────────────

export function getStoredLongTermGoals(): LongTermGoal[] {
  if (typeof window === "undefined") return DEFAULT_LONG_TERM_GOALS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LONG_TERM);
    if (!raw) {
      return DEFAULT_LONG_TERM_GOALS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading long term goals from localStorage:", err);
    return DEFAULT_LONG_TERM_GOALS;
  }
}

export function saveStoredLongTermGoals(goals: LongTermGoal[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LONG_TERM, JSON.stringify(goals));
  } catch (err) {
    console.error("Error saving long term goals to localStorage:", err);
  }
}

export function getStoredShortTermGoals(): ShortTermGoal[] {
  if (typeof window === "undefined") return DEFAULT_SHORT_TERM_GOALS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SHORT_TERM);
    if (!raw) {
      return DEFAULT_SHORT_TERM_GOALS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading short term goals from localStorage:", err);
    return DEFAULT_SHORT_TERM_GOALS;
  }
}

export function saveStoredShortTermGoals(goals: ShortTermGoal[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SHORT_TERM, JSON.stringify(goals));
  } catch (err) {
    console.error("Error saving short term goals to localStorage:", err);
  }
}

export function getStoredTasks(): TaskItem[] {
  if (typeof window === "undefined") return DEFAULT_TASKS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
    if (!raw) {
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading tasks from localStorage:", err);
    return DEFAULT_TASKS;
  }
}

export function saveStoredTasks(tasks: TaskItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error("Error saving tasks to localStorage:", err);
  }
}

// ── Computed Statistics ────────────────────────────────────────────────────

export function computeLongTermGoalStats(
  longTermGoalId: string,
  shortTermGoals: ShortTermGoal[],
  tasks: TaskItem[]
): ComputedGoalStats {
  const childShortTerm = shortTermGoals.filter(
    (st) => st.longTermGoalId === longTermGoalId
  );
  const childShortTermIds = new Set(childShortTerm.map((st) => st.id));

  const childTasks = tasks.filter((t) => childShortTermIds.has(t.shortTermGoalId));
  const completedTasks = childTasks.filter((t) => t.completed);

  const completedShortTerm = childShortTerm.filter((st) => {
    const stTasks = tasks.filter((t) => t.shortTermGoalId === st.id);
    return stTasks.length > 0 && stTasks.every((t) => t.completed);
  });

  const progressPercentage =
    childTasks.length > 0
      ? Math.round((completedTasks.length / childTasks.length) * 100)
      : 0;

  return {
    shortTermGoalsCount: childShortTerm.length,
    completedShortTermCount: completedShortTerm.length,
    totalTasksCount: childTasks.length,
    completedTasksCount: completedTasks.length,
    remainingTasksCount: childTasks.length - completedTasks.length,
    progressPercentage,
  };
}

export function computeShortTermGoalStats(
  shortTermGoalId: string,
  tasks: TaskItem[]
): { total: number; completed: number; progress: number } {
  const stTasks = tasks.filter((t) => t.shortTermGoalId === shortTermGoalId);
  const completed = stTasks.filter((t) => t.completed).length;
  const total = stTasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, progress };
}

export function computeOverallWorkspaceStats(
  longTermGoals: LongTermGoal[],
  shortTermGoals: ShortTermGoal[],
  tasks: TaskItem[]
) {
  const activeLongTermGoals = longTermGoals.filter(
    (g) => g.status !== "COMPLETED"
  ).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    activeGoalsCount: activeLongTermGoals,
    totalLongTermGoals: longTermGoals.length,
    totalShortTermGoals: shortTermGoals.length,
    completedTasks,
    remainingTasks,
    totalTasks,
    overallProgress,
  };
}

export function getTaskContextTrace(
  task: TaskItem,
  shortTermGoals: ShortTermGoal[],
  longTermGoals: LongTermGoal[]
): TaskGoalContext {
  const st = shortTermGoals.find((s) => s.id === task.shortTermGoalId);
  const lt = st ? longTermGoals.find((l) => l.id === st.longTermGoalId) : undefined;
  return {
    task,
    shortTermGoal: st,
    longTermGoal: lt,
  };
}
