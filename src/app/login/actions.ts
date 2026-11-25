"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const emailSchema = z.string().trim().toLowerCase().email("Informe um e-mail válido.");

export async function sendMagicLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = h.get("origin") ?? `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    console.error("[login] signInWithOtp falhou:", error.status, error.code, error.message);
    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
      return {
        error:
          "O limite de e-mails do Supabase foi atingido (no plano gratuito é bem baixo). Aguarde cerca de 1 hora e tente de novo.",
      };
    }
    if (error.code === "email_address_invalid") {
      return { error: "Este e-mail não foi aceito. Confira se digitou corretamente." };
    }
    return { error: `Não foi possível enviar o link: ${error.message}` };
  }
  return { ok: true, message: "Link enviado! Abra o e-mail neste mesmo aparelho e toque no link para entrar." };
}
