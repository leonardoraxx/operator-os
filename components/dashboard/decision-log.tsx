"use client";

import { GitBranch } from "lucide-react";
import { FeedSection, type FeedItem } from "@/components/primitives/feed-section";
import { DECISIONS } from "@/data/dashboard";
import { formatDate } from "@/lib/format";

const TODAY = "2026-04-28";

function groupLabel(dateIso: string): string {
  if (dateIso === TODAY) return "TODAY";
  return formatDate(dateIso, { month: "short", day: "numeric" }).toUpperCase();
}

export function DecisionLog() {
  const sorted = [...DECISIONS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const items: FeedItem[] = sorted.map((d) => ({
    id: d.id,
    icon: GitBranch,
    iconColor: "var(--text-secondary)",
    title: d.title,
    meta: `${d.outcome} · ${d.category}`,
    impact: {
      label: d.reversible ? "Reversible" : "Irreversible",
      tone: d.reversible ? "neutral" : "danger",
    },
    group: groupLabel(d.date),
  }));

  return (
    <FeedSection
      title="Decision Log"
      icon={GitBranch}
      items={items}
      footer="View all decisions →"
    />
  );
}
