import { GitCommitHorizontal } from "lucide-react";
import {
  TimelineSection,
  type TimelineItem,
} from "@/components/primitives/timeline-section";
import { ACTIVE_GOALS } from "@/data/goals";
import { formatDate } from "@/lib/format";

export function MilestoneTimeline() {
  // Flatten across active goals, sort by due date asc, take next 8.
  const flattened = ACTIVE_GOALS.filter((g) => g.milestones && g.milestones.length > 0)
    .flatMap((g) =>
      (g.milestones ?? []).map((m) => ({ ...m, goalTitle: g.title })),
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 8);

  // First non-done becomes "active" — the only gold dot.
  const firstUpcomingId = flattened.find((m) => !m.done)?.id;

  const items: TimelineItem[] = flattened.map((m) => ({
    id: m.id,
    title: `${m.title} · ${m.goalTitle}`,
    date: formatDate(m.dueDate, { month: "short", day: "numeric" }),
    state: m.done
      ? "completed"
      : m.id === firstUpcomingId
        ? "active"
        : "upcoming",
  }));

  return (
    <TimelineSection
      title="Milestone Timeline"
      icon={GitCommitHorizontal}
      items={items}
    />
  );
}
