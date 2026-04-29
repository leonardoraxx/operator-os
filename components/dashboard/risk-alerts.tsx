"use client";

import { AlertTriangle, Moon, Activity, DollarSign, TrendingDown } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { RiskBadge } from "@/components/primitives/risk-badge";
import { RISK_ALERTS } from "@/data/dashboard";
import type { DataListItem } from "@/components/primitives/data-list";

const CATEGORY_ICON: Record<string, typeof AlertTriangle> = {
  sleep: Moon,
  output: Activity,
  spending: DollarSign,
  tilt: TrendingDown,
};

export function RiskAlerts() {
  const items: DataListItem[] = RISK_ALERTS.map((alert) => {
    const Icon = CATEGORY_ICON[alert.category] ?? AlertTriangle;
    const tone =
      alert.level === "high" || alert.level === "elevated" ? "danger" : "warning";
    return {
      id: alert.id,
      icon: Icon,
      iconColor:
        tone === "danger" ? "var(--status-danger)" : "var(--status-warning)",
      iconBg:
        tone === "danger"
          ? "var(--status-danger-bg)"
          : "var(--status-warning-bg)",
      title: alert.title,
      meta: alert.description,
      trailing: <RiskBadge level={alert.level} />,
    };
  });

  return (
    <ListSection
      title="Risk Alerts"
      icon={AlertTriangle}
      pill={{ label: `${RISK_ALERTS.length}`, color: "danger" }}
      items={items}
      density="comfortable"
      footer="View all →"
    />
  );
}
