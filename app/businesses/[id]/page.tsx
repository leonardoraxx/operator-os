import { notFound } from "next/navigation";
import { Building2, ArrowRight, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { StatusBadge } from "@/components/primitives/status-badge";
import { formatCurrency } from "@/lib/format";
import { getBusinessById } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BusinessDetailPage({ params }: Props) {
  const { id } = await params;
  const biz = await getBusinessById(id);
  if (!biz) notFound();

  const profit = biz.revenue - (biz.expenses ?? 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={biz.type ?? "Business"}
        title={biz.name}
        subtitle={biz.tagline || undefined}
      />

      <div className="space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} style={{ color: "var(--status-success)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Revenue MTD</p>
            </div>
            <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(biz.revenue)}
            </p>
          </GlassCard>

          <GlassCard padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={13} style={{ color: "var(--status-danger)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Expenses MTD</p>
            </div>
            <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(biz.expenses ?? 0)}
            </p>
          </GlassCard>

          <GlassCard padding="sm">
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Net Profit</p>
            <p
              className="text-2xl font-semibold"
              style={{ color: profit >= 0 ? "var(--status-success)" : "var(--status-danger)" }}
            >
              {formatCurrency(profit)}
            </p>
          </GlassCard>

          <GlassCard padding="sm">
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Status</p>
            <div className="mt-1">
              <StatusBadge status={biz.status} />
            </div>
          </GlassCard>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard header={{ icon: ArrowRight, title: "Next Action" }}>
            {biz.nextMilestone ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{biz.nextMilestone}</p>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-subtle)" }}>No next action set.</p>
            )}
          </GlassCard>

          <GlassCard header={{ icon: AlertTriangle, title: "Current Bottleneck" }}>
            {biz.bottleneck ? (
              <p className="text-sm" style={{ color: "var(--status-warning)" }}>{biz.bottleneck}</p>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-subtle)" }}>No bottleneck reported.</p>
            )}
          </GlassCard>
        </div>

        {/* About */}
        {biz.tagline && (
          <GlassCard header={{ icon: Building2, title: "About" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{biz.tagline}</p>
            {biz.type && (
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Type: {biz.type}</p>
            )}
          </GlassCard>
        )}
      </div>
    </PageContainer>
  );
}
