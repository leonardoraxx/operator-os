import { PieChart } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { DonutChart } from "@/components/primitives/donut-chart";
import { GOAL_CATEGORIES_DATA } from "@/data/goals";

export function GoalCategories() {
  // Sort descending; top category gets the lone gold slice.
  const sorted = [...GOAL_CATEGORIES_DATA]
    .map((c) => ({ name: c.name, value: c.value })) // strip explicit colors → neutral palette
    .sort((a, b) => b.value - a.value);

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
