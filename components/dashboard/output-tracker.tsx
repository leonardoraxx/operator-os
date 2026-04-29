"use client";

import { Zap, Video, Mail, CheckSquare, MessageSquare, Phone, FileText } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { OUTPUT_ITEMS } from "@/data/dashboard";
import { formatRelative } from "@/lib/format";
import type { OutputItem } from "@/data/types";
import type { DataListItem } from "@/components/primitives/data-list";

const TYPE_ICONS: Record<OutputItem["type"], typeof Video> = {
  video: Video,
  post: MessageSquare,
  email: Mail,
  call: Phone,
  task: CheckSquare,
  doc: FileText,
};

export function OutputTracker() {
  const items: DataListItem[] = OUTPUT_ITEMS.map((item) => ({
    id: item.id,
    icon: TYPE_ICONS[item.type],
    iconColor: "var(--text-secondary)",
    title: item.title,
    meta: item.platform,
    trailing: (
      <span
        className="text-tiny tabular-nums flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {formatRelative(item.timestamp)}
      </span>
    ),
  }));

  return (
    <ListSection
      title="Output Tracker"
      icon={Zap}
      pill={{ label: `${OUTPUT_ITEMS.length} today`, color: "neutral" }}
      items={items}
      footer="View all output →"
    />
  );
}
