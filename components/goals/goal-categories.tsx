import { PieChart } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { DonutChart } from "@/components/primitives/donut-chart";
import { GOAL_CATEGORIES_DATA } from "@/data/goals";
import type { Goal } from "@/data/types";

interface Props { goals?: Goal[] }

export function GoalCategories({ goals }: Props = {}) {
  const computed =
    goals && goals.length > 0
      ? Object.entries(
          goals.reduce<Record<string, number>>((acc, g) => {
            acc[g.category] = (acc[g.category] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([name, value]) => ({ name, value }))
      : GOAL_CATEGORIES_DATA.map((c) => ({ name: c.name, value: c.value }));

  const sorted = [...computed].sort((a, b) => b.value - a.value);

  const total = sorted.reduce((sum, c) => sum + c.value, 0);

  return (
    <GlassCard header={{ icon: PieChart, title: "Goal Categories" }}>
      <DonutChart
        data={sorted}
        size={180}
        innerRadius={56}
        outerRadius={80}
        accentIndex={0}
        showLegend
        centerLabel={{ value: total, sub: "goals" }}
      />
    </GlassCard>
  );
}
