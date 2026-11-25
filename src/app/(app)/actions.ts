"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { dailySchema, firstError, workoutTypeSchema } from "@/lib/validation";
import type { ActionState, WorkoutType } from "@/lib/types";

/** Soma (ou subtrai) água do dia de hoje. */
export async function addWater(ml: number, _formData: FormData): Promise<void> {
  void _formData;
  const { supabase, user } = await requireUser();
  const today = todayISO();
  const { data, error } = await supabase
    .from("daily_checklist")
    .select("water_ml")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();
  if (error) throw new Error("Não foi possível registrar a água. Tente de novo.");
  const current = Number(data?.water_ml ?? 0);
  const next = Math.max(0, Math.min(20000, current + ml));
  const { error: upsertError } = await supabase
    .from("daily_checklist")
    .upsert({ user_id: user.id, log_date: today, water_ml: next }, { onConflict: "user_id,log_date" });
  if (upsertError) throw new Error("Não foi possível registrar a água. Tente de novo.");
  revalidatePath("/", "layout");
}

/** Marca/desmarca o treino do dia. */
export async function setWorkout(type: WorkoutType, done: boolean, _formData: FormData): Promise<void> {
  void _formData;
  const parsedType = workoutTypeSchema.safeParse(type);
  if (!parsedType.success) throw new Error("Tipo de treino inválido.");
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("daily_checklist").upsert(
    { user_id: user.id, log_date: todayISO(), workout_done: done, workout_type: type },
    { onConflict: "user_id,log_date" },
  );
  if (error) throw new Error("Não foi possível salvar o treino. Tente de novo.");
  revalidatePath("/", "layout");
}

/** Salva passos e horas de sono do dia. */
export async function saveDaily(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = dailySchema.safeParse({
    log_date: todayISO(),
    steps: formData.get("steps"),
    sleep_hours: formData.get("sleep_hours"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase.from("daily_checklist").upsert(
      {
        user_id: user.id,
        log_date: parsed.data.log_date,
        steps: parsed.data.steps,
        sleep_hours: parsed.data.sleep_hours,
      },
      { onConflict: "user_id,log_date" },
    );
    if (error) return { error: "Não foi possível salvar. Tente de novo." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Salvo!" };
}
