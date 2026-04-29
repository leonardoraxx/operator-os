"use client";

import { User, Palette, Plug, Bell } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import type { Operator } from "@/data/types";

export function SettingsClient({ operator }: { operator: Operator }) {
  const op = operator;
  return (
    <PageContainer>
      <div className="max-w-[900px] mx-auto">
        <PageHeader
          eyebrow="Account"
          title="Settings"
          subtitle="Preferences, integrations, and account settings"
        />
        <div className="space-y-4">

          <GlassCard header={{ icon: User, title: "Profile" }}>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{
                  background: "var(--bg-glass-subtle)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {op.name[0]}
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {op.name}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {op.role}
                </p>
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  {op.handle}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Display Name", value: op.name },
                { label: "Handle", value: op.handle },
                { label: "Role", value: op.role },
                { label: "Timezone", value: "America/New_York (EST)" },
              ].map((field) => (
                <div key={field.label}>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {field.label}
                  </label>
                  <input
                    defaultValue={field.value}
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>
          </GlassCard>

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
                  {
                    name: "Dark Glass",
                    desc: "Charcoal body, frosted cards, restrained gold accent",
                    bg: "#0B0B0D",
                    textPrimary: "#F2F2F4",
                    textMuted: "#7A7A80",
                    border: "rgba(255,255,255,0.08)",
                  },
                  {
                    name: "Light Glass",
                    desc: "Pearl white, translucent cards, restrained gold accent",
                    bg: "#FAFAF7",
                    textPrimary: "#1A1A1A",
                    textMuted: "#88888B",
                    border: "rgba(20,20,20,0.09)",
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl p-3"
                    style={{ background: t.bg, border: `1px solid ${t.border}` }}
                  >
                    <p
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: t.textPrimary }}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: t.textMuted }}>
                      {t.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard header={{ icon: Plug, title: "Integrations" }}>
            <div className="space-y-2">
              {[
                { name: "Supabase", desc: "Database & Auth", status: "Connected" },
                { name: "Render", desc: "Hosting", status: "Connected" },
                { name: "GitHub", desc: "Source control", status: "Connected" },
                { name: "Notion", desc: "Notes sync", status: "Not connected" },
                { name: "Stripe", desc: "Revenue tracking", status: "Not connected" },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {integration.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {integration.desc}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        integration.status === "Connected"
                          ? "var(--status-success-bg)"
                          : integration.status === "Pending"
                            ? "var(--status-warning-bg)"
                            : "var(--bg-glass-subtle)",
                      color:
                        integration.status === "Connected"
                          ? "var(--status-success)"
                          : integration.status === "Pending"
                            ? "var(--status-warning)"
                            : "var(--text-subtle)",
                    }}
                  >
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard header={{ icon: Bell, title: "Notifications" }}>
            <div className="space-y-3">
              {[
                { label: "Daily mission reminder", value: "7:00 AM", enabled: true },
                { label: "Evening closeout prompt", value: "6:30 PM", enabled: true },
                { label: "Agent inbox alerts", value: "Immediately", enabled: true },
                { label: "Weekly review reminder", value: "Sunday 9 AM", enabled: false },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {n.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {n.value}
                    </p>
                  </div>
                  <div
                    className="w-10 h-6 rounded-full relative cursor-pointer transition-colors"
                    style={{
                      background: n.enabled ? "var(--accent)" : "var(--border-default)",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full absolute top-1 transition-transform"
                      style={{
                        background: "white",
                        transform: n.enabled ? "translateX(20px)" : "translateX(4px)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
