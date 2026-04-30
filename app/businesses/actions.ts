"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export interface UpdateBusinessInput {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  revenue: number;
  expenses: number;
  next_action: string;
  current_bottleneck: string;
}

export async function updateBusiness(input: UpdateBusinessInput) {
  const { error } = await supabaseServer
    .from("businesses")
    .update({
      name: input.name,
      type: input.type || null,
      status: input.status,
      description: input.description || null,
      revenue: input.revenue,
      expenses: input.expenses,
      next_action: input.next_action || null,
      current_bottleneck: input.current_bottleneck || null,
    })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  revalidatePath("/businesses");
  revalidatePath(`/businesses/${input.id}`);
}
