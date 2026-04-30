"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ScriptStatus = "idea" | "scripted" | "filmed" | "edited" | "posted";
export type Platform     = "youtube" | "tiktok" | "instagram" | "whop" | "other";
export type VideoType    = "short" | "long";

const STAGE_ORDER: ScriptStatus[] = ["idea", "scripted", "filmed", "edited", "posted"];

function nextStage(current: string): ScriptStatus | null {
  const idx = STAGE_ORDER.indexOf(current as ScriptStatus);
  return idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
}

// ── Create ────────────────────────────────────────────────────────────

export interface CreateContentInput {
  idea:      string;
  hook:      string;
  platform:  Platform;
  videoType: VideoType;
}

export async function createContentItem(
  input: CreateContentInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from("content_pipeline")
      .insert({
        idea:          input.idea.trim(),
        hook:          input.hook.trim(),
        platform:      input.platform,
        video_type:    input.videoType,
        script_status: "idea",
        posted:        false,
        views:         0,
        lesson:        "",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/content");
    return { success: true, id: data.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ── Advance stage ───────────────────────────────────────��─────────────

export async function advanceContentStage(
  id:           string,
  currentStage: string,
): Promise<{ success: boolean; newStage?: string; error?: string }> {
  const newStage = nextStage(currentStage);
  if (!newStage) return { success: false, error: "Already at final stage" };

  try {
    const { error } = await supabaseServer
      .from("content_pipeline")
      .update({
        script_status: newStage,
        posted:        newStage === "posted" ? true : undefined,
        updated_at:    new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/content");
    return { success: true, newStage };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ── Update views + lesson (post-publish) ─────────────────────────────

export async function updateContentPerformance(
  id:     string,
  views:  number,
  lesson: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from("content_pipeline")
      .update({
        views,
        lesson:     lesson.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/content");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
