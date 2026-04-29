-- =====================================================================
-- OperatorOS schema migration
-- Wipes old `homebase` schema, creates clean OperatorOS schema.
-- Safe to re-run: uses DROP IF EXISTS / CREATE IF NOT EXISTS where useful.
-- =====================================================================

-- ── Drop old homebase tables ─────────────────────────────────────────
DROP TABLE IF EXISTS public.graph_relationships CASCADE;
DROP TABLE IF EXISTS public.graph_entities      CASCADE;
DROP TABLE IF EXISTS public.knowledge_items     CASCADE;
DROP TABLE IF EXISTS public.chat_imports        CASCADE;
DROP TABLE IF EXISTS public.chat_extractions    CASCADE;
DROP TABLE IF EXISTS public.archives            CASCADE;
DROP TABLE IF EXISTS public.agent_logs          CASCADE;
DROP TABLE IF EXISTS public.agents              CASCADE;
DROP TABLE IF EXISTS public.workflows           CASCADE;
DROP TABLE IF EXISTS public.systems             CASCADE;
DROP TABLE IF EXISTS public.ideas               CASCADE;
DROP TABLE IF EXISTS public.decisions           CASCADE;
DROP TABLE IF EXISTS public.projects            CASCADE;
DROP TABLE IF EXISTS public.goals               CASCADE;
DROP TABLE IF EXISTS public.sectors             CASCADE;

-- ── Identity / settings ──────────────────────────────────────────────
CREATE TABLE public.operator_profile (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  alias           text,
  handle          text,
  role            text,
  avatar_url      text,
  focus           text,
  philosophy      jsonb DEFAULT '[]'::jsonb,
  response_pref   text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE public.operator_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            text NOT NULL CHECK (kind IN ('focus','execution')),
  value           int  NOT NULL,
  delta           int  DEFAULT 0,
  sparkline       int[] DEFAULT '{}',
  recorded_at     date DEFAULT current_date,
  UNIQUE (kind, recorded_at)
);

CREATE TABLE public.operator_preferences (
  key             text PRIMARY KEY,
  value           jsonb,
  updated_at      timestamptz DEFAULT now()
);

-- ── Businesses ───────────────────────────────────────────────────────
CREATE TABLE public.businesses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL UNIQUE,
  tagline         text,
  status          text DEFAULT 'on-track',
  revenue         numeric DEFAULT 0,
  mrr             numeric DEFAULT 0,
  employees       int DEFAULT 0,
  founded         text,
  next_milestone  text,
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- ── Goals ────────────────────────────────────────────────────────────
CREATE TABLE public.goals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  category        text NOT NULL,
  progress        int DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target          numeric DEFAULT 0,
  current_value   numeric DEFAULT 0,
  unit            text DEFAULT '',
  deadline        date,
  status          text DEFAULT 'on-track',
  priority        text DEFAULT 'medium',
  risk            text,
  next_action     text,
  quadrant        text,
  business_id     uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  is_completed    boolean DEFAULT false,
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE public.milestones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id         uuid REFERENCES public.goals(id) ON DELETE CASCADE,
  title           text NOT NULL,
  due_date        date,
  done            boolean DEFAULT false,
  sort_order      int DEFAULT 0
);

-- ── Projects ─────────────────────────────────────────────────────────
CREATE TABLE public.projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  business_id     uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  business_name   text,
  category        text,
  progress        int DEFAULT 0,
  status          text DEFAULT 'active',
  priority        text DEFAULT 'medium',
  due_date        date,
  tasks_total     int DEFAULT 0,
  tasks_done      int DEFAULT 0,
  column_lane     text DEFAULT 'active',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── Tasks ────────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  category        text DEFAULT 'personal',
  priority        text DEFAULT 'medium',
  done            boolean DEFAULT false,
  due_date        date,
  project_id      uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  goal_id         uuid REFERENCES public.goals(id) ON DELETE SET NULL,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  completed_at    timestamptz
);

-- ── Today's Mission ──────────────────────────────────────────────────
CREATE TABLE public.missions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  deadline        text,
  status          text DEFAULT 'on-track',
  consequence     text,
  for_date        date DEFAULT current_date,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.mission_actions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id      uuid REFERENCES public.missions(id) ON DELETE CASCADE,
  title           text NOT NULL,
  done            boolean DEFAULT false,
  sort_order      int DEFAULT 0
);

-- ── Risk Alerts ──────────────────────────────────────────────────────
CREATE TABLE public.risk_alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  level           text DEFAULT 'medium',
  category        text DEFAULT 'system',
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- ── Agent Approval queue ─────────────────────────────────────────────
CREATE TABLE public.agent_tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent           text NOT NULL,
  description     text NOT NULL,
  count           int,
  status          text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  payload         jsonb,
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz
);

CREATE TABLE public.agent_recommendations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  category        text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- ── Kill List + Decisions + Opportunities ────────────────────────────
CREATE TABLE public.kill_list (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  reason          text,
  time_saved      text,
  category        text DEFAULT 'system',
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.decisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  outcome         text,
  category        text,
  reversible      boolean DEFAULT true,
  decided_on      date DEFAULT current_date,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.opportunities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  category        text,
  potential_value numeric DEFAULT 0,
  effort          text DEFAULT 'medium',
  deadline        date,
  notes           text,
  status          text DEFAULT 'open',
  created_at      timestamptz DEFAULT now()
);

-- ── Reviews & Closeouts ──────────────────────────────────────────────
CREATE TABLE public.daily_reviews (
  for_date        date PRIMARY KEY,
  mission_id      uuid REFERENCES public.missions(id) ON DELETE SET NULL,
  reflection      jsonb DEFAULT '{}'::jsonb,
  output_count    int DEFAULT 0,
  focus_score     int,
  execution_score int,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.weekly_reviews (
  iso_week        text PRIMARY KEY,
  highlights      jsonb DEFAULT '[]'::jsonb,
  bottlenecks     jsonb DEFAULT '[]'::jsonb,
  next_week       jsonb DEFAULT '[]'::jsonb,
  output_total    int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- ── Domain trackers ──────────────────────────────────────────────────
CREATE TABLE public.content_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  platform        text,
  format          text CHECK (format IN ('short','long','post','reel','other')),
  title           text,
  url             text,
  posted_at       timestamptz,
  views           int DEFAULT 0,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.clipping_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign        text NOT NULL,
  platform        text,
  url             text,
  posted_at       timestamptz,
  views           int DEFAULT 0,
  cpm             numeric DEFAULT 0,
  pending_amount  numeric DEFAULT 0,
  approved_amount numeric DEFAULT 0,
  payout_status   text DEFAULT 'pending',
  rejected        boolean DEFAULT false,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.trading_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date    date DEFAULT current_date,
  instrument      text,
  setup           text,
  model_followed  boolean DEFAULT false,
  rule_breaks     int DEFAULT 0,
  revenge_trade   boolean DEFAULT false,
  overtrading     boolean DEFAULT false,
  emotional_state text,
  result_pnl      numeric DEFAULT 0,
  discipline_score int,
  notes           text,
  screenshot_url  text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.fitness_logs (
  for_date        date PRIMARY KEY,
  body_weight_lb  numeric,
  calories        int,
  protein_g       int,
  gym_completed   boolean DEFAULT false,
  workout_split   text,
  sleep_hours     numeric,
  sleep_quality   int CHECK (sleep_quality BETWEEN 1 AND 10),
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.money_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_on     date DEFAULT current_date,
  direction       text CHECK (direction IN ('in','out','pending')),
  source          text,
  category        text,
  amount          numeric NOT NULL,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

-- ── AI Bridge & Approvals & Activity ─────────────────────────────────
CREATE TABLE public.ai_bridge_exports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_kind    text NOT NULL,
  payload         jsonb NOT NULL,
  prompt          text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.ai_bridge_imports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_label    text,
  raw_input       jsonb NOT NULL,
  validated       boolean DEFAULT false,
  applied         boolean DEFAULT false,
  applied_at      timestamptz,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.approval_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            text NOT NULL,
  payload         jsonb NOT NULL,
  status          text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  resolved_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.activity_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor           text DEFAULT 'system',
  action          text NOT NULL,
  target_type     text,
  target_id       text,
  detail          jsonb,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE public.automation_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name   text NOT NULL,
  status          text DEFAULT 'queued',
  started_at      timestamptz,
  finished_at     timestamptz,
  output          jsonb,
  created_at      timestamptz DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────────
CREATE INDEX idx_goals_status        ON public.goals(status);
CREATE INDEX idx_goals_category      ON public.goals(category);
CREATE INDEX idx_projects_status     ON public.projects(status);
CREATE INDEX idx_tasks_done          ON public.tasks(done);
CREATE INDEX idx_agent_tasks_status  ON public.agent_tasks(status);
CREATE INDEX idx_risk_alerts_active  ON public.risk_alerts(is_active);
CREATE INDEX idx_missions_active     ON public.missions(is_active, for_date DESC);

-- ── RLS (open for service-role; tighten when auth wired) ─────────────
-- Service role bypasses RLS. We enable RLS so anon role cannot read by default.
ALTER TABLE public.operator_profile      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_actions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kill_list             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clipping_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_bridge_exports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_bridge_imports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs       ENABLE ROW LEVEL SECURITY;
