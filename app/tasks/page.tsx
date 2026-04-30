export const dynamic = "force-dynamic";

import { CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { getAllTasks } from "@/lib/db";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const tasks = await getAllTasks();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Today"
        title="Tasks"
        subtitle="All operator tasks from Homebase"
        actions={
          <span
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
            style={{ background: "var(--bg-glass-subtle)", color: "var(--text-subtle)" }}
          >
            <CheckSquare size={12} />
            {tasks.length} total
          </span>
        }
      />
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed p-12 text-center"
            style={{ borderColor: "var(--border-default)", color: "var(--text-subtle)" }}
          >
            <CheckSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No tasks found</p>
            <p className="text-xs mt-1">Add entries to the operator_tasks table in Supabase.</p>
          </div>
        ) : (
          <TasksClient initialTasks={tasks} />
        )}
      </div>
    </PageContainer>
  );
}
