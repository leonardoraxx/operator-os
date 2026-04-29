"use client";

import { AlertCircle } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RiskBadge } from "@/components/primitives/risk-badge";
import { formatDate } from "@/lib/format";
import type { DataListItem } from "@/components/primitives/data-list";
import type { ContextEntry } from "@/lib/db";
import type { RiskLevel } from "@/data/types";

interface Props {
  bottlenecks: ContextEntry[];
}

const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  elevated: 1,
  medium: 2,
  low: 3,
};

export function BottleneckDetector({ bottlenecks }: Props) {
  const sorted = [...bottlenecks]
    .sort((a, b) => (SEVERITY_ORDER[a.impact] ?? 2) - (SEVERITY_ORDER[b.impact] ?? 2))
    .slice(0, 6);

  const items: DataListItem[] = sorted.map((b) => ({
    id: b.id,
    icon: AlertCircle,
    iconColor:
      b.impact === "high" || b.impact === "elevated"
        ? "var(--status-danger)"
        : b.impact === "medium"
          ? "var(--status-warning)"
          : "var(--text-secondary)",
    title: b.area,
    meta: b.blocked_since
      ? `${b.description} · blocked since ${formatDate(b.blocked_since)}`
      : b.description,
    trailing: <RiskBadge level={b.impact as RiskLevel} />,
  }));

  return (
    <ListSection
      title="Bottlenecks"
      icon={AlertCircle}
      pill={{ label: bottlenecks.length > 6 ? `${sorted.length} of ${bottlenecks.length}` : `${bottlenecks.length}`, color: "warning" }}
      items={items}
      density="comfortable"
      footer="View all →"
    />
  );
}
