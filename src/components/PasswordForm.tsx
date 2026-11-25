"use client";

import { useActionState, useEffect, useRef } from "react";
import { setPassword } from "@/app/(app)/configuracoes/actions";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { Label, btnSecondaryCls, inputCls } from "./ui";

export function PasswordForm() {
  const [state, action] = useActionState(setPassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div>
        <Label htmlFor="new_password">Nova senha</Label>
        <input id="new_password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputCls} />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Mínimo de 8 caracteres.</p>
      </div>
      <div>
        <Label htmlFor="confirm_password">Repita a senha</Label>
        <input id="confirm_password" name="confirm" type="password" autoComplete="new-password" minLength={8} required className={inputCls} />
      </div>
      <SubmitButton className={`${btnSecondaryCls} w-full`}>Salvar senha</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
