"use client";

import { useState } from "react";
import { User, Palette, Plug, Bell, Database } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { updateOperatorProfile } from "./actions";
import type { Operator } from "@/data/types";
import type { OperatorPreferences } from "@/lib/db";

interface Props {
  operator:    Operator;
  preferences: OperatorPreferences | null;
}

export function SettingsClient({ operator, preferences }: Props) {
  // Profile fields — map from DB columns
  const [fields, setFields] = useState({
    name:   operator.name,
    handle: operator.handle,   // alias
    role:   operator.role,     // primary_focus
  });

  const [notifications, setNotifications] = useState([
    { label: "Daily scoreboard reminder", value: "7:00 AM",      enabled: true  },
    { label: "Evening closeout prompt",   value: "6:30 PM",      enabled: true  },
    { label: "Agent inbox alerts",        value: "Immediately",  enabled: true  },
    { label: "Weekly review reminder",    value: "Sunday 9 AM",  enabled: false },
  ]);

  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [saveErr,  setSaveErr]  = useState<string | null>(null);

  async function handleSaveProfile() {
    setSaving(true);
    setSaveErr(null);
    const result = await updateOperatorProfile(fields.name, fields.role, fields.handle);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveErr(result.error ?? "Failed to save");
    }
  }

  function toggleNotification(index: number) {
    setNotifications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], enabled: !next[index].enabled };
      return next;
    });
  }

  const profileFields = [
    { key: "name"   as const, label: "Display Name", placeholder: "Edgar" },
    { key: "handle" as const, label: "Handle / Alias", placeholder: "@ven" },
    { key: "role"   as const, label: "Primary Focus",  placeholder: "Founder & Operator" },
  ];

  return (
    <PageContainer>
      <div className="max-w-[900px] mx-auto">
        <PageHeader
          eyebrow="Account"
          title="Settings"
          subtitle="Preferences, integrations, and account settings"
        />
        <div className="space-y-4">

          {/* Profile */}
          <GlassCard header={{ icon: User, title: "Profile" }}>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{
                  background: "var(--bg-glass-subtle)",
                  color:      "var(--text-secondary)",
                  border:     "1px solid var(--border-default)",
                }}
              >
                {fields.name[0] ?? "?"}
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {fields.name}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {fields.role}
                </p>
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  {fields.handle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {profileFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs mb-1 block" style={{ color: "var(--text-subtle)" }}>
                    {label}
                  </label>
                  <input
                    value={fields[key]}
                    onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border:     "1px solid var(--border-default)",
                      color:      "var(--text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: saved ? "var(--status-success)" : "var(--accent)",
                  color:      "white",
                  opacity:    saving ? 0.7 : 1,
                  cursor:     saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : saved ? "Saved ✓" : "Save Profile"}
              </button>
              {saveErr && (
                <p className="text-xs" style={{ color: "var(--status-danger)" }}>
                  {saveErr}
                </p>
              )}
            </div>
          </GlassCard>

          {/* System Preferences (from operator_preferences) */}
          {preferences && (
            <GlassCard header={{ icon: Database, title: "System Preferences" }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Theme",     value: preferences.theme            },
                  { label: "Accent",    value: preferences.accent           },
                  { label: "Density",   value: preferences.dashboardDensity },
                  { label: "Home View", value: preferences.defaultView      },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border:     "1px solid var(--border-subtle)",
                    }}
                  >
                    <p className="text-tiny mb-0.5" style={{ color: "var(--text-subtle)" }}>
                      {label}
                    </p>
                    <p className="text-[13px] font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
              {Object.keys(preferences.settings).length > 0 && (
                <div className="mt-3 space-y-1">
                  {Object.entries(preferences.settings).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                      style={{ background: "var(--bg-glass-subtle)" }}
                    >
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{k}</span>
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {/* Theme */}
          <GlassCard header={{ icon: Palette, title: "Theme" }}>
            <div className="space-y-3">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Toggle between Dark (default) and Light Glass themes.
              </p>
              <div className="max-w-[200px]">
                <ThemeToggle />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { name: "Dark Glass",  desc: "Charcoal body, frosted cards, restrained gold accent", bg: "#0B0B0D", textPrimary: "#F2F2F4", textMuted: "#7A7A80", border: "rgba(255,255,255,0.08)" },
                  { name: "Light Glass", desc: "Pearl white, translucent cards, restrained gold accent", bg: "#FAFAF7", textPrimary: "#1A1A1A", textMuted: "#88888B", border: "rgba(20,20,20,0.09)" },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl p-3"
                    style={{ background: t.bg, border: `1px solid ${t.border}` }}
                  >
                    <p className="text-xs font-semibold mb-0.5" style={{ color: t.textPrimary }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: t.textMuted }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Integrations */}
          <GlassCard header={{ icon: Plug, title: "Integrations" }}>
            <div className="space-y-2">
              {[
                { name: "Supabase", desc: "Database",       status: "Connected"     },
                { name: "Render",   desc: "Hosting",        status: "Connected"     },
                { name: "GitHub",   desc: "Source control", status: "Connected"     },
                { name: "Notion",   desc: "Notes sync",     status: "Not connected" },
                { name: "Stripe",   desc: "Revenue",        status: "Not connected" },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-subtle)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {integration.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {integration.desc}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: integration.status === "Connected" ? "var(--status-success-bg)" : "var(--bg-glass-subtle)",
                      color:      integration.status === "Connected" ? "var(--status-success)"    : "var(--text-subtle)",
                    }}
                  >
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard header={{ icon: Bell, title: "Notifications" }}>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>{n.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{n.value}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(i)}
                    className="w-10 h-6 rounded-full relative transition-colors"
                    style={{
                      background: n.enabled ? "var(--accent)" : "var(--border-default)",
                      cursor:     "pointer",
                    }}
                    aria-label={`Toggle ${n.label}`}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-transform"
                      style={{
                        background: "white",
                        transform:  n.enabled ? "translateX(20px)" : "translateX(4px)",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </PageContainer>
  );
}
