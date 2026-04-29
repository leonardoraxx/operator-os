"use client";

import { Bot, Check, X } from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { AGENT_TASKS } from "@/data/dashboard";
import { formatRelative } from "@/lib/format";
import { useState } from "react";
import type { AgentTask } from "@/data/types";

export function AgentApprovalCenter() {
  const [tasks, setTasks] = useState<AgentTask[]>(AGENT_TASKS);

  function setStatus(id: string, status: AgentTask["status"]) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  const pending = tasks.filter((t) => t.status === "pending").length;

  return (
    <GlassCard
      header={{
        icon: Bot,
        title: "Agent Approval Center",
        pill:
          pending > 0
            ? { label: `${pending} pending`, color: "warning" }
            : undefined,
      }}
      footer="View full inbox →"
      padding="md"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-[var(--radius-lg)] p-3 flex flex-col gap-3"
            style={{
              background: "var(--bg-glass-subtle)",
              opacity: task.status !== "pending" ? 0.6 : 1,
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--bg-glass)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Bot size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {task.agent}
                </p>
                <p
                  className="text-tiny leading-snug mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {task.description}
                </p>
                <p
                  className="text-tiny mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatRelative(task.timestamp)}
                </p>
              </div>
            </div>

            {task.status === "pending" ? (
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setStatus(task.id, "approved")}
                  className="flex-1 flex items-center justify-center gap-1 h-8 rounded-md text-tiny font-medium outline-none"
                  style={{
                    background: "var(--accent)",
                    color: "var(--on-accent)",
                  }}
                >
                  <Check size={11} />
                  Approve
                </button>
                <button
                  onClick={() => setStatus(task.id, "rejected")}
                  className="flex-1 flex items-center justify-center gap-1 h-8 rounded-md text-tiny font-medium outline-none"
                  style={{
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <X size={11} />
                  Reject
                </button>
              </div>
            ) : (
              <div
                className="text-center h-8 rounded-md text-tiny font-medium flex items-center justify-center"
                style={{
                  background:
                    task.status === "approved"
                      ? "var(--status-success-bg)"
                      : "var(--bg-glass-subtle)",
                  color:
                    task.status === "approved"
                      ? "var(--status-success)"
                      : "var(--text-muted)",
                }}
              >
                {task.status === "approved" ? "Approved" : "Rejected"}
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
