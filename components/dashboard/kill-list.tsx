"use client";

import { Trash2 } from "lucide-react";
import { FeedSection, type FeedItem } from "@/components/primitives/feed-section";
import { KILL_ITEMS } from "@/data/dashboard";

export function KillList() {
  const items: FeedItem[] = KILL_ITEMS.map((k) => ({
    id: k.id,
    icon: Trash2,
    iconColor: "var(--text-secondary)",
    title: k.title,
    meta: k.reason,
    impact: { label: `+${k.timeSaved}`, tone: "success" },
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
