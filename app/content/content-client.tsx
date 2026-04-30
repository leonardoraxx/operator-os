"use client";

import { useState, useTransition } from "react";
import {
  FileVideo, Plus, ChevronRight, Eye, BookOpen,
  CheckCircle2, Circle, Loader2, AlertCircle, X, Check,
} from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { KPICard } from "@/components/primitives/kpi-card";
import {
  createContentItem,
  advanceContentStage,
  updateContentPerformance,
} from "./content-actions";
import type { ScriptStatus, Platform, VideoType } from "./content-actions";
import type { ContentPipelineItem } from "@/lib/db";

// ── Stage config ──────────────────────────────────────────────────────────────

const STAGES: { key: ScriptStatus | "all"; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "idea",     label: "Idea"     },
  { key: "scripted", label: "Scripted" },
  { key: "filmed",   label: "Filmed"   },
  { key: "edited",   label: "Edited"   },
  { key: "posted",   label: "Posted"   },
];

const STAGE_COLOR: Record<string, string> = {
  idea:     "var(--text-muted)",
  scripted: "var(--accent)",
  filmed:   "var(--status-warning)",
  edited:   "#a78bfa",
  posted:   "var(--status-success)",
};

const STAGE_BG: Record<string, string> = {
  idea:     "var(--bg-glass-subtle)",
  scripted: "var(--accent-soft)",
  filmed:   "var(--status-warning-bg)",
  edited:   "color-mix(in srgb, #a78bfa 15%, transparent)",
  posted:   "var(--status-success-bg)",
};

const PLATFORM_COLOR: Record<string, string> = {
  youtube:   "#ff4444",
  tiktok:    "#69C9D0",
  instagram: "#C13584",
  whop:      "var(--accent)",
  other:     "var(--text-muted)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function stageBadge(status: string) {
  return (
    <span
      className="text-tiny px-2 py-0.5 rounded-full font-medium"
      style={{
        background: STAGE_BG[status]    ?? "var(--bg-glass-subtle)",
        color:      STAGE_COLOR[status] ?? "var(--text-muted)",
      }}
    >
      {status}
    </span>
  );
}

function platformBadge(platform: string) {
  return (
    <span
      className="text-tiny px-2 py-0.5 rounded-full font-medium"
      style={{
        background: "var(--bg-glass-subtle)",
        color:      PLATFORM_COLOR[platform] ?? "var(--text-muted)",
        border:     `1px solid color-mix(in srgb, ${PLATFORM_COLOR[platform] ?? "var(--text-muted)"} 25%, transparent)`,
      }}
    >
      {platform}
    </span>
  );
}

function avgViews(items: ContentPipelineItem[]): number {
  const posted = items.filter((i) => i.posted && i.views > 0);
  if (!posted.length) return 0;
  return Math.round(posted.reduce((s, i) => s + i.views, 0) / posted.length);
}

// ── Add Content Dialog ────────────────────────────────────────────────────────

function AddDialog({
  open,
  onClose,
  onAdd,
}: {
  open:    boolean;
  onClose: () => void;
  onAdd:   (item: ContentPipelineItem) => void;
}) {
  const [idea,      setIdea]      = useState("");
  const [hook,      setHook]      = useState("");
  const [platform,  setPlatform]  = useState<Platform>("youtube");
  const [videoType, setVideoType] = useState<VideoType>("short");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim() || !hook.trim()) return;
    setSaving(true);
    setError(null);

    const result = await createContentItem({ idea, hook, platform, videoType });
    if (!result.success || !result.id) {
      setError(result.error ?? "Failed to create");
      setSaving(false);
      return;
    }

    // Build optimistic item
    const optimistic: ContentPipelineItem = {
      id:           result.id,
      idea:         idea.trim(),
      hook:         hook.trim(),
      scriptStatus: "idea",
      videoType,
      platform,
      posted:       false,
      views:        0,
      lesson:       "",
      createdAt:    new Date().toISOString(),
    };
    onAdd(optimistic);

    // Reset
    setIdea(""); setHook(""); setPlatform("youtube"); setVideoType("short");
    setSaving(false);
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    background:  "var(--bg-glass-subtle)",
    border:      "1px solid var(--border-default)",
    borderRadius: 8,
    color:       "var(--text-primary)",
    padding:     "8px 12px",
    fontSize:    13,
    width:       "100%",
    outline:     "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color:    "var(--text-muted)",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display:  "block",
    marginBottom: 4,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          background:  "var(--bg-glass-elevated)",
          border:      "1px solid var(--border-default)",
          boxShadow:   "var(--shadow-elevated)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Add Content Idea
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 outline-none"
            style={{ color: "var(--text-subtle)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>Idea</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="What's the content about?"
              rows={2}
              required
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div>
            <label style={labelStyle}>Hook</label>
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Opening line / hook..."
              rows={2}
              required
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                style={inputStyle}
              >
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="whop">Whop</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Format</label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value as VideoType)}
                style={inputStyle}
              >
                <option value="short">Short</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
            >
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium outline-none"
              style={{
                background: "var(--bg-glass-subtle)",
                color:      "var(--text-secondary)",
                border:     "1px solid var(--border-default)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !idea.trim() || !hook.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold outline-none"
              style={{
                background: saving ? "var(--accent-soft)" : "var(--accent)",
                color:      "white",
                opacity:    !idea.trim() || !hook.trim() ? 0.5 : 1,
                cursor:     saving || !idea.trim() || !hook.trim() ? "not-allowed" : "pointer",
              }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? "Adding..." : "Add Idea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Performance Edit Dialog ───────────────────────────────────────────────────

function PerfDialog({
  item,
  onClose,
  onSave,
}: {
  item:    ContentPipelineItem;
  onClose: () => void;
  onSave:  (id: string, views: number, lesson: string) => void;
}) {
  const [views,  setViews]  = useState(String(item.views || ""));
  const [lesson, setLesson] = useState(item.lesson ?? "");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const v = parseInt(views, 10) || 0;
    const result = await updateContentPerformance(item.id, v, lesson);
    if (!result.success) {
      setError(result.error ?? "Save failed");
      setSaving(false);
      return;
    }
    onSave(item.id, v, lesson);
    setSaving(false);
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    background:   "var(--bg-glass-subtle)",
    border:       "1px solid var(--border-default)",
    borderRadius: 8,
    color:        "var(--text-primary)",
    padding:      "8px 12px",
    fontSize:     13,
    width:        "100%",
    outline:      "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize:      11,
    color:         "var(--text-muted)",
    fontWeight:    600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display:       "block",
    marginBottom:  4,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-glass-elevated)",
          border:     "1px solid var(--border-default)",
          boxShadow:  "var(--shadow-elevated)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Log Performance
            </h2>
            <p className="text-tiny mt-0.5 truncate" style={{ color: "var(--text-muted)", maxWidth: 280 }}>
              {item.idea}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 outline-none" style={{ color: "var(--text-subtle)" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>Views</label>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              placeholder="0"
              min={0}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Lesson Learned</label>
            <textarea
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="What worked? What flopped?"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}>
              <AlertCircle size={12} />{error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium outline-none"
              style={{ background: "var(--bg-glass-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold outline-none"
              style={{ background: "var(--accent)", color: "white", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Content Card ──────────────────────────────────────────────────────────────

function ContentCard({
  item,
  advancing,
  onAdvance,
  onLogPerf,
}: {
  item:       ContentPipelineItem;
  advancing:  string | null;
  onAdvance:  (id: string, currentStage: string) => void;
  onLogPerf:  (item: ContentPipelineItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPosted  = item.scriptStatus === "posted" || item.posted;
  const isLoading = advancing === item.id;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border:     "1px solid var(--border-subtle)",
        background: "var(--bg-glass)",
        backdropFilter: "blur(var(--glass-blur))",
        transition: "border-color var(--motion-fast)",
      }}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Stage icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isPosted
            ? <CheckCircle2 size={15} style={{ color: "var(--status-success)" }} />
            : <Circle       size={15} style={{ color: "var(--text-subtle)" }}    />}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {platformBadge(item.platform)}
            {item.videoType && (
              <span
                className="text-tiny px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--bg-glass-subtle)", color: "var(--text-subtle)" }}
              >
                {item.videoType}
              </span>
            )}
            {stageBadge(item.scriptStatus)}
          </div>

          {/* Idea */}
          <p
            className="text-[13px] font-medium leading-snug"
            style={{ color: isPosted ? "var(--text-muted)" : "var(--text-primary)" }}
          >
            {item.idea}
          </p>

          {/* Hook preview */}
          <p
            className={`text-tiny mt-0.5 leading-snug ${expanded ? "" : "truncate"}`}
            style={{ color: "var(--text-subtle)" }}
          >
            "{item.hook}"
          </p>

          {/* Views + lesson (if posted) */}
          {isPosted && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {item.views > 0 && (
                <span
                  className="flex items-center gap-1 text-tiny"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Eye size={10} />
                  {item.views.toLocaleString()} views
                </span>
              )}
              {item.lesson && (
                <span
                  className="flex items-center gap-1 text-tiny"
                  style={{ color: "var(--text-muted)" }}
                >
                  <BookOpen size={10} />
                  {expanded ? item.lesson : item.lesson.slice(0, 48) + (item.lesson.length > 48 ? "…" : "")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 p-1 rounded-md outline-none"
          style={{ color: "var(--text-subtle)" }}
        >
          <ChevronRight
            size={14}
            style={{
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform var(--motion-fast)",
            }}
          />
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {/* Full hook */}
          <div className="pt-3">
            <p className="text-tiny font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
              HOOK
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {item.hook}
            </p>
          </div>

          {/* Full lesson if exists */}
          {item.lesson && (
            <div>
              <p className="text-tiny font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                LESSON
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {item.lesson}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {/* Advance stage */}
            {!isPosted && (
              <button
                onClick={() => onAdvance(item.id, item.scriptStatus)}
                disabled={!!advancing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
                style={{
                  background: "var(--accent)",
                  color:      "white",
                  opacity:    advancing && advancing !== item.id ? 0.5 : 1,
                  cursor:     advancing ? "not-allowed" : "pointer",
                }}
              >
                {isLoading
                  ? <Loader2 size={12} className="animate-spin" />
                  : <ChevronRight size={12} />}
                {isLoading ? "Advancing…" : `→ ${nextStageName(item.scriptStatus)}`}
              </button>
            )}

            {/* Log performance */}
            {isPosted && (
              <button
                onClick={() => onLogPerf(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
                style={{
                  background: "var(--bg-glass-subtle)",
                  color:      "var(--text-secondary)",
                  border:     "1px solid var(--border-default)",
                }}
              >
                <Eye size={12} />
                Log Performance
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function nextStageName(current: string): string {
  const stages = ["idea", "scripted", "filmed", "edited", "posted"];
  const idx = stages.indexOf(current);
  return idx >= 0 && idx < stages.length - 1 ? stages[idx + 1] : "—";
}

// ── Main Client Component ─────────────────────────────────────────────────────

interface Props {
  initialItems: ContentPipelineItem[];
}

export function ContentClient({ initialItems }: Props) {
  const [items,     setItems]     = useState<ContentPipelineItem[]>(initialItems);
  const [filter,    setFilter]    = useState<string>("all");
  const [addOpen,   setAddOpen]   = useState(false);
  const [perfItem,  setPerfItem]  = useState<ContentPipelineItem | null>(null);
  const [advancing, setAdvancing] = useState<string | null>(null);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [,          startTransition] = useTransition();

  // ── Computed ──
  const totalCount  = items.length;
  const postedCount = items.filter((i) => i.posted || i.scriptStatus === "posted").length;
  const avgV        = avgViews(items);

  // Platform breakdown label (top platform)
  const platformCounts: Record<string, number> = {};
  for (const i of items) platformCounts[i.platform] = (platformCounts[i.platform] ?? 0) + 1;
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Filtered items
  const visible = filter === "all"
    ? items
    : items.filter((i) => i.scriptStatus === filter);

  // ── Handlers ──

  function handleAdd(item: ContentPipelineItem) {
    setItems((cur) => [item, ...cur]);
  }

  function handleAdvance(id: string, currentStage: string) {
    if (advancing) return;
    const prevStage = currentStage;
    setAdvancing(id);
    setErrors((e) => { const n = { ...e }; delete n[id]; return n; });

    startTransition(async () => {
      const result = await advanceContentStage(id, currentStage);
      if (!result.success) {
        setErrors((e) => ({ ...e, [id]: result.error ?? "Advance failed" }));
      } else {
        setItems((cur) =>
          cur.map((i) =>
            i.id === id
              ? {
                  ...i,
                  scriptStatus: result.newStage as ScriptStatus,
                  posted: result.newStage === "posted" ? true : i.posted,
                }
              : i
          )
        );
      }
      setAdvancing(null);
    });
  }

  function handlePerfSave(id: string, views: number, lesson: string) {
    setItems((cur) =>
      cur.map((i) => (i.id === id ? { ...i, views, lesson } : i))
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="VenHQ · Content"
        title="Content Pipeline"
        subtitle="Ideas → scripted → filmed → edited → posted"
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="In Pipeline" value={totalCount} />
        <KPICard
          label="Posted"
          value={postedCount}
          tone={postedCount > 0 ? "success" : "neutral"}
          delta={totalCount > 0 ? `${Math.round((postedCount / totalCount) * 100)}% rate` : undefined}
        />
        <KPICard
          label="Avg Views"
          value={avgV > 0 ? avgV.toLocaleString() : "—"}
          tone={avgV > 1000 ? "success" : "neutral"}
        />
        <KPICard
          label="Top Platform"
          value={topPlatform === "—" ? "—" : topPlatform.charAt(0).toUpperCase() + topPlatform.slice(1)}
        />
      </div>

      {/* Main card */}
      <GlassCard
        padding="none"
        header={{
          icon:      FileVideo,
          title:     "Content Pipeline",
          pill:      {
            label: `${totalCount} piece${totalCount !== 1 ? "s" : ""}`,
            color: totalCount > 0 ? "gold" : "neutral",
          },
          rightSlot: (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold outline-none flex-shrink-0"
              style={{
                background: "var(--accent)",
                color:      "white",
              }}
            >
              <Plus size={12} />
              Add
            </button>
          ),
          showMenu: false,
        }}
      >
        {/* Stage filter tabs */}
        <div
          className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {STAGES.map(({ key, label }) => {
            const count = key === "all"
              ? items.length
              : items.filter((i) => i.scriptStatus === key).length;
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium outline-none flex-shrink-0"
                style={{
                  background: active ? "var(--accent-soft)" : "transparent",
                  color:      active ? "var(--accent)"      : "var(--text-muted)",
                  transition: "background var(--motion-fast), color var(--motion-fast)",
                }}
              >
                {label}
                <span
                  className="text-tiny tabular-nums px-1 py-0.5 rounded-full"
                  style={{
                    background: active ? "var(--accent)" : "var(--bg-glass-subtle)",
                    color:      active ? "white"         : "var(--text-subtle)",
                    minWidth:   16,
                    textAlign:  "center",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Item list */}
        <div className="p-3">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <FileVideo size={24} style={{ color: "var(--text-subtle)", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {filter === "all" ? "No content yet — add your first idea." : `No content in "${filter}" stage.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  advancing={advancing}
                  onAdvance={handleAdvance}
                  onLogPerf={setPerfItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Global error strip */}
        {Object.entries(errors).length > 0 && (
          <div
            className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
          >
            <AlertCircle size={12} />
            {Object.values(errors)[0]}
          </div>
        )}
      </GlassCard>

      {/* Add Dialog */}
      <AddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      {/* Performance Dialog */}
      {perfItem && (
        <PerfDialog
          item={perfItem}
          onClose={() => setPerfItem(null)}
          onSave={handlePerfSave}
        />
      )}
    </PageContainer>
  );
}
