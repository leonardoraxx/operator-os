"use client";

import { Trash2 } from "lucide-react";
import { FeedSection, type FeedItem } from "@/components/primitives/feed-section";
import type { KillItem } from "@/data/types";

interface Props { items?: KillItem[] }

export function KillList({ items: propItems = [] }: Props) {
  const data = propItems;
  const items: FeedItem[] = data.map((k) => ({
    id: k.id,
    icon: Trash2,
    iconColor: "var(--text-secondary)",
    title: k.title,
    meta: k.reason,
    impact: k.timeSaved ? { label: `+${k.timeSaved}`, tone: "success" } : undefined,
    group: "KILLED",
  }));

  return (
    <FeedSection
      title="Kill List"
      icon={Trash2}
      items={items}
      footer="Manage kill list →"
    />
  );
}
