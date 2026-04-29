import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { GlassCard } from "@/components/primitives/glass-card";
import { getTodayTasks, getAllTasks } from "@/lib/db";

const WEEK_DAYS_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--status-danger)",
  high: "var(--status-warning)",
  medium: "var(--accent)",
  low: "var(--status-success)",
};

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export default async function CalendarPage() {
  const [todayTasks, allTasks] = await Promise.all([
    getTodayTasks(),
    getAllTasks(),
  ]);

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);

  const todayLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`Week ${getISOWeek(now)}`}
        title="Calendar"
        subtitle={`Week of ${weekLabel}`}
        actions={
          <div className="flex items-center gap-2">
            <button
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

        <GlassCard header={{ icon: Calendar, title: `Today — ${todayLabel}` }}>
          {todayTasks.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No tasks scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    background: "var(--bg-glass-subtle)",
                    border: "1px solid var(--border-subtle)",
                    opacity: task.done ? 0.6 : 1,
                  }}
                >
                  <div
                    className="w-1 rounded-full flex-shrink-0"
                    style={{
                      height: 36,
                      background: PRIORITY_COLORS[task.priority] ?? "var(--text-subtle)",
                    }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: "var(--text-primary)",
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
                {WEEK_DAYS_HEADERS.map((day, i) => {
                  const d = new Date(weekStart);
                  d.setDate(weekStart.getDate() + i);
                  return (
                    <div
                      key={day}
                      className="p-2 text-center text-xs font-semibold"
                      style={{
                        color: i === dayOfWeek ? "var(--accent)" : "var(--text-muted)",
                        borderLeft: "1px solid var(--border-subtle)",
                      }}
                    >
                      {day}
                      <div
                        className="text-lg font-medium mt-0.5"
                        style={{ color: i === dayOfWeek ? "var(--accent)" : "var(--text-primary)" }}
                      >
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
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
                    const d = new Date(weekStart);
                    d.setDate(weekStart.getDate() + di);
                    const dateStr = d.toISOString().slice(0, 10);
                    const dayTasks = hour === 9 ? allTasks.filter((t) => t.due_date === dateStr) : [];
                    return (
                      <div
                        key={di}
                        className="relative p-1"
                        style={{ borderLeft: "1px solid var(--border-subtle)" }}
                      >
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-lg px-2 py-1.5 text-xs font-medium mb-1"
                            style={{
                              background: `color-mix(in srgb, ${PRIORITY_COLORS[t.priority] ?? "var(--text-subtle)"} 12%, transparent)`,
                              borderLeft: `2px solid ${PRIORITY_COLORS[t.priority] ?? "var(--text-subtle)"}`,
                              color: PRIORITY_COLORS[t.priority] ?? "var(--text-subtle)",
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
