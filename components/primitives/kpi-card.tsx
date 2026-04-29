import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type KPITone = "neutral" | "success" | "warning" | "danger";

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: string;
  tone?: KPITone;
  icon?: LucideIcon;
  className?: string;
}

const TONE_DOT: Record<Exclude<KPITone, "neutral">, string> = {
  success: "var(--status-success)",
  warning: "var(--status-warning)",
  danger: "var(--status-danger)",
};

/**
 * Compact metric tile — 96px fixed height, no header divider.
 * Used in 4-up rows at top of pages (Goals KPIs, Reports KPIs, etc.).
 *
 * Layout:
 *   LABEL (eyebrow)                    [icon 14px subtle]
 *   VALUE (Mono, metric-value)
 *   delta + tone dot                            (only if non-neutral)
 */
export function KPICard({
  label,
  value,
  delta,
  tone = "neutral",
  icon: Icon,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] flex flex-col justify-between p-4 h-[96px]",
        className,
      )}
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-card), var(--glass-highlight)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-eyebrow"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        {Icon && (
          <Icon
            size={14}
            style={{ color: "var(--text-subtle)" }}
          />
        )}
      </div>

      <div
        className="text-metric-value leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>

      {delta && (
        <div
          className="flex items-center gap-1.5 text-tiny"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="truncate">{delta}</span>
          {tone !== "neutral" && (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: TONE_DOT[tone] }}
              aria-hidden
            />
          )}
        </div>
      )}
    </div>
  );
}
