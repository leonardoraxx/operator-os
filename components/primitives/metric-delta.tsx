import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface MetricDeltaProps {
  /** Percent or absolute. Sign determines direction unless `sign` is provided. */
  value: number;
  /** Override the sign. */
  sign?: "up" | "down" | "flat";
  /** Suffix appended after the number (e.g. "%", "pts"). */
  suffix?: string;
  /** Hide the directional arrow. */
  compact?: boolean;
  className?: string;
}

export function MetricDelta({
  value,
  sign,
  suffix = "%",
  compact = false,
  className,
}: MetricDeltaProps) {
  const direction =
    sign ?? (value > 0 ? "up" : value < 0 ? "down" : "flat");

  const color =
    direction === "up"
      ? "var(--status-success)"
      : direction === "down"
        ? "var(--status-danger)"
        : "var(--text-muted)";

  const Arrow =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : null;

  const display = `${value > 0 ? "+" : ""}${value}${suffix}`;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-tiny tabular-nums", className)}
      style={{
        color,
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      }}
    >
      {!compact && Arrow && <Arrow size={11} />}
      {display}
    </span>
  );
}
