"use client";

import { AlertCircle } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RiskBadge } from "@/components/primitives/risk-badge";
import { BOTTLENECKS } from "@/data/dashboard";
import { formatDate } from "@/lib/format";
import type { DataListItem } from "@/components/primitives/data-list";

const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  elevated: 1,
  medium: 2,
  low: 3,
};

export function BottleneckDetector() {
  const sorted = [...BOTTLENECKS].sort(
    (a, b) => SEVERITY_ORDER[a.impact] - SEVERITY_ORDER[b.impact],
  );

  const items: DataListItem[] = sorted.map((b) => ({
    id: b.id,
    icon: AlertCircle,
    iconColor:
      b.impact === "high"
        ? "var(--status-danger)"
        : b.impact === "medium"
          ? "var(--status-warning)"
          : "var(--text-secondary)",
    title: b.area,
    meta: `${b.description} · blocked since ${formatDate(b.blockedSince)}`,
    trailing: <RiskBadge level={b.impact} />,
  }));

  return (
    <ListSection
      title="Bottlenecks"
      icon={AlertCircle}
      pill={{ label: `${BOTTLENECKS.length}`, color: "warning" }}
      items={items}
      density="comfortable"
      footer="View all →"
    />
  );
}
