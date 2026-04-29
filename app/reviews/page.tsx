import { Sun, CalendarDays, Archive } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { ScoreRing } from "@/components/primitives/score-ring";
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
          <GlassCard
            header={{ icon: Sun, title: `Daily Review — ${today}` }}
            footer="Start today's review →"
          >
            {dailyEntries.length === 0 ? (
              <div className="text-center py-6" style={{ color: "var(--text-subtle)" }}>
                <Sun size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No review for today yet</p>
                <p className="text-xs mt-1">Complete your daily closeout to populate this.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyEntries.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl p-2.5"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border: "1px solid var(--border-subtle)",
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

          <GlassCard
            header={{ icon: CalendarDays, title: "Weekly Review" }}
            footer="Start weekly review →"
          >
            {!weeklyReview ? (
              <div className="text-center py-6" style={{ color: "var(--text-subtle)" }}>
                <CalendarDays size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No weekly review yet</p>
                <p className="text-xs mt-1">Add a row to weekly_reviews for this ISO week.</p>
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
                        <li key={i} className="text-sm" style={{ color: "var(--text-primary)" }}>
                          · {w}
                        </li>
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
                        <li key={i} className="text-sm" style={{ color: "var(--text-primary)" }}>
                          · {l}
                        </li>
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

        <GlassCard
          header={{ icon: Archive, title: "Quarterly Review" }}
          footer="View full review →"
        >
          <div className="text-center py-6" style={{ color: "var(--text-subtle)" }}>
            <Archive size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Quarterly review not yet connected</p>
            <p className="text-xs mt-1">Add quarterly_reviews table to Supabase to enable this.</p>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
