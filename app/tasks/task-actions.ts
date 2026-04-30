"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function toggleTaskDone(
  id:   string,
  done: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("operator_tasks")
      .update({ status: done ? "done" : "active" })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
