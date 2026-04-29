"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, ChevronDown, CheckSquare, Target, FileText, Sparkles } from "lucide-react";

const ITEMS = [
  { label: "New Task", icon: CheckSquare, action: "task" },
  { label: "New Goal", icon: Target, action: "goal" },
  { label: "Capture Decision", icon: FileText, action: "decision" },
  { label: "Log Opportunity", icon: Sparkles, action: "opportunity" },
] as const;

export function QuickAddButton() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-[13px] font-medium outline-none"
          style={{
            background: "var(--accent)",
            color: "var(--on-accent)",
            transition: "background var(--motion-fast), transform var(--motion-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          aria-label="Quick add"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Quick Add</span>
          <ChevronDown size={12} className="opacity-80" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="min-w-[200px] p-1 rounded-[var(--radius-md)] outline-none"
          style={{
            background: "var(--bg-glass-elevated)",
            backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            WebkitBackdropFilter:
              "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-floating)",
            color: "var(--text-primary)",
            zIndex: 1000,
          }}
        >
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenu.Item
                key={item.action}
                onSelect={() => {
                  // eslint-disable-next-line no-console
                  console.log(`[QuickAdd] ${item.action}`);
                }}
                className="flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] cursor-pointer outline-none"
                style={{
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-glass-subtle)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
