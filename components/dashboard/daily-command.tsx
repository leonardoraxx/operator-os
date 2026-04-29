"use client";

import { Terminal } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { QuickCapture } from "@/components/primitives/quick-capture";
import type { OperatorTask } from "@/lib/db";

interface Props {
  tasks?: OperatorTask[];
}

export function DailyCommand({ tasks = [] }: Props) {
  const top3 = tasks.slice(0, 3);

  return (
    <GlassCard
      header={{ icon: Terminal, title: "Daily Command" }}
      padding="md"
    >
      <div className="flex flex-col gap-3 flex-1">
        <QuickCapture placeholder="Capture a thought…" />
        <div>
          <p className="text-eyebrow mb-2" style={{ color: "var(--text-muted)" }}>
            Today's top 3
          </p>
          {top3.length === 0 ? (
            <p className="text-xs px-2" style={{ color: "var(--text-subtle)" }}>
              No tasks scheduled for today.
            </p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {top3.map((task, i) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 px-2 h-8 rounded-md"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    opacity: task.done ? 0.5 : 1,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-tiny font-semibold flex-shrink-0 tabular-nums"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-small truncate"
                    style={{
                      color: "var(--text-primary)",
                      textDecoration: task.done ? "line-through" : undefined,
                    }}
                  >
                    {task.title}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
