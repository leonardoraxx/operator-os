export const dynamic = "force-dynamic";

import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { BarSpark } from "@/components/primitives/bar-spark";
import { formatCurrency } from "@/lib/format";
import { getMoneyData } from "@/lib/db";

export default async function MoneyPage() {
  const money = await getMoneyData();
  const totalPayouts = money.expectedPayouts.reduce((s, p) => s + p.amount, 0);
  const earnedDelta = money.earnedToday > 0 ? `+${formatCurrency(money.earnedToday)} today` : "No income logged today";

  return (
    <PageContainer>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        title="Money"
        subtitle="Cash flow and financial overview"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Cash Available"
            value={formatCurrency(money.cashAvailable)}
            delta={earnedDelta}
            tone={money.cashAvailable > 0 ? "success" : "neutral"}
          />
          <KPICard
            label="Earned Today"
            value={formatCurrency(money.earnedToday)}
            tone={money.earnedToday > 0 ? "success" : "neutral"}
          />
          <KPICard
            label="Expected Payouts"
            value={formatCurrency(totalPayouts)}
            delta={`${money.expectedPayouts.length} pending`}
          />
          <KPICard
            label="Expenses This Week"
            value={formatCurrency(money.expensesThisWeek)}
            tone={money.expensesThisWeek > 0 ? "warning" : "neutral"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard header={{ icon: ArrowUpRight, title: "Cash Flow This Week" }}>
            <BarSpark data={money.cashFlowSeries} height={120} />
            {money.expectedPayouts.length > 0 && (
              <div className="mt-3 space-y-2">
                {money.expectedPayouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft size={12} style={{ color: "var(--status-success)" }} />
                      <span style={{ color: "var(--text-muted)" }}>{p.source}</span>
                    </div>
                    <span style={{ color: "var(--status-success)" }}>
                      +{formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard header={{ icon: Wallet, title: "Pending Payouts" }}>
            {money.expectedPayouts.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No pending payouts logged.
              </p>
            ) : (
              <div className="space-y-2">
                {money.expectedPayouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {p.source}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                        Due {p.dueDate}
                      </p>
                    </div>
                    <p className="text-base font-semibold" style={{ color: "var(--status-success)" }}>
                      +{formatCurrency(p.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
