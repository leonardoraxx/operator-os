"use client";

import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { BarSpark } from "@/components/primitives/bar-spark";
import { LineSpark } from "@/components/primitives/line-spark";

const REVENUE_DATA = [
  { day: "Jan", amount: 480 },
  { day: "Feb", amount: 720 },
  { day: "Mar", amount: 1240 },
  { day: "Apr", amount: 1840 },
];

const OUTPUT_DATA = [8, 12, 9, 14, 11, 7, 13].map((y, x) => ({ x, y }));
const FOCUS_DATA = [65, 70, 68, 75, 72, 80, 78].map((y, x) => ({ x, y }));
const WEIGHT_DATA = [178.5, 179, 179.8, 180.2, 180.8, 181, 181.4].map((y, x) => ({ x, y }));

export default function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Last 7 days"
        title="Reports"
        subtitle="Performance metrics across all areas"
      />
      <div className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard header={{ icon: BarChart3, title: "Revenue MTD by Month" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-subtle)" }}>
              Combined across all income streams
            </p>
            <BarSpark data={REVENUE_DATA} height={120} />
          </GlassCard>

          <GlassCard header={{ icon: BarChart3, title: "Daily Output (Tasks/Day)" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-subtle)" }}>
              Last 7 days - target: 12+
            </p>
            <LineSpark data={OUTPUT_DATA} height={100} />
          </GlassCard>

          <GlassCard header={{ icon: BarChart3, title: "Focus Score Trend" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-subtle)" }}>
              Last 7 days - current: 78
            </p>
            <LineSpark data={FOCUS_DATA} height={100} />
          </GlassCard>

          <GlassCard header={{ icon: BarChart3, title: "Body Weight Trend (lbs)" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-subtle)" }}>
              Last 7 days - target: 196 lbs
            </p>
            <LineSpark data={WEIGHT_DATA} height={100} />
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
}
