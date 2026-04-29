import { Sun, CalendarDays, Archive } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { ScoreRing } from "@/components/primitives/score-ring";

export default function ReviewsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Cadence"
        title="Reviews"
        subtitle="Daily, weekly, and quarterly review cadence"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard
            header={{ icon: Sun, title: "Daily Review - Apr 26" }}
            footer="Start today's review →"
          >
            <div className="space-y-3">
              {[
                { q: "Top win today?", a: "Sent pricing to Miami Beach Naturals" },
                { q: "What didn't get done?", a: "Coral Gables Co-op call, reschedule AM" },
                { q: "Energy (1–10)?", a: "7" },
                { q: "Improve tomorrow?", a: "Start outreach by 8 AM" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-2.5"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    {item.q}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard
            header={{ icon: CalendarDays, title: "Weekly Review - Wk 17" }}
            footer="Start weekly review →"
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <ScoreRing value={78} size={80} label="score" />
              </div>
              <div className="space-y-2">
                {[
                  { label: "Focus sessions hit", value: "3/5" },
                  { label: "Goals on track", value: "4/6" },
                  { label: "Revenue vs target", value: "68%" },
                  { label: "Content posted", value: "2/3" },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>{m.label}</span>
                    <span style={{ color: "var(--text-primary)" }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard
            header={{ icon: Archive, title: "Quarterly Review - Q1 2026" }}
            footer="View full Q1 review →"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Q1 Score
                </p>
                <ScoreRing value={71} size={56} />
              </div>
              <div className="space-y-2">
                {[
                  { label: "Goals completed", value: "3/5", positive: true },
                  { label: "Revenue vs plan", value: "82%", positive: true },
                  { label: "Sleep avg", value: "5.5h", positive: false },
                  { label: "Content output", value: "14 pieces", positive: true },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>{m.label}</span>
                    <span
                      style={{
                        color: m.positive
                          ? "var(--status-success)"
                          : "var(--status-danger)",
                      }}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
