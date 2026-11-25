"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isISODate, todayISO } from "@/lib/dates";
import { firstError, weightSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function saveWeight(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = weightSchema.safeParse({
    log_date: formData.get("log_date"),
    weight_kg: formData.get("weight_kg"),
    note: (formData.get("note") as string | null) ?? undefined,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (parsed.data.log_date > todayISO()) return { error: "Não é possível registrar peso em data futura." };

  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase.from("weight_logs").upsert(
      {
        user_id: user.id,
        log_date: parsed.data.log_date,
        weight_kg: parsed.data.weight_kg,
        note: parsed.data.note || null,
      },
      { onConflict: "user_id,log_date" },
    );
    if (error) return { error: "Não foi possível salvar o peso. Tente de novo." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Peso salvo!" };
}

export async function deleteWeight(formData: FormData): Promise<void> {
  const date = String(formData.get("log_date") ?? "");
  if (!isISODate(date)) throw new Error("Data inválida.");
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("weight_logs").delete().eq("user_id", user.id).eq("log_date", date);
  if (error) throw new Error("Não foi possível excluir o registro.");
  revalidatePath("/", "layout");
}
