"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import type { Operator } from "@/data/types";

interface AppShellProps {
  children: React.ReactNode;
  operator?: Operator | null;
}

export function AppShell({ children, operator }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar operator={operator} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar operator={operator} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
