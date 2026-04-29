"use client";

import { Target } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RingProgress } from "@/components/primitives/ring-progress";
import { CardFooterLink } from "@/components/primitives/card-footer-link";
import type { DataListItem } from "@/components/primitives/data-list";
import type { Goal } from "@/data/types";

interface Props { goals?: Goal[] }

export function ActiveGoals({ goals = [] }: Props) {
  const data = goals.slice(0, 4);
  const focusedId =
    (goals.find((g) => g.priority === "critical") ?? goals[0])?.id ?? "";

  const items: DataListItem[] = data.map((g) => ({
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
      pill={{ label: `${goals.length}`, color: "neutral" }}
      items={items}
      density="comfortable"
      footer={<CardFooterLink href="/goals" label="View goals →" />}
    />
  );
}
