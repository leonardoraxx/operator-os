import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { BarSpark } from "@/components/primitives/bar-spark";
import { LineSpark } from "@/components/primitives/line-spark";
import { getMoneyData, getActivityLogs } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export default async function ReportsPage() {
  const [money, activities] = await Promise.all([getMoneyData(), getActivityLogs()]);

  // Build revenue chart from cash flow series
  const revenueSeries = money.cashFlowSeries.map((d) => ({
    day: d.day,
    amount: d.amount,
  }));

  // Build output chart from activity logs (last 7 days by day count)
  const now = new Date();
  const outputByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    outputByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const a of activities) {
    const day = a.created_at.slice(0, 10);
    if (day in outputByDay) outputByDay[day]++;
  }
  const outputSeries = Object.entries(outputByDay).map(([, count], x) => ({ x, y: count }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Last 7 days"
        title="Reports"
        subtitle="Performance metrics across all areas"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Cash Available" value={formatCurrency(money.cashAvailable)} />
          <KPICard label="Earned Today" value={formatCurrency(money.earnedToday)} />
          <KPICard label="Expenses This Week" value={formatCurrency(money.expensesThisWeek)} />
          <KPICard label="Activity (7d)" value={activities.length} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard header={{ icon: BarChart3, title: "Cash Flow — This Week" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-subtle)" }}>
              Net daily cash flow from money_entries
            </p>
            {revenueSeries.every((d) => d.amount === 0) ? (
              <div className="text-center py-8" style={{ color: "var(--text-subtle)" }}>
                <p className="text-sm">No money entries this week</p>
              </div>
            ) : (
              <BarSpark data={revenueSeries} height={120} />
            )}
          </GlassCard>

          <GlassCard header={{ icon: BarChart3, title: "Daily Output (Activity Logs)" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-subtle)" }}>
              Last 7 days — entries in activity_logs
            </p>
            {outputSeries.every((d) => d.y === 0) ? (
              <div className="text-center py-8" style={{ color: "var(--text-subtle)" }}>
                <p className="text-sm">No activity logged yet</p>
              </div>
            ) : (
              <LineSpark data={outputSeries} height={100} />
            )}
          </GlassCard>

          <GlassCard header={{ icon: BarChart3, title: "Focus Score Trend" }}>
            <div className="text-center py-8" style={{ color: "var(--text-subtle)" }}>
              <BarChart3 size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No score trend data</p>
              <p className="text-xs mt-1">Add focus_score entries to daily_reviews over time.</p>
            </div>
          </GlassCard>

          <GlassCard header={{ icon: BarChart3, title: "Body Weight Trend" }}>
            <div className="text-center py-8" style={{ color: "var(--text-subtle)" }}>
              <BarChart3 size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No weight data</p>
              <p className="text-xs mt-1">Add a fitness_logs table to track body weight over time.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
