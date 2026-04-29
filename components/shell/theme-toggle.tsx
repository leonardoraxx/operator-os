"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // Render a fixed-size placeholder during SSR to avoid hydration flash
  if (!mounted) {
    return <div className="w-9 h-9 flex-shrink-0" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 outline-none"
      style={{
        background: "transparent",
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
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
