"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

interface CardFooterLinkProps {
  label: string;
  href?: string;
  className?: string;
}

/**
 * Client-side footer link for GlassCard.
 * Wraps an anchor/Link with hover state so the server-component GlassCard
 * can pass it as the `footer` prop without any client-side handlers.
 */
export function CardFooterLink({ label, href, className }: CardFooterLinkProps) {
  const shared = cn(
    "text-xs font-medium transition-colors duration-150 group",
    className
  );

  const inner = (
    <span
      className="group-hover:underline underline-offset-2"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
      }}
    >
      {label}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={shared}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => console.log(`[CardFooter] ${label}`)}
      className={cn(shared, "cursor-pointer text-left")}
    >
      {inner}
    </button>
  );
}
