import { PageContainer } from "@/components/shell/page-container";
import { SectionGrid } from "@/components/shell/section-grid";
import { PageHeader } from "@/components/shell/page-header";
import { KPICard } from "@/components/primitives/kpi-card";
import { GoalFocus } from "@/components/goals/goal-focus";
import { GoalCategories } from "@/components/goals/goal-categories";
import { ActiveGoalsTable } from "@/components/goals/active-goals-table";
import { AtRiskGoals } from "@/components/goals/at-risk-goals";
import { MilestoneTimeline } from "@/components/goals/milestone-timeline";
import { PriorityMatrix } from "@/components/goals/priority-matrix";
import { RecentProgress } from "@/components/goals/recent-progress";
import { QuarterlyReview } from "@/components/goals/quarterly-review";
import { ACTIVE_GOALS, COMPLETED_GOALS_QTD } from "@/data/goals";

export default function GoalsPage() {
  const onTrack = ACTIVE_GOALS.filter((g) => g.status === "on-track").length;
  const atRisk = ACTIVE_GOALS.filter(
    (g) => g.status === "at-risk" || g.status === "behind",
  ).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Q2 2026"
        title="Goals"
        subtitle="Active goal tracking across 4 categories"
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5 2xl:gap-6 mb-5">
        <KPICard label="Active Goals" value={ACTIVE_GOALS.length} delta="This quarter" />
        <KPICard
          label="On Track"
          value={onTrack}
          delta={`${onTrack} of ${ACTIVE_GOALS.length}`}
          tone="success"
        />
        <KPICard
          label="At Risk"
          value={atRisk}
          delta={atRisk > 0 ? "Needs attention" : "All clear"}
          tone={atRisk > 0 ? "warning" : "neutral"}
        />
        <KPICard
          label="Completed QTD"
          value={COMPLETED_GOALS_QTD.length}
          delta="This quarter"
        />
      </div>

      {/* Goal Focus + Categories */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 lg:col-span-8">
          <GoalFocus />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <GoalCategories />
        </div>
      </SectionGrid>

      {/* Active Goals Table + At Risk */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 lg:col-span-8">
          <ActiveGoalsTable />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <AtRiskGoals />
        </div>
      </SectionGrid>

      {/* Milestone Timeline + Priority Matrix */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 lg:col-span-7">
          <MilestoneTimeline />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-5">
          <PriorityMatrix />
        </div>
      </SectionGrid>

      {/* Recent Progress + Quarterly Review */}
      <SectionGrid>
        <div className="col-span-12 sm:col-span-6 lg:col-span-5">
          <RecentProgress />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-7">
          <QuarterlyReview />
        </div>
      </SectionGrid>
    </PageContainer>
  );
}
