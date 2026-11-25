"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveMeal } from "@/app/(app)/alimentacao/actions";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { Label, inputCls } from "./ui";
import { MEAL_LABELS, MEAL_TYPES, type Meal } from "@/lib/types";

export function MealForm({
  date,
  meal,
  onDone,
}: {
  date: string;
  meal?: Meal;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveMeal, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      if (!meal) formRef.current?.reset();
      onDone?.();
    }
  }, [state, meal, onDone]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="log_date" value={date} />
      {meal && <input type="hidden" name="id" value={meal.id} />}
      <div>
        <Label htmlFor={`meal_type_${meal?.id ?? "new"}`}>Refeição</Label>
        <select
          id={`meal_type_${meal?.id ?? "new"}`}
          name="meal_type"
          defaultValue={meal?.meal_type ?? "almoco"}
          className={inputCls}
        >
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {MEAL_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`description_${meal?.id ?? "new"}`}>O que você comeu</Label>
        <input
          id={`description_${meal?.id ?? "new"}`}
          name="description"
          type="text"
          required
          maxLength={200}
          defaultValue={meal?.description}
          placeholder="Ex.: 2 ovos mexidos e 1 fatia de pão"
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`kcal_${meal?.id ?? "new"}`}>Calorias (kcal)</Label>
          <input id={`kcal_${meal?.id ?? "new"}`} name="kcal" type="text" inputMode="numeric" defaultValue={meal?.kcal ?? ""} placeholder="0" className={inputCls} />
        </div>
        <div>
          <Label htmlFor={`protein_${meal?.id ?? "new"}`}>Proteína (g)</Label>
          <input id={`protein_${meal?.id ?? "new"}`} name="protein_g" type="text" inputMode="numeric" defaultValue={meal?.protein_g ?? ""} placeholder="0" className={inputCls} />
        </div>
      </div>
      <SubmitButton>{meal ? "Salvar alterações" : "Adicionar refeição"}</SubmitButton>
      <FormMessage state={state && !state.ok ? state : null} />
    </form>
  );
}
