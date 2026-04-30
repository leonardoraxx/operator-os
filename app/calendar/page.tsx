export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { getTodayTasks, getAllTasks } from "@/lib/db";
import { CalendarNav } from "./calendar-nav";

const WEEK_DAYS_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--status-danger)",
  high:     "var(--status-warning)",
  medium:   "var(--accent)",
  low:      "var(--status-success)",
};

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(
    ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
  );
}

interface PageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params     = await searchParams;
  const weekOffset = parseInt(params.week ?? "0", 10) || 0;

  const [todayTasks, allTasks] = await Promise.all([
    getTodayTasks(),
    getAllTasks(),
  ]);

  const now = new Date();

  // Compute the viewed week start (Monday)
  const viewedDate = new Date(now.getTime() + weekOffset * 7 * 86400000);
  const dayOfWeek  = (viewedDate.getDay() + 6) % 7;   // Mon=0 … Sun=6
  const weekStart  = new Date(viewedDate);
  weekStart.setDate(viewedDate.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // Today's day-of-week index (for highlighting) — only relevant when viewing current week
  const todayDow     = (now.getDay() + 6) % 7;
  const todayDateStr = now.toISOString().slice(0, 10);
  const isThisWeek   = weekOffset === 0;

  const weekEnd   = new Date(weekStart.getTime() + 6 * 86400000);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  const todayLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`Week ${getISOWeek(viewedDate)}${weekOffset !== 0 ? (weekOffset < 0 ? ` (${Math.abs(weekOffset)}w ago)` : ` (+${weekOffset}w)`) : ""}`}
        title="Calendar"
        subtitle={`Week of ${weekLabel}`}
        actions={
          <Suspense fallback={null}>
            <CalendarNav weekLabel={weekLabel} />
          </Suspense>
        }
      />

      <div className="space-y-4">
        {/* Today's tasks — only on current week */}
        {isThisWeek && (
          <GlassCard header={{ icon: Calendar, title: `Today — ${todayLabel}` }}>
            {todayTasks.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No tasks scheduled for today.
              </p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{
                      background: "var(--bg-glass-subtle)",
                      border:     "1px solid var(--border-subtle)",
                      opacity:    task.done ? 0.6 : 1,
                    }}
                  >
                    <div
                      className="w-1 rounded-full flex-shrink-0"
                      style={{
                        height:     36,
                        background: PRIORITY_COLORS[task.priority] ?? "var(--text-subtle)",
                      }}
                    />
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{
                          color:          "var(--text-primary)",
                          textDecoration: task.done ? "line-through" : undefined,
                        }}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                        {task.category} · {task.priority}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Week grid */}
        <GlassCard header={{ icon: Calendar, title: `Week View — ${weekLabel}` }} padding="none">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div
                className="grid border-b"
                style={{
                  gridTemplateColumns: "60px repeat(7, 1fr)",
                  borderColor:         "var(--border-subtle)",
                }}
              >
                <div className="p-2" />
                {WEEK_DAYS_HEADERS.map((day, i) => {
                  const d = new Date(weekStart);
                  d.setDate(weekStart.getDate() + i);
                  const isToday = isThisWeek && i === todayDow;
                  const dateStr = d.toISOString().slice(0, 10);
                  const hasTasks = allTasks.some((t) => t.due_date === dateStr);

                  return (
                    <div
                      key={day}
                      className="p-2 text-center text-xs font-semibold"
                      style={{
                        color:       isToday ? "var(--accent)" : "var(--text-muted)",
                        borderLeft:  "1px solid var(--border-subtle)",
                        background:  isToday ? "color-mix(in srgb, var(--accent) 4%, transparent)" : undefined,
                      }}
                    >
                      {day}
                      <div
                        className="text-lg font-medium mt-0.5"
                        style={{ color: isToday ? "var(--accent)" : "var(--text-primary)" }}
                      >
                        {d.getDate()}
                      </div>
                      {hasTasks && (
                        <div
                          className="w-1 h-1 rounded-full mx-auto mt-0.5"
                          style={{ background: isToday ? "var(--accent)" : "var(--text-subtle)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Hour rows */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid"
                  style={{
                    gridTemplateColumns: "60px repeat(7, 1fr)",
                    borderBottom:        "1px solid var(--border-subtle)",
                    minHeight:           48,
                  }}
                >
                  <div
                    className="p-2 text-xs text-right pr-3"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {hour}:00
                  </div>
                  {WEEK_DAYS_HEADERS.map((_, di) => {
                    const d = new Date(weekStart);
                    d.setDate(weekStart.getDate() + di);
                    const dateStr  = d.toISOString().slice(0, 10);
                    // Place all tasks for the day at 9:00
                    const dayTasks = hour === 9 ? allTasks.filter((t) => t.due_date === dateStr) : [];
                    const isToday  = isThisWeek && di === todayDow;

                    return (
                      <div
                        key={di}
                        className="relative p-1"
                        style={{
                          borderLeft: "1px solid var(--border-subtle)",
                          background: isToday
                            ? "color-mix(in srgb, var(--accent) 2%, transparent)"
                            : undefined,
                        }}
                      >
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-lg px-2 py-1.5 text-xs font-medium mb-1"
                            style={{
                              background:  `color-mix(in srgb, ${PRIORITY_COLORS[t.priority] ?? "var(--text-subtle)"} 12%, transparent)`,
                              borderLeft:  `2px solid ${PRIORITY_COLORS[t.priority] ?? "var(--text-subtle)"}`,
                              color:       PRIORITY_COLORS[t.priority] ?? "var(--text-subtle)",
                              opacity:     t.done ? 0.5 : 1,
                              textDecoration: t.done ? "line-through" : undefined,
                            }}
                          >
                            {t.title}
                          </div>
                        ))}
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
