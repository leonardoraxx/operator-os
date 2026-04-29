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

// ── Goals ───────────────────────────────────────────────────────────
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
        .from("goals")
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
        .from("goals")
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

// ── Projects ────────────────────────────────────────────────────────
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
        .from("projects")
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

// ── Agent Tasks (approval queue) ────────────────────────────────────
export async function getAgentTasks(): Promise<AgentTask[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("agent_tasks")
        .select("id, agent, description, count, status, created_at")
        .order("created_at", { ascending: false }),
    [] as Array<{
      id: string;
      agent: string;
      description: string;
      count: number;
      status: string;
      created_at: string;
    }>
  );
  return rows.map((r) => ({
    id: r.id,
    agent: r.agent,
    description: r.description,
    count: r.count ?? undefined,
    status: r.status as AgentTask["status"],
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

// ── Agent Recommendations ───────────────────────────────────────────
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
