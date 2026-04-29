import { Calendar, Check } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { CALENDAR_TODAY } from "@/data/dashboard";

const CATEGORY_COLORS: Record<string, string> = {
  business: "var(--text-secondary)",
  health: "var(--status-success)",
  content: "var(--text-secondary)",
  system: "var(--text-subtle)",
  finance: "var(--text-secondary)",
};

export function CalendarToday() {
  const remaining = CALENDAR_TODAY.filter((e) => !e.done).length;

  return (
    <GlassCard
      header={{
        icon: Calendar,
        title: "Today",
        pill: { label: `${remaining} left`, color: "neutral" },
      }}
      footer="Full calendar →"
      padding="sm"
    >
      <ul className="flex flex-col">
        {CALENDAR_TODAY.map((event) => (
          <li
            key={event.id}
            className="flex items-center gap-3 px-2 py-2 rounded-md"
            style={{ opacity: event.done ? 0.55 : 1 }}
          >
            <span
              className="text-tiny tabular-nums w-12 flex-shrink-0"
              style={{
                color: "var(--text-muted)",
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, monospace",
              }}
            >
              {event.time}
            </span>
            <span
              className="w-1 h-7 rounded-full flex-shrink-0"
              style={{
                background:
                  CATEGORY_COLORS[event.category] ?? "var(--text-subtle)",
              }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] truncate"
                style={{
                  color: "var(--text-primary)",
                  textDecoration: event.done ? "line-through" : undefined,
                }}
              >
                {event.title}
              </p>
              <p
                className="text-tiny truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {event.duration}
              </p>
            </div>
            {event.done && (
              <Check
                size={14}
                style={{ color: "var(--status-success)", flexShrink: 0 }}
              />
            )}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
