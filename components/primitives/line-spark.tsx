"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTokens } from "@/hooks/use-chart-tokens";

interface DataPoint {
  x: number;
  y: number;
}

export type LineSparkTone = "neutral" | "accent" | "success" | "danger";

interface LineSparkProps {
  data: DataPoint[];
  height?: number;
  /** Phase 3: default neutral. */
  tone?: LineSparkTone;
  color?: string;
  showTooltip?: boolean;
}

export function LineSpark({
  data,
  height = 36,
  tone = "neutral",
  color,
  showTooltip = false,
}: LineSparkProps) {
  const tokens = useChartTokens();
  const lineColor =
    color ??
    (tone === "accent"
      ? tokens.accent
      : tone === "success"
        ? tokens.success
        : tone === "danger"
          ? tokens.danger
          : tokens.textMuted);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="y"
          stroke={lineColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        {showTooltip && <Tooltip contentStyle={{ display: "none" }} />}
      </LineChart>
    </ResponsiveContainer>
  );
}
