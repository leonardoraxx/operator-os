"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MobileDataCard } from "./mobile-data-card";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  /** Cell render. Defaults to `String(row[key])`. */
  render?: (row: Row) => ReactNode;
  /** Tailwind width hint, e.g. "w-32". */
  width?: string;
  align?: "left" | "right" | "center";
  /** Hide on mobile (only matters for `mobileVariant="scroll"`). */
  hideOnMobile?: boolean;
}

interface DataTableProps<Row extends { id: string }> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /**
   * stacked → below md, render rows as MobileDataCards (one per row).
   * scroll  → keep table; horizontal scroll on overflow.
   */
  mobileVariant?: "stacked" | "scroll";
  /** Render an action menu at the right of each row. */
  rowActions?: (row: Row) => ReactNode;
  className?: string;
}

export function DataTable<Row extends { id: string }>({
  columns,
  rows,
  mobileVariant = "stacked",
  rowActions,
  className,
}: DataTableProps<Row>) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile && mobileVariant === "stacked") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {rows.map((row) => (
          <MobileDataCard
            key={row.id}
            fields={columns
              .filter((c) => !c.hideOnMobile)
              .map((c) => ({
                label: c.header,
                value: c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? ""),
              }))}
            actionMenu={rowActions?.(row)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-[13px]" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-eyebrow font-semibold px-3 py-2.5 text-left",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.width,
                )}
                style={{
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {col.header}
              </th>
            ))}
            {rowActions && (
              <th
                className="w-10"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              />
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className="group"
              style={{
                borderBottom:
                  i < rows.length - 1
                    ? "1px solid var(--border-subtle)"
                    : undefined,
                transition: "background var(--motion-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-glass-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-3 py-3 align-middle",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                  style={{ color: "var(--text-primary)" }}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              {rowActions && (
                <td className="px-2 py-3 align-middle text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  {rowActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
