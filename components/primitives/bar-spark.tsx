"use client";

import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { useChartTokens } from "@/hooks/use-chart-tokens";

interface DataPoint {
  day: string;
  amount: number;
}

interface BarSparkProps {
  data: DataPoint[];
  height?: number;
  /** Index of the highlighted (accent) bar. Other bars are neutral. */
  accentIndex?: number;
  /** Show the day axis labels. Default true. */
  showAxis?: boolean;
}

/**
 * Phase 3: bars are neutral by default (text-subtle at 0.4 alpha).
 * The `accentIndex` bar uses --accent.
 */
export function BarSpark({
  data,
  height = 56,
  accentIndex,
  showAxis = true,
}: BarSparkProps) {
  const tokens = useChartTokens();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        barSize={6}
      >
        {showAxis && (
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: tokens.textMuted }}
          />
        )}
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            background: "var(--bg-glass-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            fontSize: 11,
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-floating)",
          }}
          labelStyle={{ color: "var(--text-muted)" }}
        />
        <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === accentIndex ? tokens.accent : tokens.textSubtle}
              fillOpacity={i === accentIndex ? 0.9 : 0.4}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
