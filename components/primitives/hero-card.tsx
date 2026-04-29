import { cn } from "@/lib/cn";
import { GlassCard } from "./glass-card";

interface HeroCardProps {
  /** Right-aligned context line, e.g. "Q2 2026 · Funded Account". */
  eyebrow?: string;
  /** Optional left-aligned pill (Top Priority, etc.). */
  pillSlot?: React.ReactNode;
  /** Sentence-case title rendered at card-title-hero scale. */
  title: string;
  subtitle?: string;
  /** Primary progress visualization (ProgressBar tone="accent" + values). */
  progressSlot?: React.ReactNode;
  /** Inline risk strip rendered as a subtle sub-card. Only shown when at-risk. */
  riskStripSlot?: React.ReactNode;
  /** Checklist of next milestones (32px rows). */
  checklistSlot?: React.ReactNode;
  /** Bottom 4-cell meta grid (Deadline / Priority / Risk / Status). */
  metaGrid?: React.ReactNode;
  /** Single accent-text CTA at the bottom. */
  cta?: React.ReactNode;
  className?: string;
}

/**
 * Featured/focus card. Used by Goal Focus and Today's Mission only.
 * Visual anchor: elevated glass + 3px gold left rail + larger title.
 */
export function HeroCard({
  eyebrow,
  pillSlot,
  title,
  subtitle,
  progressSlot,
  riskStripSlot,
  checklistSlot,
  metaGrid,
  cta,
  className,
}: HeroCardProps) {
  return (
    <GlassCard
      variant="elevated"
      accent
      padding="lg"
      className={cn("h-full", className)}
    >
      {/* Eyebrow row: pill (left) + context (right) */}
      {(pillSlot || eyebrow) && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">{pillSlot}</div>
          {eyebrow && (
            <span
              className="text-eyebrow"
              style={{ color: "var(--text-muted)" }}
            >
              {eyebrow}
            </span>
          )}
        </div>
      )}

      {/* Title block */}
      <div className="mb-4">
        <h2
          className="text-card-title-hero"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-body mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Progress */}
      {progressSlot && <div className="mb-4">{progressSlot}</div>}

      {/* Risk strip — only when at-risk */}
      {riskStripSlot && <div className="mb-4">{riskStripSlot}</div>}

      {/* Checklist */}
      {checklistSlot && (
        <div className="mb-4">
          <p
            className="text-eyebrow mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Next milestones
          </p>
          {checklistSlot}
        </div>
      )}

      {/* Meta grid divider */}
      {(metaGrid || cta) && (
        <div
          className="mt-auto pt-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {metaGrid && <div className="mb-3">{metaGrid}</div>}
          {cta}
        </div>
      )}
    </GlassCard>
  );
}
