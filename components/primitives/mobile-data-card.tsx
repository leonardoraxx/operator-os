import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Field {
  label: string;
  value: ReactNode;
}

interface MobileDataCardProps {
  /** Optional title row (e.g. row's primary identifier). */
  title?: ReactNode;
  /** Optional category/tag pill rendered inline with title. */
  tag?: ReactNode;
  fields: Field[];
  actionMenu?: ReactNode;
  className?: string;
}

/**
 * Stacked label-value card representing a single row of a DataTable
 * on mobile. Renders below md.
 */
export function MobileDataCard({
  title,
  tag,
  fields,
  actionMenu,
  className,
}: MobileDataCardProps) {
  return (
    <div
      className={cn("rounded-[var(--radius-lg)] p-3 flex flex-col gap-2", className)}
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        WebkitBackdropFilter:
          "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {(title || tag || actionMenu) && (
        <div className="flex items-center gap-2">
          {title && (
            <div
              className="text-body-medium flex-1 min-w-0 truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </div>
          )}
          {tag}
          {actionMenu}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {fields.map((f, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3">
            <span
              className="text-tiny flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              {f.label}
            </span>
            <span
              className="text-[13px] text-right truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
