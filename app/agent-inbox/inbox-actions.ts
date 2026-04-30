"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateAgentStatus(
  id:     string,
  action: "approved" | "rejected",
): Promise<{ success: boolean; error?: string }> {
  // "dismissed" is the DB value that hides items; "approved" marks them actioned
  const status = action === "rejected" ? "dismissed" : "approved";

  try {
    const { error } = await supabaseServer
      .from("agent_recommendations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/agent-inbox");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
