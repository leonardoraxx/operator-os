import { Scissors, DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { formatCurrency } from "@/lib/format";
import { getMoneyData } from "@/lib/db";
import { AddEntryDialog } from "./add-entry-dialog";
import { supabaseServer } from "@/lib/supabase-server";

type EntryRow = {
  id: string;
  entry_date: string;
  type: string | null;
  category: string | null;
  amount: number;
  notes: string | null;
};

async function getAllEntries(): Promise<EntryRow[]> {
  const { data } = await supabaseServer
    .from("money_entries")
    .select("id,entry_date,type,category,amount,notes")
    .order("entry_date", { ascending: false })
    .limit(100);
  return (data ?? []) as EntryRow[];
}

function typeIcon(type: string | null) {
  const t = (type ?? "").toLowerCase();
  if (t === "income" || t === "revenue" || t === "in") return TrendingUp;
  if (t === "expense" || t === "cost" || t === "out") return TrendingDown;
  return Clock;
}

function typeColor(type: string | null) {
  const t = (type ?? "").toLowerCase();
  if (t === "income" || t === "revenue" || t === "in") return "var(--status-success)";
  if (t === "expense" || t === "cost" || t === "out") return "var(--status-danger)";
  return "var(--status-warning)";
}

function typeSign(type: string | null) {
  const t = (type ?? "").toLowerCase();
  if (t === "expense" || t === "cost" || t === "out") return "-";
  if (t === "pending") return "";
  return "+";
}

export default async function ClippingPage() {
  const [money, entries] = await Promise.all([getMoneyData(), getAllEntries()]);
  const payouts = money.expectedPayouts;
  const pendingEarnings = payouts.reduce((s, p) => s + p.amount, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Short-form revenue"
        title="Clipping"
        subtitle="Short-form clip queue and payout tracking"
        actions={<AddEntryDialog />}
      />

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Cash Available" value={formatCurrency(money.cashAvailable)} />
          <KPICard label="Earned Today" value={formatCurrency(money.earnedToday)} tone={money.earnedToday > 0 ? "success" : "neutral"} />
          <KPICard label="Pending Payouts" value={formatCurrency(pendingEarnings)} tone={pendingEarnings > 0 ? "warning" : "neutral"} />
          <KPICard label="Expenses This Week" value={formatCurrency(money.expensesThisWeek)} tone={money.expensesThisWeek > 0 ? "danger" : "neutral"} />
        </div>

        <GlassCard header={{ icon: Scissors, title: "All Entries" }}>
          {entries.length === 0 ? (
            <div className="text-center py-10" style={{ color: "var(--text-subtle)" }}>
              <DollarSign size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No entries yet</p>
              <p className="text-xs mt-1">Click "Add Entry" to log income, expenses, or pending payouts.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {entries.map((entry) => {
                const Icon = typeIcon(entry.type);
                const color = typeColor(entry.type);
                const sign = typeSign(entry.type);
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-2.5 px-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--bg-glass-subtle)", color }}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {entry.category ?? entry.notes ?? "—"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {entry.entry_date} · {entry.type ?? "—"}
                        {entry.notes && entry.category ? ` · ${entry.notes}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums flex-shrink-0" style={{ color }}>
                      {sign}{formatCurrency(Number(entry.amount))}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </PageContainer>
  );
}
