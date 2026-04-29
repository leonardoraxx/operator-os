import { BookOpen } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { QUARTERLY_REVIEW } from "@/data/goals";

interface ReviewColumnProps {
  label: string;
  dotColor: string;
  items: string[];
  /** Render single paragraph instead of list (used for Next Focus / Cut). */
  paragraph?: string;
}

function ReviewColumn({ label, dotColor, items, paragraph }: ReviewColumnProps) {
  return (
    <div className="min-w-0 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dotColor }}
          aria-hidden
        />
        <p
          className="text-eyebrow"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
      </div>
      {paragraph ? (
        <p
          className="text-small leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {paragraph}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((it, i) => (
            <li
              key={i}
              className="text-small leading-snug"
              style={{ color: "var(--text-secondary)" }}
            >
              · {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function QuarterlyReview() {
  return (
    <GlassCard
      header={{ icon: BookOpen, title: "Quarterly Review · Q2 2026" }}
      padding="md"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-4">
        <ReviewColumn
          label="Wins"
          dotColor="var(--status-success)"
          items={QUARTERLY_REVIEW.wins}
        />
        <ReviewColumn
          label="Misses"
          dotColor="var(--status-warning)"
          items={QUARTERLY_REVIEW.misses}
        />
        <ReviewColumn
          label="Next Focus"
          dotColor="var(--accent)"
          items={[]}
          paragraph={QUARTERLY_REVIEW.nextFocus}
        />
        <ReviewColumn
          label="Cut"
          dotColor="var(--status-danger)"
          items={[]}
          paragraph={QUARTERLY_REVIEW.cut}
        />
      </div>
    </GlassCard>
  );
}
