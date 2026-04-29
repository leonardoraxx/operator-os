"use client";

import { Target } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RingProgress } from "@/components/primitives/ring-progress";
import { ACTIVE_GOALS } from "@/data/goals";
import type { DataListItem } from "@/components/primitives/data-list";
import type { Goal } from "@/data/types";

interface Props { goals?: Goal[] }

export function ActiveGoals({ goals: propGoals }: Props = {}) {
  const data = propGoals && propGoals.length > 0 ? propGoals : ACTIVE_GOALS;
  const goals = data.slice(0, 4);
  const focusedId =
    (data.find((g) => g.priority === "critical") ?? data[0])?.id ?? "";

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
      pill={{ label: `${data.length}`, color: "neutral" }}
      items={items}
      density="comfortable"
      footer="View goals →"
    />
  );
}
