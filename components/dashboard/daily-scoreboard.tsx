"use client";

import { Check, Circle, Flame } from "lucide-react";
import { HeroCard } from "@/components/primitives/hero-card";
import { ProgressBar } from "@/components/primitives/progress-bar";
import type { DailyScoreboardEntry } from "@/lib/db";

interface Props {
  entries?: DailyScoreboardEntry[];
}

const LABELS: Record<keyof Omit<DailyScoreboardEntry, "id" | "date" | "notes" | "score">, string> = {
  moneyAction:    "Money Action",
  venhqOutput:    "VenHQ Output",
  clippingOutput: "Clipping Output",
  gymOrProtein:   "Gym / Protein",
  faithCheck:     "Faith Check",
  homebaseUsed:   "Homebase Used",
};

const KEYS = Object.keys(LABELS) as Array<keyof typeof LABELS>;

export function DailyScoreboard({ entries = [] }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find((e) => e.date === today) ?? null;
  const doneCount = todayEntry
    ? KEYS.filter((k) => todayEntry[k]).length
    : 0;
  const progress = Math.round((doneCount / KEYS.length) * 100);

  if (!todayEntry) {
    return (
      <div
        className="rounded-[var(--radius-xl)] p-6 flex flex-col items-center justify-center gap-3"
        style={{
          background: "var(--bg-glass-subtle)",
          border: "1px solid var(--border-subtle)",
          minHeight: 200,
        }}
      >
        <Flame size={24} style={{ color: "var(--text-subtle)" }} />
        <p className="text-small text-center" style={{ color: "var(--text-muted)" }}>
          No scoreboard entry for today.
          <br />
          Add a row in <code className="text-tiny">daily_scoreboard</code>.
        </p>
      </div>
    );
  }

  return (
    <HeroCard
      eyebrow={`TODAY · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}`}
      pillSlot={
        <span
          className="text-tiny font-medium px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          Daily Scoreboard
        </span>
      }
      title="Today's 6 Actions"
      subtitle="Complete every high-leverage output before EOD."
      progressSlot={
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-eyebrow" style={{ color: "var(--text-muted)" }}>
              Completed
            </span>
            <span
              className="text-metric-value tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {doneCount} / {KEYS.length}
            </span>
          </div>
          <ProgressBar value={progress} size="lg" tone="accent" />
        </div>
      }
      riskStripSlot={
        todayEntry.notes ? (
          <div
            className="rounded-[var(--radius-lg)] p-3"
            style={{
              background: "var(--bg-glass-subtle)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p className="text-eyebrow mb-1" style={{ color: "var(--text-muted)" }}>
              Notes
            </p>
            <p className="text-small leading-snug" style={{ color: "var(--text-secondary)" }}>
              {todayEntry.notes}
            </p>
          </div>
        ) : (
          <div
            className="rounded-[var(--radius-lg)] p-3"
            style={{
              background: "var(--bg-glass-subtle)",
              border: `1px solid ${progress === 100 ? "var(--status-success-bg)" : "var(--status-danger-bg)"}`,
            }}
          >
            <p
              className="text-eyebrow mb-1"
              style={{ color: progress === 100 ? "var(--status-success)" : "var(--status-danger)" }}
            >
              {progress === 100 ? "All Done" : "Incomplete"}
            </p>
            <p className="text-small leading-snug" style={{ color: "var(--text-secondary)" }}>
              {progress === 100
                ? "Full execution day. Every action completed."
                : "Skipping daily actions compounds into stalled momentum."}
            </p>
          </div>
        )
      }
      checklistSlot={
        <ul className="flex flex-col gap-1">
          {KEYS.map((k) => {
            const done = todayEntry[k];
            return (
              <li
                key={k}
                className="flex items-center gap-3 h-8 px-2 rounded-md"
              >
                {done ? (
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--status-success)" }}
                  >
                    <Check size={9} color="white" strokeWidth={3} />
                  </span>
                ) : (
                  <Circle size={14} style={{ color: "var(--text-subtle)" }} />
                )}
                <span
                  className="flex-1 text-small truncate"
                  style={{
                    color: done ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: done ? "line-through" : undefined,
                  }}
                >
                  {LABELS[k]}
                </span>
              </li>
            );
          })}
        </ul>
      }
      cta={null}
    />
  );
}
