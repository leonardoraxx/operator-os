"use client";

import { Bell } from "lucide-react";
import { SearchBar } from "./search-bar";
import { QuickAddButton } from "./quick-add-button";
import { MobileSidebar } from "./mobile-sidebar";
import type { Operator } from "@/data/types";

interface TopBarProps {
  breadcrumb?: string;
  notificationCount?: number;
  operator?: Operator | null;
}

export function TopBar({ breadcrumb, notificationCount = 3, operator }: TopBarProps) {
  return (
    <header
      className="flex items-center gap-3 px-4 lg:px-6 flex-shrink-0 h-[56px] md:h-[60px] lg:h-[64px]"
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Left: hamburger (mobile) + env indicator + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <MobileSidebar operator={operator} />
        <div className="hidden lg:flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--status-success)",
              boxShadow: "0 0 6px var(--status-success)",
            }}
            aria-hidden
          />
          <span
            className="text-[11px] font-medium tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Operator Mode
          </span>
        </div>
        {breadcrumb && (
          <>
            <span
              className="hidden lg:inline text-[11px]"
              style={{ color: "var(--text-subtle)" }}
            >
              ›
            </span>
            <span
              className="hidden lg:inline text-[12px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {breadcrumb}
            </span>
          </>
        )}
      </div>

      {/* Center: search */}
      <div className="hidden md:flex flex-1 justify-center">
        <SearchBar />
      </div>

      {/* Right: notifications + Quick Add */}
      <div className="ml-auto md:ml-0 flex items-center gap-1.5">
        <button
          onClick={() => console.log("[TopBar] notifications")}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg outline-none"
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
          aria-label={`Notifications${
            notificationCount > 0 ? `, ${notificationCount} unread` : ""
          }`}
        >
          <Bell size={16} />
          {notificationCount > 0 && (
            <span
              className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--status-danger)" }}
            />
          )}
        </button>
        <QuickAddButton />
      </div>
    </header>
  );
}
