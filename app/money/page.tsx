"use client";

import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { BarSpark } from "@/components/primitives/bar-spark";
import { formatCurrency } from "@/lib/format";
import { MONEY_SNAPSHOT } from "@/data/dashboard";

const ACCOUNTS = [
  { id: "acc1", name: "Chase Checking", balance: 5240.31, type: "Checking", institution: "Chase" },
  { id: "acc2", name: "Prop Firm Account", balance: 8420, type: "Trading", institution: "Funded Firm" },
  { id: "acc3", name: "Emergency Fund", balance: 8420.31, type: "Savings", institution: "HYSA" },
  { id: "acc4", name: "Business (South FL Suds)", balance: 2180, type: "Business", institution: "Mercury" },
];

export default function MoneyPage() {
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const snapshot = MONEY_SNAPSHOT;
  const totalPayouts = snapshot.expectedPayouts.reduce((s, p) => s + p.amount, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="April 2026"
        title="Money"
        subtitle="Accounts, cash flow, and financial overview"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Total Balance"
            value={formatCurrency(totalBalance)}
            delta="+$342 today"
            tone="success"
          />
          <KPICard label="Cash Available" value={formatCurrency(snapshot.cashAvailable)} />
          <KPICard
            label="Expected Payouts"
            value={formatCurrency(totalPayouts)}
            delta="Next 7 days"
          />
          <KPICard
            label="Expenses This Week"
            value={formatCurrency(snapshot.expensesThisWeek)}
            tone="warning"
            delta="High"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard header={{ icon: Wallet, title: "Accounts" }}>
            <div className="space-y-2">
              {ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {acc.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {acc.institution} · {acc.type}
                    </p>
                  </div>
                  <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(acc.balance)}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard header={{ icon: ArrowUpRight, title: "Cash Flow This Week" }}>
            <BarSpark data={snapshot.cashFlowSeries} height={120} />
            <div className="mt-3 space-y-2">
              {snapshot.expectedPayouts.map((p) => (
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
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
