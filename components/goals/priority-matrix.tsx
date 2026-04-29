import { Grid2x2 } from "lucide-react";
import {
  MatrixSection,
  type MatrixQuadrant,
} from "@/components/primitives/matrix-section";
import { ACTIVE_GOALS } from "@/data/goals";
import type { Goal } from "@/data/types";

const QUADRANT_KEYS: NonNullable<Goal["quadrant"]>[] = [
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
];

const QUADRANT_LABELS: Record<NonNullable<Goal["quadrant"]>, string> = {
  "urgent-important": "Do Now · Urgent + Important",
  "not-urgent-important": "Schedule · Important",
  "urgent-not-important": "Delegate · Urgent",
  "not-urgent-not-important": "Eliminate",
};

const CATEGORY_DOT: Record<string, string> = {
  finance: "var(--text-secondary)",
  business: "var(--text-secondary)",
  content: "var(--text-secondary)",
  health: "var(--text-secondary)",
  system: "var(--text-secondary)",
  personal: "var(--text-secondary)",
};

export function PriorityMatrix() {
  const quadrants = QUADRANT_KEYS.map((key): MatrixQuadrant => {
    const goals = ACTIVE_GOALS.filter((g) => g.quadrant === key);
    return {
      label: QUADRANT_LABELS[key],
      chips: goals.map((g) => ({
        id: g.id,
        label: g.title,
        dotColor: CATEGORY_DOT[g.category],
      })),
      maxVisible: 3,
    };
  }) as [MatrixQuadrant, MatrixQuadrant, MatrixQuadrant, MatrixQuadrant];

  return (
    <MatrixSection
      title="Priority Matrix"
      icon={Grid2x2}
      quadrants={quadrants}
    />
  );
}
