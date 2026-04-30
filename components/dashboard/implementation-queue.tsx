"use client";

import { Layers, CheckCircle2, Circle, Clock } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { CardFooterLink } from "@/components/primitives/card-footer-link";
import type { ImplementationItem } from "@/lib/db";

interface Props {
  items?: ImplementationItem[];
}

const STATUS_ICON: Record<string, React.ElementType> = {
  done:        CheckCircle2,
  completed:   CheckCircle2,
  "in-progress": Clock,
  active:      Clock,
};

const STATUS_COLOR: Record<string, string> = {
  done:          "var(--status-success)",
  completed:     "var(--status-success)",
  "in-progress": "var(--accent)",
  active:        "var(--accent)",
  pending:       "var(--text-subtle)",
  blocked:       "var(--status-danger)",
};

const PRIORITY_DOT: Record<string, string> = {
  critical: "var(--status-danger)",
  high:     "var(--status-warning)",
  medium:   "var(--accent)",
  low:      "var(--text-subtle)",
};

export function ImplementationQueue({ items = [] }: Props) {
  // Group by phase, preserve order
  const phases: Map<string, ImplementationItem[]> = new Map();
  for (const item of items) {
    const phase = item.phase || "Unphased";
    if (!phases.has(phase)) phases.set(phase, []);
    phases.get(phase)!.push(item);
  }

  const activeCount = items.filter(
    (i) => i.status === "in-progress" || i.status === "active"
  ).length;
  const doneCount = items.filter(
    (i) => i.status === "done" || i.status === "completed"
  ).length;

  return (
    <GlassCard
      header={{
        icon: Layers,
        title: "Implementation Queue",
        pill: {
          label: `${activeCount} active`,
          color: activeCount > 0 ? "gold" : "neutral",
        },
      }}
      footer={<CardFooterLink href="/projects" label="View projects →" />}
      padding="sm"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Layers size={24} style={{ color: "var(--text-subtle)" }} />
          <p className="text-small text-center" style={{ color: "var(--text-muted)" }}>
            No items in implementation queue.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 420 }}>
          {/* Summary bar */}
          <div
            className="flex items-center gap-4 px-2 py-2 mb-1 rounded-lg"
            style={{ background: "var(--bg-glass-subtle)" }}
          >
            <span className="text-tiny" style={{ color: "var(--text-muted)" }}>
              {doneCount}/{items.length} done
            </span>
            <div className="flex-1 h-1 rounded-full" style={{ background: "var(--border-subtle)" }}>
              <div
                className="h-1 rounded-full"
                style={{
                  background: "var(--accent)",
                  width: `${items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {Array.from(phases.entries()).map(([phase, phaseItems]) => (
            <div key={phase} className="mb-2">
              {/* Phase header */}
              <p
                className="text-eyebrow px-2 py-1"
                style={{ color: "var(--text-muted)" }}
              >
                {phase}
              </p>

              {phaseItems.map((item) => {
                const Icon = STATUS_ICON[item.status] ?? Circle;
                const statusColor = STATUS_COLOR[item.status] ?? "var(--text-subtle)";
                const priorityDot = PRIORITY_DOT[item.priority] ?? "var(--text-subtle)";
                const isDone = item.status === "done" || item.status === "completed";

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-2 py-2 rounded-md"
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      opacity: isDone ? 0.55 : 1,
                    }}
                  >
                    <Icon
                      size={14}
                      style={{ color: statusColor, flexShrink: 0, marginTop: 2 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] truncate"
                        style={{
                          color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: isDone ? "line-through" : undefined,
                        }}
                      >
                        {item.title}
                      </p>
                      {item.category && (
                        <p className="text-tiny truncate mt-0.5" style={{ color: "var(--text-subtle)" }}>
                          {item.category}
                          {item.successCriteria ? ` · ${item.successCriteria}` : ""}
                        </p>
                      )}
                    </div>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: priorityDot }}
                      title={item.priority}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
