import { Building2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { StatusBadge } from "@/components/primitives/status-badge";
import { formatCurrency } from "@/lib/format";
import { getBusinesses } from "@/lib/db";

const BUSINESSES_FALLBACK = [
  {
    id: "b1",
    name: "South FL Suds",
    tagline: "Premium eco cleaning products - direct & wholesale",
    revenue: 1840,
    mrr: 420,
    status: "on-track" as const,
    nextMilestone: "10 wholesale accounts by June 30",
    employees: 1,
    founded: "Jan 2026",
  },
  {
    id: "b2",
    name: "VenHQ",
    tagline: "YouTube content brand - operators, founders, and builders",
    revenue: 680,
    mrr: 680,
    status: "on-track" as const,
    nextMilestone: "1,000 subscribers & monetization",
    employees: 1,
    founded: "Mar 2026",
  },
];

export default async function BusinessesPage() {
  const dbBusinesses = await getBusinesses();
  const BUSINESSES = dbBusinesses.length > 0 ? dbBusinesses : BUSINESSES_FALLBACK;
  const totalRevenue = BUSINESSES.reduce((s, b) => s + (b.revenue ?? 0), 0);
  const totalMrr = BUSINESSES.reduce((s, b) => s + (b.mrr ?? 0), 0);
  const activeCount = BUSINESSES.filter((b) => b.status === "on-track").length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Q2 2026"
        title="Businesses"
        subtitle="Your active ventures and revenue streams"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Ventures" value={BUSINESSES.length} />
          <KPICard label="Revenue MTD" value={formatCurrency(totalRevenue)} delta="+12%" />
          <KPICard label="Est. MRR" value={formatCurrency(totalMrr)} />
          <KPICard
            label="Active"
            value={activeCount}
            tone="success"
            delta="All healthy"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUSINESSES.map((biz) => (
            <GlassCard
              key={biz.id}
              header={{ icon: Building2, title: biz.name }}
              footer="View details →"
            >
              <div className="space-y-4">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {biz.tagline}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="rounded-xl p-2.5"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Revenue MTD</p>
                    <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(biz.revenue)}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-2.5"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Est. MRR</p>
                    <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(biz.mrr ?? 0)}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-2.5"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Status</p>
                    <StatusBadge status={biz.status} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <ArrowRight size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <p style={{ color: "var(--text-muted)" }}>
                    <strong>Next:</strong> {biz.nextMilestone}
                  </p>
                </div>

                <div className="flex gap-4 text-xs" style={{ color: "var(--text-subtle)" }}>
                  {biz.founded && <span>Founded {biz.founded}</span>}
                  <span>{biz.employees === 1 ? "Solo" : `${biz.employees ?? 0} team`}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
