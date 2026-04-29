import { PageContainer } from "@/components/shell/page-container";
import { SectionGrid } from "@/components/shell/section-grid";
import { PageHeader } from "@/components/shell/page-header";
import { TodaysMission } from "@/components/dashboard/todays-mission";
import { DailyCommand } from "@/components/dashboard/daily-command";
import { MoneySnapshot } from "@/components/dashboard/money-snapshot";
import { RiskAlerts } from "@/components/dashboard/risk-alerts";
import { CalendarToday } from "@/components/dashboard/calendar-today";
import { OutputTracker } from "@/components/dashboard/output-tracker";
import { ActiveGoals } from "@/components/dashboard/active-goals";
import { ActiveProjects } from "@/components/dashboard/active-projects";
import { BottleneckDetector } from "@/components/dashboard/bottleneck-detector";
import { WeeklyWarRoom } from "@/components/dashboard/weekly-war-room";
import { DailyCloseout } from "@/components/dashboard/daily-closeout";
import { MoneyRunway } from "@/components/dashboard/money-runway";
import { ExecutionScore } from "@/components/dashboard/execution-score";
import { FocusScore } from "@/components/dashboard/focus-score";
import { OpportunityQueue } from "@/components/dashboard/opportunity-queue";
import { DecisionLog } from "@/components/dashboard/decision-log";
import { KillList } from "@/components/dashboard/kill-list";
import { AgentApprovalCenter } from "@/components/dashboard/agent-approval-center";
import {
  getActiveGoals,
  getProjects,
  getRiskAlerts,
  getKillItems,
  getAgentTasks,
  getTodaysMission,
  getOperator,
} from "@/lib/db";

export default async function DashboardPage() {
  const [
    goals,
    projects,
    alerts,
    killItems,
    agentTasks,
    mission,
    operator,
  ] = await Promise.all([
    getActiveGoals(),
    getProjects(),
    getRiskAlerts(),
    getKillItems(),
    getAgentTasks(),
    getTodaysMission(),
    getOperator(),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow={today}
        title="Dashboard"
        subtitle={
          operator
            ? `${operator.name} · ${operator.role}`
            : "Your operator console"
        }
      />

      {/* Row 1 — Status: Mission dominates, then Command + Money */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 xl:col-span-5">
          <TodaysMission mission={mission} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <DailyCommand />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <MoneySnapshot />
        </div>
      </SectionGrid>

      {/* Row 2 — Risk + Calendar + Output Tracker */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <RiskAlerts alerts={alerts} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <CalendarToday />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <OutputTracker />
        </div>
      </SectionGrid>

      {/* Row 3 — Execution: Goals + Projects + Bottlenecks */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <ActiveGoals goals={goals} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <ActiveProjects projects={projects} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <BottleneckDetector />
        </div>
      </SectionGrid>

      {/* Row 4 — Week + Closeout + Runway/Scores */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 xl:col-span-5">
          <WeeklyWarRoom />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <DailyCloseout />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3 grid grid-cols-1 gap-4">
          <MoneyRunway />
          <div className="grid grid-cols-2 gap-4">
            <ExecutionScore score={operator?.executionScore} />
            <FocusScore score={operator?.focusScore} />
          </div>
        </div>
      </SectionGrid>

      {/* Row 5 — Queues */}
      <SectionGrid className="mb-5">
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <OpportunityQueue />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <DecisionLog />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <KillList items={killItems} />
        </div>
      </SectionGrid>

      {/* Row 6 — Agent Approval Center (full width) */}
      <div>
        <AgentApprovalCenter initialTasks={agentTasks} />
      </div>
    </PageContainer>
  );
}
