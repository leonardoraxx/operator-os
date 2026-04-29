import { cn } from "@/lib/cn";

export type ProgressTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type ProgressSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  /** sm=4, md=6, lg=10 */
  size?: ProgressSize;
  /**
   * Phase 3: default is `neutral` (text-muted fill).
   * Pass `accent` only when the bar represents the focused/priority item.
   */
  tone?: ProgressTone;
  /** Override fill color (rarely needed; prefer `tone`). */
  color?: string;
  /** @deprecated use `size` */
  height?: number;
  showLabel?: boolean;
}

const SIZE_PX: Record<ProgressSize, number> = { sm: 4, md: 6, lg: 10 };

const TONE_COLOR: Record<ProgressTone, string> = {
  neutral: "var(--text-muted)",
  accent: "var(--accent)",
  success: "var(--status-success)",
  warning: "var(--status-warning)",
  danger: "var(--status-danger)",
};

export function ProgressBar({
  value,
  className,
  size = "md",
  tone = "neutral",
  color,
  height,
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const px = height ?? SIZE_PX[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{
          height: px,
          background: "var(--border-subtle)",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: color ?? TONE_COLOR[tone],
            transition: "width var(--motion-slow)",
            opacity: tone === "neutral" ? 0.6 : 1,
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-tiny tabular-nums w-8 text-right flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}
