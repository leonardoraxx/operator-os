"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export interface AddEntryInput {
  type: "income" | "expense" | "pending";
  amount: number;
  category: string;
  notes: string;
  entry_date: string;
}

export async function addMoneyEntry(input: AddEntryInput) {
  const { error } = await supabaseServer.from("money_entries").insert({
    type: input.type,
    amount: input.amount,
    category: input.category || null,
    notes: input.notes || null,
    entry_date: input.entry_date,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/clipping");
}
