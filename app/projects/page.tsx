export const dynamic = "force-dynamic";

import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { StatusBadge } from "@/components/primitives/status-badge";
import { ProgressBar } from "@/components/primitives/progress-bar";
import type { Project } from "@/data/types";
import { getProjects } from "@/lib/db";

const COLUMNS: { id: Project["column"]; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "active", label: "Active" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export default async function ProjectsPage() {
  const PROJECTS = await getProjects();
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Active board"
        title="Projects"
        subtitle="Kanban view across all ventures"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto">
          {COLUMNS.map((col) => {
            const colProjects = PROJECTS.filter(
              (p) => p.column === col.id || (!p.column && col.id === "active"),
            );
            return (
              <div key={col.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {col.label}
                  </h3>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      color: "var(--text-subtle)",
                    }}
                  >
                    {colProjects.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colProjects.map((proj) => (
                    <GlassCard key={proj.id} padding="sm">
                      <div className="space-y-2">
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {proj.title}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                          {proj.business} · {proj.category}
                        </p>
                        <ProgressBar value={proj.progress} size="sm" showLabel />
                        <div className="flex items-center justify-between">
                          <StatusBadge status={proj.status} />
                          {proj.tasks && (
                            <span
                              className="text-xs"
                              style={{ color: "var(--text-subtle)" }}
                            >
                              {proj.tasks.done}/{proj.tasks.total}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                  {colProjects.length === 0 && (
                    <div
                      className="rounded-2xl border-2 border-dashed p-6 text-center"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "var(--text-subtle)",
                      }}
                    >
                      <p className="text-xs">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
