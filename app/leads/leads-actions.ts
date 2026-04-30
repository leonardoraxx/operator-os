"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

// ── Create ────────────────────────────────────────────────────────────

export interface CreateLeadInput {
  name:         string;
  email:        string;
  phone:        string;
  source:       string;
  status:       LeadStatus;
  notes:        string;
  followUpDate: string | null;
}

export async function createLead(
  input: CreateLeadInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from("leads")
      .insert({
        name:          input.name.trim(),
        email:         input.email.trim(),
        phone:         input.phone.trim(),
        source:        input.source.trim(),
        status:        input.status,
        notes:         input.notes.trim(),
        follow_up_date: input.followUpDate || null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/leads");
    return { success: true, id: data.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ── Update status ─────────────────────────────────────────────────────

export async function updateLeadStatus(
  id:     string,
  status: LeadStatus,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/leads");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ── Update notes + follow-up date ────────────────────────────────────

export async function updateLeadDetails(
  id:           string,
  notes:        string,
  followUpDate: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("leads")
      .update({
        notes:          notes.trim(),
        follow_up_date: followUpDate || null,
        updated_at:     new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/leads");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
