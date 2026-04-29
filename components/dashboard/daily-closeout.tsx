import { Moon } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import type { CloseoutEntry } from "@/lib/db";

interface Props {
  items: CloseoutEntry[];
}

export function DailyCloseout({ items }: Props) {
  return (
    <GlassCard
      header={{ icon: Moon, title: "Daily Closeout" }}
      footer="Start closeout →"
      padding="md"
    >
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-small" style={{ color: "var(--text-muted)" }}>
            No closeout logged for today yet.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[var(--radius-lg)] p-3"
              style={{ background: "var(--bg-glass-subtle)" }}
            >
              <p className="text-eyebrow mb-1" style={{ color: "var(--text-muted)" }}>
                {item.prompt}
              </p>
              <p className="text-small" style={{ color: "var(--text-primary)" }}>
                {item.answer}
              </p>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
