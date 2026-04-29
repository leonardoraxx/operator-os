"use client";

import { Activity, TrendingUp, Flag } from "lucide-react";
import { FeedSection, type FeedItem } from "@/components/primitives/feed-section";
import { formatDate } from "@/lib/format";
import type { ActivityEntry } from "@/lib/db";

interface Props {
  activities?: ActivityEntry[];
}

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

function groupLabel(dateIso: string): string {
  if (dateIso === TODAY) return "TODAY";
  if (dateIso === YESTERDAY) return "YESTERDAY";
  return formatDate(dateIso, { month: "short", day: "numeric" }).toUpperCase();
}

export function RecentProgress({ activities = [] }: Props) {
  const items: FeedItem[] = activities.map((a) => {
    const isMilestone = a.target_type === "milestone";
    const dateStr = a.created_at.slice(0, 10);
    return {
      id: a.id,
      icon: isMilestone ? Flag : TrendingUp,
      iconColor: isMilestone ? "var(--status-success)" : "var(--text-secondary)",
      title: a.detail?.title ?? a.action,
      meta: a.detail?.update ?? a.actor,
      impact: isMilestone
        ? { label: "Milestone", tone: "success" as const }
        : { label: "Progress", tone: "neutral" as const },
      group: groupLabel(dateStr),
    };
  });

  return (
    <FeedSection
      title="Recent Progress"
      icon={Activity}
      items={items}
      footer="View all updates →"
    />
  );
}
