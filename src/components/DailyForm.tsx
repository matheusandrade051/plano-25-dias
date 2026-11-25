"use client";

import { useActionState } from "react";
import { saveDaily } from "@/app/(app)/actions";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { btnSecondaryCls, Label, inputCls } from "./ui";

export function DailyForm({ steps, sleep }: { steps: number; sleep: string }) {
  const [state, action] = useActionState(saveDaily, null);
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="steps">Passos</Label>
          <input id="steps" name="steps" type="text" inputMode="numeric" defaultValue={steps || ""} placeholder="0" className={inputCls} />
        </div>
        <div>
          <Label htmlFor="sleep_hours">Sono (horas)</Label>
          <input id="sleep_hours" name="sleep_hours" type="text" inputMode="decimal" defaultValue={sleep} placeholder="7,5" className={inputCls} />
        </div>
      </div>
      <SubmitButton className={`${btnSecondaryCls} w-full`}>Salvar passos e sono</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
