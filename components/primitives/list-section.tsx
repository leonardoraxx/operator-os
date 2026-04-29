import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";
import { DataList, type DataListItem, type DataListDensity } from "./data-list";

interface ListSectionProps {
  title: string;
  icon?: LucideIcon;
  pill?: { label: string; color?: "gold" | "success" | "warning" | "danger" | "neutral" };
  items: DataListItem[];
  density?: DataListDensity;
  footer?: React.ReactNode | string;
  /** Cap height; content scrolls. Default 480. */
  maxHeight?: number;
  showMenu?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * GlassCard + DataList sandwich.
 * Used by Risk Alerts, Output Tracker, Active Goals, Bottleneck Detector,
 * Active Projects, At Risk Goals — anywhere a card wraps a vertical list.
 */
export function ListSection({
  title,
  icon,
  pill,
  items,
  density = "regular",
  footer,
  maxHeight = 480,
  showMenu = true,
  rightSlot,
  className,
}: ListSectionProps) {
  return (
    <GlassCard
      header={{ icon, title, pill, showMenu, rightSlot }}
      footer={footer}
      padding="sm"
      className={className}
    >
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight }}
      >
        <DataList items={items} density={density} />
      </div>
    </GlassCard>
  );
}
