"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarNav({ weekLabel }: { weekLabel: string }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const offset       = parseInt(searchParams.get("week") ?? "0", 10);

  function go(delta: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("week", String(offset + delta));
    router.push(`/calendar?${next.toString()}`);
  }

  const isCurrentWeek = offset === 0;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(-1)}
        aria-label="Previous week"
        className="p-1.5 rounded-lg outline-none"
        style={{
          background: "var(--bg-glass-subtle)",
          border:     "1px solid var(--border-default)",
          color:      "var(--text-muted)",
          cursor:     "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <ChevronLeft size={14} />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => go(-offset)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium outline-none"
          style={{
            background: "var(--accent-soft)",
            color:      "var(--accent)",
            cursor:     "pointer",
          }}
        >
          Today
        </button>
      )}

      <span className="text-xs tabular-nums" style={{ color: "var(--text-subtle)" }}>
        {weekLabel}
      </span>

      <button
        onClick={() => go(+1)}
        aria-label="Next week"
        className="p-1.5 rounded-lg outline-none"
        style={{
          background: "var(--bg-glass-subtle)",
          border:     "1px solid var(--border-default)",
          color:      "var(--text-muted)",
          cursor:     "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
