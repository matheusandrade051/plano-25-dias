"use client";

import { useActionState } from "react";
import { saveWeight } from "@/app/(app)/peso/actions";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { Label, inputCls } from "./ui";

export function WeightForm({
  date,
  today,
  defaultWeight,
  compact = false,
}: {
  date: string;
  today: string;
  defaultWeight?: string;
  compact?: boolean;
}) {
  const [state, action] = useActionState(saveWeight, null);
  return (
    <form action={action} className="space-y-3">
      {compact ? (
        <input type="hidden" name="log_date" value={date} />
      ) : (
        <div>
          <Label htmlFor="log_date">Data</Label>
          <input id="log_date" name="log_date" type="date" defaultValue={date} max={today} required className={inputCls} />
        </div>
      )}
      <div>
        <Label htmlFor="weight_kg">Peso (kg)</Label>
        <input
          id="weight_kg"
          name="weight_kg"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required
          defaultValue={defaultWeight}
          placeholder="Ex.: 97,8"
          className={`${inputCls} text-xl font-semibold`}
        />
      </div>
      {!compact && (
        <div>
          <Label htmlFor="note">Observação (opcional)</Label>
          <input id="note" name="note" type="text" maxLength={200} className={inputCls} placeholder="Ex.: em jejum, após treino..." />
        </div>
      )}
      <SubmitButton>Salvar peso</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
