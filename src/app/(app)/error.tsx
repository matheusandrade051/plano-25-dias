"use client";

import { btnPrimaryCls, Card } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mt-10 text-center">
      <p className="text-3xl" aria-hidden>
        😕
      </p>
      <h1 className="mt-2 text-lg font-bold">Algo deu errado</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {error.message && !error.message.includes("Server Components")
          ? error.message
          : "Não foi possível carregar esta tela. Verifique sua conexão e tente de novo."}
      </p>
      <button type="button" onClick={reset} className={`${btnPrimaryCls} mt-4`}>
        Tentar de novo
      </button>
    </Card>
  );
}
