import "server-only";
import { supabaseServer } from "./supabase-server";
import type {
  Goal,
  Project,
  Business,
  RiskAlert,
  AgentTask,
  KillItem,
  Mission,
  Operator,
  Score,
  Opportunity,
  Decision,
} from "@/data/types";

// ── Helpers ─────────────────────────────────────────────────────────
type Queryable<T> = PromiseLike<{ data: T | null; error: unknown }>;

async function safeQuery<T>(fn: () => Queryable<T>, fallback: T): Promise<T> {
  try {
    const { data, error } = await fn();
    if (error) {
      console.warn("[db]", error);
      return fallback;
    }
    return (data ?? fallback) as T;
  } catch (e) {
    console.warn("[db] threw", e);
    return fallback;
  }
}

// ── Operator profile + scores ───────────────────────────────────────
export async function getOperator(): Promise<Operator | null> {
  const profile = await safeQuery(
    () =>
      supabaseServer
        .from("operator_profile")
        .select("name, alias, handle, role, avatar_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    null as null | { name: string; alias: string | null; handle: string | null; role: string | null; avatar_url: string | null }
  );

  if (!profile) return null;

  const focus = await safeQuery(
    () =>
      supabaseServer
        .from("operator_scores")
        .select("value, delta, sparkline")
        .eq("kind", "focus")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    { value: 0, delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] } as { value: number; delta: number; sparkline: number[] }
  );

  const exec = await safeQuery(
    () =>
      supabaseServer
        .from("operator_scores")
        .select("value, delta, sparkline")
        .eq("kind", "execution")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    { value: 0, delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] } as { value: number; delta: number; sparkline: number[] }
  );

  const focusScore: Score = {
    value: focus?.value ?? 0,
    delta: focus?.delta ?? 0,
    sparkline: focus?.sparkline ?? [],
    label: "Focus Score",
  };
  const executionScore: Score = {
    value: exec?.value ?? 0,
    delta: exec?.delta ?? 0,
    sparkline: exec?.sparkline ?? [],
    label: "Execution Score",
  };

  return {
    name: profile.name,
    handle: profile.handle ?? "",
    role: profile.role ?? "",
    focusScore,
    executionScore,
  };
}

// ── Goals — uses operator_goals ─────────────────────────────────────
type GoalRow = {
  id: string;
  title: string;
  category: string;
  progress: number;
  target: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  status: string;
  priority: string;
  risk: string | null;
  next_action: string | null;
  quadrant: string | null;
  is_completed: boolean;
};

function mapGoal(r: GoalRow): Goal {
  return {
    id: r.id,
    title: r.title,
    category: r.category as Goal["category"],
    progress: r.progress,
    target: Number(r.target),
    current: Number(r.current_value),
    unit: r.unit,
    deadline: r.deadline ?? "",
    status: r.status as Goal["status"],
    priority: r.priority as Goal["priority"],
    risk: r.risk ?? undefined,
    nextAction: r.next_action ?? undefined,
    quadrant: (r.quadrant as Goal["quadrant"]) ?? undefined,
  };
}

export async function getActiveGoals(): Promise<Goal[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_goals")
        .select("*")
        .eq("is_completed", false)
        .order("priority", { ascending: true })
        .order("deadline", { ascending: true }),
    [] as GoalRow[]
  );
  return rows.map(mapGoal);
}

export async function getCompletedGoals(): Promise<Goal[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_goals")
        .select("*")
        .eq("is_completed", true)
        .order("completed_at", { ascending: false }),
    [] as GoalRow[]
  );
  return rows.map(mapGoal);
}

// ── Businesses ──────────────────────────────────────────────────────
type BusinessRow = {
  id: string;
  name: string;
  tagline: string | null;
  status: string;
  revenue: number | null;
  mrr: number | null;
  employees: number | null;
  founded: string | null;
  next_milestone: string | null;
};

export async function getBusinesses(): Promise<Business[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("businesses")
        .select("*")
        .order("sort_order", { ascending: true }),
    [] as BusinessRow[]
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    tagline: r.tagline ?? "",
    revenue: Number(r.revenue ?? 0),
    status: r.status as Business["status"],
    nextMilestone: r.next_milestone ?? "",
    mrr: r.mrr ? Number(r.mrr) : undefined,
    employees: r.employees ?? undefined,
    founded: r.founded ?? undefined,
  }));
}

// ── Projects — uses operator_projects ───────────────────────────────
type ProjectRow = {
  id: string;
  title: string;
  business_name: string | null;
  category: string | null;
  progress: number;
  status: string;
  priority: string;
  due_date: string | null;
  tasks_total: number | null;
  tasks_done: number | null;
  column_lane: string | null;
};

export async function getProjects(): Promise<Project[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_projects")
        .select("*")
        .order("priority", { ascending: true }),
    [] as ProjectRow[]
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    business: r.business_name ?? "",
    category: r.category ?? "",
    progress: r.progress,
    status: r.status as Project["status"],
    priority: r.priority as Project["priority"],
    dueDate: r.due_date ?? undefined,
    tasks:
      r.tasks_total != null
        ? { total: r.tasks_total, done: r.tasks_done ?? 0 }
        : undefined,
    column: (r.column_lane as Project["column"]) ?? "active",
  }));
}

// ── Operator Tasks (today's tasks) ───────────────────────────────────
export interface OperatorTask {
  id: string;
  title: string;
  category: string;
  priority: string;
  done: boolean;
  due_date: string | null;
  notes: string | null;
}

function mapTaskRow(r: Record<string, unknown>): OperatorTask {
  return {
    id: String(r.id ?? ""),
    title: String(r.title ?? ""),
    category: String(r.category ?? r.type ?? "personal"),
    priority: String(r.priority ?? "medium"),
    done: Boolean(r.done ?? r.completed ?? false),
    due_date: r.due_date ? String(r.due_date) : null,
    notes: r.notes ? String(r.notes) : null,
  };
}

export async function getTodayTasks(): Promise<OperatorTask[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_tasks")
        .select("*")
        .eq("due_date", today)
        .order("created_at", { ascending: true }),
    [] as Record<string, unknown>[]
  );
  return rows.map(mapTaskRow);
}

export async function getAllTasks(): Promise<OperatorTask[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_tasks")
        .select("*")
        .order("due_date", { ascending: true })
        .limit(50),
    [] as Record<string, unknown>[]
  );
  return rows.map(mapTaskRow);
}

// ── Risk Alerts ─────────────────────────────────────────────────────
export async function getRiskAlerts(): Promise<RiskAlert[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("risk_alerts")
        .select("id, title, description, level, category, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      title: string;
      description: string | null;
      level: string;
      category: string;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    level: r.level as RiskAlert["level"],
    category: r.category as RiskAlert["category"],
    timestamp: r.created_at,
  }));
}

// ── Agent Recommendations (approval queue) ───────────────────────────
export async function getAgentTasks(): Promise<AgentTask[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("agent_recommendations")
        .select("id, title, description, category, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      title: string;
      description: string | null;
      category: string | null;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    agent: r.category ?? "system",
    description: r.description ?? r.title,
    count: undefined,
    status: "pending" as const,
    timestamp: r.created_at,
  }));
}

// ── Kill List ───────────────────────────────────────────────────────
export async function getKillItems(): Promise<KillItem[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("kill_list")
        .select("id, title, reason, time_saved, category")
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      title: string;
      reason: string | null;
      time_saved: string | null;
      category: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    reason: r.reason ?? "",
    timeSaved: r.time_saved ?? "",
    category: r.category as KillItem["category"],
  }));
}

// ── Today's Mission ─────────────────────────────────────────────────
export async function getTodaysMission(): Promise<Mission | null> {
  const m = await safeQuery(
    () =>
      supabaseServer
        .from("missions")
        .select("id, title, description, deadline, status, consequence")
        .eq("is_active", true)
        .order("for_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    null as null | {
      id: string;
      title: string;
      description: string | null;
      deadline: string | null;
      status: string;
      consequence: string | null;
    }
  );
  if (!m) return null;

  const actions = await safeQuery(
    () =>
      supabaseServer
        .from("mission_actions")
        .select("id, title, done, sort_order")
        .eq("mission_id", m.id)
        .order("sort_order", { ascending: true }),
    [] as Array<{ id: string; title: string; done: boolean; sort_order: number }>
  );

  return {
    title: m.title,
    description: m.description ?? "",
    deadline: m.deadline ?? "",
    status: m.status as Mission["status"],
    consequence: m.consequence ?? "",
    actions: actions.map((a) => ({ id: a.id, title: a.title, done: a.done })),
  };
}

// ── Decisions ───────────────────────────────────────────────────────
export async function getDecisions(): Promise<Decision[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("decisions")
        .select("id, title, outcome, category, reversible, decided_on, created_at")
        .order("decided_on", { ascending: false })
        .limit(20),
    [] as Array<{
      id: string;
      title: string;
      outcome: string | null;
      category: string | null;
      reversible: boolean;
      decided_on: string | null;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    outcome: r.outcome ?? "",
    date: r.decided_on ?? r.created_at.slice(0, 10),
    reversible: r.reversible,
    category: (r.category as Decision["category"]) ?? "system",
  }));
}

// ── Opportunities ────────────────────────────────────────────────────
export async function getOpportunities(): Promise<Opportunity[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("opportunities")
        .select("id, title, category, potential_value, effort, deadline, notes, status")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20),
    [] as Array<{
      id: string;
      title: string;
      category: string | null;
      potential_value: number | null;
      effort: string | null;
      deadline: string | null;
      notes: string | null;
      status: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: (r.category as Opportunity["category"]) ?? "business",
    potentialValue: Number(r.potential_value ?? 0),
    effort: (r.effort as Opportunity["effort"]) ?? "medium",
    deadline: r.deadline ?? undefined,
    notes: r.notes ?? undefined,
  }));
}

// ── Weekly Review ────────────────────────────────────────────────────
export interface WeeklyReviewData {
  wins: string[];
  losses: string[];
  nextMetric: string;
  doubleDown: string;
}

function getCurrentISOWeek(): string {
  const now = new Date();
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export async function getWeeklyReview(): Promise<WeeklyReviewData | null> {
  const isoWeek = getCurrentISOWeek();
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("weekly_reviews")
        .select("highlights, bottlenecks, next_week")
        .eq("iso_week", isoWeek)
        .maybeSingle(),
    null as null | {
      highlights: string[] | null;
      bottlenecks: string[] | null;
      next_week: string[] | null;
    }
  );
  if (!row) return null;
  const nextWeek = row.next_week ?? [];
  return {
    wins: row.highlights ?? [],
    losses: row.bottlenecks ?? [],
    nextMetric: nextWeek[0] ?? "",
    doubleDown: nextWeek[1] ?? "",
  };
}

// ── Daily Review / Closeout ──────────────────────────────────────────
export interface CloseoutEntry {
  id: string;
  prompt: string;
  answer: string;
}

export async function getDailyReview(): Promise<CloseoutEntry[]> {
  const today = new Date().toISOString().slice(0, 10);
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("daily_reviews")
        .select("reflection, output_count, focus_score, execution_score")
        .eq("for_date", today)
        .maybeSingle(),
    null as null | {
      reflection: Record<string, string> | null;
      output_count: number | null;
      focus_score: number | null;
      execution_score: number | null;
    }
  );
  if (!row) return [];

  const entries: CloseoutEntry[] = [];
  const reflection = row.reflection ?? {};

  const PROMPT_LABELS: Record<string, string> = {
    top_win: "Top win today?",
    what_missed: "What didn't get done?",
    energy: "Energy level (1–10)?",
    improvement: "One thing to improve tomorrow?",
  };

  for (const [key, label] of Object.entries(PROMPT_LABELS)) {
    if (reflection[key] != null) {
      entries.push({ id: key, prompt: label, answer: String(reflection[key]) });
    }
  }

  if (row.output_count != null) {
    entries.push({ id: "output_count", prompt: "Outputs shipped today", answer: String(row.output_count) });
  }
  if (row.focus_score != null) {
    entries.push({ id: "focus_score", prompt: "Focus score", answer: `${row.focus_score}/100` });
  }

  return entries;
}

// ── Activity Logs (output tracker) ──────────────────────────────────
export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  target_type: string | null;
  detail: Record<string, string> | null;
  created_at: string;
}

export async function getActivityLogs(): Promise<ActivityEntry[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("activity_logs")
        .select("id, actor, action, target_type, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    [] as ActivityEntry[]
  );
  return rows;
}

// ── Operator Context (bottlenecks etc.) ─────────────────────────────
export interface ContextEntry {
  id: string;
  area: string;
  description: string;
  blocked_since: string;
  impact: string;
}

export async function getOperatorContext(): Promise<ContextEntry[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_context")
        .select("*")
        .order("created_at", { ascending: false }),
    [] as Record<string, unknown>[]
  );
  return rows.map((r) => ({
    id: String(r.id ?? ""),
    area: String(r.area ?? r.context_type ?? r.key ?? ""),
    description: String(r.description ?? r.content ?? r.value ?? ""),
    blocked_since: String(r.blocked_since ?? r.created_at ?? ""),
    impact: String(r.impact ?? r.level ?? "medium"),
  }));
}

// ── Money Data ───────────────────────────────────────────────────────
export interface MoneyData {
  cashAvailable: number;
  earnedToday: number;
  expectedPayouts: { id: string; source: string; amount: number; dueDate: string }[];
  expensesThisWeek: number;
  cashFlowSeries: { day: string; amount: number }[];
}

type MoneyRow = {
  id: string;
  occurred_on: string;
  direction: "in" | "out" | "pending";
  source: string | null;
  category: string | null;
  amount: number;
  notes: string | null;
};

export async function getMoneyData(): Promise<MoneyData> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("money_entries")
        .select("id, occurred_on, direction, source, category, amount, notes")
        .order("occurred_on", { ascending: false })
        .limit(500),
    [] as MoneyRow[]
  );

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0, Sun=6
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  // Build 7-day series Mon–Sun
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayTotals: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dayTotals[d.toISOString().slice(0, 10)] = 0;
  }

  let cashAvailable = 0;
  let earnedToday = 0;
  let expensesThisWeek = 0;
  const pendingPayouts: MoneyData["expectedPayouts"] = [];

  for (const r of rows) {
    const amt = Number(r.amount);
    if (r.direction === "in") {
      cashAvailable += amt;
      if (r.occurred_on === today) earnedToday += amt;
      if (r.occurred_on in dayTotals) dayTotals[r.occurred_on] += amt;
    } else if (r.direction === "out") {
      cashAvailable -= amt;
      if (r.occurred_on >= weekStartStr && r.occurred_on <= today) expensesThisWeek += amt;
      if (r.occurred_on in dayTotals) dayTotals[r.occurred_on] -= amt;
    } else if (r.direction === "pending") {
      pendingPayouts.push({
        id: r.id,
        source: r.source ?? r.category ?? "Pending",
        amount: amt,
        dueDate: r.occurred_on,
      });
    }
  }

  const cashFlowSeries = Object.entries(dayTotals).map(([dateStr, amount], i) => ({
    day: DAYS[i] ?? dateStr,
    amount: Math.round(amount * 100) / 100,
  }));

  return {
    cashAvailable: Math.round(cashAvailable * 100) / 100,
    earnedToday: Math.round(earnedToday * 100) / 100,
    expectedPayouts: pendingPayouts,
    expensesThisWeek: Math.round(expensesThisWeek * 100) / 100,
    cashFlowSeries,
  };
}

// ── Agent Recommendations (re-export for other pages) ───────────────
export interface AgentRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
}
export async function getAgentRecommendations(): Promise<AgentRecommendation[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("agent_recommendations")
        .select("id, title, description, category")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      title: string;
      description: string | null;
      category: string | null;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    category: r.category ?? "system",
  }));
}
