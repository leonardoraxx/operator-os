import { Flame } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { ScoreRing } from "@/components/primitives/score-ring";
import { OPERATOR } from "@/data/operator";

export function ExecutionScore() {
  const score = OPERATOR.executionScore;
  const tone = score.value >= 80 ? "accent" : "neutral";

  return (
    <GlassCard
      header={{ icon: Flame, title: "Execution", showMenu: false }}
      padding="md"
    >
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <ScoreRing value={score.value} size={80} tone={tone} />
        <div className="text-center">
          <p className="text-tiny" style={{ color: "var(--text-muted)" }}>
            vs yesterday
          </p>
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
            {score.delta}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
