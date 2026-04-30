"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, ChevronDown, CheckSquare, Target, FileText, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask, createGoal, createDecision } from "@/app/quick-add/actions";

type Mode = "task" | "goal" | "decision" | null;

const ITEMS = [
  { label: "New Task", icon: CheckSquare, action: "task" as const },
  { label: "New Goal", icon: Target, action: "goal" as const },
  { label: "Capture Decision", icon: FileText, action: "decision" as const },
] as const;

const CATEGORIES = ["business", "finance", "content", "health", "system", "personal"] as const;
const PRIORITIES = ["critical", "high", "medium", "low"] as const;

// ── Shared form primitives ────────────────────────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "var(--bg-glass-subtle)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
} as const;

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-3 rounded-md text-sm outline-none w-full"
      style={inputStyle}
    />
  );
}

function SelectInput({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 rounded-md text-sm outline-none w-full"
      style={inputStyle}
    >
      {children}
    </select>
  );
}

// ── Dialog shell ──────────────────────────────────────────────────────

function QuickDialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 950,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <Dialog.Content
            className="w-full max-w-md rounded-[var(--radius-card)] p-6 outline-none"
            style={{
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--bg-glass-elevated)",
              backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
              WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="outline-none" style={{ color: "var(--text-subtle)" }}>
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Task form ─────────────────────────────────────────────────────────

function TaskForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setError("");
    startTransition(async () => {
      try {
        await createTask(title, priority, dueDate);
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Task Title">
        <TextInput value={title} onChange={setTitle} placeholder="What needs to get done?" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Priority">
          <SelectInput value={priority} onChange={setPriority}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </SelectInput>
        </FormField>
        <FormField label="Due Date">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-9 px-3 rounded-md text-sm outline-none w-full"
            style={inputStyle}
          />
        </FormField>
      </div>
      {error && <p className="text-xs" style={{ color: "var(--status-danger)" }}>{error}</p>}
      <SubmitButton isPending={isPending} label="Add Task" />
    </form>
  );
}

// ── Goal form ─────────────────────────────────────────────────────────

function GoalForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("business");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("high");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!target || isNaN(Number(target))) { setError("Target value must be a number."); return; }
    setError("");
    startTransition(async () => {
      try {
        await createGoal(title, category, Number(target), unit, deadline, priority);
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Goal Title">
        <TextInput value={title} onChange={setTitle} placeholder="What are you trying to achieve?" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Category">
          <SelectInput value={category} onChange={setCategory}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </SelectInput>
        </FormField>
        <FormField label="Priority">
          <SelectInput value={priority} onChange={setPriority}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </SelectInput>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Target Value">
          <TextInput value={target} onChange={setTarget} placeholder="e.g. 1000" />
        </FormField>
        <FormField label="Unit">
          <TextInput value={unit} onChange={setUnit} placeholder="e.g. dollars, leads" />
        </FormField>
      </div>
      <FormField label="Deadline (optional)">
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="h-9 px-3 rounded-md text-sm outline-none w-full"
          style={inputStyle}
        />
      </FormField>
      {error && <p className="text-xs" style={{ color: "var(--status-danger)" }}>{error}</p>}
      <SubmitButton isPending={isPending} label="Add Goal" />
    </form>
  );
}

// ── Decision form ─────────────────────────────────────────────────────

function DecisionForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [rationale, setRationale] = useState("");
  const [sector, setSector] = useState("business");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setError("");
    startTransition(async () => {
      try {
        await createDecision(title, rationale, sector);
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Decision">
        <TextInput value={title} onChange={setTitle} placeholder="What did you decide?" />
      </FormField>
      <FormField label="Rationale / Outcome">
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          rows={3}
          placeholder="Why did you make this call?"
          className="px-3 py-2 rounded-md text-sm outline-none resize-none w-full"
          style={inputStyle}
        />
      </FormField>
      <FormField label="Sector">
        <SelectInput value={sector} onChange={setSector}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </SelectInput>
      </FormField>
      {error && <p className="text-xs" style={{ color: "var(--status-danger)" }}>{error}</p>}
      <SubmitButton isPending={isPending} label="Log Decision" />
    </form>
  );
}

// ── Submit button ─────────────────────────────────────────────────────

function SubmitButton({ isPending, label }: { isPending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="h-10 rounded-md text-sm font-semibold outline-none mt-1"
      style={{
        background: isPending ? "var(--bg-glass-subtle)" : "var(--accent)",
        color: isPending ? "var(--text-muted)" : "var(--on-accent)",
      }}
    >
      {isPending ? "Saving…" : label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function QuickAddButton() {
  const [mode, setMode] = useState<Mode>(null);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-[13px] font-medium outline-none"
            style={{
              background: "var(--accent)",
              color: "var(--on-accent)",
              transition: "background var(--motion-fast), transform var(--motion-fast)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            aria-label="Quick add"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Quick Add</span>
            <ChevronDown size={12} className="opacity-80" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="min-w-[200px] p-1 rounded-[var(--radius-md)] outline-none"
            style={{
              background: "var(--bg-glass-elevated)",
              backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
              WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-floating)",
              color: "var(--text-primary)",
              zIndex: 1000,
            }}
          >
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenu.Item
                  key={item.action}
                  onSelect={() => setMode(item.action)}
                  className="flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] cursor-pointer outline-none"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-glass-subtle)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Task dialog */}
      <QuickDialog open={mode === "task"} onOpenChange={(v) => !v && setMode(null)} title="New Task">
        <TaskForm onClose={() => setMode(null)} />
      </QuickDialog>

      {/* Goal dialog */}
      <QuickDialog open={mode === "goal"} onOpenChange={(v) => !v && setMode(null)} title="New Goal">
        <GoalForm onClose={() => setMode(null)} />
      </QuickDialog>

      {/* Decision dialog */}
      <QuickDialog open={mode === "decision"} onOpenChange={(v) => !v && setMode(null)} title="Capture Decision">
        <DecisionForm onClose={() => setMode(null)} />
      </QuickDialog>
    </>
  );
}
