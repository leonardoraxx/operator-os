"use client";

import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export type DataListDensity = "compact" | "regular" | "comfortable";

export interface DataListItem {
  id: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  meta?: string;
  trailing?: React.ReactNode;
}

interface DataListProps {
  items: DataListItem[];
  /** compact=32, regular=44, comfortable=56 */
  density?: DataListDensity;
  divided?: boolean;
  className?: string;
}

const ROW_HEIGHT: Record<DataListDensity, string> = {
  compact: "h-8",
  regular: "h-11",
  comfortable: "min-h-[56px] py-2",
};

export function DataList({
  items,
  density = "regular",
  divided = true,
  className,
}: DataListProps) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const isLast = i === items.length - 1;
        return (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-3 px-2 rounded-md",
              ROW_HEIGHT[density],
            )}
            style={{
              borderBottom:
                divided && !isLast ? "1px solid var(--border-subtle)" : undefined,
              transition: "background var(--motion-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-glass-subtle)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {Icon && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.iconBg ?? "var(--bg-glass-subtle)",
                  color: item.iconColor ?? "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Icon size={12} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {item.title}
              </p>
              {item.meta && (
                <p
                  className="text-tiny truncate mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.meta}
                </p>
              )}
            </div>
            {item.trailing && (
              <div className="flex-shrink-0">{item.trailing}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
