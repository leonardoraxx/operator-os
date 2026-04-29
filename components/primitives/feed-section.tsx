import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";

export interface FeedItem {
  id: string;
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  meta?: string;
  /** Subtle pill rendered right-side (e.g. "+$420", "+1 milestone"). Mono. */
  impact?: { label: string; tone?: "neutral" | "success" | "danger" | "accent" };
  /** Group label, e.g. "TODAY", "YESTERDAY", "APR 23". */
  group: string;
}

interface FeedSectionProps {
  title: string;
  icon?: LucideIcon;
  items: FeedItem[];
  footer?: React.ReactNode | string;
  maxHeight?: number;
  className?: string;
}

const IMPACT_COLOR: Record<NonNullable<FeedItem["impact"]>["tone"] & string, { bg: string; text: string }> = {
  neutral: { bg: "var(--bg-glass-subtle)", text: "var(--text-secondary)" },
  success: { bg: "var(--status-success-bg)", text: "var(--status-success)" },
  danger: { bg: "var(--status-danger-bg)", text: "var(--status-danger)" },
  accent: { bg: "var(--accent-soft)", text: "var(--accent)" },
};

/**
 * Time-grouped activity card. Items grouped by `group` label with eyebrow
 * dividers. Used by Recent Progress, Decision Log, Output Tracker (week
 * feed), Opportunity Queue, Kill List.
 */
export function FeedSection({
  title,
  icon,
  items,
  footer,
  maxHeight = 480,
  className,
}: FeedSectionProps) {
  // Group items in order, preserving first-seen group order
  const groups: { group: string; items: FeedItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.group === item.group) {
      last.items.push(item);
    } else {
      groups.push({ group: item.group, items: [item] });
    }
  }

  return (
    <GlassCard
      header={{ icon, title, showMenu: true }}
      footer={footer}
      padding="sm"
      className={className}
    >
      <div className="flex-1 overflow-y-auto" style={{ maxHeight }}>
        {groups.map((g, gi) => (
          <div key={gi} className="mb-3 last:mb-0">
            <div
              className="text-eyebrow px-2 py-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              {g.group}
            </div>
            <ul className="flex flex-col">
              {g.items.map((item, i) => {
                const Icon = item.icon;
                const impact = item.impact;
                const impactColor = impact
                  ? IMPACT_COLOR[impact.tone ?? "neutral"]
                  : null;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-2 min-h-[56px] py-2 rounded-md"
                    style={{
                      borderBottom:
                        i < g.items.length - 1
                          ? "1px solid var(--border-subtle)"
                          : undefined,
                    }}
                  >
                    {Icon && (
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "var(--bg-glass-subtle)",
                          color: item.iconColor ?? "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <Icon size={12} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.title}
                      </p>
                      {item.meta && (
                        <p
                          className="text-tiny truncate mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.meta}
                        </p>
                      )}
                    </div>
                    {impact && impactColor && (
                      <span
                        className="text-tiny px-2 py-0.5 rounded-full tabular-nums flex-shrink-0"
                        style={{
                          background: impactColor.bg,
                          color: impactColor.text,
                          fontFamily:
                            "var(--font-geist-mono), ui-monospace, monospace",
                        }}
                      >
                        {impact.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
