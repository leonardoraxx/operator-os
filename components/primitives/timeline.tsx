import { Check } from "lucide-react";
import type { Milestone } from "@/data/types";
import { formatDate } from "@/lib/format";

interface TimelineProps {
  milestones: Milestone[];
}

export function Timeline({ milestones }: TimelineProps) {
  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={m.id} className="flex items-start gap-3">
          {/* Dot + connector */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ marginTop: 2 }}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: m.done ? "var(--success)" : "var(--bg-glass-strong)",
                border: m.done ? "none" : "1.5px solid var(--border)",
              }}
            >
              {m.done && <Check size={10} color="white" strokeWidth={3} />}
            </div>
            {i < milestones.length - 1 && (
              <div
                className="w-px flex-1 mt-1"
                style={{
                  minHeight: 20,
                  background: m.done ? "var(--success)" : "var(--border-soft)",
                  opacity: 0.5,
                }}
              />
            )}
          </div>
          {/* Content */}
          <div className="pb-3 min-w-0">
            <p
              className="text-sm leading-tight"
              style={{
                color: m.done ? "var(--text-muted)" : "var(--text)",
                textDecoration: m.done ? "line-through" : undefined,
              }}
            >
              {m.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
              {formatDate(m.dueDate, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
