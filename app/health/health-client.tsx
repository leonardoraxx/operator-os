"use client";

import { useState, useTransition } from "react";
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Loader2,
  Globe, Settings, MousePointerClick, Server,
  AlertTriangle, Edit3, Check, X,
} from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { runHealthCheck, toggleHealthField, updateIssuesFound } from "./health-actions";
import type { HealthField } from "./health-actions";
import type { SystemHealth } from "@/lib/db";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTs(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const now   = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM  = Math.floor(diffMs / 60000);
  const diffH  = Math.floor(diffMs / 3600000);
  const diffD  = Math.floor(diffMs / 86400000);
  if (diffM < 1)  return "just now";
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7)  return `${diffD}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function allPassing(h: SystemHealth): boolean {
  return h.frontendConnected && h.settingsWorking && h.buttonsWorking && h.renderDeployed;
}

function passingCount(h: SystemHealth): number {
  return [h.frontendConnected, h.settingsWorking, h.buttonsWorking, h.renderDeployed]
    .filter(Boolean).length;
}

// ── Check item config ─────────────────────────────────────────────────────────

interface CheckConfig {
  key:         HealthField;
  label:       string;
  description: string;
  icon:        React.ElementType;
}

const CHECKS: CheckConfig[] = [
  {
    key:         "frontend_connected",
    label:       "Frontend Connected",
    description: "Next.js app is live and serving pages",
    icon:        Globe,
  },
  {
    key:         "settings_working",
    label:       "Settings Working",
    description: "Supabase reads/writes on operator_profile are healthy",
    icon:        Settings,
  },
  {
    key:         "buttons_working",
    label:       "Buttons Working",
    description: "Server actions are reachable from the client",
    icon:        MousePointerClick,
  },
  {
    key:         "render_deployed",
    label:       "Render Deployed",
    description: "Latest build is live on Render",
    icon:        Server,
  },
];

// ── Single check row ──────────────────────────────────────────────────────────

function CheckRow({
  config,
  passing,
  toggling,
  onToggle,
}: {
  config:   CheckConfig;
  passing:  boolean;
  toggling: HealthField | null;
  onToggle: (field: HealthField, val: boolean) => void;
}) {
  const Icon    = config.icon;
  const loading = toggling === config.key;

  return (
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        background:   passing
          ? "color-mix(in srgb, var(--status-success) 4%, transparent)"
          : "color-mix(in srgb, var(--status-danger) 3%, transparent)",
        transition:   "background var(--motion-base)",
      }}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {loading ? (
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        ) : passing ? (
          <CheckCircle2 size={18} style={{ color: "var(--status-success)" }} />
        ) : (
          <XCircle size={18} style={{ color: "var(--status-danger)" }} />
        )}
      </div>

      {/* Check icon + text */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: passing
            ? "color-mix(in srgb, var(--status-success) 12%, transparent)"
            : "color-mix(in srgb, var(--status-danger) 10%, transparent)",
        }}
      >
        <Icon
          size={15}
          style={{
            color: passing ? "var(--status-success)" : "var(--status-danger)",
          }}
        />
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {config.label}
        </p>
        <p className="text-tiny mt-0.5" style={{ color: "var(--text-muted)" }}>
          {config.description}
        </p>
      </div>

      {/* Status badge + manual toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-tiny px-2 py-0.5 rounded-full font-semibold"
          style={{
            background: passing ? "var(--status-success-bg)" : "var(--status-danger-bg)",
            color:      passing ? "var(--status-success)"    : "var(--status-danger)",
          }}
        >
          {passing ? "PASS" : "FAIL"}
        </span>

        <button
          onClick={() => onToggle(config.key, !passing)}
          disabled={!!toggling}
          title={passing ? "Mark as failing" : "Mark as passing"}
          className="text-tiny px-2 py-0.5 rounded-lg outline-none"
          style={{
            background: "var(--bg-glass-subtle)",
            color:      "var(--text-subtle)",
            border:     "1px solid var(--border-subtle)",
            cursor:     toggling ? "not-allowed" : "pointer",
            opacity:    toggling && toggling !== config.key ? 0.4 : 1,
          }}
        >
          Override
        </button>
      </div>
    </div>
  );
}

// ── Issues panel ──────────────────────────────────────────────────────────────

function IssuesPanel({
  id,
  issues,
  onSave,
}: {
  id:     string;
  issues: string | null;
  onSave: (val: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(issues ?? "");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateIssuesFound(id, draft);
    if (!result.success) {
      setError(result.error ?? "Save failed");
      setSaving(false);
      return;
    }
    onSave(draft.trim() || null);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{
          background: issues
            ? "var(--status-danger-bg)"
            : "var(--status-success-bg)",
          border: `1px solid ${issues
            ? "color-mix(in srgb, var(--status-danger) 20%, transparent)"
            : "color-mix(in srgb, var(--status-success) 20%, transparent)"}`,
        }}
      >
        {issues ? (
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--status-danger)" }} />
        ) : (
          <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--status-success)" }} />
        )}
        <div className="flex-1 min-w-0">
          <p
            className="text-tiny font-semibold mb-0.5"
            style={{ color: issues ? "var(--status-danger)" : "var(--status-success)" }}
          >
            {issues ? "Issues Found" : "No Issues Found"}
          </p>
          {issues && (
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {issues}
            </p>
          )}
        </div>
        <button
          onClick={() => { setDraft(issues ?? ""); setEditing(true); }}
          className="flex-shrink-0 p-1 rounded-md outline-none"
          style={{ color: "var(--text-subtle)" }}
        >
          <Edit3 size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Describe any issues found (leave blank if none)…"
        rows={3}
        autoFocus
        style={{
          width:        "100%",
          background:   "var(--bg-glass-subtle)",
          border:       "1px solid var(--border-default)",
          borderRadius: 10,
          color:        "var(--text-primary)",
          padding:      "8px 12px",
          fontSize:     13,
          outline:      "none",
          resize:       "vertical",
          lineHeight:   1.6,
        }}
      />
      {error && (
        <p className="text-tiny" style={{ color: "var(--status-danger)" }}>{error}</p>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none"
          style={{ background: "var(--accent)", color: "white", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
          style={{ background: "var(--bg-glass-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
        >
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main client ───────────────────────────────────────────────────────────────

interface Props {
  initialHealth: SystemHealth | null;
}

export function HealthClient({ initialHealth }: Props) {
  const [health,   setHealth]   = useState<SystemHealth | null>(initialHealth);
  const [running,  setRunning]  = useState(false);
  const [toggling, setToggling] = useState<HealthField | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [,         startTransition] = useTransition();

  const passing = health ? passingCount(health) : 0;
  const total   = 4;
  const allGood = health ? allPassing(health) : false;

  // ── Run full health check ──
  function handleRunCheck() {
    if (running) return;
    setRunning(true);
    setRunError(null);

    startTransition(async () => {
      const result = await runHealthCheck(health?.id ?? null);
      if (!result.success || !result.result) {
        setRunError(result.error ?? "Health check failed");
      } else {
        const r = result.result;
        setHealth((prev) => prev
          ? {
              ...prev,
              frontendConnected: r.frontendConnected,
              settingsWorking:   r.settingsWorking,
              buttonsWorking:    r.buttonsWorking,
              renderDeployed:    r.renderDeployed,
              issuesFound:       r.issuesFound,
              lastChecked:       r.checkedAt,
            }
          : null
        );
      }
      setRunning(false);
    });
  }

  // ── Manual toggle ──
  function handleToggle(field: HealthField, value: boolean) {
    if (!health || toggling) return;
    const prevVal = health[camelField(field)] as boolean;

    // Optimistic
    setHealth((prev) => prev ? { ...prev, [camelField(field)]: value } : prev);
    setToggling(field);

    startTransition(async () => {
      const result = await toggleHealthField(health.id, field, value);
      if (!result.success) {
        // Revert
        setHealth((prev) => prev ? { ...prev, [camelField(field)]: prevVal } : prev);
      }
      setToggling(null);
    });
  }

  function handleIssuesSave(val: string | null) {
    setHealth((prev) => prev ? { ...prev, issuesFound: val } : prev);
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Homebase OS · Monitoring"
        title="System Health"
        subtitle="Live status of every critical system check"
      />

      {/* Hero status bar */}
      <div
        className="rounded-2xl px-6 py-5 mb-6 flex items-center gap-6"
        style={{
          background: allGood
            ? "color-mix(in srgb, var(--status-success) 8%, var(--bg-glass))"
            : "color-mix(in srgb, var(--status-danger) 6%, var(--bg-glass))",
          border: `1px solid ${allGood
            ? "color-mix(in srgb, var(--status-success) 25%, transparent)"
            : "color-mix(in srgb, var(--status-danger) 25%, transparent)"}`,
          backdropFilter: "blur(var(--glass-blur))",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Big status icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: allGood ? "var(--status-success-bg)" : "var(--status-danger-bg)",
          }}
        >
          {allGood
            ? <CheckCircle2 size={28} style={{ color: "var(--status-success)" }} />
            : <AlertTriangle size={28} style={{ color: "var(--status-danger)" }} />}
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-base font-bold"
            style={{ color: allGood ? "var(--status-success)" : "var(--status-danger)" }}
          >
            {health === null
              ? "No data — run a check"
              : allGood
                ? "All Systems Operational"
                : `${total - passing} of ${total} checks failing`}
          </p>
          <p className="text-tiny mt-0.5" style={{ color: "var(--text-muted)" }}>
            Last checked: {formatTs(health?.lastChecked ?? null)}
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mt-2">
            <div
              className="flex-1 h-1.5 rounded-full"
              style={{ background: "var(--border-subtle)", maxWidth: 200 }}
            >
              <div
                className="h-1.5 rounded-full"
                style={{
                  width:      `${(passing / total) * 100}%`,
                  background: allGood ? "var(--status-success)" : "var(--status-danger)",
                  transition: "width var(--motion-slow)",
                }}
              />
            </div>
            <span className="text-tiny tabular-nums" style={{ color: "var(--text-muted)" }}>
              {passing}/{total} passing
            </span>
          </div>
        </div>

        {/* Run check button */}
        <button
          onClick={handleRunCheck}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none flex-shrink-0"
          style={{
            background: running ? "var(--accent-soft)" : "var(--accent)",
            color:      "white",
            cursor:     running ? "not-allowed" : "pointer",
            transition: "background var(--motion-fast)",
          }}
        >
          {running
            ? <Loader2 size={15} className="animate-spin" />
            : <RefreshCw size={15} />}
          {running ? "Checking…" : "Run Check"}
        </button>
      </div>

      {runError && (
        <div
          className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)", border: "1px solid color-mix(in srgb, var(--status-danger) 20%, transparent)" }}
        >
          <AlertTriangle size={14} className="flex-shrink-0" />
          {runError}
        </div>
      )}

      {health === null ? (
        /* No row yet */
        <GlassCard padding="md">
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <Activity size={28} style={{ color: "var(--text-subtle)", opacity: 0.4 }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              No health check data found.
            </p>
            <p className="text-tiny" style={{ color: "var(--text-subtle)" }}>
              Click <strong>Run Check</strong> above to create the first record.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {/* Check list */}
          <GlassCard
            padding="none"
            header={{
              icon:  Activity,
              title: "Check Status",
              pill:  {
                label: allGood ? "All passing" : `${passing}/${total} passing`,
                color: allGood ? "success" : "danger",
              },
            }}
          >
            {CHECKS.map((cfg) => (
              <CheckRow
                key={cfg.key}
                config={cfg}
                passing={health[camelField(cfg.key)] as boolean}
                toggling={toggling}
                onToggle={handleToggle}
              />
            ))}
          </GlassCard>

          {/* Issues found */}
          <GlassCard
            header={{
              icon:  AlertTriangle,
              title: "Issues Found",
            }}
          >
            <IssuesPanel
              id={health.id}
              issues={health.issuesFound}
              onSave={handleIssuesSave}
            />
          </GlassCard>

          {/* Check detail cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CHECKS.map((cfg) => {
              const ok   = health[camelField(cfg.key)] as boolean;
              const Icon = cfg.icon;
              return (
                <div
                  key={cfg.key}
                  className="rounded-xl p-4 flex flex-col gap-2"
                  style={{
                    background: ok
                      ? "color-mix(in srgb, var(--status-success) 6%, var(--bg-glass))"
                      : "color-mix(in srgb, var(--status-danger) 5%, var(--bg-glass))",
                    border: `1px solid ${ok
                      ? "color-mix(in srgb, var(--status-success) 20%, transparent)"
                      : "color-mix(in srgb, var(--status-danger) 20%, transparent)"}`,
                    backdropFilter: "blur(var(--glass-blur))",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={14} style={{ color: ok ? "var(--status-success)" : "var(--status-danger)" }} />
                    <span
                      className="text-tiny font-bold"
                      style={{ color: ok ? "var(--status-success)" : "var(--status-danger)" }}
                    >
                      {ok ? "✓" : "✗"}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {cfg.label}
                  </p>
                  <p className="text-tiny leading-snug" style={{ color: "var(--text-subtle)" }}>
                    {cfg.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ── Field name mapper ─────────────────────────────────────────────────────────

function camelField(field: HealthField): keyof SystemHealth {
  const map: Record<HealthField, keyof SystemHealth> = {
    frontend_connected: "frontendConnected",
    settings_working:   "settingsWorking",
    buttons_working:    "buttonsWorking",
    render_deployed:    "renderDeployed",
  };
  return map[field];
}
