"use client";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { LineSpark } from "@/components/primitives/line-spark";
import { formatCurrency } from "@/lib/format";

const EQUITY_CURVE = [8000, 8120, 7980, 8240, 8180, 8380, 8420].map((y, x) => ({ x, y }));

const OPEN_POSITIONS = [
  { id: "t1", symbol: "ES", direction: "long", size: 1, entry: 5280.25, current: 5294.50, pnl: 712.50 },
  { id: "t2", symbol: "NQ", direction: "short", size: 1, entry: 19840, current: 19820, pnl: 200 },
];

const RECENT_TRADES = [
  { id: "tr1", symbol: "ES", date: "Apr 25", result: "W", pnl: 337.50, grade: "A" },
  { id: "tr2", symbol: "NQ", date: "Apr 24", result: "L", pnl: -125, grade: "B" },
  { id: "tr3", symbol: "ES", date: "Apr 23", result: "W", pnl: 175, grade: "A" },
  { id: "tr4", symbol: "NQ", date: "Apr 22", result: "L", pnl: -215, grade: "C" },
  { id: "tr5", symbol: "ES", date: "Apr 21", result: "W", pnl: 262.50, grade: "A" },
];

export default function TradingPage() {
  const totalPnL = RECENT_TRADES.reduce((s, t) => s + t.pnl, 0);
  const wins = RECENT_TRADES.filter((t) => t.result === "W").length;
  const winRate = Math.round((wins / RECENT_TRADES.length) * 100);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Prop firm"
        title="Trading"
        subtitle="Funded account · prop firm performance"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Account Balance"
            value={formatCurrency(8420)}
            delta="+$180 today"
            tone="success"
          />
          <KPICard
            label="Target"
            value={formatCurrency(25000)}
            delta="34% complete"
          />
          <KPICard label="Win Rate (5d)" value={`${winRate}%`} />
          <KPICard
            label="P&L (5d)"
            value={formatCurrency(totalPnL)}
            delta={totalPnL >= 0 ? `+${formatCurrency(totalPnL)}` : formatCurrency(totalPnL)}
            tone={totalPnL >= 0 ? "success" : "danger"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard header={{ icon: Activity, title: "Equity Curve" }}>
            <div className="py-2">
              <LineSpark data={EQUITY_CURVE} height={120} />
              <div
                className="flex justify-between text-xs mt-2"
                style={{ color: "var(--text-subtle)" }}
              >
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard header={{ icon: TrendingUp, title: "Open Positions" }}>
            <div className="space-y-2">
              {OPEN_POSITIONS.map((pos) => (
                <div
                  key={pos.id}
                  className="rounded-xl p-3"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {pos.symbol} · {pos.direction.toUpperCase()} {pos.size}x
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                        Entry: {pos.entry} → Current: {pos.current}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-base font-semibold"
                        style={{
                          color:
                            pos.pnl >= 0 ? "var(--status-success)" : "var(--status-danger)",
                        }}
                      >
                        {pos.pnl >= 0 ? "+" : ""}
                        {formatCurrency(pos.pnl)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard header={{ icon: TrendingDown, title: "Recent Trade Reviews" }}>
          <div className="space-y-2">
            {RECENT_TRADES.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: "var(--bg-glass-subtle)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background:
                      trade.result === "W"
                        ? "var(--status-success-bg)"
                        : "var(--status-danger-bg)",
                    color:
                      trade.result === "W"
                        ? "var(--status-success)"
                        : "var(--status-danger)",
                  }}
                >
                  {trade.result}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {trade.symbol}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    {trade.date}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color:
                        trade.pnl >= 0 ? "var(--status-success)" : "var(--status-danger)",
                    }}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {formatCurrency(trade.pnl)}
                  </p>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Grade: {trade.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
