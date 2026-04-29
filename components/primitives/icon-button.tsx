"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type IconButtonSize = 32 | 36 | 40;
export type IconButtonTone = "ghost" | "subtle" | "primary";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for accessibility — icon-only buttons must have a label. */
  "aria-label": string;
  size?: IconButtonSize;
  tone?: IconButtonTone;
}

const SIZE_CLASS: Record<IconButtonSize, string> = {
  32: "w-8 h-8",
  36: "w-9 h-9",
  40: "w-10 h-10",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { size = 36, tone = "ghost", className, children, ...props },
    ref,
  ) {
    const palette =
      tone === "primary"
        ? {
            bg: "var(--accent)",
            color: "var(--on-accent)",
            hoverBg: "var(--accent-strong)",
          }
        : tone === "subtle"
          ? {
              bg: "var(--bg-glass-subtle)",
              color: "var(--text-secondary)",
              hoverBg: "var(--bg-glass-elevated)",
            }
          : {
              bg: "transparent",
              color: "var(--text-secondary)",
              hoverBg: "var(--bg-glass-subtle)",
            };

    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          "flex items-center justify-center rounded-lg outline-none flex-shrink-0",
          SIZE_CLASS[size],
          className,
        )}
        style={{
          background: palette.bg,
          color: palette.color,
          transition: "background var(--motion-fast), color var(--motion-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = palette.hoverBg;
          if (tone !== "primary") {
            e.currentTarget.style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = palette.bg;
          e.currentTarget.style.color = palette.color;
        }}
      >
        {children}
      </button>
    );
  },
);
