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

// ── Operator profile ─────────────────────────────────────────────────
// Real columns: id, profile_key, name, alias, age, location, primary_focus,
//               response_preference, operating_philosophy, context
export async function getOperator(): Promise<Operator | null> {
  const profile = await safeQuery(
    () =>
      supabaseServer
        .from("operator_profile")
        .select("name, alias, primary_focus")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    null as null | { name: string; alias: string | null; primary_focus: string | null }
  );

  if (!profile) return null;

  const EMPTY_SCORE: Score = { value: 0, delta: 0, sparkline: [], label: "" };

  return {
    name: profile.name,
    handle: profile.alias ?? "",
    role: profile.primary_focus ?? "",
    focusScore: { ...EMPTY_SCORE, label: "Focus Score" },
    executionScore: { ...EMPTY_SCORE, label: "Execution Score" },
  };
}

// ── Goals — uses operator_goals ─────────────────────────────────────
// Real columns: id, title, description, category, target_value, current_value,
//               unit, progress_percent, deadline, status, priority, risk_level,
//               next_action, linked_business_id, linked_project_id, metadata
type GoalRow = {
  id: string;
  title: string;
  category: string;
  progress_percent: number;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  status: string;
  priority: string;
  risk_level: string | null;
  next_action: string | null;
};

function mapGoal(r: GoalRow): Goal {
  return {
    id: r.id,
    title: r.title,
    category: r.category as Goal["category"],
    progress: r.progress_percent ?? 0,
    target: Number(r.target_value ?? 0),
    current: Number(r.current_value ?? 0),
    unit: r.unit ?? "",
    deadline: r.deadline ?? "",
    status: r.status as Goal["status"],
    priority: r.priority as Goal["priority"],
    risk: r.risk_level ?? undefined,
    nextAction: r.next_action ?? undefined,
  };
}

export async function getActiveGoals(): Promise<Goal[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_goals")
        .select("id,title,category,progress_percent,target_value,current_value,unit,deadline,status,priority,risk_level,next_action")
        .neq("status", "completed")
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
        .select("id,title,category,progress_percent,target_value,current_value,unit,deadline,status,priority,risk_level,next_action")
        .eq("status", "completed")
        .order("updated_at", { ascending: false }),
    [] as GoalRow[]
  );
  return rows.map(mapGoal);
}

// ── Businesses ──────────────────────────────────────────────────────
// Real columns: id, name, type, status, description, revenue, expenses,
//               current_bottleneck, next_action, metadata
type BusinessRow = {
  id: string;
  name: string;
  type: string | null;
  status: string;
  description: string | null;
  revenue: number | null;
  expenses: number | null;
  current_bottleneck: string | null;
  next_action: string | null;
};

function mapBusiness(r: BusinessRow): Business {
  return {
    id: r.id,
    name: r.name,
    tagline: r.description ?? "",
    revenue: Number(r.revenue ?? 0),
    expenses: Number(r.expenses ?? 0),
    status: (r.status === "active" ? "on-track" : r.status === "paused" ? "paused" : "on-track") as Business["status"],
    nextMilestone: r.next_action ?? "",
    bottleneck: r.current_bottleneck ?? "",
    type: r.type ?? "",
    mrr: undefined,
    employees: undefined,
    founded: undefined,
  };
}

export async function getBusinesses(): Promise<Business[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("businesses")
        .select("id,name,type,status,description,revenue,expenses,current_bottleneck,next_action")
        .order("name", { ascending: true }),
    [] as BusinessRow[]
  );
  return rows.map(mapBusiness);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("businesses")
        .select("id,name,type,status,description,revenue,expenses,current_bottleneck,next_action")
        .eq("id", id)
        .maybeSingle(),
    null
  );
  if (!row) return null;
  return mapBusiness(row);
}

// ── Projects — uses operator_projects ───────────────────────────────
// Real columns: id, name, type, status, business_id, description, repo_url,
//               live_url, priority, revenue_potential, next_step, last_touched_at, metadata
type ProjectRow = {
  id: string;
  name: string;
  type: string | null;
  status: string;
  priority: string;
  next_step: string | null;
};

export async function getProjects(): Promise<Project[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_projects")
        .select("id,name,type,status,priority,next_step")
        .order("priority", { ascending: true }),
    [] as ProjectRow[]
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.name,
    business: "",
    category: r.type ?? "",
    progress: 0,
    status: r.status as Project["status"],
    priority: r.priority as Project["priority"],
    dueDate: undefined,
    tasks: undefined,
    column: "active" as Project["column"],
  }));
}

// ── Operator Tasks ───────────────────────────────────────────────────
// Real columns: id, title, description, status, priority, due_date,
//               linked_goal_id, linked_project_id, linked_business_id, source, metadata
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
  const status = String(r.status ?? "");
  return {
    id: String(r.id ?? ""),
    title: String(r.title ?? ""),
    category: String(r.source ?? r.category ?? r.type ?? "personal"),
    priority: String(r.priority ?? "medium"),
    done: status === "done" || status === "completed",
    due_date: r.due_date ? String(r.due_date) : null,
    notes: r.description ? String(r.description) : null,
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
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(100),
    [] as Record<string, unknown>[]
  );
  return rows.map(mapTaskRow);
}

// ── Risk Alerts ─────────────────────────────────────────────────────
// Real columns: id, title, category, severity, reason, mitigation,
//               status, source, linked_*, metadata
export async function getRiskAlerts(): Promise<RiskAlert[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("risk_alerts")
        .select("id,title,category,severity,reason,created_at")
        .neq("status", "resolved")
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      title: string;
      category: string;
      severity: string | null;
      reason: string | null;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.reason ?? "",
    level: (r.severity ?? "medium") as RiskAlert["level"],
    category: r.category as RiskAlert["category"],
    timestamp: r.created_at,
  }));
}

// ── Agent Recommendations (approval queue) ───────────────────────────
// Real columns: id, agent_name, recommendation, confidence_score, risk_level,
//               expected_upside, required_action, status, source, linked_*, metadata
export async function getAgentTasks(): Promise<AgentTask[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("agent_recommendations")
        .select("id,agent_name,recommendation,created_at")
        .neq("status", "dismissed")
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      agent_name: string | null;
      recommendation: string | null;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    agent: r.agent_name ?? "System",
    description: r.recommendation ?? "",
    count: undefined,
    status: "pending" as const,
    timestamp: r.created_at,
  }));
}

// ── Kill List ───────────────────────────────────────────────────────
// Real columns: id, title, reason, status, source
export async function getKillItems(): Promise<KillItem[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("kill_list")
        .select("id,title,reason,source")
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      title: string;
      reason: string | null;
      source: string | null;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    reason: r.reason ?? "",
    timeSaved: "",
    category: (r.source ?? "system") as KillItem["category"],
  }));
}

// ── Today's Mission — missions table not yet provisioned ─────────────
export async function getTodaysMission(): Promise<Mission | null> {
  return null;
}

// ── Decisions ───────────────────────────────────────────────────────
// Real columns: id, title, context, rationale, decided_on, sector, system_id, goal_id, project_id
export async function getDecisions(): Promise<Decision[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("decisions")
        .select("id,title,rationale,sector,decided_on,created_at")
        .order("decided_on", { ascending: false })
        .limit(20),
    [] as Array<{
      id: string;
      title: string;
      rationale: string | null;
      sector: string | null;
      decided_on: string | null;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    outcome: r.rationale ?? "",
    date: r.decided_on ?? r.created_at.slice(0, 10),
    reversible: false,
    category: (r.sector as Decision["category"]) ?? "system",
  }));
}

// ── Opportunities — not yet provisioned ─────────────────────────────
export async function getOpportunities(): Promise<Opportunity[]> {
  return [];
}

// ── Weekly Review ────────────────────────────────────────────────────
// Real columns: id, week_start, week_end, wins, losses, fake_productivity,
//               double_down, cut, biggest_risk, next_metric, score, status
export interface WeeklyReviewData {
  wins: string[];
  losses: string[];
  nextMetric: string;
  doubleDown: string;
}

export async function getWeeklyReview(): Promise<WeeklyReviewData | null> {
  const today = new Date().toISOString().slice(0, 10);
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("weekly_reviews")
        .select("wins,losses,next_metric,double_down")
        .lte("week_start", today)
        .gte("week_end", today)
        .maybeSingle(),
    null as null | {
      wins: string | null;
      losses: string | null;
      next_metric: string | null;
      double_down: string | null;
    }
  );
  if (!row) return null;
  const toList = (v: string | null) =>
    v ? v.split(/\n|;/).map((s) => s.trim()).filter(Boolean) : [];
  return {
    wins: toList(row.wins),
    losses: toList(row.losses),
    nextMetric: row.next_metric ?? "",
    doubleDown: row.double_down ?? "",
  };
}

// ── Daily Review / Closeout ──────────────────────────────────────────
// Real columns: id, review_date, wins, losses, output_completed, money_earned,
//               money_spent, biggest_risk, tomorrow_mission, closeout_status,
//               execution_score
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
        .select("wins,losses,output_completed,biggest_risk,tomorrow_mission,execution_score")
        .eq("review_date", today)
        .maybeSingle(),
    null as null | {
      wins: string | null;
      losses: string | null;
      output_completed: string | null;
      biggest_risk: string | null;
      tomorrow_mission: string | null;
      execution_score: number | null;
    }
  );
  if (!row) return [];

  const entries: CloseoutEntry[] = [];
  if (row.wins) entries.push({ id: "wins", prompt: "Top win today?", answer: row.wins });
  if (row.losses) entries.push({ id: "losses", prompt: "What didn't get done?", answer: row.losses });
  if (row.output_completed) entries.push({ id: "output", prompt: "Outputs completed", answer: row.output_completed });
  if (row.biggest_risk) entries.push({ id: "risk", prompt: "Biggest risk right now?", answer: row.biggest_risk });
  if (row.tomorrow_mission) entries.push({ id: "tomorrow", prompt: "Tomorrow's mission?", answer: row.tomorrow_mission });
  if (row.execution_score != null) entries.push({ id: "score", prompt: "Execution score", answer: `${row.execution_score}/100` });
  return entries;
}

// ── Activity Logs ────────────────────────────────────────────────────
// Real columns: id, event_type, title, description, entity_type, entity_id, metadata
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
        .select("id,event_type,title,description,entity_type,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    [] as Array<{
      id: string;
      event_type: string | null;
      title: string | null;
      description: string | null;
      entity_type: string | null;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    actor: "operator",
    action: r.event_type ?? r.title ?? "activity",
    target_type: r.entity_type ?? null,
    detail: r.description ? { note: r.description } : null,
    created_at: r.created_at,
  }));
}

// ── Operator Context (bottlenecks) ───────────────────────────────────
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
// Real columns: id, entry_date, type, category, amount, linked_business_id, notes, metadata
export interface MoneyData {
  cashAvailable: number;
  earnedToday: number;
  expectedPayouts: { id: string; source: string; amount: number; dueDate: string }[];
  expensesThisWeek: number;
  cashFlowSeries: { day: string; amount: number }[];
}

type MoneyRow = {
  id: string;
  entry_date: string;
  type: string | null;
  category: string | null;
  amount: number;
  notes: string | null;
};

export async function getMoneyData(): Promise<MoneyData> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("money_entries")
        .select("id,entry_date,type,category,amount,notes")
        .order("entry_date", { ascending: false })
        .limit(500),
    [] as MoneyRow[]
  );

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

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
    const t = (r.type ?? "").toLowerCase();
    const isIn = t === "income" || t === "in" || t === "revenue";
    const isOut = t === "expense" || t === "out" || t === "cost";
    const isPending = t === "pending";

    if (isIn) {
      cashAvailable += amt;
      if (r.entry_date === today) earnedToday += amt;
      if (r.entry_date in dayTotals) dayTotals[r.entry_date] += amt;
    } else if (isOut) {
      cashAvailable -= amt;
      if (r.entry_date >= weekStartStr && r.entry_date <= today) expensesThisWeek += amt;
      if (r.entry_date in dayTotals) dayTotals[r.entry_date] -= amt;
    } else if (isPending) {
      pendingPayouts.push({
        id: r.id,
        source: r.category ?? r.notes ?? "Pending",
        amount: amt,
        dueDate: r.entry_date,
      });
    }
  }

  const cashFlowSeries = Object.entries(dayTotals).map(([, amount], i) => ({
    day: DAYS[i] ?? "",
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

// ── Agent Recommendations (extended) ─────────────────────────────────
// Real columns: id, agent_name, recommendation, confidence_score, risk_level,
//               expected_upside, required_action, status, source, linked_*, metadata
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
        .select("id,agent_name,recommendation")
        .neq("status", "dismissed")
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      agent_name: string | null;
      recommendation: string | null;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.agent_name ?? "Agent",
    description: r.recommendation ?? "",
    category: "agent",
  }));
}
