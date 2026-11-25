"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "./actions";
import { FormMessage } from "@/components/FormMessage";
import { Label, btnPrimaryCls, btnSecondaryCls, inputCls } from "@/components/ui";

function Buttons() {
  const { pending } = useFormStatus();
  return (
    <div className="space-y-3">
      <button type="submit" name="modo" value="senha" disabled={pending} className={btnPrimaryCls}>
        {pending ? "Aguarde..." : "Entrar"}
      </button>
      <button type="submit" name="modo" value="link" disabled={pending} className={`${btnSecondaryCls} w-full`}>
        Receber link por e-mail
      </button>
    </div>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(signIn, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Seu e-mail</Label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com"
          className={inputCls}
        />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <input id="password" name="password" type="password" autoComplete="current-password" className={inputCls} />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sem senha? Use &quot;Receber link por e-mail&quot;.</p>
      </div>
      <Buttons />
      <FormMessage state={state} />
    </form>
  );
}
