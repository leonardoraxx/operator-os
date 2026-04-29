"use client";

import { Check } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { useState } from "react";
import type { OperatorTask } from "@/lib/db";

type Segment = "today" | "week" | "backlog";

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "backlog", label: "Backlog" },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--status-danger)",
  high: "var(--status-warning)",
  medium: "var(--accent)",
  low: "var(--status-success)",
};

function getSegment(task: OperatorTask, today: string, weekEnd: string): Segment {
  if (!task.due_date) return "backlog";
  if (task.due_date === today) return "today";
  if (task.due_date <= weekEnd) return "week";
  return "backlog";
}

export function TasksClient({ initialTasks }: { initialTasks: OperatorTask[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  type TaskWithSegment = OperatorTask & { segment: Segment };
  const withSegments: TaskWithSegment[] = initialTasks.map((t) => ({
    ...t,
    segment: getSegment(t, today, weekEnd),
  }));

  const [tasks, setTasks] = useState<TaskWithSegment[]>(withSegments);

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const todayDone = tasks.filter((t) => t.segment === "today" && t.done).length;
  const todayTotal = tasks.filter((t) => t.segment === "today").length;

  return (
    <>
      <p className="text-xs mb-4" style={{ color: "var(--text-subtle)" }}>
        Today: {todayDone}/{todayTotal} done
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SEGMENTS.map((seg) => {
          const segTasks = tasks.filter((t) => t.segment === seg.id);
          const done = segTasks.filter((t) => t.done).length;
          return (
            <GlassCard
              key={seg.id}
              header={{
                title: seg.label,
                pill: {
                  label: `${done}/${segTasks.length}`,
                  color: done === segTasks.length && segTasks.length > 0 ? "success" : "neutral",
                },
              }}
            >
              {segTasks.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>No tasks.</p>
              ) : (
                <ul className="space-y-2">
                  {segTasks.map((task) => (
                    <li key={task.id}>
                      <button
                        onClick={() => toggle(task.id)}
                        className="w-full flex items-start gap-2.5 text-left py-2 rounded-lg transition-opacity"
                        style={{ opacity: task.done ? 0.6 : 1 }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                          style={{
                            background: task.done
                              ? "var(--status-success)"
                              : "var(--bg-glass-subtle)",
                            border: task.done ? "none" : "1.5px solid var(--border-default)",
                          }}
                        >
                          {task.done && <Check size={9} color="white" strokeWidth={3} />}
                        </div>
                        <div>
                          <p
                            className="text-sm"
                            style={{
                              color: "var(--text-primary)",
                              textDecoration: task.done ? "line-through" : undefined,
                            }}
                          >
                            {task.title}
                          </p>
                          <span
                            className="text-xs"
                            style={{
                              color: PRIORITY_COLORS[task.priority] ?? "var(--text-subtle)",
                            }}
                          >
                            {task.category} · {task.priority}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}
