"use client";

import { Activity, TrendingUp, Flag } from "lucide-react";
import { FeedSection, type FeedItem } from "@/components/primitives/feed-section";
import { RECENT_PROGRESS } from "@/data/goals";

const TODAY = "2026-04-27";
const YESTERDAY = "2026-04-26";

function groupLabel(dateIso: string): string {
  if (dateIso === TODAY) return "TODAY";
  if (dateIso === YESTERDAY) return "YESTERDAY";
  const d = new Date(dateIso);
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

export function RecentProgress() {
  // Sort newest first by date, then group preserves order.
  const sorted = [...RECENT_PROGRESS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const items: FeedItem[] = sorted.map((entry) => ({
    id: entry.id,
    icon: entry.type === "milestone" ? Flag : TrendingUp,
    iconColor:
      entry.type === "milestone"
        ? "var(--status-success)"
        : "var(--text-secondary)",
    title: entry.goalTitle,
    meta: entry.update,
    impact:
      entry.type === "milestone"
        ? { label: "Milestone", tone: "success" }
        : { label: "Progress", tone: "neutral" },
    group: groupLabel(entry.date),
  }));

  return (
    <FeedSection
      title="Recent Progress"
      icon={Activity}
      items={items}
      footer="View all updates →"
    />
  );
}
