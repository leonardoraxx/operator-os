import { Dumbbell, Moon, Beef, Scale } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";

const WEEK_DAYS = [
  { day: "Mon", workout: "Push", done: true },
  { day: "Tue", workout: "Rest", done: true },
  { day: "Wed", workout: "Pull", done: true },
  { day: "Thu", workout: "Legs", done: false },
  { day: "Fri", workout: "Push", done: false },
  { day: "Sat", workout: "Rest", done: false },
  { day: "Sun", workout: "Active recovery", done: false },
];

const WORKOUT_LOG = [
  { id: "w1", date: "Apr 25 (Wed)", type: "Pull", duration: "58m", notes: "Rows 4×8 @185lb PR, pull-ups 5×8" },
  { id: "w2", date: "Apr 24 (Tue)", type: "Rest", duration: "-", notes: "8h sleep, 3100 kcal, 182g protein" },
  { id: "w3", date: "Apr 23 (Mon)", type: "Push", duration: "52m", notes: "Bench 4×5 @195lb, shoulder press 3×10" },
];

export default function FitnessPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Week 17"
        title="Fitness"
        subtitle="Body composition and training log"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            icon={Scale}
            label="Current Weight"
            value="181 lbs"
            delta="+0.8 lbs · target: 196"
          />
          <KPICard
            icon={Moon}
            label="Avg Sleep"
            value="5h 52m"
            tone="warning"
            delta="Below target"
          />
          <KPICard icon={Beef} label="Protein Today" value="184g" delta="Target: 200g" />
          <KPICard
            icon={Dumbbell}
            label="Sessions This Week"
            value="3/4"
            tone="success"
            delta="On track"
          />
        </div>

        <GlassCard header={{ icon: Dumbbell, title: "This Week" }}>
          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                style={{
                  background: d.done ? "var(--status-success-bg)" : "var(--bg-glass-subtle)",
                  border: d.done
                    ? "1px solid var(--status-success)"
                    : "1px solid var(--border-subtle)",
                  opacity: d.done ? 1 : 0.7,
                }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: d.done ? "var(--status-success)" : "var(--text-muted)",
                  }}
                >
                  {d.day}
                </p>
                <p className="text-xs text-center" style={{ color: "var(--text-subtle)" }}>
                  {d.workout}
                </p>
                {d.done && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--status-success)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard header={{ icon: Dumbbell, title: "Workout Log" }} footer="View full log →">
          <div className="space-y-3">
            {WORKOUT_LOG.map((w) => (
              <div
                key={w.id}
                className="rounded-xl p-3"
                style={{
                  background: "var(--bg-glass-subtle)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {w.date} - {w.type}
                  </p>
                  {w.duration !== "-" && (
                    <span className="text-xs" style={{ color: "var(--accent)" }}>
                      {w.duration}
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {w.notes}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
