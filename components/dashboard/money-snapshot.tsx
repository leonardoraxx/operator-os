import { DollarSign, Wallet, TrendingUp, Calendar, Receipt } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { MetricCard } from "@/components/primitives/metric-card";
import { BarSpark } from "@/components/primitives/bar-spark";
import { CardFooterLink } from "@/components/primitives/card-footer-link";
import { formatCurrency } from "@/lib/format";
import type { MoneyData } from "@/lib/db";

interface Props {
  money: MoneyData;
}

export function MoneySnapshot({ money }: Props) {
  const totalPayouts = money.expectedPayouts.reduce((s, p) => s + p.amount, 0);

  const todayIndex = money.cashFlowSeries
    .map((d, i) => ({ d, i }))
    .reverse()
    .find(({ d }) => d.amount !== 0)?.i;

  return (
    <GlassCard
      header={{ icon: DollarSign, title: "Money Snapshot" }}
      footer={<CardFooterLink href="/money" label="View money →" />}
      padding="md"
    >
      <div className="flex flex-col gap-3 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard icon={Wallet} label="Cash" value={formatCurrency(money.cashAvailable)} />
          <MetricCard
            icon={TrendingUp}
            label="Earned today"
            value={`+${formatCurrency(money.earnedToday)}`}
          />
          <MetricCard
            icon={Calendar}
            label="Payouts"
            value={formatCurrency(totalPayouts)}
            sub={`${money.expectedPayouts.length} pending`}
          />
          <MetricCard
            icon={Receipt}
            label="Expenses (wk)"
            value={formatCurrency(money.expensesThisWeek)}
          />
        </div>

        <div>
          <p className="text-eyebrow mb-1.5" style={{ color: "var(--text-muted)" }}>
            Cash flow this week
          </p>
          <BarSpark data={money.cashFlowSeries} height={56} accentIndex={todayIndex} />
        </div>
      </div>
    </GlassCard>
  );
}
