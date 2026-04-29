import { FileVideo } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { KPICard } from "@/components/primitives/kpi-card";

export default function ContentPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Pipeline"
        title="Content"
        subtitle="Content pipeline and publishing calendar"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="In Pipeline" value="—" />
          <KPICard label="Posted This Week" value="—" />
          <KPICard label="Platforms" value="—" />
          <KPICard label="Weekly Target" value="—" />
        </div>

        <GlassCard header={{ icon: FileVideo, title: "Content Pipeline" }}>
          <div className="text-center py-10" style={{ color: "var(--text-subtle)" }}>
            <FileVideo size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No content pipeline connected</p>
            <p className="text-xs mt-1">Add a content_pipeline table to Supabase to track pieces here.</p>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
