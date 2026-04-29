"use client";

import { Target } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RingProgress } from "@/components/primitives/ring-progress";
import { ACTIVE_GOALS } from "@/data/goals";
import type { DataListItem } from "@/components/primitives/data-list";

export function ActiveGoals() {
  const goals = ACTIVE_GOALS.slice(0, 4);
  const focusedId =
    (ACTIVE_GOALS.find((g) => g.priority === "critical") ?? ACTIVE_GOALS[0]).id;

  const items: DataListItem[] = goals.map((g) => ({
    id: g.id,
    title: g.title,
    meta: `${g.current.toLocaleString()} / ${g.target.toLocaleString()} ${g.unit}`,
    trailing: (
      <RingProgress
        value={g.progress}
        size={40}
        strokeWidth={3}
        tone={g.id === focusedId ? "accent" : "neutral"}
      />
    ),
  }));

  return (
    <ListSection
      title="Active Goals"
      icon={Target}
      pill={{ label: `${ACTIVE_GOALS.length}`, color: "neutral" }}
      items={items}
      density="comfortable"
      footer="View goals →"
    />
  );
}
