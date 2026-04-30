"use client";

import { Lightbulb } from "lucide-react";
import { FeedSection, type FeedItem } from "@/components/primitives/feed-section";
import { formatCurrency } from "@/lib/format";
import type { Opportunity } from "@/data/types";

interface Props {
  opportunities: Opportunity[];
}

export function OpportunityQueue({ opportunities }: Props) {
  const items: FeedItem[] = opportunities.map((opp) => ({
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
      footer={undefined}
    />
  );
}
