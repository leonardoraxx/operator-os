import { Dumbbell, Scale } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { ProgressBar } from "@/components/primitives/progress-bar";
import { getActiveGoals } from "@/lib/db";

export default async function FitnessPage() {
  const goals = await getActiveGoals();
  const fitnessGoal = goals.find(
    (g) => g.category === "health" || /body|weight|fitness|bulk/i.test(g.title)
  );

  const currentWeight = fitnessGoal ? fitnessGoal.current : null;
  const targetWeight = fitnessGoal ? fitnessGoal.target : null;
  const weightUnit = fitnessGoal?.unit ?? "lbs";
  const weightProgress = fitnessGoal ? fitnessGoal.progress : 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Body composition"
        title="Fitness"
        subtitle="Training log and body composition goals"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentWeight != null ? (
            <KPICard
              icon={Scale}
              label="Current Weight"
              value={`${currentWeight} ${weightUnit}`}
              delta={targetWeight != null ? `target: ${targetWeight} ${weightUnit}` : undefined}
            />
          ) : (
            <KPICard icon={Scale} label="Current Weight" value="—" delta="No data" />
          )}
          <KPICard
            icon={Dumbbell}
            label="Goal Progress"
            value={`${weightProgress}%`}
            tone={weightProgress >= 75 ? "success" : weightProgress >= 40 ? "warning" : "neutral"}
          />
          {fitnessGoal && (
            <KPICard
              label="Goal"
              value={fitnessGoal.title}
              tone={fitnessGoal.status === "on-track" ? "success" : "warning"}
            />
          )}
        </div>

        {fitnessGoal ? (
          <GlassCard header={{ icon: Scale, title: fitnessGoal.title }}>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>
                  {currentWeight} {weightUnit} current
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {targetWeight} {weightUnit} target
                </span>
              </div>
              <ProgressBar value={weightProgress} showLabel />
              {fitnessGoal.nextAction && (
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  Next: {fitnessGoal.nextAction}
                </p>
              )}
              {fitnessGoal.deadline && (
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  Deadline: {fitnessGoal.deadline}
                </p>
              )}
            </div>
          </GlassCard>
        ) : (
          <GlassCard header={{ icon: Scale, title: "Body Composition Goal" }}>
            <div
              className="rounded-xl p-8 text-center"
              style={{ color: "var(--text-subtle)" }}
            >
              <Scale size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No fitness goal found</p>
              <p className="text-xs mt-1">
                Add a goal with category "fitness" or "health" to operator_goals.
              </p>
            </div>
          </GlassCard>
        )}

        <GlassCard header={{ icon: Dumbbell, title: "Workout Log" }}>
          <div
            className="rounded-xl p-8 text-center"
            style={{ color: "var(--text-subtle)" }}
          >
            <Dumbbell size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No workout log connected</p>
            <p className="text-xs mt-1">Log workouts to a fitness_logs table to see history here.</p>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
