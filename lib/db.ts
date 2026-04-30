import "server-only";
import { supabaseServer } from "./supabase-server";
import type {
  Goal,
  Project,
  Business,
  RiskAlert,
  AgentTask,
  KillItem,
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
// Confirmed columns: id, profile_key, name, alias, age, location,
//   primary_focus, response_preference, operating_philosophy, context
export async function getOperator(): Promise<Operator | null> {
  const [profile, reviews] = await Promise.all([
    safeQuery(
      () =>
        supabaseServer
          .from("operator_profile")
          .select("name, alias, primary_focus")
          .limit(1)
          .maybeSingle(),
      null as null | { name: string; alias: string | null; primary_focus: string | null }
    ),
    safeQuery(
      () =>
        supabaseServer
          .from("daily_reviews")
          // focus_score column does not exist in this DB; only execution_score
          .select("review_date, execution_score")
          .order("review_date", { ascending: false })
          .limit(7),
      [] as Array<{ review_date: string; execution_score: number | null }>
    ),
  ]);

  if (!profile) return null;

  // Build sparklines from last 7 days of daily_reviews (oldest→newest)
  const sorted   = [...reviews].reverse();
  const execSpark = sorted.map((r) => r.execution_score ?? 0);
  const latest    = reviews[0]; // most recent

  const execValue  = latest?.execution_score ?? 0;
  const execDelta  = execSpark.length > 1
    ? execSpark[execSpark.length - 1] - execSpark[execSpark.length - 2]
    : 0;

  return {
    name:   profile.name,
    handle: profile.alias ?? "",
    role:   profile.primary_focus ?? "",
    // No focus_score column exists; mirror execution score
    focusScore: {
      value:     execValue,
      delta:     execDelta,
      sparkline: execSpark,
      label:     "Focus Score",
    },
    executionScore: {
      value:     execValue,
      delta:     execDelta,
      sparkline: execSpark,
      label:     "Execution Score",
    },
  };
}

// ── Operator preferences ─────────────────────────────────────────────
// Confirmed columns: id, preference_key, theme, accent, dashboard_density,
//   default_view, settings, created_at, updated_at
export interface OperatorPreferences {
  theme:            string;
  accent:           string;
  dashboardDensity: string;
  defaultView:      string;
  settings:         Record<string, unknown>;
}

export async function getOperatorPreferences(): Promise<OperatorPreferences | null> {
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("operator_preferences")
        .select("theme, accent, dashboard_density, default_view, settings")
        .limit(1)
        .maybeSingle(),
    null as null | Record<string, unknown>
  );
  if (!row) return null;
  return {
    theme:            String(row.theme ?? "dark"),
    accent:           String(row.accent ?? "gold"),
    dashboardDensity: String(row.dashboard_density ?? "comfortable"),
    defaultView:      String(row.default_view ?? "dashboard"),
    settings:         (row.settings as Record<string, unknown>) ?? {},
  };
}

// ── Goals — operator_goals ───────────────────────────────────────────
// Confirmed columns: id, title, description, category, target_value,
//   current_value, unit, progress_percent, deadline, status, priority,
//   risk_level, next_action, linked_business_id, linked_project_id, metadata
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

function mapGoalStatus(s: string): Goal["status"] {
  // DB uses "active" — map to frontend StatusType values
  if (s === "active" || s === "on-track") return "on-track";
  if (s === "at_risk" || s === "at-risk")  return "at-risk";
  if (s === "behind")                       return "behind";
  if (s === "done" || s === "completed")    return "done";
  if (s === "paused")                       return "paused";
  if (s === "in-progress" || s === "in_progress") return "in-progress";
  return "on-track"; // safe default
}

function mapGoal(r: GoalRow): Goal {
  return {
    id:         r.id,
    title:      r.title,
    category:   r.category as Goal["category"],
    progress:   r.progress_percent ?? 0,
    target:     Number(r.target_value  ?? 0),
    current:    Number(r.current_value ?? 0),
    unit:       r.unit ?? "",
    deadline:   r.deadline ?? "",
    status:     mapGoalStatus(r.status),
    priority:   r.priority as Goal["priority"],
    risk:       r.risk_level  ?? undefined,
    nextAction: r.next_action ?? undefined,
  };
}

const GOAL_SELECT =
  "id,title,category,progress_percent,target_value,current_value,unit,deadline,status,priority,risk_level,next_action";

export async function getActiveGoals(): Promise<Goal[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_goals")
        .select(GOAL_SELECT)
        .neq("status", "completed")
        .order("priority", { ascending: true })
        .order("deadline",  { ascending: true }),
    [] as GoalRow[]
  );
  return rows.map(mapGoal);
}

export async function getCompletedGoals(): Promise<Goal[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_goals")
        .select(GOAL_SELECT)
        .eq("status", "completed")
        .order("updated_at", { ascending: false }),
    [] as GoalRow[]
  );
  return rows.map(mapGoal);
}

// ── Businesses ──────────────────────────────────────────────────────
// Confirmed columns: id, name, type, status, description, revenue,
//   expenses, current_bottleneck, next_action, metadata
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
    id:            r.id,
    name:          r.name,
    tagline:       r.description ?? "",
    revenue:       Number(r.revenue  ?? 0),
    expenses:      Number(r.expenses ?? 0),
    status:        (r.status === "active" ? "on-track" : r.status === "paused" ? "paused" : "on-track") as Business["status"],
    nextMilestone: r.next_action       ?? "",
    bottleneck:    r.current_bottleneck ?? "",
    type:          r.type ?? "",
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

// ── Projects — operator_projects ────────────────────────────────────
// Confirmed columns: id, name, type, status, business_id, description,
//   repo_url, live_url, priority, revenue_potential, next_step,
//   last_touched_at, metadata
export async function getProjects(): Promise<Project[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_projects")
        .select("id,name,type,status,priority,next_step")
        .order("priority", { ascending: true }),
    [] as Array<{ id: string; name: string; type: string | null; status: string; priority: string; next_step: string | null }>
  );
  return rows.map((r) => ({
    id:       r.id,
    title:    r.name,
    business: "",
    category: r.type ?? "",
    progress: 0,
    status:   r.status   as Project["status"],
    priority: r.priority as Project["priority"],
    column:   "active"   as Project["column"],
  }));
}

// ── Operator Tasks — operator_tasks ──────────────────────────────────
// Confirmed columns: id, title, description, status, priority, due_date,
//   linked_goal_id, linked_project_id, linked_business_id, source, metadata
export interface OperatorTask {
  id:       string;
  title:    string;
  category: string;
  priority: string;
  done:     boolean;
  due_date: string | null;
  notes:    string | null;
}

function mapTaskRow(r: Record<string, unknown>): OperatorTask {
  const status = String(r.status ?? "");
  return {
    id:       String(r.id    ?? ""),
    title:    String(r.title ?? ""),
    category: String(r.source ?? "personal"),
    priority: String(r.priority ?? "medium"),
    done:     status === "done" || status === "completed",
    due_date: r.due_date ? String(r.due_date) : null,
    notes:    r.description ? String(r.description) : null,
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
// Confirmed columns: id, title, category, severity, reason, mitigation,
//   status, source, linked_*, metadata, created_at, resolved_at
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
    id:          r.id,
    title:       r.title,
    description: r.reason ?? "",
    level:       (r.severity ?? "medium") as RiskAlert["level"],
    category:    r.category as RiskAlert["category"],
    timestamp:   r.created_at,
  }));
}

// ── Agent Recommendations ────────────────────────────────────────────
// Confirmed columns: id, agent_name, recommendation, confidence_score,
//   risk_level, expected_upside, required_action, status, source,
//   linked_*, metadata, created_at, updated_at
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
    id:          r.id,
    agent:       r.agent_name ?? "System",
    description: r.recommendation ?? "",
    count:       undefined,
    status:      "pending" as const,
    timestamp:   r.created_at,
  }));
}

export interface AgentRecommendation {
  id:          string;
  title:       string;
  description: string;
  category:    string;
}

export async function getAgentRecommendations(): Promise<AgentRecommendation[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("agent_recommendations")
        .select("id,agent_name,recommendation")
        .neq("status", "dismissed")
        .order("created_at", { ascending: false }),
    [] as Array<{ id: string; agent_name: string | null; recommendation: string | null }>
  );
  return rows.map((r) => ({
    id:          r.id,
    title:       r.agent_name ?? "Agent",
    description: r.recommendation ?? "",
    category:    "agent",
  }));
}

// ── Kill List ───────────────────────────────────────────────────────
// Confirmed columns: id, title, reason, status, source, created_at
export async function getKillItems(): Promise<KillItem[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("kill_list")
        .select("id,title,reason,source")
        .order("created_at", { ascending: false }),
    [] as Array<{ id: string; title: string; reason: string | null; source: string | null }>
  );
  return rows.map((r) => ({
    id:        r.id,
    title:     r.title,
    reason:    r.reason ?? "",
    timeSaved: "",
    category:  (r.source ?? "system") as KillItem["category"],
  }));
}

// ── Decisions ───────────────────────────────────────────────────────
// Confirmed columns (from prior work): id, title, rationale, sector,
//   decided_on, created_at
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
    id:         r.id,
    title:      r.title,
    outcome:    r.rationale ?? "",
    date:       r.decided_on ?? r.created_at.slice(0, 10),
    reversible: false,
    category:   (r.sector as Decision["category"]) ?? "system",
  }));
}

// ── Opportunities — table does not exist ─────────────────────────────
export async function getOpportunities(): Promise<Opportunity[]> {
  return [];
}

// ── Daily Scoreboard ─────────────────────────────────────────────────
// Confirmed columns: id, date, money_action, venhq_output, clipping_output,
//   gym_or_protein, faith_check, homebase_used, notes, created_at, updated_at
export interface DailyScoreboardEntry {
  id:             string;
  date:           string;
  moneyAction:    boolean;
  venhqOutput:    boolean;
  clippingOutput: boolean;
  gymOrProtein:   boolean;
  faithCheck:     boolean;
  homebaseUsed:   boolean;
  notes:          string | null;
  score:          number; // 0–100: (true_count / 6) * 100
}

export async function getDailyScoreboard(): Promise<DailyScoreboardEntry[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("daily_scoreboard")
        .select("id,date,money_action,venhq_output,clipping_output,gym_or_protein,faith_check,homebase_used,notes")
        .order("date", { ascending: false })
        .limit(7),
    [] as Record<string, unknown>[]
  );
  return rows.map((r) => {
    const flags = [r.money_action, r.venhq_output, r.clipping_output, r.gym_or_protein, r.faith_check, r.homebase_used];
    const trueCount = flags.filter(Boolean).length;
    return {
      id:             String(r.id   ?? ""),
      date:           String(r.date ?? ""),
      moneyAction:    Boolean(r.money_action),
      venhqOutput:    Boolean(r.venhq_output),
      clippingOutput: Boolean(r.clipping_output),
      gymOrProtein:   Boolean(r.gym_or_protein),
      faithCheck:     Boolean(r.faith_check),
      homebaseUsed:   Boolean(r.homebase_used),
      notes:          r.notes ? String(r.notes) : null,
      score:          Math.round((trueCount / 6) * 100),
    };
  });
}

// ── Implementation Queue ─────────────────────────────────────────────
// Confirmed columns: id, phase, sequence_order, title, prompt, status,
//   priority, category, success_criteria, metadata, created_at, updated_at
export interface ImplementationItem {
  id:              string;
  phase:           string;
  order:           number;
  title:           string;
  prompt:          string | null;
  status:          string;
  priority:        string;
  category:        string;
  successCriteria: string | null;
}

export async function getImplementationQueue(): Promise<ImplementationItem[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("implementation_queue")
        .select("id,phase,sequence_order,title,prompt,status,priority,category,success_criteria")
        .order("phase",           { ascending: true })
        .order("sequence_order",  { ascending: true }),
    [] as Record<string, unknown>[]
  );
  return rows.map((r) => ({
    id:              String(r.id             ?? ""),
    phase:           String(r.phase          ?? ""),
    order:           Number(r.sequence_order ?? 0),
    title:           String(r.title          ?? ""),
    prompt:          r.prompt           ? String(r.prompt)           : null,
    status:          String(r.status         ?? ""),
    priority:        String(r.priority       ?? "medium"),
    category:        String(r.category       ?? ""),
    successCriteria: r.success_criteria ? String(r.success_criteria) : null,
  }));
}

// ── System Health Checks ─────────────────────────────────────────────
// Confirmed columns: id, frontend_connected, settings_working,
//   buttons_working, render_deployed, last_checked, issues_found
export interface SystemHealth {
  frontendConnected: boolean;
  settingsWorking:   boolean;
  buttonsWorking:    boolean;
  renderDeployed:    boolean;
  lastChecked:       string | null;
  issuesFound:       string | null;
}

export async function getSystemHealth(): Promise<SystemHealth | null> {
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("system_health_checks")
        .select("frontend_connected,settings_working,buttons_working,render_deployed,last_checked,issues_found")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    null as null | Record<string, unknown>
  );
  if (!row) return null;
  return {
    frontendConnected: Boolean(row.frontend_connected),
    settingsWorking:   Boolean(row.settings_working),
    buttonsWorking:    Boolean(row.buttons_working),
    renderDeployed:    Boolean(row.render_deployed),
    lastChecked:       row.last_checked ? String(row.last_checked) : null,
    issuesFound:       row.issues_found ? String(row.issues_found) : null,
  };
}

// ── Content Pipeline ────────────────────────────────────────���────────
// Confirmed columns: id, idea, hook, script_status (default "idea"),
//   video_type, platform, posted, views, lesson, created_at, updated_at
// Pipeline stages: idea → scripted → filmed → edited → posted
export interface ContentPipelineItem {
  id:           string;
  idea:         string;
  hook:         string;
  scriptStatus: string;   // "idea" | "scripted" | "filmed" | "edited" | "posted"
  videoType:    string | null;
  platform:     string;
  posted:       boolean;
  views:        number;
  lesson:       string;
  createdAt:    string;
}

export async function getContentPipeline(): Promise<ContentPipelineItem[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("content_pipeline")
        .select("id,idea,hook,script_status,video_type,platform,posted,views,lesson,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    [] as Record<string, unknown>[]
  );
  return rows.map((r) => ({
    id:           String(r.id            ?? ""),
    idea:         String(r.idea          ?? ""),
    hook:         String(r.hook          ?? ""),
    scriptStatus: String(r.script_status ?? "idea"),
    videoType:    r.video_type ? String(r.video_type) : null,
    platform:     String(r.platform      ?? ""),
    posted:       Boolean(r.posted),
    views:        Number(r.views         ?? 0),
    lesson:       String(r.lesson        ?? ""),
    createdAt:    String(r.created_at    ?? ""),
  }));
}

// ── Leads — table exists, currently empty ────────────────────────────
export interface Lead {
  id:      string;
  name:    string;
  source:  string;
  status:  string;
  value:   number;
  notes:   string | null;
}

export async function getLeads(): Promise<Lead[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    [] as Record<string, unknown>[]
  );
  return rows.map((r) => ({
    id:     String(r.id     ?? ""),
    name:   String(r.name   ?? ""),
    source: String(r.source ?? ""),
    status: String(r.status ?? ""),
    value:  Number(r.value  ?? 0),
    notes:  r.notes ? String(r.notes) : null,
  }));
}

// ── Prompt Library — table exists, currently empty ───────────────────
export interface PromptEntry {
  id:       string;
  title:    string;
  prompt:   string;
  category: string;
  tags:     string[];
}

export async function getPromptLibrary(): Promise<PromptEntry[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("prompt_library")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    [] as Record<string, unknown>[]
  );
  return rows.map((r) => ({
    id:       String(r.id       ?? ""),
    title:    String(r.title    ?? ""),
    prompt:   String(r.prompt   ?? r.content ?? ""),
    category: String(r.category ?? ""),
    tags:     Array.isArray(r.tags) ? r.tags.map(String) : [],
  }));
}

// ── Today's Mission — missions table does not exist ──────────────────
// Synthesized from daily_scoreboard when a row exists for today.
import type { Mission } from "@/data/types";

export async function getTodaysMission(): Promise<Mission | null> {
  const today = new Date().toISOString().slice(0, 10);
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("daily_scoreboard")
        .select("*")
        .eq("date", today)
        .maybeSingle(),
    null as Record<string, unknown> | null
  );
  if (!row) return null;

  return {
    title:       "Today's Daily Scoreboard",
    description: "Six high-leverage actions. Complete them all.",
    deadline:    "EOD",
    status:      "on-track",
    consequence: "Skipped output days compound into stalled momentum cycles.",
    actions: [
      { id: "money",    title: "Money Action",    done: Boolean(row.money_action) },
      { id: "venhq",    title: "VenHQ Output",    done: Boolean(row.venhq_output) },
      { id: "clipping", title: "Clipping Output", done: Boolean(row.clipping_output) },
      { id: "gym",      title: "Gym / Protein",   done: Boolean(row.gym_or_protein) },
      { id: "faith",    title: "Faith Check",     done: Boolean(row.faith_check) },
      { id: "homebase", title: "Homebase Used",   done: Boolean(row.homebase_used) },
    ],
  };
}

// ── Weekly Review ────────────────────────────────────────────────────
// Confirmed columns (from prior work): week_start, week_end, wins,
//   losses, next_metric, double_down
export interface WeeklyReviewData {
  wins:        string[];
  losses:      string[];
  nextMetric:  string;
  doubleDown:  string;
}

export async function getWeeklyReview(): Promise<WeeklyReviewData | null> {
  const today = new Date().toISOString().slice(0, 10);
  const row = await safeQuery(
    () =>
      supabaseServer
        .from("weekly_reviews")
        .select("wins,losses,next_metric,double_down")
        .lte("week_start", today)
        .gte("week_end",   today)
        .maybeSingle(),
    null as null | {
      wins:        string | null;
      losses:      string | null;
      next_metric: string | null;
      double_down: string | null;
    }
  );
  if (!row) return null;
  const toList = (v: string | null) =>
    v ? v.split(/\n|;/).map((s) => s.trim()).filter(Boolean) : [];
  return {
    wins:       toList(row.wins),
    losses:     toList(row.losses),
    nextMetric: row.next_metric ?? "",
    doubleDown: row.double_down ?? "",
  };
}

// ── Daily Review / Closeout ──────────────────────────────────────────
// Confirmed columns: id, review_date, wins, losses, output_completed,
//   money_earned, money_spent, biggest_risk, tomorrow_mission,
//   closeout_status, execution_score, source, metadata
export interface CloseoutEntry {
  id:     string;
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
      wins:             string | null;
      losses:           string | null;
      output_completed: string | null;
      biggest_risk:     string | null;
      tomorrow_mission: string | null;
      execution_score:  number | null;
    }
  );
  if (!row) return [];

  const entries: CloseoutEntry[] = [];
  if (row.wins)             entries.push({ id: "wins",     prompt: "Top win today?",          answer: row.wins });
  if (row.losses)           entries.push({ id: "losses",   prompt: "What didn't get done?",   answer: row.losses });
  if (row.output_completed) entries.push({ id: "output",   prompt: "Outputs completed",        answer: row.output_completed });
  if (row.biggest_risk)     entries.push({ id: "risk",     prompt: "Biggest risk right now?",  answer: row.biggest_risk });
  if (row.tomorrow_mission) entries.push({ id: "tomorrow", prompt: "Tomorrow's mission?",      answer: row.tomorrow_mission });
  if (row.execution_score != null)
    entries.push({ id: "score", prompt: "Execution score", answer: `${row.execution_score}/100` });
  return entries;
}

// ── Activity Logs ────────────────────────────────────────────────────
// Confirmed columns: id, event_type, title, description, entity_type,
//   entity_id, metadata, created_at
export interface ActivityEntry {
  id:          string;
  actor:       string;
  action:      string;
  target_type: string | null;
  detail:      Record<string, string> | null;
  created_at:  string;
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
    id:          r.id,
    actor:       "operator",
    action:      r.event_type ?? r.title ?? "activity",
    target_type: r.entity_type ?? null,
    detail:      r.description ? { note: r.description } : null,
    created_at:  r.created_at,
  }));
}

// ── Operator Context (bottlenecks) ───────────────────────────────────
// Confirmed columns: id, context_type, title, content, metadata,
//   priority, status, created_at, updated_at
export interface ContextEntry {
  id:            string;
  area:          string;
  description:   string;
  blocked_since: string;
  impact:        string;
}

export async function getOperatorContext(): Promise<ContextEntry[]> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("operator_context")
        .select("id,context_type,title,content,priority,status,created_at")
        .order("created_at", { ascending: false }),
    [] as Record<string, unknown>[]
  );
  return rows.map((r) => ({
    id:            String(r.id           ?? ""),
    area:          String(r.title        ?? r.context_type ?? ""),
    description:   String(r.content      ?? ""),
    blocked_since: String(r.created_at   ?? ""),
    impact:        String(r.priority     ?? "medium"),
  }));
}

// ── Money Data ───────────────────────────────────────────────────────
// Confirmed columns: id, entry_date, type, category, amount, notes
// (table currently empty; direction/occurred_on variant also handled)
export interface MoneyData {
  cashAvailable:   number;
  earnedToday:     number;
  expectedPayouts: { id: string; source: string; amount: number; dueDate: string }[];
  expensesThisWeek: number;
  cashFlowSeries:  { day: string; amount: number }[];
}

export async function getMoneyData(): Promise<MoneyData> {
  const rows = await safeQuery(
    () =>
      supabaseServer
        .from("money_entries")
        .select("id,entry_date,type,category,amount,notes")
        .order("entry_date", { ascending: false })
        .limit(500),
    [] as Array<{
      id: string;
      entry_date: string;
      type: string | null;
      category: string | null;
      amount: number;
      notes: string | null;
    }>
  );

  const today      = new Date().toISOString().slice(0, 10);
  const now        = new Date();
  const dayOfWeek  = (now.getDay() + 6) % 7;
  const weekStart  = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const DAYS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayTotals: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dayTotals[d.toISOString().slice(0, 10)] = 0;
  }

  let cashAvailable    = 0;
  let earnedToday      = 0;
  let expensesThisWeek = 0;
  const pendingPayouts: MoneyData["expectedPayouts"] = [];

  for (const r of rows) {
    const amt = Number(r.amount);
    const t   = (r.type ?? "").toLowerCase();
    const isIn      = t === "income"  || t === "in"  || t === "revenue";
    const isOut     = t === "expense" || t === "out" || t === "cost";
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
        id:      r.id,
        source:  r.category ?? r.notes ?? "Pending",
        amount:  amt,
        dueDate: r.entry_date,
      });
    }
  }

  return {
    cashAvailable:    Math.round(cashAvailable    * 100) / 100,
    earnedToday:      Math.round(earnedToday      * 100) / 100,
    expectedPayouts:  pendingPayouts,
    expensesThisWeek: Math.round(expensesThisWeek * 100) / 100,
    cashFlowSeries:   Object.entries(dayTotals).map(([, amount], i) => ({
      day:    DAYS[i] ?? "",
      amount: Math.round(amount * 100) / 100,
    })),
  };
}

// ── Notification count ───────────────────────────────────────────────
// Unresolved risk alerts + non-dismissed agent recommendations
export async function getNotificationCount(): Promise<number> {
  try {
    const [alertsRes, recsRes] = await Promise.all([
      supabaseServer
        .from("risk_alerts")
        .select("id", { count: "exact", head: true })
        .neq("status", "resolved"),
      supabaseServer
        .from("agent_recommendations")
        .select("id", { count: "exact", head: true })
        .neq("status", "dismissed"),
    ]);
    return ((alertsRes.count ?? 0) + (recsRes.count ?? 0));
  } catch {
    return 0;
  }
}
