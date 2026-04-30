"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Flame, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { ProgressBar } from "@/components/primitives/progress-bar";
import { toggleScoreboardField } from "@/app/dashboard/scoreboard-actions";
import type { ScoreField } from "@/app/dashboard/scoreboard-actions";
import type { DailyScoreboardEntry } from "@/lib/db";

// ── Field config ──────────────────────────────────────────────────────────────

const FIELDS: { key: ScoreField; label: string; sub: string }[] = [
  { key: "money_action",    label: "Money Action",    sub: "One income-producing action" },
  { key: "venhq_output",   label: "VenHQ Output",    sub: "Short or long-form video posted" },
  { key: "clipping_output", label: "Clipping Output", sub: "Whop clip posted" },
  { key: "gym_or_protein",  label: "Gym / Protein",   sub: "Trained or hit protein target" },
  { key: "faith_check",     label: "Faith Check",     sub: "Morning intention or prayer" },
  { key: "homebase_used",   label: "Homebase Used",   sub: "Tracked or reviewed something here" },
];

// DB column name → camelCase key (DailyScoreboardEntry uses camelCase)
const DB_TO_CAMEL: Record<ScoreField, keyof Pick<
  DailyScoreboardEntry,
  "moneyAction" | "venhqOutput" | "clippingOutput" | "gymOrProtein" | "faithCheck" | "homebaseUsed"
>> = {
  money_action:    "moneyAction",
  venhq_output:    "venhqOutput",
  clipping_output: "clippingOutput",
  gym_or_protein:  "gymOrProtein",
  faith_check:     "faithCheck",
  homebase_used:   "homebaseUsed",
};

// ── Local state shape ─────────────────────────────────────────────────────────

type FieldState = Record<ScoreField, boolean>;

function entryToFieldState(entry: DailyScoreboardEntry | null): FieldState {
  return {
    money_action:    entry?.moneyAction    ?? false,
    venhq_output:    entry?.venhqOutput    ?? false,
    clipping_output: entry?.clippingOutput ?? false,
    gym_or_protein:  entry?.gymOrProtein   ?? false,
    faith_check:     entry?.faithCheck     ?? false,
    homebase_used:   entry?.homebaseUsed   ?? false,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  entries?: DailyScoreboardEntry[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DailyScoreboard({ entries = [] }: Props) {
  const today      = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find((e) => e.date === today) ?? null;

  // Optimistic local state — initialised from server data
  const [fields,    setFields]    = useState<FieldState>(() => entryToFieldState(todayEntry));
  const [rowId,     setRowId]     = useState<string | null>(todayEntry?.id ?? null);
  const [saving,    setSaving]    = useState<ScoreField | null>(null);   // field currently in-flight
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);
  const [,          startTransition] = useTransition();

  const doneCount = FIELDS.filter(({ key }) => fields[key]).length;
  const progress  = Math.round((doneCount / FIELDS.length) * 100);

  const progressTone = progress === 100 ? "success" : progress >= 50 ? "accent" : "neutral";

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
  });

  async function handleToggle(field: ScoreField) {
    if (saving) return;                         // block while another save is in-flight
    const next = !fields[field];

    // Optimistic update
    setFields((prev) => ({ ...prev, [field]: next }));
    setSaving(field);
    setErrorMsg(null);

    startTransition(async () => {
      const result = await toggleScoreboardField(field, next, rowId);

      if (!result.success) {
        // Revert on error
        setFields((prev) => ({ ...prev, [field]: !next }));
        setErrorMsg(result.error ?? "Save failed");
      } else if (result.id) {
        // Row was just created — persist the id
        setRowId(result.id);
      }
      setSaving(null);
    });
  }

  return (
    <GlassCard
      variant="elevated"
      accent
      padding="lg"
      className="h-full flex flex-col"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} style={{ color: "var(--accent)" }} />
            <span className="text-eyebrow" style={{ color: "var(--accent)" }}>
              Daily Scoreboard
            </span>
          </div>
          <h2 className="text-card-title-hero" style={{ color: "var(--text-primary)" }}>
            Today's 6 Actions
          </h2>
        </div>
        <span className="text-eyebrow mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          {todayLabel.toUpperCase()}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-eyebrow" style={{ color: "var(--text-muted)" }}>
            Completed
          </span>
          <span
            className="text-metric-value tabular-nums"
            style={{
              color: progress === 100 ? "var(--status-success)" : "var(--text-primary)",
            }}
          >
            {doneCount} / {FIELDS.length}
          </span>
        </div>
        <ProgressBar value={progress} size="lg" tone={progressTone} />
      </div>

      {/* Checklist */}
      <ul className="flex flex-col gap-1.5 flex-1">
        {FIELDS.map(({ key, label, sub }) => {
          const done    = fields[key];
          const loading = saving === key;

          return (
            <li key={key}>
              <button
                onClick={() => handleToggle(key)}
                disabled={loading || (saving !== null && saving !== key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left outline-none group"
                style={{
                  background:   done ? "var(--bg-glass-subtle)" : "transparent",
                  border:       `1px solid ${done ? "var(--border-subtle)" : "var(--border-subtle)"}`,
                  cursor:       loading ? "wait" : "pointer",
                  opacity:      saving !== null && saving !== key ? 0.55 : 1,
                  transition:   "background var(--motion-fast), border-color var(--motion-fast), opacity var(--motion-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!loading && !saving) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-glass-subtle)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!done) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }
                }}
                aria-pressed={done}
                aria-label={`${label}: ${done ? "done" : "not done"}`}
              >
                {/* Checkbox indicator */}
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:  done    ? "var(--status-success)"    : "transparent",
                    border:      done    ? "none"                      : "1.5px solid var(--border-default)",
                    transition: "background var(--motion-fast), border var(--motion-fast)",
                  }}
                >
                  {loading ? (
                    <Loader2
                      size={11}
                      className="animate-spin"
                      style={{ color: done ? "white" : "var(--text-subtle)" }}
                    />
                  ) : done ? (
                    <Check size={11} color="white" strokeWidth={3} />
                  ) : null}
                </span>

                {/* Label + sub */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-small font-medium leading-tight"
                    style={{
                      color:          done ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: done ? "line-through"      : undefined,
                      transition:     "color var(--motion-fast)",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-tiny leading-tight mt-0.5"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {sub}
                  </p>
                </div>

                {/* Done timestamp / status chip */}
                {done && !loading && (
                  <span
                    className="text-tiny px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: "var(--status-success-bg)",
                      color:      "var(--status-success)",
                    }}
                  >
                    Done
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Error message */}
      {errorMsg && (
        <div
          className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs"
          style={{
            background: "var(--status-danger-bg)",
            color:      "var(--status-danger)",
          }}
        >
          <AlertCircle size={13} />
          {errorMsg}
        </div>
      )}

      {/* Footer status strip */}
      <div
        className="mt-4 pt-3 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <p className="text-tiny" style={{ color: "var(--text-subtle)" }}>
          {progress === 100
            ? "Full execution day. Every action completed."
            : `${FIELDS.length - doneCount} action${FIELDS.length - doneCount !== 1 ? "s" : ""} remaining`}
        </p>
        {progress === 100 && (
          <span
            className="text-tiny font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "var(--status-success-bg)",
              color:      "var(--status-success)",
            }}
          >
            6/6 ✓
          </span>
        )}
      </div>
    </GlassCard>
  );
}
