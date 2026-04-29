"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMoneyEntry } from "./actions";

const TODAY = new Date().toISOString().slice(0, 10);

const TYPE_OPTIONS = [
  { value: "income", label: "Income / Revenue" },
  { value: "expense", label: "Expense / Cost" },
  { value: "pending", label: "Pending Payout" },
] as const;

export function AddEntryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<"income" | "expense" | "pending">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(TODAY);
  const [error, setError] = useState("");

  function reset() {
    setType("income");
    setAmount("");
    setCategory("");
    setNotes("");
    setDate(TODAY);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setError("");

    startTransition(async () => {
      try {
        await addMoneyEntry({ type, amount: amt, category, notes, entry_date: date });
        setOpen(false);
        reset();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-[13px] font-medium outline-none"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          <Plus size={14} />
          Add Entry
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 900 }}
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 w-full max-w-md rounded-[var(--radius-card)] p-6 outline-none"
          style={{
            transform: "translate(-50%, -50%)",
            background: "var(--bg-glass-elevated)",
            backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-elevated)",
            zIndex: 901,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title
              className="text-[15px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Add Money Entry
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="outline-none" style={{ color: "var(--text-subtle)" }}>
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Type
              </label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className="flex-1 h-9 rounded-md text-xs font-medium outline-none transition-colors"
                    style={{
                      background: type === opt.value ? "var(--accent)" : "var(--bg-glass-subtle)",
                      color: type === opt.value ? "var(--on-accent)" : "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Amount ($)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 px-3 rounded-md text-sm outline-none"
                style={{
                  background: "var(--bg-glass-subtle)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Source / Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Source / Category
              </label>
              <input
                type="text"
                placeholder="e.g. South FL Suds, TikTok clips"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 px-3 rounded-md text-sm outline-none"
                style={{
                  background: "var(--bg-glass-subtle)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 px-3 rounded-md text-sm outline-none"
                style={{
                  background: "var(--bg-glass-subtle)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Notes (optional)
              </label>
              <input
                type="text"
                placeholder="Additional details…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 px-3 rounded-md text-sm outline-none"
                style={{
                  background: "var(--bg-glass-subtle)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: "var(--status-danger)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-md text-sm font-semibold outline-none mt-1"
              style={{
                background: isPending ? "var(--bg-glass-subtle)" : "var(--accent)",
                color: isPending ? "var(--text-muted)" : "var(--on-accent)",
              }}
            >
              {isPending ? "Saving…" : "Save Entry"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
