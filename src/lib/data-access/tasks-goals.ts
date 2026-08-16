import type {
  LongTermGoal,
  ShortTermGoal,
  TaskItem,
  ComputedGoalStats,
  TaskGoalContext,
} from "@/types/tasks-goals";

const LOCAL_STORAGE_KEY_LONG_TERM = "studyos_long_term_goals_v1";
const LOCAL_STORAGE_KEY_SHORT_TERM = "studyos_short_term_goals_v1";
const LOCAL_STORAGE_KEY_TASKS = "studyos_tasks_v1";

// ── Default Seed Data ───────────────────────────────────────────────────────

const DEFAULT_LONG_TERM_GOALS: LongTermGoal[] = [
  {
    id: "lt-dsa-1",
    title: "Master Data Structures & Algorithms for Placements",
    description: "Build deep proficiency in core algorithms, dynamic programming, graph theory, and system coding interviews.",
    subject: "DSA",
    category: "Placement Prep",
    targetDate: "2026-11-30",
    priority: "HIGH",
    status: "IN_PROGRESS",
    color: "#22d3ee",
    createdAt: "2026-08-01",
  },
  {
    id: "lt-dbms-2",
    title: "Complete Advanced Database Systems & SQL Mastery",
    description: "Deep dive into indexing, ACID transactions, relational algebra, and complex SQL optimization.",
    subject: "DBMS",
    category: "Core Academic",
    targetDate: "2026-10-15",
    priority: "HIGH",
    status: "ON_TRACK",
    color: "#34d399",
    createdAt: "2026-08-05",
  },
  {
    id: "lt-sd-3",
    title: "Build Low-Level System Design & Architecture Portfolio",
    description: "Implement 3 clean object-oriented production projects applying design patterns & SOLID principles.",
    subject: "OOP",
    category: "Projects",
    targetDate: "2026-12-15",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    color: "#a78bfa",
    createdAt: "2026-08-10",
  },
];

const DEFAULT_SHORT_TERM_GOALS: ShortTermGoal[] = [
  {
    id: "st-dsa-arrays",
    longTermGoalId: "lt-dsa-1",
    title: "Complete Arrays & Two-Pointer Patterns",
    description: "Master sliding window, two pointer algorithms, and prefix sums.",
    dueDate: "2026-08-20",
    priority: "HIGH",
    status: "IN_PROGRESS",
    color: "#22d3ee",
    createdAt: "2026-08-10",
  },
  {
    id: "st-dsa-trees",
    longTermGoalId: "lt-dsa-1",
    title: "Binary Trees & BST Traversals",
    description: "Solve level-order, LCA, tree construction, and BST verification problems.",
    dueDate: "2026-08-28",
    priority: "MEDIUM",
    status: "ON_TRACK",
    color: "#22d3ee",
    createdAt: "2026-08-12",
  },
  {
    id: "st-dbms-sql",
    longTermGoalId: "lt-dbms-2",
    title: "Complex SQL Joins & Window Functions",
    description: "Practice multi-table joins, subqueries, RANK(), DENSE_RANK(), and window aggregations.",
    dueDate: "2026-08-22",
    priority: "HIGH",
    status: "IN_PROGRESS",
    color: "#34d399",
    createdAt: "2026-08-11",
  },
  {
    id: "st-sd-patterns",
    longTermGoalId: "lt-sd-3",
    title: "Design & Implement Parking Lot System",
    description: "Apply Strategy, Factory, and Singleton design patterns.",
    dueDate: "2026-08-30",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    color: "#a78bfa",
    createdAt: "2026-08-14",
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  // Short-Term Goal: Complete Arrays & Two-Pointer Patterns (st-dsa-arrays)
  {
    id: "t-1",
    shortTermGoalId: "st-dsa-arrays",
    title: "Learn Array Fundamentals & Memory Layout",
    subject: "DSA",
    dueDate: "2026-08-17",
    estimatedMinutes: 45,
    priority: "HIGH",
    completed: true,
    completedAt: "2026-08-15T14:30:00Z",
    tags: ["Theory", "Fundamentals"],
    createdAt: "2026-08-10",
  },
  {
    id: "t-2",
    shortTermGoalId: "st-dsa-arrays",
    title: "Solve 5 Two Pointer Problems on LeetCode",
    subject: "DSA",
    dueDate: "2026-08-18",
    estimatedMinutes: 60,
    priority: "HIGH",
    completed: true,
    completedAt: "2026-08-16T10:15:00Z",
    tags: ["Practice", "LeetCode"],
    createdAt: "2026-08-10",
  },
  {
    id: "t-3",
    shortTermGoalId: "st-dsa-arrays",
    title: "Master Sliding Window Technique (Fixed & Variable Length)",
    subject: "DSA",
    dueDate: "2026-08-19",
    estimatedMinutes: 60,
    priority: "HIGH",
    completed: false,
    notes: "Focus on Longest Substring Without Repeating Characters.",
    tags: ["Algorithms"],
    createdAt: "2026-08-11",
  },
  {
    id: "t-4",
    shortTermGoalId: "st-dsa-arrays",
    title: "Revise Prefix Sum Array Patterns & Range Queries",
    subject: "DSA",
    dueDate: "2026-08-20",
    estimatedMinutes: 45,
    priority: "MEDIUM",
    completed: false,
    tags: ["Revision"],
    createdAt: "2026-08-12",
  },

  // Short-Term Goal: Binary Trees & BST Traversals (st-dsa-trees)
  {
    id: "t-5",
    shortTermGoalId: "st-dsa-trees",
    title: "Implement Tree Preorder, Inorder, and Postorder Iteratively",
    subject: "DSA",
    dueDate: "2026-08-22",
    estimatedMinutes: 50,
    priority: "MEDIUM",
    completed: true,
    completedAt: "2026-08-14T16:00:00Z",
    tags: ["Implementation"],
    createdAt: "2026-08-12",
  },
  {
    id: "t-6",
    shortTermGoalId: "st-dsa-trees",
    title: "Solve Lowest Common Ancestor (LCA) in BST & Binary Tree",
    subject: "DSA",
    dueDate: "2026-08-25",
    estimatedMinutes: 45,
    priority: "HIGH",
    completed: false,
    tags: ["LeetCode Medium"],
    createdAt: "2026-08-13",
  },

  // Short-Term Goal: Complex SQL Joins & Window Functions (st-dbms-sql)
  {
    id: "t-7",
    shortTermGoalId: "st-dbms-sql",
    title: "Practice INNER, LEFT, RIGHT, and FULL OUTER Joins",
    subject: "DBMS",
    dueDate: "2026-08-17",
    estimatedMinutes: 40,
    priority: "HIGH",
    completed: true,
    completedAt: "2026-08-16T18:00:00Z",
    tags: ["SQL", "Practice"],
    createdAt: "2026-08-11",
  },
  {
    id: "t-8",
    shortTermGoalId: "st-dbms-sql",
    title: "Solve 10 Window Function Queries (ROW_NUMBER, DENSE_RANK)",
    subject: "DBMS",
    dueDate: "2026-08-21",
    estimatedMinutes: 60,
    priority: "HIGH",
    completed: false,
    notes: "Test queries against real PostgreSQL database.",
    tags: ["SQL", "Advanced"],
    createdAt: "2026-08-11",
  },

  // Short-Term Goal: Design & Implement Parking Lot System (st-sd-patterns)
  {
    id: "t-9",
    shortTermGoalId: "st-sd-patterns",
    title: "Draw UML Class Diagram for Parking Lot Entities",
    subject: "OOP",
    dueDate: "2026-08-26",
    estimatedMinutes: 45,
    priority: "MEDIUM",
    completed: false,
    tags: ["Design", "UML"],
    createdAt: "2026-08-14",
  },
  {
    id: "t-10",
    shortTermGoalId: "st-sd-patterns",
    title: "Implement Vehicle, Spot, and Pricing Strategy Classes",
    subject: "OOP",
    dueDate: "2026-08-29",
    estimatedMinutes: 90,
    priority: "HIGH",
    completed: false,
    tags: ["Coding", "OOP"],
    createdAt: "2026-08-14",
  },
];

// ── Persistence Helpers ─────────────────────────────────────────────────────

export function getStoredLongTermGoals(): LongTermGoal[] {
  if (typeof window === "undefined") return DEFAULT_LONG_TERM_GOALS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LONG_TERM);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_LONG_TERM, JSON.stringify(DEFAULT_LONG_TERM_GOALS));
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
      localStorage.setItem(LOCAL_STORAGE_KEY_SHORT_TERM, JSON.stringify(DEFAULT_SHORT_TERM_GOALS));
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
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(DEFAULT_TASKS));
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
