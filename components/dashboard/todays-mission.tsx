"use client";

import { Check, Circle, ArrowRight } from "lucide-react";
import { HeroCard } from "@/components/primitives/hero-card";
import { ProgressBar } from "@/components/primitives/progress-bar";
import { TODAYS_MISSION } from "@/data/dashboard";

export function TodaysMission() {
  const mission = TODAYS_MISSION;
  const doneCount = mission.actions.filter((a) => a.done).length;
  const total = mission.actions.length;
  const progress = Math.round((doneCount / total) * 100);
  const upcoming = mission.actions.filter((a) => !a.done).slice(0, 3);

  return (
    <HeroCard
      eyebrow={`TODAY · ${mission.deadline} DEADLINE`}
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
      title={mission.title}
      subtitle={mission.description}
      progressSlot={
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-eyebrow" style={{ color: "var(--text-muted)" }}>
              Actions
            </span>
            <span
              className="text-metric-value tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {doneCount} / {total}
            </span>
          </div>
          <ProgressBar value={progress} size="lg" tone="accent" />
        </div>
      }
      riskStripSlot={
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
            At Risk
          </p>
          <p
            className="text-small leading-snug"
            style={{ color: "var(--text-secondary)" }}
          >
            {mission.consequence}
          </p>
        </div>
      }
      checklistSlot={
        <ul className="flex flex-col gap-1">
          {mission.actions.slice(0, 4).map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 h-8 px-2 rounded-md"
            >
              {a.done ? (
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--status-success)" }}
                >
                  <Check size={9} color="white" strokeWidth={3} />
                </span>
              ) : (
                <Circle
                  size={14}
                  style={{ color: "var(--text-subtle)" }}
                  aria-hidden
                />
              )}
              <span
                className="flex-1 text-small truncate"
                style={{
                  color: a.done ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: a.done ? "line-through" : undefined,
                }}
              >
                {a.title}
              </span>
            </li>
          ))}
        </ul>
      }
      cta={
        upcoming.length > 0 ? (
          <button
            onClick={() => console.log(`[TodaysMission] take action: ${upcoming[0].title}`)}
            className="flex items-center gap-2 text-small font-medium outline-none"
            style={{ color: "var(--accent)" }}
          >
            <ArrowRight size={14} />
            <span>Take next action: {upcoming[0].title}</span>
          </button>
        ) : null
      }
    />
  );
}
