"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createTask(title: string, priority: string, dueDate: string) {
  const { error } = await supabaseServer.from("operator_tasks").insert({
    title: title.trim(),
    priority,
    status: "pending",
    due_date: dueDate || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createGoal(
  title: string,
  category: string,
  targetValue: number,
  unit: string,
  deadline: string,
  priority: string
) {
  const { error } = await supabaseServer.from("operator_goals").insert({
    title: title.trim(),
    category,
    target_value: targetValue,
    current_value: 0,
    progress_percent: 0,
    unit: unit.trim() || "units",
    deadline: deadline || null,
    status: "in-progress",
    priority,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function createDecision(
  title: string,
  rationale: string,
  sector: string
) {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabaseServer.from("decisions").insert({
    title: title.trim(),
    rationale: rationale.trim() || null,
    sector: sector || "business",
    decided_on: today,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/decisions");
  revalidatePath("/dashboard");
}
