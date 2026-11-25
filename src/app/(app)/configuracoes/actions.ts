"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstError, settingsSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = settingsSchema.safeParse({
    start_date: formData.get("start_date"),
    start_weight_kg: formData.get("start_weight_kg"),
    target_loss_kg: formData.get("target_loss_kg"),
    kcal_min: formData.get("kcal_min"),
    kcal_max: formData.get("kcal_max"),
    protein_goal_g: formData.get("protein_goal_g"),
    water_goal_ml: formData.get("water_goal_ml"),
    steps_goal: formData.get("steps_goal"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("settings")
      .upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id" });
    if (error) return { error: "Não foi possível salvar as configurações. Tente de novo." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Configurações salvas!" };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
