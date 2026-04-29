"use client";

import { Terminal } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { QuickCapture } from "@/components/primitives/quick-capture";

const TOP_PRIORITIES = [
  { id: "p1", text: "Close 3 wholesale accounts" },
  { id: "p2", text: "Record YT long-form (Block 3)" },
  { id: "p3", text: "Daily closeout — 18:30" },
];

export function DailyCommand() {
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
          <ol className="flex flex-col gap-1.5">
            {TOP_PRIORITIES.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-2 px-2 h-8 rounded-md"
                style={{ background: "var(--bg-glass-subtle)" }}
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
                  style={{ color: "var(--text-primary)" }}
                >
                  {p.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </GlassCard>
  );
}
