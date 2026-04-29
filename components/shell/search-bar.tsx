"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative w-full max-w-[360px]">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--text-subtle)" }}
      />
      <input
        type="text"
        placeholder="Search anything…"
        className="w-full pl-9 pr-12 h-9 text-[13px] rounded-[var(--radius-md)] outline-none"
        style={{
          background: "var(--bg-glass-subtle)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          transition: "border-color var(--motion-fast), background var(--motion-fast)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.background = "var(--bg-glass)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.background = "var(--bg-glass-subtle)";
        }}
      />
      <span
        className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-medium pointer-events-none"
        style={{
          background: "var(--bg-glass-subtle)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-subtle)",
          letterSpacing: "0.04em",
        }}
      >
        ⌘K
      </span>
    </div>
  );
}
