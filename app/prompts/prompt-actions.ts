"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// ── Create ────────────────────────────────────────────────────────────

export interface CreatePromptInput {
  promptName:  string;
  category:    string;
  promptText:  string;
  usedFor:     string;
}

export async function createPrompt(
  input: CreatePromptInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from("prompt_library")
      .insert({
        prompt_name: input.promptName.trim(),
        category:    input.category.trim(),
        prompt_text: input.promptText.trim(),
        used_for:    input.usedFor.trim(),
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/prompts");
    return { success: true, id: data.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ── Log usage (update last_used + rating) ────────────────────────────

export async function logPromptUsage(
  id:            string,
  successRating: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("prompt_library")
      .update({
        last_used:      new Date().toISOString(),
        success_rating: successRating,
        updated_at:     new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/prompts");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ── Update prompt text + metadata ────────────────────────────────────

export async function updatePrompt(
  id:         string,
  promptName: string,
  promptText: string,
  usedFor:    string,
  category:   string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("prompt_library")
      .update({
        prompt_name: promptName.trim(),
        prompt_text: promptText.trim(),
        used_for:    usedFor.trim(),
        category:    category.trim(),
        updated_at:  new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/prompts");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
