"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { CALENDAR_TODAY } from "@/data/dashboard";

const WEEK_DAYS_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const WEEK_EVENTS = [
  { day: 0, hour: 9, title: "Deep Work - Suds outreach", duration: 2, color: "var(--accent)" },
  { day: 0, hour: 11, title: "VenHQ product call", duration: 1, color: "var(--status-warning)" },
  { day: 0, hour: 15, title: "Record YT long-form", duration: 2, color: "var(--status-danger)" },
  { day: 1, hour: 10, title: "Investor check-in", duration: 1, color: "var(--status-warning)" },
  { day: 2, hour: 9, title: "Deep Work block", duration: 2, color: "var(--accent)" },
  { day: 2, hour: 14, title: "Content batch", duration: 3, color: "var(--status-danger)" },
  { day: 4, hour: 9, title: "Weekly review", duration: 1, color: "var(--status-success)" },
];

const CATEGORY_COLORS: Record<string, string> = {
  business: "var(--accent)",
  health: "var(--status-success)",
  content: "var(--status-warning)",
};

export default function CalendarPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Week 17"
        title="Calendar"
        subtitle="Week of April 21–27, 2026"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => console.log("[Calendar] prev week")}
              className="p-1.5 rounded-lg"
              aria-label="Previous week"
              style={{
                background: "var(--bg-glass-subtle)",
                border: "1px solid var(--border-default)",
                color: "var(--text-muted)",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => console.log("[Calendar] next week")}
              className="p-1.5 rounded-lg"
              aria-label="Next week"
              style={{
                background: "var(--bg-glass-subtle)",
                border: "1px solid var(--border-default)",
                color: "var(--text-muted)",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        }
      />
      <div className="space-y-4">

        <GlassCard header={{ icon: Calendar, title: "Today - April 26" }}>
          <div className="space-y-2">
            {CALENDAR_TODAY.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: event.done ? "var(--bg-glass-subtle)" : "var(--bg-glass-subtle)",
                  border: "1px solid var(--border-subtle)",
                  opacity: event.done ? 0.6 : 1,
                }}
              >
                <div
                  className="w-1 rounded-full flex-shrink-0"
                  style={{
                    height: 36,
                    background: CATEGORY_COLORS[event.category] ?? "var(--text-subtle)",
                  }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: "var(--text-primary)",
                      textDecoration: event.done ? "line-through" : undefined,
                    }}
                  >
                    {event.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    {event.time} · {event.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard header={{ icon: Calendar, title: "Week View" }} padding="none">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div
                className="grid border-b"
                style={{
                  gridTemplateColumns: "60px repeat(7, 1fr)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="p-2" />
                {WEEK_DAYS_HEADERS.map((day, i) => (
                  <div
                    key={day}
                    className="p-2 text-center text-xs font-semibold"
                    style={{
                      color: i === 6 ? "var(--accent)" : "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                    }}
                  >
                    {day}
                    <div
                      className="text-lg font-medium mt-0.5"
                      style={{ color: i === 6 ? "var(--accent)" : "var(--text-primary)" }}
                    >
                      {21 + i}
                    </div>
                  </div>
                ))}
              </div>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid"
                  style={{
                    gridTemplateColumns: "60px repeat(7, 1fr)",
                    borderBottom: "1px solid var(--border-subtle)",
                    minHeight: 48,
                  }}
                >
                  <div
                    className="p-2 text-xs text-right pr-3"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {hour}:00
                  </div>
                  {WEEK_DAYS_HEADERS.map((_, di) => {
                    const evt = WEEK_EVENTS.find((e) => e.day === di && e.hour === hour);
                    return (
                      <div
                        key={di}
                        className="relative p-1"
                        style={{ borderLeft: "1px solid var(--border-subtle)" }}
                      >
                        {evt && (
                          <div
                            className="rounded-lg px-2 py-1.5 text-xs font-medium"
                            style={{
                              background: `color-mix(in srgb, ${evt.color} 12%, transparent)`,
                              borderLeft: `2px solid ${evt.color}`,
                              color: evt.color,
                            }}
                          >
                            {evt.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
