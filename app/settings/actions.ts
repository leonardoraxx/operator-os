"use server";

import { supabaseServer } from "@/lib/supabase-server";

export async function updateOperatorProfile(
  name: string,
  role: string,
  handle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("operator_profile")
      .update({
        name: name.trim(),
        role: role.trim(),
        handle: handle.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("is_active", true);

    if (error) {
      console.warn("[settings] updateOperatorProfile error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    console.warn("[settings] updateOperatorProfile threw:", e);
    return { success: false, error: String(e) };
  }
}
