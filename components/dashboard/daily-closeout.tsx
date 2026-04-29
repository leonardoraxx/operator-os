import { Moon } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { DAILY_CLOSEOUT } from "@/data/dashboard";

export function DailyCloseout() {
  return (
    <GlassCard
      header={{ icon: Moon, title: "Daily Closeout" }}
      footer="Start closeout →"
      padding="md"
    >
      <div className="flex flex-col gap-3">
        {DAILY_CLOSEOUT.map((item) => (
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
        ))}
      </div>
    </GlassCard>
  );
}
