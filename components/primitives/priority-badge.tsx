import { cn } from "@/lib/cn";

export type PriorityLevel = "P0" | "P1" | "P2";

interface PriorityBadgeProps {
  level: PriorityLevel;
  size?: "sm" | "md";
  className?: string;
}

const PRIORITY_CONFIG: Record<PriorityLevel, { bg: string; text: string }> = {
  P0: { bg: "var(--status-danger-bg)", text: "var(--status-danger)" },
  P1: { bg: "var(--status-warning-bg)", text: "var(--status-warning)" },
  P2: { bg: "var(--bg-glass-subtle)", text: "var(--text-secondary)" },
};

export function PriorityBadge({
  level,
  size = "md",
  className,
}: PriorityBadgeProps) {
  const c = PRIORITY_CONFIG[level];
  const sizing =
    size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-tiny px-2 py-0.5";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full tabular-nums",
        sizing,
        className,
      )}
      style={{ background: c.bg, color: c.text }}
    >
      {level}
    </span>
  );
}
