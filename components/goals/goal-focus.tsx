"use client";

import { Check, Circle, ArrowRight } from "lucide-react";
import { HeroCard } from "@/components/primitives/hero-card";
import { ProgressBar } from "@/components/primitives/progress-bar";
import { ACTIVE_GOALS } from "@/data/goals";
import { formatCurrency, formatDate } from "@/lib/format";

const PRIORITY_LABEL: Record<string, string> = {
  critical: "P0 · Critical",
  high: "P1 · High",
  medium: "P2 · Medium",
  low: "P3 · Low",
};

export function GoalFocus() {
  // Feature the most critical goal
  const goal = ACTIVE_GOALS.find((g) => g.priority === "critical") ?? ACTIVE_GOALS[0];

  const isAtRisk = goal.status === "at-risk" || goal.status === "behind";
  const currentLabel =
    goal.unit === "USD"
      ? formatCurrency(goal.current)
      : `${goal.current.toLocaleString()} ${goal.unit}`;
  const targetLabel =
    goal.unit === "USD"
      ? formatCurrency(goal.target)
      : `${goal.target.toLocaleString()} ${goal.unit}`;

  const upcomingMilestones = (goal.milestones ?? [])
    .filter((m) => !m.done)
    .slice(0, 3);

  return (
    <HeroCard
      eyebrow={`${goal.category.toUpperCase()} · DEADLINE ${formatDate(goal.deadline, {
        month: "short",
        day: "numeric",
      }).toUpperCase()}`}
      pillSlot={
        <span
          className="text-tiny font-medium px-2 py-0.5 rounded-full"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent)",
          }}
        >
          Top Priority
        </span>
      }
      title={goal.title}
      subtitle={`Reach ${targetLabel} by ${formatDate(goal.deadline, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`}
      progressSlot={
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span
              className="text-eyebrow"
              style={{ color: "var(--text-muted)" }}
            >
              Progress
            </span>
            <span
              className="text-metric-value tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {goal.progress}%
            </span>
          </div>
          <ProgressBar value={goal.progress} size="lg" tone="accent" />
          <div
            className="flex justify-between mt-2 text-tiny tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            <span>{currentLabel}</span>
            <span>{targetLabel}</span>
          </div>
        </div>
      }
      riskStripSlot={
        isAtRisk && goal.risk ? (
          <div
            className="rounded-[var(--radius-lg)] p-3"
            style={{
              background: "var(--bg-glass-subtle)",
              border: "1px solid var(--status-danger-bg)",
            }}
          >
            <p
              className="text-eyebrow mb-1"
              style={{ color: "var(--status-danger)" }}
            >
              Risk
            </p>
            <p
              className="text-small leading-snug"
              style={{ color: "var(--text-secondary)" }}
            >
              {goal.risk}
            </p>
          </div>
        ) : null
      }
      checklistSlot={
        upcomingMilestones.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {upcomingMilestones.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 h-8 px-2 rounded-md"
              >
                <Circle
                  size={14}
                  style={{ color: "var(--text-subtle)" }}
                  aria-hidden
                />
                <span
                  className="flex-1 text-small truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {m.title}
                </span>
                <span
                  className="text-tiny tabular-nums flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(m.dueDate, { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
          </ul>
        ) : null
      }
      metaGrid={
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetaCell
            label="Deadline"
            value={formatDate(goal.deadline, { month: "short", day: "numeric" })}
          />
          <MetaCell label="Priority" value={PRIORITY_LABEL[goal.priority] ?? goal.priority} />
          <MetaCell
            label="Status"
            value={goal.status.replace("-", " ")}
            tone={isAtRisk ? "danger" : "neutral"}
          />
          <MetaCell
            label="Pace"
            value={isAtRisk ? "Off track" : "On pace"}
            tone={isAtRisk ? "warning" : "success"}
          />
        </div>
      }
      cta={
        goal.nextAction ? (
          <button
            onClick={() => console.log(`[GoalFocus] take action: ${goal.nextAction}`)}
            className="flex items-center gap-2 text-small font-medium outline-none"
            style={{ color: "var(--accent)" }}
          >
            <ArrowRight size={14} />
            <span>Take next action: {goal.nextAction}</span>
          </button>
        ) : null
      }
    />
  );
}

function MetaCell({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneColor =
    tone === "success"
      ? "var(--status-success)"
      : tone === "warning"
        ? "var(--status-warning)"
        : tone === "danger"
          ? "var(--status-danger)"
          : "var(--text-primary)";

  return (
    <div className="min-w-0">
      <p
        className="text-eyebrow mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-small font-medium capitalize truncate"
        style={{ color: toneColor }}
      >
        {value}
      </p>
    </div>
  );
}

// Suppress unused-import lint (Check kept for future "done" milestone rendering).
void Check;
