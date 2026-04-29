"use client";

import { Zap, Video, Mail, CheckSquare, MessageSquare, Phone, FileText, Activity } from "lucide-react";
import { ListSection } from "@/components/primitives/list-section";
import { formatRelative } from "@/lib/format";
import type { DataListItem } from "@/components/primitives/data-list";
import type { ActivityEntry } from "@/lib/db";

interface Props {
  activities: ActivityEntry[];
}

function iconForType(targetType: string | null) {
  switch (targetType) {
    case "video": return Video;
    case "post": return MessageSquare;
    case "email": return Mail;
    case "call": return Phone;
    case "task": return CheckSquare;
    case "doc": return FileText;
    default: return Activity;
  }
}

export function OutputTracker({ activities }: Props) {
  const items: DataListItem[] = activities.map((a) => ({
    id: a.id,
    icon: iconForType(a.target_type),
    iconColor: "var(--text-secondary)",
    title: a.detail?.title ?? a.action,
    meta: a.detail?.platform ?? a.actor,
    trailing: (
      <span
        className="text-tiny tabular-nums flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {formatRelative(a.created_at)}
      </span>
    ),
  }));

  return (
    <ListSection
      title="Output Tracker"
      icon={Zap}
      pill={{ label: `${activities.length} logged`, color: "neutral" }}
      items={items}
      footer="View all output →"
    />
  );
}
