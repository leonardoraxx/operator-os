import { Scissors, DollarSign, Video } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { formatCurrency } from "@/lib/format";

const CLIPS = [
  { id: "cl1", title: "Funded Account - Key Moment", source: "YT Long-form Apr 18", views: 2840, status: "ready" },
  { id: "cl2", title: "Wholesale pitch breakdown", source: "YT Long-form Apr 20", views: 1200, status: "ready" },
  { id: "cl3", title: "Morning routine 5AM", source: "YT Long-form Apr 22", views: 980, status: "review" },
  { id: "cl4", title: "Q&A - Starting a CPG brand", source: "YT Long-form Apr 15", views: 4200, status: "posted" },
  { id: "cl5", title: "Trading session breakdown", source: "YT Long-form Apr 10", views: 3100, status: "posted" },
];

const PAYOUTS = [
  { id: "py1", source: "YouTube AdSense (clips)", amount: 248, date: "Apr 1–28", status: "pending" },
  { id: "py2", source: "YouTube Shorts Fund", amount: 84, date: "Apr 1–28", status: "pending" },
  { id: "py3", source: "Instagram Reels Bonus", amount: 120, date: "Mar 1–31", status: "paid" },
];

export default function ClippingPage() {
  const pendingEarnings = PAYOUTS.filter((p) => p.status === "pending").reduce(
    (s, p) => s + p.amount,
    0,
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Short-form revenue"
        title="Clipping"
        subtitle="Short-form clip queue and payout tracking"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Clips Ready"
            value={CLIPS.filter((c) => c.status === "ready").length}
          />
          <KPICard label="Total Views MTD" value="12.3k" delta="+38%" />
          <KPICard label="Pending Earnings" value={formatCurrency(pendingEarnings)} />
          <KPICard
            label="Posted This Month"
            value={CLIPS.filter((c) => c.status === "posted").length}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard header={{ icon: Video, title: "Clip Queue" }} footer="View all clips →">
            <div className="space-y-2">
              {CLIPS.map((clip) => (
                <div
                  key={clip.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <Video size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {clip.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {clip.source} · {clip.views.toLocaleString()} views
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                    style={{
                      background:
                        clip.status === "ready"
                          ? "var(--status-success-bg)"
                          : clip.status === "posted"
                            ? "var(--bg-glass-subtle)"
                            : "var(--status-warning-bg)",
                      color:
                        clip.status === "ready"
                          ? "var(--status-success)"
                          : clip.status === "posted"
                            ? "var(--text-subtle)"
                            : "var(--status-warning)",
                    }}
                  >
                    {clip.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard header={{ icon: DollarSign, title: "Payout History" }}>
            <div className="space-y-2">
              {PAYOUTS.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {payout.source}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {payout.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatCurrency(payout.amount)}
                    </p>
                    <span
                      className="text-xs capitalize"
                      style={{
                        color:
                          payout.status === "paid"
                            ? "var(--status-success)"
                            : "var(--status-warning)",
                      }}
                    >
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
