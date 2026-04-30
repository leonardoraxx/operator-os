export const dynamic = "force-dynamic";

import { Building2, ArrowRight, AlertTriangle, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { StatusBadge } from "@/components/primitives/status-badge";
import { CardFooterLink } from "@/components/primitives/card-footer-link";
import { formatCurrency } from "@/lib/format";
import { getBusinesses } from "@/lib/db";

export default async function BusinessesPage() {
  const businesses = await getBusinesses();
  const totalRevenue = businesses.reduce((s, b) => s + (b.revenue ?? 0), 0);
  const totalExpenses = businesses.reduce((s, b) => s + (b.expenses ?? 0), 0);
  const activeCount = businesses.filter((b) => b.status === "on-track").length;
  const netProfit = totalRevenue - totalExpenses;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Q2 2026"
        title="Businesses"
        subtitle="Your active ventures and revenue streams"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Ventures" value={businesses.length} />
          <KPICard label="Revenue MTD" value={formatCurrency(totalRevenue)} tone={totalRevenue > 0 ? "success" : "neutral"} />
          <KPICard label="Expenses MTD" value={formatCurrency(totalExpenses)} tone={totalExpenses > 0 ? "danger" : "neutral"} />
          <KPICard label="Net Profit" value={formatCurrency(netProfit)} tone={netProfit > 0 ? "success" : netProfit < 0 ? "danger" : "neutral"} />
        </div>

        {businesses.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed p-12 text-center"
            style={{ borderColor: "var(--border-default)", color: "var(--text-subtle)" }}
          >
            <Building2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No businesses found</p>
            <p className="text-xs mt-1">Add entries to the businesses table in Supabase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((biz) => {
              const profit = biz.revenue - (biz.expenses ?? 0);
              return (
                <GlassCard
                  key={biz.id}
                  header={{ icon: Building2, title: biz.name }}
                  footer={<CardFooterLink href={`/businesses/${biz.id}`} label="View details →" />}
                >
                  <div className="space-y-3">
                    {/* Type + status row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {biz.type && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "var(--bg-glass-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                        >
                          {biz.type}
                        </span>
                      )}
                      <StatusBadge status={biz.status} />
                    </div>

                    {/* Description */}
                    {biz.tagline && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {biz.tagline}
                      </p>
                    )}

                    {/* Financials */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl p-2.5" style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-subtle)" }}>
                        <p className="text-xs mb-0.5" style={{ color: "var(--text-subtle)" }}>Revenue</p>
                        <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--status-success)" }}>
                          {formatCurrency(biz.revenue)}
                        </p>
                      </div>
                      <div className="rounded-xl p-2.5" style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-subtle)" }}>
                        <p className="text-xs mb-0.5" style={{ color: "var(--text-subtle)" }}>Expenses</p>
                        <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--status-danger)" }}>
                          {formatCurrency(biz.expenses ?? 0)}
                        </p>
                      </div>
                      <div className="rounded-xl p-2.5" style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-subtle)" }}>
                        <p className="text-xs mb-0.5" style={{ color: "var(--text-subtle)" }}>Profit</p>
                        <p className="text-sm font-semibold tabular-nums" style={{ color: profit >= 0 ? "var(--status-success)" : "var(--status-danger)" }}>
                          {formatCurrency(profit)}
                        </p>
                      </div>
                    </div>

                    {/* Next action */}
                    {biz.nextMilestone && (
                      <div className="flex items-start gap-2 text-xs">
                        <TrendingUp size={12} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                        <p className="line-clamp-2" style={{ color: "var(--text-muted)" }}>
                          <span className="font-medium">Next:</span> {biz.nextMilestone}
                        </p>
                      </div>
                    )}

                    {/* Bottleneck */}
                    {biz.bottleneck && (
                      <div className="flex items-start gap-2 text-xs">
                        <AlertTriangle size={12} style={{ color: "var(--status-warning)", flexShrink: 0, marginTop: 1 }} />
                        <p className="line-clamp-1" style={{ color: "var(--text-muted)" }}>
                          <span className="font-medium">Blocked:</span> {biz.bottleneck}
                        </p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
