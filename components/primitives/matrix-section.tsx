import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { GlassCard } from "./glass-card";
import { MatrixOverflowButton } from "./matrix-overflow-button";

export interface MatrixChip {
  id: string;
  label: string;
  /** Category dot color, optional. */
  dotColor?: string;
}

export interface MatrixQuadrant {
  /** Top-left, top-right, bottom-left, bottom-right (reading order). */
  label: string;
  chips: MatrixChip[];
  /** Show "+N more" link when chips.length > maxVisible. */
  maxVisible?: number;
}

interface MatrixSectionProps {
  title: string;
  icon?: LucideIcon;
  /** Exactly 4 quadrants. Top-left receives accent border. */
  quadrants: [MatrixQuadrant, MatrixQuadrant, MatrixQuadrant, MatrixQuadrant];
  className?: string;
}

/**
 * 2×2 quadrant card. Used by Priority Matrix.
 * Top-left quadrant (urgent + important) gets a 1px accent border to mark
 * it as the "do now" zone. Other quadrants are subtle glass.
 */
export function MatrixSection({
  title,
  icon,
  quadrants,
  className,
}: MatrixSectionProps) {
  return (
    <GlassCard
      header={{ icon, title, showMenu: true }}
      padding="md"
      className={className}
    >
      <div className="grid grid-cols-2 gap-3 flex-1">
        {quadrants.map((q, i) => (
          <Quadrant key={i} quadrant={q} accent={i === 0} />
        ))}
      </div>
    </GlassCard>
  );
}

function Quadrant({
  quadrant,
  accent,
}: {
  quadrant: MatrixQuadrant;
  accent: boolean;
}) {
  const max = quadrant.maxVisible ?? 3;
  const visible = quadrant.chips.slice(0, max);
  const overflow = quadrant.chips.length - visible.length;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] p-3 flex flex-col gap-2 min-h-[120px]",
      )}
      style={{
        background: "var(--bg-glass-subtle)",
        border: accent
          ? "1px solid var(--accent)"
          : "1px solid var(--border-subtle)",
      }}
    >
      <p
        className="text-eyebrow"
        style={{
          color: accent ? "var(--accent)" : "var(--text-muted)",
        }}
      >
        {quadrant.label}
      </p>
      <div className="flex flex-col gap-1.5">
        {visible.map((chip) => (
          <div
            key={chip.id}
            className="flex items-center gap-2 px-2 h-7 rounded-full"
            style={{
              background: "var(--bg-glass)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {chip.dotColor && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: chip.dotColor }}
              />
            )}
            <span
              className="text-tiny truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {chip.label}
            </span>
          </div>
        ))}
        {overflow > 0 && <MatrixOverflowButton count={overflow} />}
      </div>
    </div>
  );
}
