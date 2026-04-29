// ── Core enums ────────────────────────────────────────────────
export type StatusType = "on-track" | "at-risk" | "behind" | "done" | "paused" | "in-progress";
export type RiskLevel = "low" | "medium" | "high" | "elevated";
export type Priority = "critical" | "high" | "medium" | "low";
export type Category =
  | "business"
  | "finance"
  | "content"
  | "health"
  | "system"
  | "personal";

// ── Goal ──────────────────────────────────────────────────────
export interface Goal {
  id: string;
  title: string;
  category: Category;
  progress: number; // 0–100
  target: number;
  current: number;
  unit: string;
  deadline: string; // ISO date
  status: StatusType;
  priority: Priority;
  risk?: string;
  nextAction?: string;
  milestones?: Milestone[];
  quadrant?: "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important";
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
}

// ── Project ───────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  business: string;
  category: string;
  progress: number;
  status: StatusType;
  priority: Priority;
  dueDate?: string;
  tasks?: { total: number; done: number };
  column?: "backlog" | "active" | "review" | "done";
}

// ── Business ──────────────────────────────────────────────────
export interface Business {
  id: string;
  name: string;
  tagline: string;
  type?: string;
  revenue: number;
  expenses?: number;
  status: StatusType;
  nextMilestone: string;
  bottleneck?: string;
  mrr?: number;
  employees?: number;
  founded?: string;
}

// ── Risk Alert ────────────────────────────────────────────────
export interface RiskAlert {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  category: Category | "sleep" | "output" | "spending" | "tilt";
  timestamp: string;
}

// ── Today's Mission ───────────────────────────────────────────
export interface Mission {
  title: string;
  description: string;
  deadline: string;
  status: StatusType;
  consequence: string;
  actions: MissionAction[];
}

export interface MissionAction {
  id: string;
  title: string;
  done: boolean;
}

// ── Money ─────────────────────────────────────────────────────
export interface MoneySnapshot {
  cashAvailable: number;
  earnedToday: number;
  expectedPayouts: Payout[];
  expensesThisWeek: number;
  cashFlowSeries: { day: string; amount: number }[];
}

export interface Payout {
  id: string;
  source: string;
  amount: number;
  dueDate: string;
}

// ── Agent ─────────────────────────────────────────────────────
export interface AgentTask {
  id: string;
  agent: string;
  description: string;
  count?: number;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

// ── Calendar Event ────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  category: string;
  done?: boolean;
}

// ── Bottleneck ────────────────────────────────────────────────
export interface Bottleneck {
  id: string;
  area: string;
  description: string;
  blockedSince: string;
  impact: RiskLevel;
}

// ── Opportunity ───────────────────────────────────────────────
export interface Opportunity {
  id: string;
  title: string;
  category: Category;
  potentialValue: number;
  effort: "low" | "medium" | "high";
  deadline?: string;
  notes?: string;
}

// ── Decision ──────────────────────────────────────────────────
export interface Decision {
  id: string;
  title: string;
  outcome: string;
  date: string;
  reversible: boolean;
  category: Category;
}

// ── Kill List item ────────────────────────────────────────────
export interface KillItem {
  id: string;
  title: string;
  reason: string;
  timeSaved: string;
  category: Category;
}

// ── Output item ───────────────────────────────────────────────
export interface OutputItem {
  id: string;
  type: "video" | "post" | "email" | "call" | "task" | "doc";
  title: string;
  timestamp: string;
  platform?: string;
}

// ── Daily Closeout ────────────────────────────────────────────
export interface CloseoutItem {
  id: string;
  prompt: string;
  answer: string;
}

// ── Score ─────────────────────────────────────────────────────
export interface Score {
  value: number; // 0–100
  label: string;
  delta: number; // change vs yesterday
  sparkline: number[];
}

// ── Operator profile ──────────────────────────────────────────
export interface Operator {
  name: string;
  handle: string;
  avatar?: string;
  role: string;
  focusScore: Score;
  executionScore: Score;
}
