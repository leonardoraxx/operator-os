import { BookOpen } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import type { WeeklyReviewData } from "@/lib/db";

interface ReviewColumnProps {
  label: string;
  dotColor: string;
  items: string[];
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
        <p className="text-eyebrow" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
      {paragraph ? (
        <p className="text-small leading-snug" style={{ color: "var(--text-primary)" }}>
          {paragraph || "Not set"}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.length > 0 ? items.map((it, i) => (
            <li key={i} className="text-small leading-snug" style={{ color: "var(--text-secondary)" }}>
              · {it}
            </li>
          )) : (
            <li className="text-tiny" style={{ color: "var(--text-muted)" }}>Nothing logged</li>
          )}
        </ul>
      )}
    </div>
  );
}

interface Props {
  review?: WeeklyReviewData | null;
}

export function QuarterlyReview({ review }: Props = {}) {
  const data = review ?? { wins: [], losses: [], nextMetric: "", doubleDown: "" };

  return (
    <GlassCard
      header={{ icon: BookOpen, title: "Weekly Review" }}
      padding="md"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-4">
        <ReviewColumn label="Wins" dotColor="var(--status-success)" items={data.wins} />
        <ReviewColumn label="Losses" dotColor="var(--status-warning)" items={data.losses} />
        <ReviewColumn label="Next Focus" dotColor="var(--accent)" items={[]} paragraph={data.nextMetric} />
        <ReviewColumn label="Double Down" dotColor="var(--status-danger)" items={[]} paragraph={data.doubleDown} />
      </div>
    </GlassCard>
  );
}
