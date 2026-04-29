import { Swords } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { WEEKLY_WAR_ROOM } from "@/data/dashboard";

interface PanelProps {
  label: string;
  dotColor: string;
  items?: string[];
  paragraph?: string;
}

function Panel({ label, dotColor, items, paragraph }: PanelProps) {
  return (
    <div
      className="rounded-[var(--radius-lg)] p-3 flex flex-col gap-2"
      style={{ background: "var(--bg-glass-subtle)" }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dotColor }}
          aria-hidden
        />
        <p className="text-eyebrow" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
      {paragraph ? (
        <p
          className="text-small leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {paragraph}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items?.map((it, i) => (
            <li
              key={i}
              className="text-tiny leading-snug"
              style={{ color: "var(--text-secondary)" }}
            >
              · {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WeeklyWarRoom() {
  const data = WEEKLY_WAR_ROOM;
  return (
    <GlassCard header={{ icon: Swords, title: "Weekly War Room" }} padding="md">
      <div className="grid grid-cols-2 gap-3">
        <Panel label="Wins" dotColor="var(--status-success)" items={data.wins} />
        <Panel label="Losses" dotColor="var(--status-danger)" items={data.losses} />
        <Panel
          label="Next Metric"
          dotColor="var(--accent)"
          paragraph={data.nextMetric}
        />
        <Panel
          label="Double Down"
          dotColor="var(--status-warning)"
          paragraph={data.doubleDown}
        />
      </div>
    </GlassCard>
  );
}
