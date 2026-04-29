import type {
  Mission,
  RiskAlert,
  MoneySnapshot,
  AgentTask,
  CalendarEvent,
  OutputItem,
  Bottleneck,
  Opportunity,
  Decision,
  KillItem,
  CloseoutItem,
  Project,
} from "./types";

// ── Today's Mission ───────────────────────────────────────────
export const TODAYS_MISSION: Mission = {
  title: "Close 3 new South FL Suds wholesale accounts",
  description:
    "Reach out to the 3 warm leads from last week's trade show. Priority: Brickell Market, Coral Gables Co-op, Miami Beach Naturals.",
  deadline: "6:00 PM",
  status: "in-progress" as const,
  consequence:
    "Pipeline momentum soft. Revenue delayed. Funding target at risk for Q2.",
  actions: [
    { id: "a1", title: "Follow-up email to Brickell Market buyer", done: true },
    { id: "a2", title: "Call Coral Gables Co-op (ask for Maria)", done: false },
    { id: "a3", title: "Send pricing sheet to Miami Beach Naturals", done: false },
    { id: "a4", title: "Log all responses in CRM", done: false },
  ],
};

// ── Risk Alerts ───────────────────────────────────────────────
export const RISK_ALERTS: RiskAlert[] = [
  {
    id: "r1",
    title: "Sleep Below Threshold",
    description: "5h 12m avg (3-day). Cognitive impact expected.",
    level: "high",
    category: "sleep",
    timestamp: "2026-04-26T07:00:00Z",
  },
  {
    id: "r2",
    title: "Output Below Baseline",
    description: "7 tasks vs 14 avg. Deep work blocks missing.",
    level: "elevated",
    category: "output",
    timestamp: "2026-04-26T08:00:00Z",
  },
  {
    id: "r3",
    title: "Spending Spike This Week",
    description: "$692 vs $410 avg. 3 unplanned purchases.",
    level: "medium",
    category: "spending",
    timestamp: "2026-04-26T06:00:00Z",
  },
  {
    id: "r4",
    title: "Tilt Risk Elevated",
    description: "Trading P&L -$340 in 2 days. Review protocol.",
    level: "medium",
    category: "tilt",
    timestamp: "2026-04-25T20:00:00Z",
  },
];

// ── Money Snapshot ────────────────────────────────────────────
export const MONEY_SNAPSHOT: MoneySnapshot = {
  cashAvailable: 8420.31,
  earnedToday: 342.18,
  expectedPayouts: [
    { id: "p1", source: "YouTube AdSense", amount: 680.0, dueDate: "2026-04-28" },
    { id: "p2", source: "South FL Suds Inv #12", amount: 420.0, dueDate: "2026-04-30" },
    { id: "p3", source: "Trading - Payout", amount: 150.0, dueDate: "2026-05-01" },
  ],
  expensesThisWeek: 692.45,
  cashFlowSeries: [
    { day: "Mon", amount: 280 },
    { day: "Tue", amount: -150 },
    { day: "Wed", amount: 410 },
    { day: "Thu", amount: -90 },
    { day: "Fri", amount: 342 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 },
  ],
};

// ── Calendar Events ───────────────────────────────────────────
export const CALENDAR_TODAY: CalendarEvent[] = [
  { id: "c1", title: "Deep Work - Suds outreach", time: "09:00", duration: "2h", category: "business", done: true },
  { id: "c2", title: "VenHQ product call", time: "11:30", duration: "45m", category: "business", done: false },
  { id: "c3", title: "Gym - Push day", time: "13:00", duration: "1h", category: "health", done: false },
  { id: "c4", title: "Record YT long-form", time: "15:00", duration: "2h", category: "content", done: false },
  { id: "c5", title: "Daily closeout", time: "18:30", duration: "15m", category: "system", done: false },
];

// ── Output Tracker ────────────────────────────────────────────
export const OUTPUT_ITEMS: OutputItem[] = [
  { id: "o1", type: "video", title: "VenHQ Short - Product Demo", timestamp: "2026-04-26T08:30:00Z", platform: "YouTube" },
  { id: "o2", type: "email", title: "Wholesale outreach - Brickell Market", timestamp: "2026-04-26T07:45:00Z" },
  { id: "o3", type: "task", title: "Funded account journal entry", timestamp: "2026-04-25T19:00:00Z" },
  { id: "o4", type: "post", title: "LinkedIn: Operator OS teaser", timestamp: "2026-04-25T14:00:00Z", platform: "LinkedIn" },
  { id: "o5", type: "call", title: "Investor check-in - 15 min", timestamp: "2026-04-25T11:00:00Z" },
];

// ── Active Projects ───────────────────────────────────────────
export const ACTIVE_PROJECTS: Project[] = [
  {
    id: "proj1",
    title: "VenHQ Short Posted",
    business: "VenHQ",
    category: "Content",
    progress: 74,
    status: "on-track",
    priority: "high",
    dueDate: "2026-04-28",
    tasks: { total: 8, done: 6 },
  },
  {
    id: "proj2",
    title: "South FL Suds Website Rebuild",
    business: "South FL Suds",
    category: "Business",
    progress: 42,
    status: "at-risk",
    priority: "high",
    dueDate: "2026-05-15",
    tasks: { total: 18, done: 7 },
  },
  {
    id: "proj3",
    title: "Thumbnail Generator Tool",
    business: "Content",
    category: "Content Tool",
    progress: 28,
    status: "behind",
    priority: "medium",
    dueDate: "2026-05-30",
    tasks: { total: 12, done: 3 },
  },
];

// ── Bottlenecks ───────────────────────────────────────────────
export const BOTTLENECKS: Bottleneck[] = [
  {
    id: "b1",
    area: "South FL Suds",
    description: "Waiting on revised wholesale contract from attorney",
    blockedSince: "2026-04-20",
    impact: "high",
  },
  {
    id: "b2",
    area: "Trading",
    description: "Prop firm verification pending (2 business days)",
    blockedSince: "2026-04-24",
    impact: "medium",
  },
  {
    id: "b3",
    area: "Content",
    description: "Thumbnail template needs Figma access restored",
    blockedSince: "2026-04-25",
    impact: "low",
  },
];

// ── Weekly War Room ───────────────────────────────────────────
export const WEEKLY_WAR_ROOM = {
  wins: [
    "Landed Brickell Market trial order ($420)",
    "YT video hit 8k views, best week",
    "Completed funded account eval challenge",
  ],
  losses: [
    "Missed 2 deep work sessions (sleep)",
    "SFS website delayed 1 week",
    "Content output -40% vs plan",
  ],
  nextMetric: "3 new wholesale accounts by Friday",
  doubleDown: "Morning deep work block - 7:30–9:30 AM, no exceptions",
};

// ── Daily Closeout ────────────────────────────────────────────
export const DAILY_CLOSEOUT: CloseoutItem[] = [
  { id: "dc1", prompt: "Top win today?", answer: "Sent pricing to Miami Beach Naturals" },
  { id: "dc2", prompt: "What didn't get done?", answer: "Coral Gables Co-op call, reschedule AM" },
  { id: "dc3", prompt: "Energy level (1–10)?", answer: "7" },
  { id: "dc4", prompt: "One thing to improve tomorrow?", answer: "Start outreach by 8 AM before email spiral" },
];

// ── Opportunity Queue ─────────────────────────────────────────
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp1",
    title: "Wholesale partnership - Fresh Market FL",
    category: "business",
    potentialValue: 2400,
    effort: "medium",
    deadline: "2026-05-10",
    notes: "Intro via trade show contact. They want 3-SKU test order.",
  },
  {
    id: "opp2",
    title: "YouTube brand deal - Eco cleaning brand",
    category: "content",
    potentialValue: 1500,
    effort: "low",
    notes: "Inbound via email. Fits audience. 60-day exclusivity clause.",
  },
  {
    id: "opp3",
    title: "Funded account - additional $50k contract",
    category: "finance",
    potentialValue: 50000,
    effort: "high",
    deadline: "2026-05-31",
    notes: "Current firm offers second contract at 80/20 split after 2 payouts.",
  },
];

// ── Decision Log ──────────────────────────────────────────────
export const DECISIONS: Decision[] = [
  {
    id: "d1",
    title: "Pause paid ads for South FL Suds - focus on wholesale",
    outcome: "Reallocate $400/mo budget to trade show follow-up",
    date: "2026-04-24",
    reversible: true,
    category: "business",
  },
  {
    id: "d2",
    title: "Ship VenHQ shorts on Mon/Wed/Fri cadence",
    outcome: "Consistent growth signal vs ad hoc posting",
    date: "2026-04-22",
    reversible: true,
    category: "content",
  },
  {
    id: "d3",
    title: "No new tools or subscriptions this quarter",
    outcome: "Reduce SaaS spend by $200+/mo, reduce context switching",
    date: "2026-04-18",
    reversible: false,
    category: "finance",
  },
];

// ── Kill List ─────────────────────────────────────────────────
export const KILL_ITEMS: KillItem[] = [
  {
    id: "k1",
    title: "Daily Twitter scrolling session",
    reason: "Zero business value. Mood drag. Replace with LinkedIn 10-min max.",
    timeSaved: "45m/day",
    category: "system",
  },
  {
    id: "k2",
    title: "Re-editing already-published content",
    reason: "Perfectionism spiral. Done > perfect for volume plays.",
    timeSaved: "1h/week",
    category: "content",
  },
  {
    id: "k3",
    title: "Daily P&L checking on non-trade days",
    reason: "Triggers anxiety, no actionable outcome. Check weekly only.",
    timeSaved: "20m/day",
    category: "finance",
  },
];

// ── Agent Tasks ───────────────────────────────────────────────
export const AGENT_TASKS: AgentTask[] = [
  {
    id: "at1",
    agent: "Content Agent",
    description: "6 posts drafted and ready for review - Mon–Sat social queue",
    count: 6,
    status: "pending",
    timestamp: "2026-04-26T06:00:00Z",
  },
  {
    id: "at2",
    agent: "Research Agent",
    description: "3 wholesale opportunity leads identified in South FL area",
    count: 3,
    status: "pending",
    timestamp: "2026-04-26T05:30:00Z",
  },
  {
    id: "at3",
    agent: "Clipping Agent",
    description: "10 clips ready from last week's long-form content",
    count: 10,
    status: "pending",
    timestamp: "2026-04-25T22:00:00Z",
  },
];
