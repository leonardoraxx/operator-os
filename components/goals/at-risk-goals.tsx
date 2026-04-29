"use client";

import { ShieldAlert, AlertTriangle } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RiskBadge } from "@/components/primitives/risk-badge";
import type { Goal, RiskLevel } from "@/data/types";
import type { DataListItem } from "@/components/primitives/data-list";

const STATUS_RISK: Record<string, RiskLevel> = {
  "at-risk": "medium",
  behind: "high",
};

interface Props { goals?: Goal[] }

export function AtRiskGoals({ goals = [] }: Props) {
  const data = goals;
  const atRisk = data.filter(
    (g) => g.status === "at-risk" || g.status === "behind",
  );

  const items: DataListItem[] = atRisk.map((g) => {
    const level = STATUS_RISK[g.status] ?? "medium";
    return {
      id: g.id,
      icon: AlertTriangle,
      iconColor: level === "high" ? "var(--status-danger)" : "var(--status-warning)",
      iconBg:
        level === "high"
          ? "var(--status-danger-bg)"
          : "var(--status-warning-bg)",
      title: g.title,
      meta: g.nextAction ? `→ ${g.nextAction}` : g.risk,
      trailing: <RiskBadge level={level} />,
    };
  });

  return (
    <ListSection
      title="At Risk"
      icon={ShieldAlert}
      pill={{ label: `${atRisk.length}`, color: "danger" }}
      items={items}
      density="comfortable"
      maxHeight={400}
    />
  );
}
