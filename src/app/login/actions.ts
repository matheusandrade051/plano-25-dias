"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const emailSchema = z.string().trim().toLowerCase().email("Informe um e-mail válido.");

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  if (!parsedEmail.success) return { error: parsedEmail.error.issues[0].message };

  const modo = String(formData.get("modo") ?? "senha");
  const supabase = await createClient();

  if (modo === "senha") {
    const password = String(formData.get("password") ?? "");
    if (!password) return { error: "Informe sua senha." };

    const { error } = await supabase.auth.signInWithPassword({ email: parsedEmail.data, password });
    if (error) {
      console.error("[login] signInWithPassword falhou:", error.status, error.code, error.message);
      if (error.code === "invalid_credentials") return { error: "E-mail ou senha incorretos." };
      return { error: `Não foi possível entrar: ${error.message}` };
    }
    redirect("/");
  }

  // Link de acesso por e-mail
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = h.get("origin") ?? `${proto}://${host}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsedEmail.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    console.error("[login] signInWithOtp falhou:", error.status, error.code, error.message);
    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
      return {
        error:
          "O limite de e-mails do Supabase foi atingido (no plano gratuito é bem baixo). Entre com e-mail e senha ou aguarde cerca de 1 hora.",
      };
    }
    if (error.code === "email_address_invalid") {
      return { error: "Este e-mail não foi aceito. Confira se digitou corretamente." };
    }
    return { error: `Não foi possível enviar o link: ${error.message}` };
  }
  return { ok: true, message: "Link enviado! Abra o e-mail neste mesmo aparelho e toque no link para entrar." };
}
