"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/(app)/configuracoes/actions";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { Label, inputCls } from "./ui";
import { toInputDecimal } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings, today }: { settings: Settings; today: string }) {
  const [state, action] = useActionState(saveSettings, null);
  const num = (id: string, label: string, value: number | string, decimal = false) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} name={id} type="text" inputMode={decimal ? "decimal" : "numeric"} defaultValue={value} required className={inputCls} />
    </div>
  );
  return (
    <form action={action} className="space-y-3">
      <div>
        <Label htmlFor="start_date">Data de início</Label>
        <input id="start_date" name="start_date" type="date" defaultValue={settings.start_date} max={today} required className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {num("start_weight_kg", "Peso inicial (kg)", toInputDecimal(settings.start_weight_kg), true)}
        {num("target_loss_kg", "Meta de perda (kg)", toInputDecimal(settings.target_loss_kg), true)}
        {num("kcal_min", "Calorias mín.", settings.kcal_min)}
        {num("kcal_max", "Calorias máx.", settings.kcal_max)}
        {num("protein_goal_g", "Proteína (g)", settings.protein_goal_g)}
        {num("water_goal_ml", "Água (ml)", settings.water_goal_ml)}
      </div>
      {num("steps_goal", "Meta de passos", settings.steps_goal)}
      <SubmitButton>Salvar configurações</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
