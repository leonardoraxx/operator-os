export const dynamic = "force-dynamic";

import { Sun, CalendarDays, Archive } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { CardFooterLink } from "@/components/primitives/card-footer-link";
import { getDailyReview, getWeeklyReview } from "@/lib/db";

export default async function ReviewsPage() {
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const [dailyEntries, weeklyReview] = await Promise.all([
    getDailyReview(),
    getWeeklyReview(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Cadence"
        title="Reviews"
        subtitle="Daily, weekly, and quarterly review cadence"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Daily Review */}
          <GlassCard
            header={{ icon: Sun, title: `Daily Review — ${today}` }}
            footer={
              <CardFooterLink
                href="/dashboard"
                label="Go to Daily Scoreboard →"
              />
            }
          >
            {dailyEntries.length === 0 ? (
              <div className="text-center py-6" style={{ color: "var(--text-subtle)" }}>
                <Sun size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No review for today yet</p>
                <p className="text-xs mt-1 opacity-70">
                  Complete your daily scoreboard on the dashboard to populate this.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyEntries.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl p-2.5"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border:     "1px solid var(--border-subtle)",
                    }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {item.prompt}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Weekly Review */}
          <GlassCard
            header={{ icon: CalendarDays, title: "Weekly Review" }}
            footer={
              <CardFooterLink
                href="/goals"
                label="View Goals →"
              />
            }
          >
            {!weeklyReview ? (
              <div className="text-center py-6" style={{ color: "var(--text-subtle)" }}>
                <CalendarDays size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No weekly review yet</p>
                <p className="text-xs mt-1 opacity-70">
                  Add a row to the <code>weekly_reviews</code> table for this ISO week.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {weeklyReview.wins.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--status-success)" }}>
                      Wins
                    </p>
                    <ul className="space-y-1">
                      {weeklyReview.wins.map((w, i) => (
                        <li key={i} className="text-sm" style={{ color: "var(--text-primary)" }}>· {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {weeklyReview.losses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--status-danger)" }}>
                      Missed
                    </p>
                    <ul className="space-y-1">
                      {weeklyReview.losses.map((l, i) => (
                        <li key={i} className="text-sm" style={{ color: "var(--text-primary)" }}>· {l}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {weeklyReview.nextMetric && (
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--accent)" }}>
                      Next week focus
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {weeklyReview.nextMetric}
                    </p>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Quarterly Review — no table yet, honest disabled state */}
        <GlassCard header={{ icon: Archive, title: "Quarterly Review" }}>
          <div className="text-center py-6" style={{ color: "var(--text-subtle)" }}>
            <Archive size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Not yet connected</p>
            <p className="text-xs mt-1 opacity-70">
              Add a <code>quarterly_reviews</code> table to Supabase to enable this section.
            </p>
          </div>
        </GlassCard>

      </div>
    </PageContainer>
  );
}
