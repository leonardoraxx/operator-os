"use client";

import { Bot, Check, X, Clock } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { AGENT_TASKS } from "@/data/dashboard";
import { formatRelative } from "@/lib/format";
import { useState } from "react";
import type { AgentTask } from "@/data/types";

const EXTENDED_TASKS: AgentTask[] = [
  ...AGENT_TASKS,
  {
    id: "at4",
    agent: "Research Agent",
    description: "5 competitor pricing sheets collected and summarized",
    count: 5,
    status: "approved",
    timestamp: "2026-04-25T18:00:00Z",
  },
  {
    id: "at5",
    agent: "Content Agent",
    description: "Captions drafted for 3 Instagram Reels",
    count: 3,
    status: "rejected",
    timestamp: "2026-04-25T14:00:00Z",
  },
];

export default function AgentInboxPage() {
  const [tasks, setTasks] = useState(EXTENDED_TASKS);

  const pending = tasks.filter((t) => t.status === "pending").length;
  const approved = tasks.filter((t) => t.status === "approved").length;
  const rejected = tasks.filter((t) => t.status === "rejected").length;

  function handle(id: string, action: "approved" | "rejected") {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: action } : t)));
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Approvals queue"
        title="Agent Inbox"
        subtitle="Review and approve agent-generated work"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-3 gap-4">
          <KPICard
            label="Pending"
            value={pending}
            tone={pending > 0 ? "warning" : "neutral"}
            delta={pending > 0 ? "Needs review" : undefined}
          />
          <KPICard label="Approved" value={approved} tone="success" delta="Done" />
          <KPICard label="Rejected" value={rejected} />
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <GlassCard key={task.id} padding="md">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Bot size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {task.agent}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {task.description}
                      </p>
                      <p
                        className="text-xs mt-1 flex items-center gap-1"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        <Clock size={11} /> {formatRelative(task.timestamp)}
                      </p>
                    </div>
                    {task.status === "pending" ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handle(task.id, "approved")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: "var(--status-success-bg)",
                            color: "var(--status-success)",
                          }}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          onClick={() => handle(task.id, "rejected")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: "var(--status-danger-bg)",
                            color: "var(--status-danger)",
                          }}
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-xs px-2 py-1 rounded-lg capitalize flex-shrink-0"
                        style={{
                          background:
                            task.status === "approved"
                              ? "var(--status-success-bg)"
                              : "var(--bg-glass-subtle)",
                          color:
                            task.status === "approved"
                              ? "var(--status-success)"
                              : "var(--text-subtle)",
                        }}
                      >
                        {task.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
