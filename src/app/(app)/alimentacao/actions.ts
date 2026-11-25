"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { firstError, mealSchema } from "@/lib/validation";
import type { ActionState, MealType } from "@/lib/types";

export async function saveMeal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = mealSchema.safeParse({
    log_date: formData.get("log_date"),
    meal_type: formData.get("meal_type"),
    description: formData.get("description"),
    kcal: formData.get("kcal"),
    protein_g: formData.get("protein_g"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const id = String(formData.get("id") ?? "");
  const row = {
    log_date: parsed.data.log_date,
    meal_type: parsed.data.meal_type as MealType,
    description: parsed.data.description,
    kcal: parsed.data.kcal,
    protein_g: parsed.data.protein_g,
  };

  try {
    const { supabase, user } = await requireUser();
    const { error } = id
      ? await supabase.from("meals").update(row).eq("id", id).eq("user_id", user.id)
      : await supabase.from("meals").insert({ ...row, user_id: user.id });
    if (error) return { error: "Não foi possível salvar a refeição. Tente de novo." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Refeição atualizada!" : "Refeição adicionada!" };
}

export async function deleteMeal(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Refeição inválida.");
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("meals").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("Não foi possível excluir a refeição.");
  revalidatePath("/", "layout");
}
