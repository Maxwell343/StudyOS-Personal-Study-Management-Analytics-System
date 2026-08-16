export type GoalPriority = "LOW" | "MEDIUM" | "HIGH";
export type GoalStatus = "IN_PROGRESS" | "ON_TRACK" | "AT_RISK" | "COMPLETED";
export type TaskFilterTab = "ALL" | "TODAY" | "UPCOMING" | "OVERDUE" | "COMPLETED";

export interface LongTermGoal {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: string;
  targetDate: string; // ISO date string (YYYY-MM-DD)
  priority: GoalPriority;
  status: GoalStatus;
  color?: string;
  createdAt: string;
}

export interface ShortTermGoal {
  id: string;
  longTermGoalId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  priority: GoalPriority;
  status: GoalStatus;
  color?: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  shortTermGoalId: string;
  title: string;
  subject: string;
  dueDate: string; // ISO date string
  estimatedMinutes?: number;
  priority: GoalPriority;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface ComputedGoalStats {
  shortTermGoalsCount: number;
  completedShortTermCount: number;
  totalTasksCount: number;
  completedTasksCount: number;
  remainingTasksCount: number;
  progressPercentage: number;
}

export interface TaskGoalContext {
  task: TaskItem;
  shortTermGoal?: ShortTermGoal;
  longTermGoal?: LongTermGoal;
}
