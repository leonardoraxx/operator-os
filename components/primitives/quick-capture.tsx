"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface QuickCaptureProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
}

export function QuickCapture({
  placeholder = "Capture a thought…",
  onSubmit,
}: QuickCaptureProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit?.(value.trim());
    setValue("");
  }

  const hasValue = value.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 h-9 text-[13px] rounded-[var(--radius-md)] outline-none"
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
      <button
        type="submit"
        disabled={!hasValue}
        className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 outline-none disabled:cursor-not-allowed"
        style={{
          background: hasValue ? "var(--accent)" : "var(--bg-glass-subtle)",
          color: hasValue ? "var(--on-accent)" : "var(--text-subtle)",
          border: hasValue ? "none" : "1px solid var(--border-subtle)",
          transition: "background var(--motion-fast), color var(--motion-fast)",
        }}
        aria-label="Submit"
      >
        <Send size={13} />
      </button>
    </form>
  );
}
