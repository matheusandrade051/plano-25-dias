import { getSession, getSettings } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { Card, PageHeader, btnDangerCls } from "@/components/ui";
import { PasswordForm } from "@/components/PasswordForm";
import { SettingsForm } from "@/components/SettingsForm";
import { SubmitButton } from "@/components/SubmitButton";
import { signOut } from "./actions";

export default async function ConfiguracoesPage() {
  const { user } = await getSession();
  const settings = await getSettings();
  return (
    <div className="space-y-4">
      <PageHeader title="Configurações" subtitle="Ajuste suas metas e a data de início do plano." />
      <Card>
        <SettingsForm settings={settings} today={todayISO()} />
      </Card>
      <Card title="Criar ou trocar senha">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Com uma senha você entra só com e-mail e senha, sem esperar o link por e-mail.
        </p>
        <PasswordForm />
      </Card>
      <Card title="Conta">
        <p className="mb-3 break-all text-sm text-slate-500 dark:text-slate-400">Conectado como {user.email}</p>
        <form action={signOut}>
          <SubmitButton className={`${btnDangerCls} w-full`} pendingText="Saindo...">
            Sair da conta
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
