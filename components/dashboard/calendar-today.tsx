import { Calendar, Check } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { CardFooterLink } from "@/components/primitives/card-footer-link";
import type { OperatorTask } from "@/lib/db";

interface Props {
  tasks: OperatorTask[];
}

const CATEGORY_COLORS: Record<string, string> = {
  business: "var(--text-secondary)",
  health: "var(--status-success)",
  content: "var(--text-secondary)",
  system: "var(--text-subtle)",
  finance: "var(--text-secondary)",
  personal: "var(--accent)",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--status-danger)",
  high: "var(--status-warning)",
  medium: "var(--text-secondary)",
  low: "var(--text-subtle)",
};

export function CalendarToday({ tasks }: Props) {
  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <GlassCard
      header={{
        icon: Calendar,
        title: "Today",
        pill: { label: `${remaining} left`, color: "neutral" },
      }}
      footer={<CardFooterLink href="/calendar" label="Full calendar →" />}
      padding="sm"
    >
      {tasks.length === 0 ? (
        <p className="px-2 py-3 text-small" style={{ color: "var(--text-muted)" }}>
          No tasks due today.
        </p>
      ) : (
        <ul className="flex flex-col">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 px-2 py-2 rounded-md"
              style={{ opacity: task.done ? 0.55 : 1 }}
            >
              <span
                className="w-1 h-7 rounded-full flex-shrink-0"
                style={{
                  background:
                    PRIORITY_COLORS[task.priority] ??
                    CATEGORY_COLORS[task.category] ??
                    "var(--text-subtle)",
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] truncate"
                  style={{
                    color: "var(--text-primary)",
                    textDecoration: task.done ? "line-through" : undefined,
                  }}
                >
                  {task.title}
                </p>
                <p
                  className="text-tiny truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {task.category} · {task.priority}
                </p>
              </div>
              {task.done && (
                <Check
                  size={14}
                  style={{ color: "var(--status-success)", flexShrink: 0 }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
