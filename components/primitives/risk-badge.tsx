import { cn } from "@/lib/cn";
import type { RiskLevel } from "@/data/types";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md";
  className?: string;
}

interface RiskConfig {
  label: string;
  dot: string;
  bg: string;
  text: string;
}

/**
 * Phase 3 risk rules:
 *   "low" → returns null. No badge for benign state.
 *   medium → amber.
 *   high / elevated → red. Severity differentiated by label, not just color.
 */
const RISK_CONFIG: Record<RiskLevel, RiskConfig | null> = {
  low: null,
  medium: {
    label: "Medium",
    dot: "var(--status-warning)",
    bg: "var(--status-warning-bg)",
    text: "var(--status-warning)",
  },
  high: {
    label: "High",
    dot: "var(--status-danger)",
    bg: "var(--status-danger-bg)",
    text: "var(--status-danger)",
  },
  elevated: {
    label: "Elevated",
    dot: "var(--status-danger)",
    bg: "var(--status-danger-bg)",
    text: "var(--status-danger)",
  },
  critical: {
    label: "Critical",
    dot: "var(--status-danger)",
    bg: "var(--status-danger-bg)",
    text: "var(--status-danger)",
  },
};

export function RiskBadge({ level, size = "md", className }: RiskBadgeProps) {
  const config = RISK_CONFIG[level];
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
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: config.dot }}
      />
      {config.label}
    </span>
  );
}
