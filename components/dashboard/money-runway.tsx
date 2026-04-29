import { Landmark } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { formatCurrency } from "@/lib/format";
import { MONEY_SNAPSHOT } from "@/data/dashboard";

export function MoneyRunway() {
  const data = MONEY_SNAPSHOT;
  const burnPerDay = data.expensesThisWeek / 7;
  const runway = Math.floor(data.cashAvailable / burnPerDay);

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
            {runway}
          </p>
          <p className="text-tiny mt-1" style={{ color: "var(--text-muted)" }}>
            days runway
          </p>
        </div>
        <div
          className="flex flex-col gap-1.5 mt-auto pt-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <Row label="Cash" value={formatCurrency(data.cashAvailable)} />
          <Row
            label="Burn / day"
            value={formatCurrency(burnPerDay)}
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
