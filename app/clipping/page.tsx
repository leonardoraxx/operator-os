import { Scissors, DollarSign, Video } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { formatCurrency } from "@/lib/format";
import { getMoneyData } from "@/lib/db";

export default async function ClippingPage() {
  const money = await getMoneyData();
  const payouts = money.expectedPayouts;
  const pendingEarnings = payouts.reduce((s, p) => s + p.amount, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Short-form revenue"
        title="Clipping"
        subtitle="Short-form clip queue and payout tracking"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KPICard label="Pending Payouts" value={payouts.length} />
          <KPICard label="Pending Earnings" value={formatCurrency(pendingEarnings)} tone={pendingEarnings > 0 ? "success" : "neutral"} />
          <KPICard label="Cash Available" value={formatCurrency(money.cashAvailable)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard header={{ icon: Video, title: "Clip Queue" }}>
            <div className="text-center py-10" style={{ color: "var(--text-subtle)" }}>
              <Video size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No clip queue connected</p>
              <p className="text-xs mt-1">Add a clips table to Supabase to track short-form content.</p>
            </div>
          </GlassCard>

          <GlassCard header={{ icon: DollarSign, title: "Pending Payouts" }}>
            {payouts.length === 0 ? (
              <div className="text-center py-10" style={{ color: "var(--text-subtle)" }}>
                <DollarSign size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No pending payouts</p>
                <p className="text-xs mt-1">
                  Add entries with direction=&quot;pending&quot; to money_entries.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {payout.source}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                        Due: {payout.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: "var(--status-warning)" }}>
                        {formatCurrency(payout.amount)}
                      </p>
                      <span className="text-xs" style={{ color: "var(--status-warning)" }}>
                        pending
                      </span>
                    </div>
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
