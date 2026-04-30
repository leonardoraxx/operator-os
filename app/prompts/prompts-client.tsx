"use client";

import { useState, useTransition } from "react";
import {
  Library, Plus, Copy, Check, Star, Clock, ChevronRight,
  AlertCircle, X, Loader2, Pencil,
} from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { KPICard } from "@/components/primitives/kpi-card";
import { createPrompt, logPromptUsage, updatePrompt } from "./prompt-actions";
import type { CreatePromptInput } from "./prompt-actions";
import type { PromptEntry } from "@/lib/db";

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  "content":    "var(--accent)",
  "business":   "var(--status-warning)",
  "coding":     "#34d399",
  "research":   "#a78bfa",
  "sales":      "#f472b6",
  "fitness":    "#fb923c",
  "finance":    "#facc15",
  "operations": "#60a5fa",
  "personal":   "var(--text-muted)",
};

const CATEGORY_BG: Record<string, string> = {
  "content":    "var(--accent-soft)",
  "business":   "var(--status-warning-bg)",
  "coding":     "color-mix(in srgb, #34d399 15%, transparent)",
  "research":   "color-mix(in srgb, #a78bfa 15%, transparent)",
  "sales":      "color-mix(in srgb, #f472b6 15%, transparent)",
  "fitness":    "color-mix(in srgb, #fb923c 15%, transparent)",
  "finance":    "color-mix(in srgb, #facc15 15%, transparent)",
  "operations": "color-mix(in srgb, #60a5fa 15%, transparent)",
  "personal":   "var(--bg-glass-subtle)",
};

const PRESET_CATEGORIES = [
  "content", "business", "coding", "research",
  "sales", "fitness", "finance", "operations", "personal",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function catBadge(category: string) {
  const key = category.toLowerCase();
  return (
    <span
      className="text-tiny px-2 py-0.5 rounded-full font-medium"
      style={{
        background: CATEGORY_BG[key]    ?? "var(--bg-glass-subtle)",
        color:      CATEGORY_COLOR[key] ?? "var(--text-muted)",
      }}
    >
      {category}
    </span>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  interactive = false,
}: {
  value:        number | null;
  onChange?:    (v: number) => void;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover ?? value ?? 0) >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(null)}
            className="outline-none"
            style={{ cursor: interactive ? "pointer" : "default" }}
            disabled={!interactive}
          >
            <Star
              size={12}
              style={{
                color: filled ? "#facc15" : "var(--border-default)",
                fill:  filled ? "#facc15" : "none",
                transition: "color var(--motion-fast), fill var(--motion-fast)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none flex-shrink-0"
      style={{
        background: copied ? "var(--status-success-bg)" : "var(--bg-glass-subtle)",
        color:      copied ? "var(--status-success)"    : "var(--text-secondary)",
        border:     "1px solid var(--border-default)",
        transition: "background var(--motion-fast), color var(--motion-fast)",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ── Add / Edit Prompt Dialog ──────────────────────────────────────────────────

function PromptDialog({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode:    "add" | "edit";
  initial?: PromptEntry;
  onClose: () => void;
  onSave:  (entry: PromptEntry) => void;
}) {
  const [promptName, setPromptName] = useState(initial?.promptName ?? "");
  const [category,   setCategory]   = useState(initial?.category   ?? "content");
  const [customCat,  setCustomCat]  = useState(
    initial?.category && !PRESET_CATEGORIES.includes(initial.category.toLowerCase()) ? initial.category : ""
  );
  const [promptText, setPromptText] = useState(initial?.promptText ?? "");
  const [usedFor,    setUsedFor]    = useState(initial?.usedFor    ?? "");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const effectiveCategory = customCat.trim() || category;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promptName.trim() || !promptText.trim()) return;
    setSaving(true);
    setError(null);

    if (mode === "add") {
      const input: CreatePromptInput = {
        promptName, category: effectiveCategory, promptText, usedFor,
      };
      const result = await createPrompt(input);
      if (!result.success || !result.id) {
        setError(result.error ?? "Failed to create");
        setSaving(false);
        return;
      }
      onSave({
        id:            result.id,
        promptName:    promptName.trim(),
        category:      effectiveCategory,
        promptText:    promptText.trim(),
        usedFor:       usedFor.trim(),
        lastUsed:      null,
        successRating: null,
        createdAt:     new Date().toISOString(),
      });
    } else {
      const result = await updatePrompt(
        initial!.id, promptName, promptText, usedFor, effectiveCategory
      );
      if (!result.success) {
        setError(result.error ?? "Save failed");
        setSaving(false);
        return;
      }
      onSave({
        ...initial!,
        promptName:    promptName.trim(),
        category:      effectiveCategory,
        promptText:    promptText.trim(),
        usedFor:       usedFor.trim(),
      });
    }

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
        className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-glass-elevated)",
          border:     "1px solid var(--border-default)",
          boxShadow:  "var(--shadow-elevated)",
          maxHeight:  "92vh",
          overflowY:  "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {mode === "add" ? "Add Prompt" : "Edit Prompt"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 outline-none" style={{ color: "var(--text-subtle)" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
              placeholder="e.g. Hook Generator, Cold Email, Daily Plan..."
              required
              style={inputStyle}
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setCustomCat(""); }}
                style={inputStyle}
              >
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
                <option value="custom">Custom…</option>
              </select>
            </div>
            {(category === "custom" || customCat) && (
              <div>
                <label style={labelStyle}>Custom Category</label>
                <input
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                  placeholder="e.g. trading"
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* Use case */}
          <div>
            <label style={labelStyle}>Use Case</label>
            <input
              value={usedFor}
              onChange={(e) => setUsedFor(e.target.value)}
              placeholder="When do you reach for this prompt?"
              style={inputStyle}
            />
          </div>

          {/* Prompt text */}
          <div>
            <label style={labelStyle}>Prompt Text *</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Paste the full prompt here..."
              rows={7}
              required
              style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-geist-mono), monospace", lineHeight: 1.6 }}
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
            <button type="submit" disabled={saving || !promptName.trim() || !promptText.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold outline-none"
              style={{
                background: "var(--accent)", color: "white",
                opacity:    !promptName.trim() || !promptText.trim() ? 0.5 : 1,
                cursor:     saving || !promptName.trim() || !promptText.trim() ? "not-allowed" : "pointer",
              }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Saving..." : mode === "add" ? "Add Prompt" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Log Usage Dialog ──────────────────────────────────────────────────────────

function LogUsageDialog({
  entry,
  onClose,
  onSave,
}: {
  entry:   PromptEntry;
  onClose: () => void;
  onSave:  (id: string, rating: number) => void;
}) {
  const [rating, setRating] = useState<number>(entry.successRating ?? 0);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setSaving(true);
    setError(null);

    const result = await logPromptUsage(entry.id, rating);
    if (!result.success) {
      setError(result.error ?? "Save failed");
      setSaving(false);
      return;
    }
    onSave(entry.id, rating);
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
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
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Log Usage</h2>
            <p className="text-tiny mt-0.5" style={{ color: "var(--text-muted)", maxWidth: 260 }}
               title={entry.promptName}>{entry.promptName}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 outline-none" style={{ color: "var(--text-subtle)" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-tiny font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              HOW WELL DID IT WORK?
            </p>
            <div className="flex items-center justify-center gap-3">
              <StarRating value={rating} onChange={setRating} interactive />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)", minWidth: 24 }}>
                {rating > 0 ? `${rating}/5` : "—"}
              </span>
            </div>
            <div className="flex justify-between mt-2 px-1">
              {["Didn't work", "", "OK", "", "Perfect"].map((label, i) => (
                <span key={i} className="text-tiny" style={{ color: "var(--text-subtle)", opacity: label ? 1 : 0 }}>
                  {label}
                </span>
              ))}
            </div>
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
            <button type="submit" disabled={saving || !rating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold outline-none"
              style={{
                background: "var(--accent)", color: "white",
                opacity:    !rating ? 0.5 : 1,
                cursor:     saving || !rating ? "not-allowed" : "pointer",
              }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Logging…" : "Log Usage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Prompt Card ───────────────────────────────────────────────────────────────

function PromptCard({
  entry,
  onEdit,
  onLogUsage,
}: {
  entry:      PromptEntry;
  onEdit:     (e: PromptEntry) => void;
  onLogUsage: (e: PromptEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LENGTH = 120;
  const isLong = entry.promptText.length > PREVIEW_LENGTH;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border:         "1px solid var(--border-subtle)",
        background:     "var(--bg-glass)",
        backdropFilter: "blur(var(--glass-blur))",
        transition:     "border-color var(--motion-fast)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Left: name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {entry.promptName}
            </p>
            {catBadge(entry.category)}
          </div>

          {/* Use case */}
          {entry.usedFor && (
            <p className="text-tiny mt-0.5" style={{ color: "var(--text-muted)" }}>
              {entry.usedFor}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {entry.successRating != null && (
              <StarRating value={entry.successRating} />
            )}
            <span className="flex items-center gap-1 text-tiny" style={{ color: "var(--text-subtle)" }}>
              <Clock size={10} />
              {formatDate(entry.lastUsed)}
            </span>
          </div>

          {/* Prompt preview */}
          <p
            className="text-tiny mt-1.5 leading-relaxed"
            style={{
              color:      "var(--text-subtle)",
              fontFamily: "var(--font-geist-mono), monospace",
              whiteSpace: "pre-wrap",
              wordBreak:  "break-word",
            }}
          >
            {expanded || !isLong
              ? entry.promptText
              : entry.promptText.slice(0, PREVIEW_LENGTH) + "…"}
          </p>

          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-tiny mt-0.5 outline-none"
              style={{ color: "var(--accent)" }}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Right: expand icon */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 p-1 rounded-md outline-none"
          style={{ color: "var(--text-subtle)" }}
        >
          <ChevronRight
            size={14}
            style={{
              transform:  expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform var(--motion-fast)",
            }}
          />
        </button>
      </div>

      {/* Expanded action bar */}
      {expanded && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 flex-wrap"
          style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-glass-subtle)" }}
        >
          <CopyButton text={entry.promptText} label="Copy Prompt" />

          <button
            onClick={() => onLogUsage(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
            style={{
              background: "var(--bg-glass-subtle)",
              color:      "var(--text-secondary)",
              border:     "1px solid var(--border-default)",
            }}
          >
            <Star size={12} />
            Log Usage
          </button>

          <button
            onClick={() => onEdit(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
            style={{
              background: "var(--bg-glass-subtle)",
              color:      "var(--text-secondary)",
              border:     "1px solid var(--border-default)",
            }}
          >
            <Pencil size={12} />
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────

interface Props {
  initialEntries: PromptEntry[];
}

export function PromptsClient({ initialEntries }: Props) {
  const [entries,    setEntries]    = useState<PromptEntry[]>(initialEntries);
  const [filter,     setFilter]     = useState<string>("all");
  const [search,     setSearch]     = useState("");
  const [addOpen,    setAddOpen]    = useState(false);
  const [editEntry,  setEditEntry]  = useState<PromptEntry | null>(null);
  const [logEntry,   setLogEntry]   = useState<PromptEntry | null>(null);
  const [,           startTransition] = useTransition();

  // ── Computed ──
  const categories = Array.from(new Set(entries.map((e) => e.category).filter(Boolean))).sort();
  const totalCount = entries.length;
  const ratedCount = entries.filter((e) => e.successRating != null).length;
  const avgRating  = ratedCount > 0
    ? (entries.reduce((s, e) => s + (e.successRating ?? 0), 0) / ratedCount).toFixed(1)
    : "—";
  const usedCount  = entries.filter((e) => e.lastUsed).length;

  // Filter + search
  const visible = entries.filter((e) => {
    const matchCat  = filter === "all" || e.category.toLowerCase() === filter.toLowerCase();
    const q         = search.toLowerCase();
    const matchSearch = !q
      || e.promptName.toLowerCase().includes(q)
      || e.category.toLowerCase().includes(q)
      || e.usedFor.toLowerCase().includes(q)
      || e.promptText.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // ── Handlers ──

  function handleAdd(entry: PromptEntry) {
    setEntries((cur) => [entry, ...cur]);
  }

  function handleEditSave(entry: PromptEntry) {
    setEntries((cur) => cur.map((e) => e.id === entry.id ? entry : e));
  }

  function handleLogSave(id: string, rating: number) {
    setEntries((cur) =>
      cur.map((e) =>
        e.id === id
          ? { ...e, successRating: rating, lastUsed: new Date().toISOString() }
          : e
      )
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Claude · Homebase OS"
        title="Prompt Library"
        subtitle="Reusable prompts for Claude, ChatGPT, and every AI workflow"
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Prompts" value={totalCount} />
        <KPICard label="Avg Rating" value={avgRating} tone={Number(avgRating) >= 4 ? "success" : "neutral"} />
        <KPICard
          label="Used At Least Once"
          value={usedCount}
          tone={usedCount > 0 ? "success" : "neutral"}
          delta={totalCount > 0 ? `${Math.round((usedCount / totalCount) * 100)}%` : undefined}
        />
        <KPICard label="Categories" value={categories.length} />
      </div>

      {/* Main card */}
      <GlassCard
        padding="none"
        header={{
          icon:  Library,
          title: "Prompt Library",
          pill:  {
            label: `${totalCount} prompt${totalCount !== 1 ? "s" : ""}`,
            color: totalCount > 0 ? "gold" : "neutral",
          },
          rightSlot: (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold outline-none flex-shrink-0"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <Plus size={12} />
              Add
            </button>
          ),
          showMenu: false,
        }}
      >
        {/* Search + category filter */}
        <div
          className="px-4 py-3 space-y-2"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {/* Search bar */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts, categories, use cases..."
            style={{
              background:   "var(--bg-glass-subtle)",
              border:       "1px solid var(--border-default)",
              borderRadius: 8,
              color:        "var(--text-primary)",
              padding:      "7px 12px",
              fontSize:     13,
              width:        "100%",
              outline:      "none",
            }}
          />

          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <button
              onClick={() => setFilter("all")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium outline-none flex-shrink-0"
              style={{
                background: filter === "all" ? "var(--accent-soft)" : "transparent",
                color:      filter === "all" ? "var(--accent)"      : "var(--text-muted)",
              }}
            >
              All
              <span
                className="text-tiny tabular-nums px-1 py-0.5 rounded-full"
                style={{
                  background: filter === "all" ? "var(--accent)" : "var(--bg-glass-subtle)",
                  color:      filter === "all" ? "white"         : "var(--text-subtle)",
                  minWidth:   16,
                  textAlign:  "center",
                }}
              >
                {totalCount}
              </span>
            </button>

            {categories.map((cat) => {
              const count  = entries.filter((e) => e.category.toLowerCase() === cat.toLowerCase()).length;
              const active = filter.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium outline-none flex-shrink-0"
                  style={{
                    background: active ? "var(--accent-soft)" : "transparent",
                    color:      active ? "var(--accent)"      : "var(--text-muted)",
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
        </div>

        {/* List */}
        <div className="p-3">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Library size={24} style={{ color: "var(--text-subtle)", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {search
                  ? `No prompts match "${search}".`
                  : filter === "all"
                    ? "No prompts yet — add your first."
                    : `No prompts in "${filter}".`}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-tiny outline-none"
                  style={{ color: "var(--accent)" }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((entry) => (
                <PromptCard
                  key={entry.id}
                  entry={entry}
                  onEdit={setEditEntry}
                  onLogUsage={setLogEntry}
                />
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Dialogs */}
      {addOpen && (
        <PromptDialog
          mode="add"
          onClose={() => setAddOpen(false)}
          onSave={(e) => { handleAdd(e); }}
        />
      )}
      {editEntry && (
        <PromptDialog
          mode="edit"
          initial={editEntry}
          onClose={() => setEditEntry(null)}
          onSave={(e) => { handleEditSave(e); setEditEntry(null); }}
        />
      )}
      {logEntry && (
        <LogUsageDialog
          entry={logEntry}
          onClose={() => setLogEntry(null)}
          onSave={handleLogSave}
        />
      )}
    </PageContainer>
  );
}
