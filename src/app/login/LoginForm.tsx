"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { Label, inputCls } from "@/components/ui";

export function LoginForm() {
  const [state, action] = useActionState(sendMagicLink, null);
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
      <SubmitButton pendingText="Enviando...">Enviar link de acesso</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
