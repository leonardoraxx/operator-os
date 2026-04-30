"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { toggleTaskDone } from "./task-actions";
import type { OperatorTask } from "@/lib/db";

type Segment = "today" | "week" | "backlog";

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: "today",   label: "Today"     },
  { id: "week",    label: "This Week" },
  { id: "backlog", label: "Backlog"   },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--status-danger)",
  high:     "var(--status-warning)",
  medium:   "var(--accent)",
  low:      "var(--status-success)",
};

function getSegment(task: OperatorTask, today: string, weekEnd: string): Segment {
  if (!task.due_date)           return "backlog";
  if (task.due_date === today)  return "today";
  if (task.due_date <= weekEnd) return "week";
  return "backlog";
}

type TaskWithSegment = OperatorTask & { segment: Segment };

export function TasksClient({ initialTasks }: { initialTasks: OperatorTask[] }) {
  const today   = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [tasks,    setTasks]    = useState<TaskWithSegment[]>(
    initialTasks.map((t) => ({ ...t, segment: getSegment(t, today, weekEnd) }))
  );
  const [saving,   setSaving]   = useState<string | null>(null);  // id of in-flight task
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [,         startTransition] = useTransition();

  const todayDone  = tasks.filter((t) => t.segment === "today" && t.done).length;
  const todayTotal = tasks.filter((t) => t.segment === "today").length;

  function toggle(id: string) {
    if (saving) return;

    const prev = tasks.find((t) => t.id === id)?.done ?? false;
    const next = !prev;

    // Optimistic update
    setTasks((cur) => cur.map((t) => t.id === id ? { ...t, done: next } : t));
    setErrors((e)  => { const n = { ...e }; delete n[id]; return n; });
    setSaving(id);

    startTransition(async () => {
      const result = await toggleTaskDone(id, next);
      if (!result.success) {
        // Revert
        setTasks((cur) => cur.map((t) => t.id === id ? { ...t, done: prev } : t));
        setErrors((e)  => ({ ...e, [id]: result.error ?? "Save failed" }));
      }
      setSaving(null);
    });
  }

  return (
    <>
      <p className="text-xs mb-4" style={{ color: "var(--text-subtle)" }}>
        Today: {todayDone}/{todayTotal} done
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SEGMENTS.map((seg) => {
          const segTasks = tasks.filter((t) => t.segment === seg.id);
          const done     = segTasks.filter((t) => t.done).length;

          return (
            <GlassCard
              key={seg.id}
              header={{
                title: seg.label,
                pill:  {
                  label: `${done}/${segTasks.length}`,
                  color: done === segTasks.length && segTasks.length > 0 ? "success" : "neutral",
                },
              }}
            >
              {segTasks.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>No tasks.</p>
              ) : (
                <ul className="space-y-2">
                  {segTasks.map((task) => {
                    const isLoading = saving === task.id;
                    const hasError  = !!errors[task.id];

                    return (
                      <li key={task.id}>
                        <button
                          onClick={() => toggle(task.id)}
                          disabled={!!saving}
                          className="w-full flex items-start gap-2.5 text-left py-2 rounded-lg"
                          style={{
                            opacity: task.done ? 0.6 : 1,
                            cursor:  saving ? "not-allowed" : "pointer",
                          }}
                        >
                          {/* Checkbox */}
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: task.done
                                ? "var(--status-success)"
                                : hasError
                                  ? "var(--status-danger-bg)"
                                  : "var(--bg-glass-subtle)",
                              border: task.done
                                ? "none"
                                : hasError
                                  ? "1.5px solid var(--status-danger)"
                                  : "1.5px solid var(--border-default)",
                              transition: "background var(--motion-fast), border-color var(--motion-fast)",
                            }}
                          >
                            {isLoading ? (
                              <Loader2 size={9} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                            ) : task.done ? (
                              <Check size={9} color="white" strokeWidth={3} />
                            ) : null}
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm"
                              style={{
                                color:          "var(--text-primary)",
                                textDecoration: task.done ? "line-through" : undefined,
                              }}
                            >
                              {task.title}
                            </p>
                            <span
                              className="text-xs"
                              style={{
                                color: hasError
                                  ? "var(--status-danger)"
                                  : PRIORITY_COLORS[task.priority] ?? "var(--text-subtle)",
                              }}
                            >
                              {hasError
                                ? errors[task.id]
                                : `${task.category} · ${task.priority}`}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}
