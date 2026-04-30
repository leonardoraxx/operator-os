"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ScoreField =
  | "money_action"
  | "venhq_output"
  | "clipping_output"
  | "gym_or_protein"
  | "faith_check"
  | "homebase_used";

/**
 * Toggle one boolean field on today's daily_scoreboard row.
 * Creates the row if it doesn't exist yet.
 * Returns the row id so the client can hold it for subsequent toggles.
 */
export async function toggleScoreboardField(
  field:  ScoreField,
  value:  boolean,
  rowId:  string | null,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const today = new Date().toISOString().slice(0, 10);

  try {
    if (rowId) {
      const { error } = await supabaseServer
        .from("daily_scoreboard")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", rowId);

      if (error) return { success: false, error: error.message };
    } else {
      // No row for today — insert with every field false except the one toggled
      const seed: Record<string, unknown> = {
        date:            today,
        money_action:    false,
        venhq_output:    false,
        clipping_output: false,
        gym_or_protein:  false,
        faith_check:     false,
        homebase_used:   false,
        [field]:         value,
      };

      const { data, error } = await supabaseServer
        .from("daily_scoreboard")
        .insert(seed)
        .select("id")
        .single();

      if (error) return { success: false, error: error.message };
      revalidatePath("/dashboard");
      return { success: true, id: data.id };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
