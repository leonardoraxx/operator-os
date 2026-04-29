"use client";

import { MoreHorizontal } from "lucide-react";

interface CardMenuButtonProps {
  title: string;
}

export function CardMenuButton({ title }: CardMenuButtonProps) {
  return (
    <button
      onClick={() => console.log(`[GlassCard] menu: ${title}`)}
      className="p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity outline-none"
      style={{ color: "var(--text-subtle)" }}
      aria-label="Card menu"
    >
      <MoreHorizontal size={14} />
    </button>
  );
}
