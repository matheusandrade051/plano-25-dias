"use client";

import { useCallback, useState } from "react";
import { deleteMeal } from "@/app/(app)/alimentacao/actions";
import { MealForm } from "./MealForm";
import { SubmitButton } from "./SubmitButton";
import { btnDangerCls, btnSecondaryCls } from "./ui";
import { fmt } from "@/lib/format";
import type { Meal } from "@/lib/types";

export function MealItem({ meal }: { meal: Meal }) {
  const [editing, setEditing] = useState(false);
  const close = useCallback(() => setEditing(false), []);

  if (editing) {
    return (
      <li className="rounded-xl border border-emerald-300 p-3 dark:border-emerald-800">
        <MealForm date={meal.log_date} meal={meal} onDone={close} />
        <button type="button" onClick={close} className={`${btnSecondaryCls} mt-2 w-full`}>
          Cancelar
        </button>
      </li>
    );
  }

  return (
    <li className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className="font-medium">{meal.description}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {fmt(meal.kcal)} kcal · {fmt(meal.protein_g)} g de proteína
      </p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => setEditing(true)} className={`${btnSecondaryCls} min-h-11 flex-1 py-2`}>
          Editar
        </button>
        <form
          action={deleteMeal}
          className="flex-1"
          onSubmit={(e) => {
            if (!confirm("Excluir esta refeição?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={meal.id} />
          <SubmitButton className={`${btnDangerCls} min-h-11 w-full py-2`} pendingText="Excluindo...">
            Excluir
          </SubmitButton>
        </form>
      </div>
    </li>
  );
}
