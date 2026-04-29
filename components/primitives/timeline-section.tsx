import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";

export interface TimelineItem {
  id: string;
  title: string;
  date: string;
  state: "completed" | "active" | "upcoming";
}

interface TimelineSectionProps {
  title: string;
  icon?: LucideIcon;
  items: TimelineItem[];
  footer?: React.ReactNode | string;
  className?: string;
}

/**
 * Vertical milestone rail. Used by Milestone Timeline (Goals page).
 *   completed → filled `--text-secondary` dot
 *   upcoming  → outline `--border-strong` dot
 *   active    → filled `--accent` dot (the only gold)
 */
export function TimelineSection({
  title,
  icon,
  items,
  footer,
  className,
}: TimelineSectionProps) {
  return (
    <GlassCard
      header={{ icon, title, showMenu: true }}
      footer={footer}
      padding="md"
      className={className}
    >
      <ol className="flex flex-col">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const dot =
            item.state === "completed"
              ? { bg: "var(--text-secondary)", border: "none" }
              : item.state === "active"
                ? { bg: "var(--accent)", border: "none" }
                : { bg: "transparent", border: "1.5px solid var(--border-strong)" };

          return (
            <li key={item.id} className="flex gap-4 relative pb-6 last:pb-0">
              {/* Rail */}
              <div className="flex flex-col items-center flex-shrink-0 w-2">
                <span
                  className="w-2 h-2 rounded-full mt-1.5 z-10"
                  style={{
                    background: dot.bg,
                    border: dot.border,
                  }}
                />
                {!isLast && (
                  <span
                    className="flex-1 w-px mt-1"
                    style={{ background: "var(--border-default)" }}
                  />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 flex justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="text-body-medium truncate"
                    style={{
                      color:
                        item.state === "completed"
                          ? "var(--text-muted)"
                          : "var(--text-primary)",
                      textDecoration:
                        item.state === "completed" ? "line-through" : undefined,
                    }}
                  >
                    {item.title}
                  </p>
                </div>
                <span
                  className="text-meta flex-shrink-0 w-20 text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.date}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
