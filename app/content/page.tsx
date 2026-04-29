import { FileVideo, CheckCircle, Clock, Pencil, Film, Send } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";

type Stage = "Idea" | "Script" | "Filmed" | "Edited" | "Posted";

const CONTENT_PIPELINE: {
  id: string;
  title: string;
  platform: string;
  stage: Stage;
  priority: "high" | "medium" | "low";
}[] = [
  { id: "c1", title: "How I built a funded trading account", platform: "YouTube", stage: "Script", priority: "high" },
  { id: "c2", title: "VenHQ - 30-day update", platform: "YouTube Shorts", stage: "Filmed", priority: "high" },
  { id: "c3", title: "South FL Suds Farmer's Market recap", platform: "Instagram", stage: "Edited", priority: "medium" },
  { id: "c4", title: "Operator morning routine", platform: "YouTube Shorts", stage: "Idea", priority: "medium" },
  { id: "c5", title: "Wholesale outreach cold script breakdown", platform: "LinkedIn", stage: "Posted", priority: "low" },
  { id: "c6", title: "5 tools I use daily as a solo founder", platform: "YouTube", stage: "Script", priority: "medium" },
];

const STAGE_ICONS: Record<Stage, typeof Pencil> = {
  Idea: Pencil,
  Script: Clock,
  Filmed: Film,
  Edited: CheckCircle,
  Posted: Send,
};

const STAGE_COLORS: Record<Stage, string> = {
  Idea: "var(--text-subtle)",
  Script: "var(--status-warning)",
  Filmed: "var(--accent)",
  Edited: "var(--status-success)",
  Posted: "var(--status-success)",
};

const STAGES: Stage[] = ["Idea", "Script", "Filmed", "Edited", "Posted"];

export default function ContentPage() {
  const posted = CONTENT_PIPELINE.filter((c) => c.stage === "Posted").length;
  const inPipeline = CONTENT_PIPELINE.filter((c) => c.stage !== "Posted").length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Pipeline"
        title="Content"
        subtitle="Content pipeline and publishing calendar"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="In Pipeline" value={inPipeline} />
          <KPICard label="Posted This Week" value={posted} delta="+2 vs last" />
          <KPICard label="Platforms" value={3} />
          <KPICard label="Weekly Target" value="3 pieces" tone="warning" delta="67% hit" />
        </div>

        <GlassCard header={{ icon: FileVideo, title: "Content Pipeline" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Title", "Platform", "Stage", "Priority"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONTENT_PIPELINE.map((item, i) => {
                  const Icon = STAGE_ICONS[item.stage];
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          i < CONTENT_PIPELINE.length - 1
                            ? "1px solid var(--border-subtle)"
                            : undefined,
                      }}
                    >
                      <td className="py-2.5 px-3">
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                          {item.title}
                        </p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                          }}
                        >
                          {item.platform}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} style={{ color: STAGE_COLORS[item.stage] }} />
                          <span
                            className="text-xs"
                            style={{ color: STAGE_COLORS[item.stage] }}
                          >
                            {item.stage}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded capitalize"
                          style={{
                            background:
                              item.priority === "high"
                                ? "var(--status-danger-bg)"
                                : item.priority === "medium"
                                  ? "var(--status-warning-bg)"
                                  : "var(--bg-glass-subtle)",
                            color:
                              item.priority === "high"
                                ? "var(--status-danger)"
                                : item.priority === "medium"
                                  ? "var(--status-warning)"
                                  : "var(--text-subtle)",
                          }}
                        >
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard header={{ icon: FileVideo, title: "Pipeline Funnel" }}>
          <div className="flex items-end gap-3 h-24">
            {STAGES.map((stage) => {
              const count = CONTENT_PIPELINE.filter((c) => c.stage === stage).length;
              const maxCount = Math.max(
                ...STAGES.map((s) => CONTENT_PIPELINE.filter((c) => c.stage === s).length),
                1,
              );
              const heightPct = (count / maxCount) * 100;
              return (
                <div key={stage} className="flex-1 flex flex-col items-center justify-end gap-1.5">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {count}
                  </span>
                  <div
                    className="w-full rounded-t-lg"
                    style={{
                      height: `${Math.max(heightPct, 10)}%`,
                      background: STAGE_COLORS[stage],
                      opacity: 0.6,
                    }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
