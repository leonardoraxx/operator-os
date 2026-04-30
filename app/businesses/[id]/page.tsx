import { notFound } from "next/navigation";
import { Building2, ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Tag } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { StatusBadge } from "@/components/primitives/status-badge";
import { formatCurrency } from "@/lib/format";
import { getBusinessById } from "@/lib/db";
import { EditBusinessDialog } from "./edit-dialog";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BusinessDetailPage({ params }: Props) {
  const { id } = await params;
  const biz = await getBusinessById(id);
  if (!biz) notFound();

  const profit = biz.revenue - (biz.expenses ?? 0);
  const margin = biz.revenue > 0 ? Math.round((profit / biz.revenue) * 100) : 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={biz.type || "Business"}
        title={biz.name}
        subtitle={biz.tagline || undefined}
        actions={<EditBusinessDialog business={biz} />}
      />

      <div className="space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} style={{ color: "var(--status-success)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Revenue MTD</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(biz.revenue)}
            </p>
          </GlassCard>

          <GlassCard padding="sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={13} style={{ color: "var(--status-danger)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Expenses MTD</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(biz.expenses ?? 0)}
            </p>
          </GlassCard>

          <GlassCard padding="sm">
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Net Profit</p>
            <p
              className="text-2xl font-semibold tabular-nums"
              style={{ color: profit >= 0 ? "var(--status-success)" : "var(--status-danger)" }}
            >
              {formatCurrency(profit)}
            </p>
            {biz.revenue > 0 && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                {margin}% margin
              </p>
            )}
          </GlassCard>

          <GlassCard padding="sm">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Status</p>
            <StatusBadge status={biz.status} />
            {biz.type && (
              <div className="flex items-center gap-1 mt-2">
                <Tag size={11} style={{ color: "var(--text-subtle)" }} />
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{biz.type}</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Execution row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard header={{ icon: ArrowRight, title: "Next Action" }}>
            {biz.nextMilestone ? (
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {biz.nextMilestone}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: "var(--text-subtle)" }}>
                No next action — click Edit to add one.
              </p>
            )}
          </GlassCard>

          <GlassCard header={{ icon: AlertTriangle, title: "Current Bottleneck" }}>
            {biz.bottleneck ? (
              <p className="text-sm leading-relaxed" style={{ color: "var(--status-warning)" }}>
                {biz.bottleneck}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: "var(--text-subtle)" }}>
                No bottleneck logged.
              </p>
            )}
          </GlassCard>
        </div>

        {/* About */}
        {biz.tagline && (
          <GlassCard header={{ icon: Building2, title: "About" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {biz.tagline}
            </p>
          </GlassCard>
        )}
      </div>
    </PageContainer>
  );
}
