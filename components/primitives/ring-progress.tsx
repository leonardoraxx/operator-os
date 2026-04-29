"use client";

import { useMounted } from "@/hooks/use-mounted";

export type RingTone = "neutral" | "accent" | "success" | "warning" | "danger";

interface RingProgressProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  /** Phase 3: default neutral. Use `accent` only on focused/priority items. */
  tone?: RingTone;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
}

const TONE_COLOR: Record<RingTone, string> = {
  neutral: "var(--text-muted)",
  accent: "var(--accent)",
  success: "var(--status-success)",
  warning: "var(--status-warning)",
  danger: "var(--status-danger)",
};

export function RingProgress({
  value,
  size = 40,
  strokeWidth = 3,
  tone = "neutral",
  color,
  trackColor,
  children,
  className,
}: RingProgressProps) {
  const mounted = useMounted();
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circumference - (pct / 100) * circumference;

  if (!mounted) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  return (
    <div
      className={`relative flex-shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor ?? "var(--border-subtle)"}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? TONE_COLOR[tone]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset var(--motion-slow)" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
