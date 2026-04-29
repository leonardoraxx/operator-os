"use client";

import { CheckSquare, Check } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { useState } from "react";

type Task = {
  id: string;
  title: string;
  category: string;
  done: boolean;
  segment: "today" | "week" | "backlog";
};

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Call Coral Gables Co-op (ask for Maria)", category: "Business", done: false, segment: "today" },
  { id: "t2", title: "Send pricing sheet to Miami Beach Naturals", category: "Business", done: false, segment: "today" },
  { id: "t3", title: "Record YT long-form - 3PM block", category: "Content", done: false, segment: "today" },
  { id: "t4", title: "Log trades in journal", category: "Trading", done: true, segment: "today" },
  { id: "t5", title: "Update South FL Suds website copy", category: "Business", done: false, segment: "week" },
  { id: "t6", title: "Design thumbnail for Apr 28 video", category: "Content", done: false, segment: "week" },
  { id: "t7", title: "Research 5 new wholesale leads", category: "Business", done: false, segment: "week" },
  { id: "t8", title: "Weekly review (Sunday AM)", category: "System", done: false, segment: "week" },
  { id: "t9", title: "Build out OperatorOS Supabase schema", category: "System", done: false, segment: "backlog" },
  { id: "t10", title: "Podcast episode research", category: "Content", done: false, segment: "backlog" },
  { id: "t11", title: "Attorney follow-up on wholesale contract", category: "Business", done: false, segment: "backlog" },
];

const SEGMENTS = [
  { id: "today" as const, label: "Today" },
  { id: "week" as const, label: "This Week" },
  { id: "backlog" as const, label: "Backlog" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Business: "var(--accent)",
  Content: "var(--status-warning)",
  Trading: "var(--status-success)",
  System: "var(--text-subtle)",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const todayDone = tasks.filter((t) => t.segment === "today" && t.done).length;
  const todayTotal = tasks.filter((t) => t.segment === "today").length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Today"
        title="Tasks"
        subtitle={`Today: ${todayDone}/${todayTotal} done`}
      />
      <div className="space-y-4">

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
                    color:
                      done === segTasks.length && segTasks.length > 0 ? "success" : "neutral",
                  },
                }}
              >
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
                            border: task.done
                              ? "none"
                              : "1.5px solid var(--border-default)",
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
                              color: CATEGORY_COLORS[task.category] ?? "var(--text-subtle)",
                            }}
                          >
                            {task.category}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
