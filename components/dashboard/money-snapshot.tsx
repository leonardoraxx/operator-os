import { DollarSign, Wallet, TrendingUp, Calendar, Receipt } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { MetricCard } from "@/components/primitives/metric-card";
import { BarSpark } from "@/components/primitives/bar-spark";
import { formatCurrency } from "@/lib/format";
import { MONEY_SNAPSHOT } from "@/data/dashboard";

export function MoneySnapshot() {
  const data = MONEY_SNAPSHOT;
  const totalPayouts = data.expectedPayouts.reduce((s, p) => s + p.amount, 0);

  // Highlight today's bar (Friday — the last non-zero in the series).
  const todayIndex = data.cashFlowSeries
    .map((d, i) => ({ d, i }))
    .reverse()
    .find(({ d }) => d.amount !== 0)?.i;

  return (
    <GlassCard
      header={{ icon: DollarSign, title: "Money Snapshot" }}
      footer="View money →"
      padding="md"
    >
      <div className="flex flex-col gap-3 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard icon={Wallet} label="Cash" value={formatCurrency(data.cashAvailable)} />
          <MetricCard
            icon={TrendingUp}
            label="Earned today"
            value={`+${formatCurrency(data.earnedToday)}`}
          />
          <MetricCard
            icon={Calendar}
            label="Payouts"
            value={formatCurrency(totalPayouts)}
            sub={`${data.expectedPayouts.length} pending`}
          />
          <MetricCard
            icon={Receipt}
            label="Expenses (wk)"
            value={formatCurrency(data.expensesThisWeek)}
          />
        </div>

        <div>
          <p className="text-eyebrow mb-1.5" style={{ color: "var(--text-muted)" }}>
            Cash flow this week
          </p>
          <BarSpark data={data.cashFlowSeries} height={56} accentIndex={todayIndex} />
        </div>
      </div>
    </GlassCard>
  );
}
