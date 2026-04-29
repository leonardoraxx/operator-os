import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

/**
 * Inline sub-card for nesting inside other cards (e.g. Money Snapshot's
 * 2×2 grid). Uses subtle glass — visually demoted from KPICard.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn("rounded-[var(--radius-lg)] p-3 flex items-center gap-3", className)}
      style={{
        background: "var(--bg-glass-subtle)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {Icon && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--bg-glass)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Icon size={14} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-tiny truncate" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p
          className="text-[13px] font-semibold truncate tabular-nums"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-tiny truncate" style={{ color: "var(--text-muted)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
