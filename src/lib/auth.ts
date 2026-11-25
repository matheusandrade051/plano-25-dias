import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/dates";
import type { Settings } from "@/lib/types";

/** Para páginas: devolve cliente e usuário, ou redireciona ao login. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
});

/** Para server actions: lança erro amigável se a sessão expirou. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sua sessão expirou. Entre novamente.");
  return { supabase, user };
}

/** Lê as configurações; se não existirem (ex.: usuário antigo), cria com os padrões. */
export const getSettings = cache(async (): Promise<Settings> => {
  const { supabase, user } = await getSession();
  const { data, error } = await supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Não foi possível carregar suas configurações.");
  if (data) return normalizeSettings(data);

  const { data: created, error: insertError } = await supabase
    .from("settings")
    .insert({ user_id: user.id, start_date: todayISO() })
    .select("*")
    .single();
  if (insertError || !created) throw new Error("Não foi possível criar suas configurações.");
  return normalizeSettings(created);
});

function normalizeSettings(row: Record<string, unknown>): Settings {
  return {
    user_id: String(row.user_id),
    start_date: String(row.start_date),
    start_weight_kg: Number(row.start_weight_kg),
    target_loss_kg: Number(row.target_loss_kg),
    kcal_min: Number(row.kcal_min),
    kcal_max: Number(row.kcal_max),
    protein_goal_g: Number(row.protein_goal_g),
    water_goal_ml: Number(row.water_goal_ml),
    steps_goal: Number(row.steps_goal),
  };
}
