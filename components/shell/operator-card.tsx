"use client";

import { OPERATOR } from "@/data/operator";
import { LineSpark } from "@/components/primitives/line-spark";
import { useMounted } from "@/hooks/use-mounted";
import { ThemeToggle } from "./theme-toggle";

export function OperatorCard() {
  const mounted = useMounted();
  const op = OPERATOR;
  const accentDelta = op.focusScore.delta >= 5;

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "var(--bg-glass-subtle)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Profile + theme toggle */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
          style={{
            background: "var(--bg-glass-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
          }}
        >
          {op.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-medium leading-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {op.name}
          </p>
          <p
            className="text-[11px] leading-tight truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {op.role}
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Focus Score sub-card — neutral by default */}
      <div
        className="rounded-lg p-2.5"
        style={{
          background: "var(--bg-glass-subtle)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-eyebrow"
            style={{ color: "var(--text-muted)" }}
          >
            Focus
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className="text-[15px] font-semibold tabular-nums"
              style={{
                color: accentDelta ? "var(--accent)" : "var(--text-primary)",
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              }}
            >
              {op.focusScore.value}
            </span>
            <span
              className="text-[11px] tabular-nums"
              style={{
                color:
                  op.focusScore.delta >= 0
                    ? "var(--status-success)"
                    : "var(--status-danger)",
              }}
            >
              {op.focusScore.delta >= 0 ? "+" : ""}
              {op.focusScore.delta}
            </span>
          </div>
        </div>
        {mounted && (
          <LineSpark
            data={op.focusScore.sparkline.map((v, i) => ({ x: i, y: v }))}
            height={28}
            color={accentDelta ? "var(--accent)" : "var(--text-muted)"}
          />
        )}
      </div>
    </div>
  );
}
