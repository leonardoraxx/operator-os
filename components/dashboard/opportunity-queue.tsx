"use client";

import { Lightbulb } from "lucide-react";
import { FeedSection, type FeedItem } from "@/components/primitives/feed-section";
import { OPPORTUNITIES } from "@/data/dashboard";
import { formatCurrency } from "@/lib/format";

export function OpportunityQueue() {
  const items: FeedItem[] = OPPORTUNITIES.map((opp) => ({
    id: opp.id,
    icon: Lightbulb,
    iconColor: "var(--text-secondary)",
    title: opp.title,
    meta: `${opp.category} · ${opp.effort} effort${opp.notes ? ` · ${opp.notes}` : ""}`,
    impact: {
      label: formatCurrency(opp.potentialValue, { compact: true }),
      tone: "success",
    },
    group: "OPPORTUNITIES",
  }));

  return (
    <FeedSection
      title="Opportunity Queue"
      icon={Lightbulb}
      items={items}
      footer="View all opportunities →"
    />
  );
}
