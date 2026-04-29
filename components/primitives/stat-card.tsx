import { GlassCard } from "./glass-card";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  delta?: number | string;
  deltaLabel?: string;
  sub?: string;
  pill?: { label: string; color?: "gold" | "success" | "warning" | "danger" | "neutral" };
  children?: React.ReactNode;
  className?: string;
}

/**
 * Phase 3: StatCard is now a "demoted" primitive — used only inside other
 * cards or where a header strip + value layout is genuinely wanted.
 * For top-of-page metric tiles, prefer KPICard.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  sub,
  pill,
  children,
  className,
}: StatCardProps) {
  const isPositive = typeof delta === "number" ? delta >= 0 : undefined;

  return (
    <GlassCard
      header={{ icon: Icon, title: label, pill, showMenu: false }}
      className={className}
      padding="md"
    >
      <div className="flex items-end justify-between gap-2">
        <div>
          <div
            className="text-metric-value leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </div>
          {sub && (
            <p className="text-tiny mt-1" style={{ color: "var(--text-muted)" }}>
              {sub}
            </p>
          )}
        </div>
        {delta !== undefined && (
          <div
            className={cn("text-tiny font-medium px-1.5 py-0.5 rounded-md tabular-nums")}
            style={{
              background:
                isPositive === undefined
                  ? "var(--bg-glass-subtle)"
                  : isPositive
                    ? "var(--status-success-bg)"
                    : "var(--status-danger-bg)",
              color:
                isPositive === undefined
                  ? "var(--text-muted)"
                  : isPositive
                    ? "var(--status-success)"
                    : "var(--status-danger)",
            }}
          >
            {typeof delta === "number"
              ? `${delta >= 0 ? "+" : ""}${delta}${deltaLabel ?? ""}`
              : delta}
          </div>
        )}
      </div>
      {children}
    </GlassCard>
  );
}
