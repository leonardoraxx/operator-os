"use client";

import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      {Icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: "var(--bg-glass-subtle)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Icon size={20} />
        </div>
      )}
      <h3
        className="text-body-medium mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-small max-w-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 h-9 px-3 text-[13px] font-medium rounded-[var(--radius-md)] outline-none"
          style={{
            background: "var(--accent)",
            color: "var(--on-accent)",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
