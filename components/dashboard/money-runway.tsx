import { Landmark } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { formatCurrency } from "@/lib/format";
import type { MoneyData } from "@/lib/db";

interface Props {
  money: MoneyData;
}

export function MoneyRunway({ money }: Props) {
  const burnPerDay = money.expensesThisWeek > 0 ? money.expensesThisWeek / 7 : 0;
  const runway = burnPerDay > 0 ? Math.floor(money.cashAvailable / burnPerDay) : 0;

  return (
    <GlassCard
      header={{ icon: Landmark, title: "Money Runway", showMenu: false }}
      padding="md"
    >
      <div className="flex flex-col gap-3 flex-1">
        <div>
          <p
            className="text-metric-value-lg tabular-nums leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {runway > 0 ? runway : "—"}
          </p>
          <p className="text-tiny mt-1" style={{ color: "var(--text-muted)" }}>
            days runway
          </p>
        </div>
        <div
          className="flex flex-col gap-1.5 mt-auto pt-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <Row label="Cash" value={formatCurrency(money.cashAvailable)} />
          <Row
            label="Burn / day"
            value={burnPerDay > 0 ? formatCurrency(burnPerDay) : "—"}
            tone="danger"
          />
        </div>
      </div>
    </GlassCard>
  );
}

function Row({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div className="flex justify-between text-tiny tabular-nums">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span
        style={{
          color:
            tone === "danger" ? "var(--status-danger)" : "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
