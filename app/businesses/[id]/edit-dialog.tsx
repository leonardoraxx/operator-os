"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBusiness } from "../actions";
import type { Business } from "@/data/types";

const STATUS_OPTIONS = [
  { value: "active", label: "Active / On Track" },
  { value: "paused", label: "Paused" },
  { value: "at-risk", label: "At Risk" },
  { value: "behind", label: "Behind" },
];

interface Props {
  business: Business;
}

export function EditBusinessDialog({ business }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(business.name);
  const [type, setType] = useState(business.type ?? "");
  const [status, setStatus] = useState(business.status === "on-track" ? "active" : business.status);
  const [description, setDescription] = useState(business.tagline);
  const [revenue, setRevenue] = useState(String(business.revenue));
  const [expenses, setExpenses] = useState(String(business.expenses ?? 0));
  const [nextAction, setNextAction] = useState(business.nextMilestone);
  const [bottleneck, setBottleneck] = useState(business.bottleneck ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setError("");

    startTransition(async () => {
      try {
        await updateBusiness({
          id: business.id,
          name: name.trim(),
          type: type.trim(),
          status,
          description: description.trim(),
          revenue: parseFloat(revenue) || 0,
          expenses: parseFloat(expenses) || 0,
          next_action: nextAction.trim(),
          current_bottleneck: bottleneck.trim(),
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-[13px] font-medium outline-none"
          style={{ background: "var(--bg-glass-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
        >
          <Pencil size={13} />
          Edit
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0" style={{ background: "rgba(0,0,0,0.6)", zIndex: 900 }} />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 w-full max-w-lg rounded-[var(--radius-card)] p-6 outline-none overflow-y-auto"
          style={{
            transform: "translate(-50%, -50%)",
            maxHeight: "90vh",
            background: "var(--bg-glass-elevated)",
            backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-elevated)",
            zIndex: 901,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Edit Business
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="outline-none" style={{ color: "var(--text-subtle)" }}><X size={16} /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Business Name">
              <Input value={name} onChange={setName} placeholder="e.g. South FL Suds" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type / Niche">
                <Input value={type} onChange={setType} placeholder="e.g. Pressure Washing" />
              </Field>
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 px-3 rounded-md text-sm outline-none w-full"
                  style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description / Tagline">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What does this business do?"
                className="px-3 py-2 rounded-md text-sm outline-none resize-none w-full"
                style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Revenue MTD ($)">
                <Input value={revenue} onChange={setRevenue} placeholder="0.00" type="number" />
              </Field>
              <Field label="Expenses MTD ($)">
                <Input value={expenses} onChange={setExpenses} placeholder="0.00" type="number" />
              </Field>
            </div>

            <Field label="Next Action">
              <textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                rows={2}
                placeholder="What's the immediate next move?"
                className="px-3 py-2 rounded-md text-sm outline-none resize-none w-full"
                style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </Field>

            <Field label="Current Bottleneck">
              <textarea
                value={bottleneck}
                onChange={(e) => setBottleneck(e.target.value)}
                rows={2}
                placeholder="What's blocking progress right now?"
                className="px-3 py-2 rounded-md text-sm outline-none resize-none w-full"
                style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </Field>

            {error && <p className="text-xs" style={{ color: "var(--status-danger)" }}>{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-md text-sm font-semibold outline-none mt-1"
              style={{
                background: isPending ? "var(--bg-glass-subtle)" : "var(--accent)",
                color: isPending ? "var(--text-muted)" : "var(--on-accent)",
              }}
            >
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-3 rounded-md text-sm outline-none w-full"
      style={{ background: "var(--bg-glass-subtle)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
    />
  );
}
