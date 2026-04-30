"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// Confirmed operator_profile columns: name, alias, primary_focus
// (no 'role', 'handle', or 'is_active' columns exist)
export async function updateOperatorProfile(
  name:   string,
  role:   string,
  handle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("operator_profile")
      .update({
        name:          name.trim()   || undefined,
        alias:         handle.trim() || undefined,
        primary_focus: role.trim()   || undefined,
        updated_at:    new Date().toISOString(),
      })
      // Single-row table — match any row that has a non-empty name
      .neq("name", "");

    if (error) {
      console.warn("[settings] updateOperatorProfile error:", error);
      return { success: false, error: error.message };
    }
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.warn("[settings] updateOperatorProfile threw:", e);
    return { success: false, error: String(e) };
  }
}

// Confirmed operator_preferences columns: theme, accent, dashboard_density,
//   default_view, settings
export async function updateOperatorPreferences(
  theme:            string,
  dashboardDensity: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("operator_preferences")
      .update({
        theme,
        dashboard_density: dashboardDensity,
        updated_at: new Date().toISOString(),
      })
      // Single-row table — match any row
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.warn("[settings] updateOperatorPreferences error:", error);
      return { success: false, error: error.message };
    }
    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    console.warn("[settings] updateOperatorPreferences threw:", e);
    return { success: false, error: String(e) };
  }
}
