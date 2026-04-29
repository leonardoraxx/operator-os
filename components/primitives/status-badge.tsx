import { cn } from "@/lib/cn";
import type { StatusType } from "@/data/types";

interface StatusBadgeProps {
  status: StatusType | string;
  /** Show 6px dot prefix. Default true. */
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

interface StatusConfig {
  label: string;
  dot: string;
  bg: string;
  text: string;
}

/**
 * Phase 3 status rules:
 *   "on-track" → returns null. Default state earns no badge.
 *   Other states render a tinted pill in their status color.
 */
const STATUS_CONFIG: Record<string, StatusConfig | null> = {
  "on-track": null,
  "at-risk": {
    label: "At Risk",
    dot: "var(--status-warning)",
    bg: "var(--status-warning-bg)",
    text: "var(--status-warning)",
  },
  behind: {
    label: "Behind",
    dot: "var(--status-danger)",
    bg: "var(--status-danger-bg)",
    text: "var(--status-danger)",
  },
  done: {
    label: "Done",
    dot: "var(--text-muted)",
    bg: "var(--bg-glass-subtle)",
    text: "var(--text-muted)",
  },
  paused: {
    label: "Paused",
    dot: "var(--text-subtle)",
    bg: "var(--bg-glass-subtle)",
    text: "var(--text-subtle)",
  },
  "in-progress": {
    label: "In Progress",
    dot: "var(--accent)",
    bg: "var(--accent-soft)",
    text: "var(--accent)",
  },
  pending: {
    label: "Pending",
    dot: "var(--status-warning)",
    bg: "var(--status-warning-bg)",
    text: "var(--status-warning)",
  },
};

export function StatusBadge({
  status,
  dot = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const sizing =
    size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-tiny px-2 py-0.5 gap-1.5";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        sizing,
        className,
      )}
      style={{ background: config.bg, color: config.text }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: config.dot }}
        />
      )}
      {config.label}
    </span>
  );
}
