"use client";

import { Table2, MoreHorizontal } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { DataTable, type DataTableColumn } from "@/components/primitives/data-table";
import { ProgressBar } from "@/components/primitives/progress-bar";
import { StatusBadge } from "@/components/primitives/status-badge";
import { ACTIVE_GOALS } from "@/data/goals";
import { formatDate } from "@/lib/format";
import type { Goal } from "@/data/types";

export function ActiveGoalsTable() {
  // Determine focused goal — the one HeroCard features. Only that row gets accent progress.
  const focusedId =
    (ACTIVE_GOALS.find((g) => g.priority === "critical") ?? ACTIVE_GOALS[0]).id;

  const columns: DataTableColumn<Goal>[] = [
    {
      key: "title",
      header: "Goal",
      render: (g) => (
        <div className="min-w-0">
          <p
            className="text-[13px] font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {g.title}
          </p>
          <p
            className="text-tiny truncate tabular-nums mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {g.current.toLocaleString()} / {g.target.toLocaleString()} {g.unit}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      hideOnMobile: false,
      render: (g) => (
        <span
          className="text-tiny px-2 py-0.5 rounded-full capitalize"
          style={{
            background: "var(--bg-glass-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          {g.category}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      width: "w-44",
      render: (g) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-24 flex-shrink-0">
            <ProgressBar
              value={g.progress}
              size="sm"
              tone={g.id === focusedId ? "accent" : "neutral"}
            />
          </div>
          <span
            className="text-tiny tabular-nums flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            {g.progress}%
          </span>
        </div>
      ),
    },
    {
      key: "deadline",
      header: "Deadline",
      render: (g) => (
        <span
          className="text-tiny tabular-nums"
          style={{ color: "var(--text-muted)" }}
        >
          {formatDate(g.deadline, { month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (g) => <StatusBadge status={g.status} />,
    },
  ];

  return (
    <GlassCard
      header={{
        icon: Table2,
        title: "Active Goals",
        pill: { label: `${ACTIVE_GOALS.length}`, color: "neutral" },
      }}
      footer="View all goals →"
      padding="none"
    >
      <div className="px-2 py-1">
        <DataTable
          columns={columns}
          rows={ACTIVE_GOALS}
          mobileVariant="stacked"
          rowActions={(row) => (
            <button
              onClick={() => console.log(`[Goals] row actions: ${row.title}`)}
              className="p-1 rounded outline-none"
              style={{ color: "var(--text-subtle)" }}
              aria-label="Row actions"
            >
              <MoreHorizontal size={14} />
            </button>
          )}
        />
      </div>
    </GlassCard>
  );
}
