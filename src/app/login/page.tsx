import { LoginForm } from "./LoginForm";
import { Card, Notice } from "@/components/ui";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
          25
        </div>
        <h1 className="text-2xl font-bold">Plano 25 Dias</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Entre com e-mail e senha, ou receba um link de acesso por e-mail.</p>
      </div>
      {erro && <Notice tone="error">O link expirou ou já foi usado. Peça um novo abaixo.</Notice>}
      <Card>
        <LoginForm />
      </Card>
    </main>
  );
}
