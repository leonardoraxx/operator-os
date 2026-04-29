"use client";

import { RingProgress, type RingTone } from "./ring-progress";

interface ScoreRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Phase 3: default neutral. */
  tone?: RingTone;
  color?: string;
}

/**
 * Larger ring for Execution / Focus / Weekly War Room scores.
 * Renders the percentage centered with optional label below.
 */
export function ScoreRing({
  value,
  size = 80,
  strokeWidth = 5,
  label,
  tone = "neutral",
  color,
}: ScoreRingProps) {
  return (
    <RingProgress
      value={value}
      size={size}
      strokeWidth={strokeWidth}
      tone={tone}
      color={color}
    >
      <div className="flex flex-col items-center justify-center">
        <span
          className="font-semibold tabular-nums leading-none"
          style={{
            color: "var(--text-primary)",
            fontSize: Math.round(size * 0.28),
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          {value}
        </span>
        {label && (
          <span
            className="text-tiny mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </span>
        )}
      </div>
    </RingProgress>
  );
}
