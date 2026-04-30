"use client";

import { useState, useTransition } from "react";
import {
  Droplets, Plus, ChevronRight, Phone, Mail, Calendar,
  AlertCircle, X, Check, Loader2, StickyNote,
} from "lucide-react";
import { GlassCard } from "@/components/primitives/glass-card";
import { PageHeader } from "@/components/shell/page-header";
import { PageContainer } from "@/components/shell/page-container";
import { KPICard } from "@/components/primitives/kpi-card";
import { createLead, updateLeadStatus, updateLeadDetails } from "./leads-actions";
import type { LeadStatus } from "./leads-actions";
import type { Lead } from "@/lib/db";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUSES: { key: LeadStatus | "all"; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "new",       label: "New"       },
  { key: "contacted", label: "Contacted" },
  { key: "quoted",    label: "Quoted"    },
  { key: "won",       label: "Won"       },
  { key: "lost",      label: "Lost"      },
];

const STATUS_COLOR: Record<string, string> = {
  new:       "var(--accent)",
  contacted: "var(--status-warning)",
  quoted:    "#a78bfa",
  won:       "var(--status-success)",
  lost:      "var(--text-subtle)",
};

const STATUS_BG: Record<string, string> = {
  new:       "var(--accent-soft)",
  contacted: "var(--status-warning-bg)",
  quoted:    "color-mix(in srgb, #a78bfa 15%, transparent)",
  won:       "var(--status-success-bg)",
  lost:      "var(--bg-glass-subtle)",
};

const STATUS_NEXT: Record<string, LeadStatus | null> = {
  new:       "contacted",
  contacted: "quoted",
  quoted:    "won",
  won:       null,
  lost:      null,
};

const STATUS_NEXT_LABEL: Record<string, string> = {
  new:       "→ Contacted",
  contacted: "→ Quoted",
  quoted:    "→ Won",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  return (
    <span
      className="text-tiny px-2 py-0.5 rounded-full font-medium"
      style={{
        background: STATUS_BG[status]    ?? "var(--bg-glass-subtle)",
        color:      STATUS_COLOR[status] ?? "var(--text-muted)",
      }}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(followUpDate: string | null): boolean {
  if (!followUpDate) return false;
  return new Date(followUpDate) < new Date();
}

// ── Add Lead Dialog ───────────────────────────────────────────────────────────

const SOURCE_OPTIONS = [
  "pressure-wash",
  "soft-wash",
  "roof-wash",
  "driveway",
  "fleet",
  "commercial",
  "referral",
  "instagram",
  "door-to-door",
  "other",
];

function AddDialog({
  open,
  onClose,
  onAdd,
}: {
  open:    boolean;
  onClose: () => void;
  onAdd:   (lead: Lead) => void;
}) {
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [source,       setSource]       = useState("pressure-wash");
  const [status,       setStatus]       = useState<LeadStatus>("new");
  const [notes,        setNotes]        = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const result = await createLead({
      name, email, phone, source, status, notes,
      followUpDate: followUpDate || null,
    });

    if (!result.success || !result.id) {
      setError(result.error ?? "Failed to create lead");
      setSaving(false);
      return;
    }

    onAdd({
      id:           result.id,
      name:         name.trim(),
      email:        email.trim(),
      phone:        phone.trim(),
      source:       source,
      status:       status,
      notes:        notes.trim(),
      followUpDate: followUpDate || null,
      createdAt:    new Date().toISOString(),
    });

    // Reset
    setName(""); setEmail(""); setPhone(""); setSource("pressure-wash");
    setStatus("new"); setNotes(""); setFollowUpDate("");
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
          maxHeight:  "90vh",
          overflowY:  "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Add Lead
          </h2>
          <button onClick={onClose} className="rounded-md p-1 outline-none" style={{ color: "var(--text-subtle)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name or business"
              required
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Service / Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} style={inputStyle}>
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} style={inputStyle}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Address, job size, context..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
            >
              <AlertCircle size={12} />{error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium outline-none"
              style={{ background: "var(--bg-glass-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold outline-none"
              style={{
                background: "var(--accent)",
                color:      "white",
                opacity:    !name.trim() ? 0.5 : 1,
                cursor:     saving || !name.trim() ? "not-allowed" : "pointer",
              }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? "Adding..." : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Details Dialog ───────────────────────────────────────────────────────

function EditDialog({
  lead,
  onClose,
  onSave,
}: {
  lead:    Lead;
  onClose: () => void;
  onSave:  (id: string, notes: string, followUpDate: string | null) => void;
}) {
  const [notes,        setNotes]        = useState(lead.notes ?? "");
  const [followUpDate, setFollowUpDate] = useState(
    lead.followUpDate ? lead.followUpDate.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await updateLeadDetails(lead.id, notes, followUpDate || null);
    if (!result.success) {
      setError(result.error ?? "Save failed");
      setSaving(false);
      return;
    }
    onSave(lead.id, notes, followUpDate || null);
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
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Edit Lead</h2>
            <p className="text-tiny mt-0.5" style={{ color: "var(--text-muted)" }}>{lead.name}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 outline-none" style={{ color: "var(--text-subtle)" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Address, job size, context..."
              rows={4}
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

// ── Lead Card ─────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  advancing,
  onAdvance,
  onEdit,
  onMarkLost,
}: {
  lead:       Lead;
  advancing:  string | null;
  onAdvance:  (id: string, status: LeadStatus) => void;
  onEdit:     (lead: Lead) => void;
  onMarkLost: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = advancing === lead.id;
  const next      = STATUS_NEXT[lead.status] as LeadStatus | null;
  const overdue   = isOverdue(lead.followUpDate) && lead.status !== "won" && lead.status !== "lost";
  const isWon     = lead.status === "won";
  const isLost    = lead.status === "lost";
  const isClosed  = isWon || isLost;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border:     `1px solid ${isWon ? "color-mix(in srgb, var(--status-success) 30%, transparent)" : overdue ? "color-mix(in srgb, var(--status-warning) 35%, transparent)" : "var(--border-subtle)"}`,
        background: "var(--bg-glass)",
        backdropFilter: "blur(var(--glass-blur))",
        opacity:    isLost ? 0.6 : 1,
        transition: "border-color var(--motion-fast)",
      }}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Status dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: STATUS_COLOR[lead.status] ?? "var(--text-subtle)" }}
        />

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p
              className="text-[13px] font-semibold"
              style={{ color: isClosed ? "var(--text-muted)" : "var(--text-primary)" }}
            >
              {lead.name}
            </p>
            {statusBadge(lead.status)}
            {lead.source && (
              <span
                className="text-tiny px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--bg-glass-subtle)", color: "var(--text-subtle)" }}
              >
                {lead.source}
              </span>
            )}
          </div>

          {/* Contact row */}
          <div className="flex items-center gap-3 flex-wrap">
            {lead.email && (
              <span className="flex items-center gap-1 text-tiny" style={{ color: "var(--text-muted)" }}>
                <Mail size={10} />{lead.email}
              </span>
            )}
            {lead.phone && (
              <span className="flex items-center gap-1 text-tiny" style={{ color: "var(--text-muted)" }}>
                <Phone size={10} />{lead.phone}
              </span>
            )}
          </div>

          {/* Follow-up date */}
          {lead.followUpDate && (
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar size={10} style={{ color: overdue ? "var(--status-warning)" : "var(--text-subtle)", flexShrink: 0 }} />
              <span
                className="text-tiny"
                style={{ color: overdue ? "var(--status-warning)" : "var(--text-subtle)" }}
              >
                {overdue ? "Overdue · " : "Follow up · "}
                {formatDate(lead.followUpDate)}
              </span>
            </div>
          )}

          {/* Notes preview */}
          {lead.notes && !expanded && (
            <p
              className="text-tiny mt-0.5 truncate"
              style={{ color: "var(--text-subtle)" }}
            >
              {lead.notes}
            </p>
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
              transform:  expanded ? "rotate(90deg)" : "rotate(0deg)",
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
          {/* Full notes */}
          {lead.notes && (
            <div className="pt-3">
              <p className="text-tiny font-semibold mb-1" style={{ color: "var(--text-muted)" }}>NOTES</p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {lead.notes}
              </p>
            </div>
          )}

          {/* Added date */}
          {lead.createdAt && (
            <p className="text-tiny" style={{ color: "var(--text-subtle)" }}>
              Added {formatDate(lead.createdAt)}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {/* Advance status */}
            {next && (
              <button
                onClick={() => onAdvance(lead.id, next)}
                disabled={!!advancing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none"
                style={{
                  background: isLoading ? "var(--accent-soft)" : "var(--accent)",
                  color:      "white",
                  opacity:    advancing && advancing !== lead.id ? 0.5 : 1,
                  cursor:     advancing ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                {isLoading ? "Saving…" : STATUS_NEXT_LABEL[lead.status]}
              </button>
            )}

            {/* Edit notes/date */}
            <button
              onClick={() => onEdit(lead)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
              style={{
                background: "var(--bg-glass-subtle)",
                color:      "var(--text-secondary)",
                border:     "1px solid var(--border-default)",
              }}
            >
              <StickyNote size={12} />
              Edit Notes
            </button>

            {/* Mark lost */}
            {!isClosed && (
              <button
                onClick={() => onMarkLost(lead.id)}
                disabled={!!advancing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
                style={{
                  background: "transparent",
                  color:      "var(--status-danger)",
                  border:     "1px solid color-mix(in srgb, var(--status-danger) 30%, transparent)",
                  opacity:    advancing ? 0.5 : 1,
                  cursor:     advancing ? "not-allowed" : "pointer",
                }}
              >
                Mark Lost
              </button>
            )}

            {/* Re-open if lost */}
            {isLost && (
              <button
                onClick={() => onAdvance(lead.id, "new")}
                disabled={!!advancing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
                style={{
                  background: "var(--bg-glass-subtle)",
                  color:      "var(--text-secondary)",
                  border:     "1px solid var(--border-default)",
                }}
              >
                Re-open
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────

interface Props {
  initialLeads: Lead[];
}

export function LeadsClient({ initialLeads }: Props) {
  const [leads,     setLeads]     = useState<Lead[]>(initialLeads);
  const [filter,    setFilter]    = useState<string>("all");
  const [addOpen,   setAddOpen]   = useState(false);
  const [editLead,  setEditLead]  = useState<Lead | null>(null);
  const [advancing, setAdvancing] = useState<string | null>(null);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [,          startTransition] = useTransition();

  // ── Computed ──
  const totalCount  = leads.length;
  const wonCount    = leads.filter((l) => l.status === "won").length;
  const newCount    = leads.filter((l) => l.status === "new").length;
  const overdueCount = leads.filter(
    (l) => isOverdue(l.followUpDate) && l.status !== "won" && l.status !== "lost"
  ).length;

  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  // ── Handlers ──

  function handleAdd(lead: Lead) {
    setLeads((cur) => [lead, ...cur]);
  }

  function handleAdvance(id: string, status: LeadStatus) {
    if (advancing) return;
    const prev = leads.find((l) => l.id === id)?.status;
    setLeads((cur) => cur.map((l) => l.id === id ? { ...l, status } : l));
    setErrors((e) => { const n = { ...e }; delete n[id]; return n; });
    setAdvancing(id);

    startTransition(async () => {
      const result = await updateLeadStatus(id, status);
      if (!result.success) {
        setLeads((cur) => cur.map((l) => l.id === id ? { ...l, status: (prev ?? "new") as LeadStatus } : l));
        setErrors((e) => ({ ...e, [id]: result.error ?? "Save failed" }));
      }
      setAdvancing(null);
    });
  }

  function handleEditSave(id: string, notes: string, followUpDate: string | null) {
    setLeads((cur) => cur.map((l) => l.id === id ? { ...l, notes, followUpDate } : l));
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="South FL Suds · CRM"
        title="Leads"
        subtitle="Track every prospect from first contact to closed job"
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Leads" value={totalCount} />
        <KPICard
          label="Won"
          value={wonCount}
          tone={wonCount > 0 ? "success" : "neutral"}
          delta={totalCount > 0 ? `${Math.round((wonCount / totalCount) * 100)}% close rate` : undefined}
        />
        <KPICard
          label="New"
          value={newCount}
          tone={newCount > 0 ? "warning" : "neutral"}
        />
        <KPICard
          label="Overdue Follow-up"
          value={overdueCount}
          tone={overdueCount > 0 ? "danger" : "neutral"}
        />
      </div>

      {/* Main card */}
      <GlassCard
        padding="none"
        header={{
          icon:  Droplets,
          title: "Lead Pipeline",
          pill:  {
            label: `${totalCount} lead${totalCount !== 1 ? "s" : ""}`,
            color: totalCount > 0 ? "gold" : "neutral",
          },
          rightSlot: (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold outline-none flex-shrink-0"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <Plus size={12} />
              Add Lead
            </button>
          ),
          showMenu: false,
        }}
      >
        {/* Status filter tabs */}
        <div
          className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {STATUSES.map(({ key, label }) => {
            const count = key === "all"
              ? leads.length
              : leads.filter((l) => l.status === key).length;
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

        {/* Lead list */}
        <div className="p-3">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Droplets size={24} style={{ color: "var(--text-subtle)", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {filter === "all" ? "No leads yet — add your first." : `No ${filter} leads.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  advancing={advancing}
                  onAdvance={handleAdvance}
                  onEdit={setEditLead}
                  onMarkLost={(id) => handleAdvance(id, "lost")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Error strip */}
        {Object.keys(errors).length > 0 && (
          <div
            className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
          >
            <AlertCircle size={12} />
            {Object.values(errors)[0]}
          </div>
        )}
      </GlassCard>

      {/* Dialogs */}
      <AddDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      {editLead && (
        <EditDialog
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSave={handleEditSave}
        />
      )}
    </PageContainer>
  );
}
