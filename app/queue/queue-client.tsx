"use client";

import { useState, useTransition } from "react";
import {
  Layers, CheckCircle2, Clock, Circle, ChevronDown, ChevronUp,
  Copy, Check, ArrowRight, AlertCircle, Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { KPICard } from "@/components/primitives/kpi-card";
import { updateQueueItemStatus } from "./queue-actions";
import type { QueueStatus } from "./queue-actions";
import type { ImplementationItem } from "@/lib/db";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  critical: "var(--status-danger)",
  high:     "var(--status-warning)",
  medium:   "var(--accent)",
  low:      "var(--text-subtle)",
};

const PRIORITY_BG: Record<string, string> = {
  critical: "var(--status-danger-bg)",
  high:     "var(--status-warning-bg)",
  medium:   "var(--accent-soft)",
  low:      "var(--bg-glass-subtle)",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  done:          CheckCircle2,
  completed:     CheckCircle2,
  "in-progress": Clock,
  queued:        Circle,
};

const STATUS_COLOR: Record<string, string> = {
  done:          "var(--status-success)",
  completed:     "var(--status-success)",
  "in-progress": "var(--accent)",
  queued:        "var(--text-subtle)",
};

const STATUS_LABEL: Record<string, string> = {
  done:          "Done",
  completed:     "Done",
  "in-progress": "In Progress",
  queued:        "Queued",
};

function isComplete(s: string) { return s === "done" || s === "completed"; }
function isActive(s: string)   { return s === "in-progress" || s === "active"; }

// ── Phase-level progress bar ──────────────────────────────────────────────────

function PhaseBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: "var(--border-subtle)" }}>
        <div
          className="h-1 rounded-full"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? "var(--status-success)" : "var(--accent)",
            transition: "width var(--motion-slow)",
          }}
        />
      </div>
      <span className="text-tiny tabular-nums" style={{ color: "var(--text-subtle)" }}>
        {done}/{total}
      </span>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy Prompt" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none flex-shrink-0"
      style={{
        background: copied ? "var(--status-success-bg)" : "var(--bg-glass-subtle)",
        color:      copied ? "var(--status-success)"    : "var(--text-secondary)",
        border:     "1px solid var(--border-default)",
        transition: "background var(--motion-fast), color var(--motion-fast)",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ── Status action button ──────────────────────────────────────────────────────

function StatusButton({
  id, current, target, label, saving, onUpdate,
}: {
  id:       string;
  current:  string;
  target:   QueueStatus;
  label:    string;
  saving:   string | null;
  onUpdate: (id: string, status: QueueStatus) => void;
}) {
  const isLoading = saving === id;

  return (
    <button
      onClick={() => onUpdate(id, target)}
      disabled={!!saving}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
      style={{
        background: "var(--bg-glass-subtle)",
        color:      "var(--text-secondary)",
        border:     "1px solid var(--border-default)",
        opacity:    saving && saving !== id ? 0.5 : 1,
        cursor:     saving ? "not-allowed" : "pointer",
        transition: "background var(--motion-fast)",
      }}
      onMouseEnter={(e) => {
        if (!saving) (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--bg-glass-subtle)";
      }}
    >
      {isLoading
        ? <Loader2 size={12} className="animate-spin" />
        : <ArrowRight size={12} />}
      {label}
    </button>
  );
}

// ── Next actions for a given status ──────────────────────────────────────────

function nextActions(status: string): { target: QueueStatus; label: string }[] {
  if (isComplete(status)) return [{ target: "queued",      label: "Re-queue" }];
  if (isActive(status))   return [{ target: "done",        label: "Mark Done" },
                                  { target: "queued",      label: "Re-queue"  }];
  // queued
  return [{ target: "in-progress", label: "Start" },
          { target: "done",        label: "Mark Done" }];
}

// ── Single queue item row ─────────────────────────────────────────────────────

function QueueRow({
  item,
  expanded,
  onToggle,
  saving,
  onUpdate,
  error,
}: {
  item:     ImplementationItem;
  expanded: boolean;
  onToggle: () => void;
  saving:   string | null;
  onUpdate: (id: string, status: QueueStatus) => void;
  error:    string | null;
}) {
  const Icon  = STATUS_ICON[item.status] ?? Circle;
  const done  = isComplete(item.status);
  const active = isActive(item.status);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border:     `1px solid ${active ? "var(--accent)" : "var(--border-subtle)"}`,
        background: active ? "color-mix(in srgb, var(--accent) 4%, transparent)" : "transparent",
        opacity:    done ? 0.6 : 1,
        transition: "border-color var(--motion-fast)",
      }}
    >
      {/* Row header — always visible */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Status icon */}
        <button
          onClick={() => onUpdate(item.id, isComplete(item.status) ? "queued" : "done")}
          disabled={!!saving}
          className="flex-shrink-0 mt-0.5 outline-none"
          title={done ? "Re-queue" : "Mark done"}
          style={{ cursor: saving ? "not-allowed" : "pointer" }}
        >
          <Icon
            size={16}
            style={{
              color:      STATUS_COLOR[item.status] ?? "var(--text-subtle)",
              transition: "color var(--motion-fast)",
            }}
          />
        </button>

        {/* Seq number */}
        <span
          className="text-tiny tabular-nums flex-shrink-0 mt-0.5 w-4 text-right"
          style={{ color: "var(--text-subtle)" }}
        >
          {item.order}
        </span>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p
              className="text-[13px] font-medium leading-snug"
              style={{
                color:          done ? "var(--text-muted)" : "var(--text-primary)",
                textDecoration: done ? "line-through"      : undefined,
              }}
            >
              {item.title}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Category */}
            <span className="text-tiny" style={{ color: "var(--text-subtle)" }}>
              {item.category}
            </span>

            {/* Priority badge */}
            <span
              className="text-tiny px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: PRIORITY_BG[item.priority]    ?? "var(--bg-glass-subtle)",
                color:      PRIORITY_COLOR[item.priority]  ?? "var(--text-subtle)",
              }}
            >
              {item.priority}
            </span>

            {/* Status badge */}
            <span
              className="text-tiny px-1.5 py-0.5 rounded-full"
              style={{
                background: "var(--bg-glass-subtle)",
                color:      STATUS_COLOR[item.status] ?? "var(--text-subtle)",
                border:     "1px solid var(--border-subtle)",
              }}
            >
              {STATUS_LABEL[item.status] ?? item.status}
            </span>
          </div>

          {/* Success criteria — always shown */}
          {item.successCriteria && (
            <p
              className="text-tiny mt-1.5 leading-snug"
              style={{ color: "var(--text-muted)" }}
            >
              ✓ {item.successCriteria}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        {item.prompt && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 p-1 rounded-md outline-none mt-0.5"
            style={{
              color:      "var(--text-subtle)",
              background: expanded ? "var(--bg-glass-subtle)" : "transparent",
            }}
            aria-label={expanded ? "Collapse prompt" : "Expand prompt"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Expanded: prompt + actions */}
      {expanded && item.prompt && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {/* Prompt block */}
          <div
            className="rounded-xl p-3 mt-3 relative"
            style={{
              background: "var(--bg-glass-subtle)",
              border:     "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-tiny font-medium" style={{ color: "var(--text-muted)" }}>
                Claude Prompt
              </span>
              <CopyButton text={item.prompt} />
            </div>
            <p
              className="text-[13px] leading-relaxed"
              style={{
                color:      "var(--text-secondary)",
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                whiteSpace: "pre-wrap",
                wordBreak:  "break-word",
              }}
            >
              {item.prompt}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {nextActions(item.status).map(({ target, label }) => (
              <StatusButton
                key={target}
                id={item.id}
                current={item.status}
                target={target}
                label={label}
                saving={saving}
                onUpdate={onUpdate}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-xs"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
            >
              <AlertCircle size={12} />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Next-Up hero ──────────────────────────────────────────────────────────────

function NextUpHero({
  item,
  saving,
  onUpdate,
  error,
}: {
  item:     ImplementationItem;
  saving:   string | null;
  onUpdate: (id: string, status: QueueStatus) => void;
  error:    string | null;
}) {
  return (
    <GlassCard variant="elevated" accent padding="lg">
      {/* Eyebrow */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-tiny font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            NEXT UP
          </span>
          <span className="text-eyebrow" style={{ color: "var(--text-muted)" }}>
            {item.phase}
          </span>
        </div>
        <span
          className="text-tiny px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{
            background: PRIORITY_BG[item.priority]   ?? "var(--bg-glass-subtle)",
            color:      PRIORITY_COLOR[item.priority] ?? "var(--text-subtle)",
          }}
        >
          {item.priority}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-card-title-hero mb-1" style={{ color: "var(--text-primary)" }}>
        {item.title}
      </h2>
      <p className="text-tiny mb-5" style={{ color: "var(--text-subtle)" }}>
        {item.category} · #{item.order}
      </p>

      {/* Prompt */}
      {item.prompt && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: "var(--bg-glass-subtle)",
            border:     "1px solid var(--border-default)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-eyebrow" style={{ color: "var(--text-muted)" }}>
              Claude Prompt
            </span>
            <CopyButton text={item.prompt} label="Copy to Claude" />
          </div>
          <p
            className="text-[13px] leading-relaxed"
            style={{
              color:      "var(--text-secondary)",
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              whiteSpace: "pre-wrap",
              wordBreak:  "break-word",
            }}
          >
            {item.prompt}
          </p>
        </div>
      )}

      {/* Success criteria */}
      {item.successCriteria && (
        <div
          className="rounded-xl px-4 py-3 mb-5"
          style={{
            background: "var(--status-success-bg)",
            border:     "1px solid color-mix(in srgb, var(--status-success) 20%, transparent)",
          }}
        >
          <p className="text-tiny font-semibold mb-0.5" style={{ color: "var(--status-success)" }}>
            Done when:
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
            {item.successCriteria}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {nextActions(item.status).map(({ target, label }) => (
          <StatusButton
            key={target}
            id={item.id}
            current={item.status}
            target={target}
            label={label}
            saving={saving}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs"
          style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
        >
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </GlassCard>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

interface Props {
  initialItems: ImplementationItem[];
}

export function QueueClient({ initialItems }: Props) {
  const [items,    setItems]    = useState<ImplementationItem[]>(initialItems);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving,   setSaving]   = useState<string | null>(null);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [,         startTransition] = useTransition();

  // ── Computed ──
  const totalCount  = items.length;
  const doneCount   = items.filter((i) => isComplete(i.status)).length;
  const activeCount = items.filter((i) => isActive(i.status)).length;
  const nextItem    = items.find((i) => !isComplete(i.status)) ?? null;

  // Group by phase (preserves order from server)
  const phases = new Map<string, ImplementationItem[]>();
  for (const item of items) {
    const p = item.phase || "Unphased";
    if (!phases.has(p)) phases.set(p, []);
    phases.get(p)!.push(item);
  }

  // ── Status update handler ──
  function handleUpdate(id: string, status: QueueStatus) {
    if (saving) return;

    const prev = items.find((i) => i.id === id)?.status;
    // Optimistic update
    setItems((cur) => cur.map((i) => i.id === id ? { ...i, status } : i));
    setErrors((e) => { const n = { ...e }; delete n[id]; return n; });
    setSaving(id);

    startTransition(async () => {
      const result = await updateQueueItemStatus(id, status);
      if (!result.success) {
        // Revert
        setItems((cur) => cur.map((i) => i.id === id ? { ...i, status: prev ?? "queued" } : i));
        setErrors((e) => ({ ...e, [id]: result.error ?? "Save failed" }));
      }
      setSaving(null);
    });
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Claude · Homebase OS"
        title="Execution Queue"
        subtitle="Queued Claude prompts — execute in order, mark done when complete"
      />

      {/* KPI strip */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total"    value={totalCount}  />
        <KPICard label="Done"     value={doneCount}   tone={doneCount > 0 ? "success" : "neutral"}
          delta={`${Math.round((doneCount / totalCount) * 100)}% complete`} />
        <KPICard label="Active"   value={activeCount} tone={activeCount > 0 ? "warning" : "neutral"} />
        <KPICard label="Remaining" value={totalCount - doneCount} />
      </div>

      <div className="space-y-8">
        {/* Next Up hero — only when there is a pending item */}
        {nextItem && (
          <section>
            <p className="text-eyebrow mb-3" style={{ color: "var(--text-muted)" }}>
              FIRE NEXT
            </p>
            <NextUpHero
              item={nextItem}
              saving={saving}
              onUpdate={handleUpdate}
              error={errors[nextItem.id] ?? null}
            />
          </section>
        )}

        {/* Phase sections */}
        <section>
          <p className="text-eyebrow mb-4" style={{ color: "var(--text-muted)" }}>
            FULL QUEUE
          </p>
          <div className="space-y-6">
            {Array.from(phases.entries()).map(([phase, phaseItems]) => {
              const pDone = phaseItems.filter((i) => isComplete(i.status)).length;
              return (
                <div key={phase}>
                  {/* Phase header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)", whiteSpace: "nowrap" }}
                    >
                      {phase}
                    </h3>
                    <div className="flex-1">
                      <PhaseBar done={pDone} total={phaseItems.length} />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {phaseItems.map((item) => (
                      <QueueRow
                        key={item.id}
                        item={item}
                        expanded={expanded === item.id}
                        onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                        saving={saving}
                        onUpdate={handleUpdate}
                        error={errors[item.id] ?? null}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* All done */}
        {nextItem === null && (
          <div
            className="rounded-2xl flex flex-col items-center gap-3 py-12 text-center"
            style={{
              background: "var(--status-success-bg)",
              border:     "1px solid color-mix(in srgb, var(--status-success) 20%, transparent)",
            }}
          >
            <CheckCircle2 size={28} style={{ color: "var(--status-success)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--status-success)" }}>
              All {totalCount} items complete
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
