"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { OperatorCard } from "./operator-card";
import type { Operator } from "@/data/types";

interface Props { operator?: Operator | null }

export function MobileSidebar({ operator }: Props = {}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg outline-none flex-shrink-0"
          style={{
            color: "var(--text-secondary)",
            transition: "background var(--motion-fast), color var(--motion-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-glass-subtle)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />

        <Dialog.Content
          className="fixed left-0 top-0 bottom-0 z-50 flex flex-col outline-none w-[280px]"
          style={{
            background: "var(--bg-glass-elevated)",
            backdropFilter: "blur(var(--glass-blur-strong)) saturate(var(--glass-saturate))",
            WebkitBackdropFilter:
              "blur(var(--glass-blur-strong)) saturate(var(--glass-saturate))",
            borderRight: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-elevated)",
          }}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>

          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2.5">
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
                Homebase
              </span>
            </div>

            <Dialog.Close asChild>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg outline-none"
                style={{
                  color: "var(--text-secondary)",
                  transition: "background var(--motion-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-glass-subtle)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                aria-label="Close navigation"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <SidebarNav />

          <div
            className="flex-shrink-0 px-3 pt-3 pb-4"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <OperatorCard operator={operator} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
