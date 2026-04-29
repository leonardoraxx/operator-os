"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3">
      <ul className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="relative flex items-center gap-3 pl-3 pr-2.5 h-9 rounded-lg text-[13px] font-medium outline-none"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--bg-glass-subtle)" : "transparent",
                  boxShadow: isActive ? "inset 2px 0 0 var(--accent)" : undefined,
                  transition: "background var(--motion-fast), color var(--motion-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--bg-glass-subtle)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && (
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
