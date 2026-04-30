"use client";

import { useState, useTransition } from "react";
import { Bot, Check, X, Clock, Loader2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";
import { formatRelative } from "@/lib/format";
import { updateAgentStatus } from "./inbox-actions";
import type { AgentTask } from "@/data/types";

export function AgentInboxClient({ tasks: initialTasks = [] }: { tasks?: AgentTask[] }) {
  const [tasks,  setTasks]  = useState<AgentTask[]>(initialTasks);
  const [saving, setSaving] = useState<string | null>(null); // id in-flight
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [,       startTransition] = useTransition();

  const pending  = tasks.filter((t) => t.status === "pending").length;
  const approved = tasks.filter((t) => t.status === "approved").length;
  const rejected = tasks.filter((t) => t.status === "rejected").length;

  function handle(id: string, action: "approved" | "rejected") {
    if (saving) return;
    const prev = tasks.find((t) => t.id === id)?.status ?? "pending";

    // Optimistic
    setTasks((cur) => cur.map((t) => t.id === id ? { ...t, status: action } : t));
    setErrors((e)  => { const n = { ...e }; delete n[id]; return n; });
    setSaving(id);

    startTransition(async () => {
      const result = await updateAgentStatus(id, action);
      if (!result.success) {
        // Revert
        setTasks((cur) => cur.map((t) =>
          t.id === id ? { ...t, status: prev as AgentTask["status"] } : t
        ));
        setErrors((e) => ({ ...e, [id]: result.error ?? "Save failed" }));
      }
      setSaving(null);
    });
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
          <KPICard label="Approved" value={approved} tone="success" delta={approved > 0 ? "Done" : undefined} />
          <KPICard label="Rejected" value={rejected} />
        </div>

        {tasks.length === 0 ? (
          <div
            className="rounded-2xl flex flex-col items-center gap-3 py-12 text-center"
            style={{
              background: "var(--bg-glass)",
              border:     "1px solid var(--border-default)",
            }}
          >
            <Bot size={28} style={{ color: "var(--text-subtle)", opacity: 0.4 }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              No agent tasks
            </p>
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
              Agent recommendations will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isLoading = saving === task.id;
              const hasError  = !!errors[task.id];

              return (
                <GlassCard key={task.id} padding="md">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      <Bot size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {task.agent}
                          </p>
                          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {task.description}
                          </p>
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-subtle)" }}>
                            <Clock size={11} /> {formatRelative(task.timestamp)}
                          </p>
                          {hasError && (
                            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--status-danger)" }}>
                              <AlertCircle size={11} /> {errors[task.id]}
                            </p>
                          )}
                        </div>

                        {/* Action area */}
                        {task.status === "pending" ? (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handle(task.id, "approved")}
                              disabled={!!saving}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
                              style={{
                                background: "var(--status-success-bg)",
                                color:      "var(--status-success)",
                                opacity:    saving && saving !== task.id ? 0.5 : 1,
                                cursor:     saving ? "not-allowed" : "pointer",
                              }}
                            >
                              {isLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handle(task.id, "rejected")}
                              disabled={!!saving}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
                              style={{
                                background: "var(--status-danger-bg)",
                                color:      "var(--status-danger)",
                                opacity:    saving && saving !== task.id ? 0.5 : 1,
                                cursor:     saving ? "not-allowed" : "pointer",
                              }}
                            >
                              {isLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <X size={12} />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-xs px-2 py-1 rounded-lg capitalize flex-shrink-0"
                            style={{
                              background: task.status === "approved"
                                ? "var(--status-success-bg)"
                                : "var(--bg-glass-subtle)",
                              color: task.status === "approved"
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
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
