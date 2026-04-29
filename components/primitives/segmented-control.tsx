"use client";

import { cn } from "@/lib/cn";

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Two- or three-segment toggle. Active segment uses elevated glass +
 * primary text. Inactive uses transparent + muted text.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  size = "sm",
  className,
}: SegmentedControlProps<T>) {
  const padding = size === "sm" ? "h-7 px-2.5 text-tiny" : "h-9 px-3 text-[13px]";

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center rounded-[var(--radius-md)] p-0.5",
        className,
      )}
      style={{
        background: "var(--bg-glass-subtle)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <button
            key={seg.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(seg.value)}
            className={cn(
              "rounded-[6px] font-medium outline-none",
              padding,
            )}
            style={{
              background: active ? "var(--bg-glass-elevated)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: active ? "var(--shadow-card)" : "none",
              transition: "background var(--motion-fast), color var(--motion-fast)",
            }}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
