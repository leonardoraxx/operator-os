"use client";

import { SidebarNav } from "./sidebar-nav";
import { OperatorCard } from "./operator-card";
import type { Operator } from "@/data/types";

interface Props { operator?: Operator | null }

export function Sidebar({ operator }: Props = {}) {
  return (
    <aside
      className="flex flex-col h-full w-[var(--sidebar-width)] 2xl:w-[var(--sidebar-width-wide)]"
      style={{
        background: "var(--bg-glass-elevated)",
        backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Wordmark — neutral monogram, no gold */}
      <div
        className="flex items-center gap-2.5 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{
            background: "var(--bg-glass-subtle)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
          }}
        >
          O
        </div>
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          OperatorOS
        </span>
      </div>

      <SidebarNav />

      <div
        className="flex-shrink-0 px-3 pt-3 pb-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <OperatorCard operator={operator} />
      </div>
    </aside>
  );
}
