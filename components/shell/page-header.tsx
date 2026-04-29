import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  /**
   * Short context line above the title (e.g. "Q2 2026", "Sunday, April 26").
   * Rendered in eyebrow style — uppercase tracked. Optional.
   */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  /**
   * @deprecated Phase 2 PageHeader no longer renders an icon.
   * Accepted for backward compatibility; will be removed in Phase 4/5.
   */
  icon?: LucideIcon;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-6", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p
            className="text-eyebrow mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="text-page-title"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-body mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
