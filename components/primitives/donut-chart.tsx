"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useChartTokens } from "@/hooks/use-chart-tokens";

interface DonutSlice {
  name: string;
  value: number;
  /** Optional explicit color. If omitted, palette is generated. */
  color?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  /** Index of the slice to render in accent (gold). All others grayscale. */
  accentIndex?: number;
  /** Center label (e.g. total count). */
  centerLabel?: { value: string | number; sub?: string };
}

export function DonutChart({
  data,
  size = 160,
  innerRadius = 50,
  outerRadius = 70,
  showLegend = true,
  accentIndex,
  centerLabel,
}: DonutChartProps) {
  const tokens = useChartTokens();

  // Neutral grayscale palette stepping from text-secondary down to text-subtle.
  // The accent index breaks ranks.
  const palette = [
    tokens.text === "#1A1A1A" ? "#3A3A3D" : "#C8C8CC",
    tokens.text === "#1A1A1A" ? "#6A6A6D" : "#9A9A9D",
    tokens.text === "#1A1A1A" ? "#909093" : "#7A7A80",
    tokens.text === "#1A1A1A" ? "#B4B4B7" : "#5A5A60",
  ];

  const colorFor = (i: number, slice: DonutSlice): string => {
    if (slice.color) return slice.color;
    if (i === accentIndex) return tokens.accent;
    return palette[i % palette.length];
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative" style={{ width: "100%", maxWidth: 240 }}>
        <ResponsiveContainer width="100%" height={size}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={false}
              stroke={tokens.bgGlass}
              strokeWidth={1}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={colorFor(i, entry)} fillOpacity={0.9} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-glass-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                color: "var(--text-primary)",
                boxShadow: "var(--shadow-floating)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-metric-value leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              {centerLabel.value}
            </span>
            {centerLabel.sub && (
              <span
                className="text-tiny mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {centerLabel.sub}
              </span>
            )}
          </div>
        )}
      </div>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
          {data.map((entry, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: colorFor(i, entry) }}
              />
              <span
                className="text-tiny"
                style={{ color: "var(--text-secondary)" }}
              >
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
