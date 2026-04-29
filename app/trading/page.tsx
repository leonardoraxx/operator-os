import { TrendingUp, Activity } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";

export default function TradingPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Prop firm"
        title="Trading"
        subtitle="Funded account performance"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Account Balance" value="—" delta="No data" />
          <KPICard label="Target" value="—" />
          <KPICard label="Win Rate" value="—" />
          <KPICard label="P&L (5d)" value="—" />
        </div>

        <GlassCard header={{ icon: Activity, title: "Equity Curve" }}>
          <div className="text-center py-10" style={{ color: "var(--text-subtle)" }}>
            <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No trading data connected</p>
            <p className="text-xs mt-1">Add a trades table to Supabase to see live performance here.</p>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard header={{ icon: TrendingUp, title: "Open Positions" }}>
            <div className="text-center py-8" style={{ color: "var(--text-subtle)" }}>
              <p className="text-sm">No open positions</p>
            </div>
          </GlassCard>
          <GlassCard header={{ icon: TrendingUp, title: "Recent Trade Reviews" }}>
            <div className="text-center py-8" style={{ color: "var(--text-subtle)" }}>
              <p className="text-sm">No trade history</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
