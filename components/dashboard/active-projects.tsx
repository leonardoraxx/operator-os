"use client";

import { FolderKanban } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RingProgress } from "@/components/primitives/ring-progress";
import { ACTIVE_PROJECTS } from "@/data/dashboard";
import type { DataListItem } from "@/components/primitives/data-list";
import type { Project } from "@/data/types";

interface Props { projects?: Project[] }

export function ActiveProjects({ projects }: Props = {}) {
  const data = projects && projects.length > 0 ? projects : ACTIVE_PROJECTS;
  const focusedId =
    (data.find((p) => p.priority === "high") ?? data[0])?.id ?? "";

  const items: DataListItem[] = data.map((p) => ({
    id: p.id,
    title: p.title,
    meta: `${p.business} · ${p.tasks ? `${p.tasks.done}/${p.tasks.total} tasks` : p.category}`,
    trailing: (
      <RingProgress
        value={p.progress}
        size={40}
        strokeWidth={3}
        tone={p.id === focusedId ? "accent" : "neutral"}
      />
    ),
  }));

  return (
    <ListSection
      title="Active Projects"
      icon={FolderKanban}
      pill={{ label: `${data.length}`, color: "neutral" }}
      items={items}
      density="comfortable"
      footer="View projects →"
    />
  );
}
