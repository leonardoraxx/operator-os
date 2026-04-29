"use client";

import { Brain } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { ScoreRing } from "@/components/primitives/score-ring";
import { LineSpark } from "@/components/primitives/line-spark";
import { OPERATOR } from "@/data/operator";
import { useMounted } from "@/hooks/use-mounted";

export function FocusScore() {
  const score = OPERATOR.focusScore;
  const mounted = useMounted();
  const tone = score.value >= 80 ? "accent" : "neutral";
  const lineTone = score.delta >= 5 ? "accent" : "neutral";

  return (
    <GlassCard
      header={{ icon: Brain, title: "Focus", showMenu: false }}
      padding="md"
    >
      <div className="flex flex-col items-center gap-2 py-2">
        <ScoreRing value={score.value} size={80} tone={tone} />
        {mounted && (
          <div className="w-full">
            <LineSpark
              data={score.sparkline.map((v, i) => ({ x: i, y: v }))}
              height={28}
              tone={lineTone}
            />
          </div>
        )}
        <p
          className="text-small font-medium tabular-nums"
          style={{
            color:
              score.delta >= 0
                ? "var(--status-success)"
                : "var(--status-danger)",
          }}
        >
          {score.delta >= 0 ? "+" : ""}
          {score.delta} today
        </p>
      </div>
    </GlassCard>
  );
}
