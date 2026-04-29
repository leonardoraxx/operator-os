import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import { CardFooterLink } from "./card-footer-link";
import { CardMenuButton } from "./card-menu-button";

export type GlassVariant = "regular" | "elevated" | "subtle";
export type GlassPadding = "none" | "sm" | "md" | "lg";

interface GlassCardHeaderProps {
  icon?: LucideIcon;
  title: string;
  pill?: { label: string; color?: "gold" | "success" | "warning" | "danger" | "neutral" };
  rightSlot?: React.ReactNode;
  showMenu?: boolean;
}

interface GlassCardProps {
  header?: GlassCardHeaderProps;
  footer?: React.ReactNode | string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Phase 3 variant prop. Replaces the legacy `elevated` boolean.
   *   regular  — default surface (`bg-glass`)
   *   elevated — hero/focus surfaces (`bg-glass-elevated` + stronger shadow)
   *   subtle   — nested sub-cards (no border, no shadow, `bg-glass-subtle`)
   */
  variant?: GlassVariant;
  /** @deprecated Use `variant="elevated"` */
  elevated?: boolean;
  /** Mission/hero variant — left gold rail accent */
  accent?: boolean;
  /** Enable hover lift — background + shadow transition */
  hoverable?: boolean;
  as?: React.ElementType;
  /** none=0, sm=12, md=20 (Phase 3 default), lg=24 */
  padding?: GlassPadding;
}

const PILL_COLORS: Record<string, { bg: string; text: string }> = {
  gold: { bg: "var(--accent-soft)", text: "var(--accent)" },
  success: { bg: "var(--status-success-bg)", text: "var(--status-success)" },
  warning: { bg: "var(--status-warning-bg)", text: "var(--status-warning)" },
  danger: { bg: "var(--status-danger-bg)", text: "var(--status-danger)" },
  neutral: { bg: "var(--bg-glass-subtle)", text: "var(--text-secondary)" },
};

const PADDINGS: Record<GlassPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  header,
  footer,
  children,
  className,
  style,
  variant,
  elevated = false,
  accent = false,
  hoverable = false,
  as: Tag = "div",
  padding = "md",
}: GlassCardProps) {
  // Resolve variant: explicit prop wins; legacy `elevated` maps to "elevated".
  const v: GlassVariant = variant ?? (elevated ? "elevated" : "regular");

  const surface = (() => {
    switch (v) {
      case "elevated":
        return {
          background: "var(--bg-glass-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-elevated), var(--glass-highlight)",
        };
      case "subtle":
        return {
          background: "var(--bg-glass-subtle)",
          border: "none",
          boxShadow: "none",
        };
      case "regular":
      default:
        return {
          background: "var(--bg-glass)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-card), var(--glass-highlight)",
        };
    }
  })();

  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-card)] flex flex-col overflow-hidden",
        hoverable && "card-hoverable",
        className,
      )}
      style={{
        background: surface.background,
        backdropFilter:
          v === "subtle" ? undefined : "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        WebkitBackdropFilter:
          v === "subtle" ? undefined : "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        border: surface.border,
        boxShadow: surface.boxShadow,
        borderLeft: accent ? "3px solid var(--accent)" : undefined,
        transition: "background var(--motion-base), box-shadow var(--motion-base), border-color var(--motion-base)",
        ...style,
      }}
    >
      {header && (
        <div
          className="flex items-center gap-2 px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {header.icon && (
            <header.icon
              size={14}
              className="flex-shrink-0"
              style={{ color: "var(--text-subtle)" }}
            />
          )}
          <h3
            className="flex-1 min-w-0 text-card-title truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {header.title}
          </h3>
          {header.pill && (
            <span
              className="text-tiny px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: PILL_COLORS[header.pill.color ?? "neutral"].bg,
                color: PILL_COLORS[header.pill.color ?? "neutral"].text,
              }}
            >
              {header.pill.label}
            </span>
          )}
          {header.rightSlot}
          {header.showMenu !== false && <CardMenuButton title={header.title} />}
        </div>
      )}

      <div className={cn("flex-1 flex flex-col", PADDINGS[padding])}>
        {children}
      </div>

      {footer && (
        <div
          className="px-5 py-2.5 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {typeof footer === "string" ? (
            <CardFooterLink label={footer} />
          ) : (
            footer
          )}
        </div>
      )}
    </Tag>
  );
}
