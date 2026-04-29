-- =====================================================================
-- OperatorOS seed: Edgar/Ven profile + starter data
-- Idempotent within a single run; assumes schema migration ran first.
-- =====================================================================

BEGIN;

-- ── Profile ──────────────────────────────────────────────────────────
INSERT INTO public.operator_profile (name, alias, handle, role, focus, response_pref, philosophy)
VALUES (
  'Edgar',
  'Ven',
  '@ven',
  'Founder & Operator',
  'Building OperatorOS as a personal founder command center and growing VenHQ — a faceless AI-voice Roblox drama/news YouTube channel.',
  'Very blunt, objective, concise, professional, high-standard. Prioritize logic, risk management, premium quality, and execution over motivation or vague advice.',
  '["Objectivity over emotion","Security and risk control","Premium quality over cheap/fast","Systems over one-time actions","Leverage, automation, profitability","Avoid fake productivity","Build scalable, high-trust assets"]'::jsonb
);

INSERT INTO public.operator_scores (kind, value, delta, sparkline) VALUES
  ('focus',     0, 0, ARRAY[0,0,0,0,0,0,0]),
  ('execution', 0, 0, ARRAY[0,0,0,0,0,0,0]);

INSERT INTO public.operator_preferences (key, value) VALUES
  ('theme',                  '"dark"'::jsonb),
  ('design_locked',          'true'::jsonb),
  ('automation_strategy',    '"ai-bridge-manual"'::jsonb),
  ('ai_safety',              '{"approval_required":true,"draft_first":true}'::jsonb),
  ('biggest_risk',           '"fake-productivity"'::jsonb);

-- ── Businesses ───────────────────────────────────────────────────────
INSERT INTO public.businesses (name, tagline, status, sort_order, next_milestone) VALUES
  ('VenHQ',          'Faceless AI-voice Roblox drama/news YouTube channel', 'on-track', 1, 'Reach consistent 1–2 Shorts/day cadence'),
  ('UGC Clipping',   'Personal-brand clipping campaigns (SCI etc.)',         'on-track', 2, 'Hit 1 clip/day baseline'),
  ('Trading',        'NQ/ES day trading — discipline-first',                 'paused',   3, 'Rebuild capital before next prop eval'),
  ('South FL Suds',  'Premium South Florida mobile detailing & exterior care','on-track', 4, 'Support Leo without distracting from personal goals'),
  ('OperatorOS',     'Personal founder command center',                       'on-track', 5, 'Functionality > redesign; finish DB persistence');

-- ── Goals ────────────────────────────────────────────────────────────
INSERT INTO public.goals (title, category, progress, target, current_value, unit, deadline, status, priority, next_action, quadrant, business_id) VALUES
  ('Grow VenHQ consistently',            'content',  0,  365, 0, 'posts',  '2026-12-31', 'on-track', 'critical', 'Pick today''s topic and ship 1 Short',          'urgent-important',    (SELECT id FROM public.businesses WHERE name='VenHQ')),
  ('Post 1–2 VenHQ Shorts daily',        'content',  0,  60,  0, 'posts',  '2026-06-30', 'on-track', 'critical', 'Batch 3 hooks → record → publish',                'urgent-important',    (SELECT id FROM public.businesses WHERE name='VenHQ')),
  ('Upload 1 VenHQ long-form weekly',    'content',  0,  9,   0, 'videos', '2026-06-30', 'on-track', 'high',     'Outline this week''s long-form',                  'not-urgent-important',(SELECT id FROM public.businesses WHERE name='VenHQ')),
  ('Post 1 UGC clip daily',              'content',  0,  60,  0, 'clips',  '2026-06-30', 'on-track', 'high',     'Cut tomorrow''s clip from today''s source',       'urgent-important',    (SELECT id FROM public.businesses WHERE name='UGC Clipping')),
  ('Clean bulk to 196 lb',               'health',   0,  196, 181,'lb',    '2026-09-30', 'on-track', 'medium',   'Hit calorie + protein target today; PPL session', 'not-urgent-important',NULL),
  ('Build trading discipline',           'finance',  0,  100, 0, '%disc.', '2026-12-31', 'paused',   'medium',   'Resume after capital rebuild',                    'not-urgent-important',(SELECT id FROM public.businesses WHERE name='Trading')),
  ('Build OperatorOS into command center','system',  0,  100, 30,'%done',  '2026-07-31', 'on-track', 'critical', 'Finish DB persistence + AI Bridge',               'urgent-important',    (SELECT id FROM public.businesses WHERE name='OperatorOS')),
  ('Generate capital for prop eval',     'finance',  0,  1000,0, 'USD',    '2026-08-31', 'on-track', 'high',     'Stack content/clipping income',                   'not-urgent-important',(SELECT id FROM public.businesses WHERE name='UGC Clipping'));

-- ── Projects ─────────────────────────────────────────────────────────
INSERT INTO public.projects (title, business_id, business_name, category, status, priority, progress, column_lane) VALUES
  ('OperatorOS Core Build',         (SELECT id FROM public.businesses WHERE name='OperatorOS'),    'OperatorOS',    'system',  'active', 'critical', 35, 'active'),
  ('VenHQ Content System',          (SELECT id FROM public.businesses WHERE name='VenHQ'),         'VenHQ',         'content', 'active', 'critical', 15, 'active'),
  ('AI Bridge',                     (SELECT id FROM public.businesses WHERE name='OperatorOS'),    'OperatorOS',    'system',  'active', 'high',     10, 'backlog'),
  ('Automations Page',              (SELECT id FROM public.businesses WHERE name='OperatorOS'),    'OperatorOS',    'system',  'active', 'medium',    5, 'backlog'),
  ('South FL Suds Support System',  (SELECT id FROM public.businesses WHERE name='South FL Suds'), 'South FL Suds', 'business','active', 'low',       0, 'backlog');

-- ── Today's Mission ──────────────────────────────────────────────────
WITH new_mission AS (
  INSERT INTO public.missions (title, description, deadline, status, consequence, is_active)
  VALUES (
    'Execute today''s highest-leverage output without fake productivity',
    'No redesign. No strategy hopping. Ship the post, the clip, the rep, the line of code.',
    'EOD',
    'on-track',
    'A skipped output day compounds into a skipped week, then a stalled momentum cycle.',
    true
  )
  RETURNING id
)
INSERT INTO public.mission_actions (mission_id, title, sort_order)
SELECT id, t.title, t.ord FROM new_mission, (VALUES
  ('Publish 1 VenHQ Short',     1),
  ('Publish 1 UGC clip',        2),
  ('PPL session + protein hit', 3),
  ('Ship one OperatorOS task',  4)
) AS t(title, ord);

-- ── Risk Alerts ──────────────────────────────────────────────────────
INSERT INTO public.risk_alerts (title, description, level, category) VALUES
  ('Fake productivity risk',  'Watch for redesigning UI / overplanning instead of shipping outputs.', 'elevated', 'output'),
  ('Low output risk',         'Daily Shorts + clip cadence not yet locked in.',                       'high',     'content'),
  ('Sleep / discipline risk', 'Sleep + PPL consistency drives weight + focus targets.',               'medium',   'health'),
  ('Overbuilding risk',       'Building OperatorOS features instead of using OperatorOS to track.',   'high',     'system');

-- ── Agent Recommendations ────────────────────────────────────────────
INSERT INTO public.agent_recommendations (title, description, category) VALUES
  ('Track daily output before adding more features', 'Ship 7 days of clean tracking data before expanding scope.',   'system'),
  ('Prioritize VenHQ + UGC output',                  'These are the two highest-leverage daily outputs right now.',   'content'),
  ('Use OperatorOS for tracking, not procrastination','Open the dashboard to log progress, not to redesign cards.',   'system');

-- ── Kill List ────────────────────────────────────────────────────────
INSERT INTO public.kill_list (title, reason, time_saved, category) VALUES
  ('Unnecessary UI redesign',          'UI is approved enough; functionality > polish.',              '6h/wk', 'system'),
  ('Strategy hopping',                 'Pick a lane, run it long enough to see results.',             '4h/wk', 'system'),
  ('Random new business ideas',        'Until VenHQ + UGC + OperatorOS are stable.',                  '5h/wk', 'business'),
  ('Over-optimizing before posting',   'Ship rough, fix in v2. Posting beats polishing.',             '3h/day','content'),
  ('AI agents before data is clean',   'Automation on top of bad data multiplies bad data.',          '8h/wk', 'system');

-- ── Activity log this wipe ───────────────────────────────────────────
INSERT INTO public.activity_logs (actor, action, target_type, detail) VALUES
  ('claude', 'wipe_and_seed', 'database', '{"summary":"Dropped legacy homebase schema, created OperatorOS schema, seeded Edgar/Ven profile."}'::jsonb);

COMMIT;
