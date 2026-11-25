import Link from "next/link";
import { getSession, getSettings } from "@/lib/auth";
import { addDays, fullDateBR, isISODate, todayISO, weekdayName } from "@/lib/dates";
import { fmt } from "@/lib/format";
import { MEAL_LABELS, MEAL_TYPES, type Meal } from "@/lib/types";
import { Card, Notice, PageHeader, ProgressBar, btnSecondaryCls } from "@/components/ui";
import { MealForm } from "@/components/MealForm";
import { MealItem } from "@/components/MealItem";

export default async function AlimentacaoPage({ searchParams }: { searchParams: Promise<{ data?: string }> }) {
  const { data: dataParam } = await searchParams;
  const today = todayISO();
  const date = isISODate(dataParam) ? dataParam : today;

  const { supabase, user } = await getSession();
  const settings = await getSettings();
  const { data, error } = await supabase
    .from("meals")
    .select("id, log_date, meal_type, description, kcal, protein_g")
    .eq("user_id", user.id)
    .eq("log_date", date)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Não foi possível carregar as refeições. Tente de novo.");

  const meals: Meal[] = (data ?? []).map((m) => ({ ...m, kcal: Number(m.kcal), protein_g: Number(m.protein_g) }));
  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein_g, 0);
  const isPast = date < today;
  const tooLow = isPast && meals.length > 0 && totalKcal < 1500;

  const prev = addDays(date, -1);
  const next = addDays(date, 1);

  return (
    <div className="space-y-4">
      <PageHeader title="Alimentação" />

      <div className="flex items-center gap-2">
        <Link href={`/alimentacao?data=${prev}`} className={`${btnSecondaryCls} w-14`} aria-label="Dia anterior">
          ←
        </Link>
        <div className="flex-1 text-center">
          <p className="font-semibold">{date === today ? "Hoje" : fullDateBR(date)}</p>
          <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{weekdayName(date)}</p>
        </div>
        {date < today ? (
          <Link href={`/alimentacao?data=${next}`} className={`${btnSecondaryCls} w-14`} aria-label="Próximo dia">
            →
          </Link>
        ) : (
          <span className={`${btnSecondaryCls} w-14 opacity-40`} aria-hidden>
            →
          </span>
        )}
      </div>
      {date !== today && (
        <Link href="/alimentacao" className="block text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Voltar para hoje
        </Link>
      )}

      <Card title="Totais do dia">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{fmt(totalKcal)} kcal</span>
              <span>
                meta {fmt(settings.kcal_min)}–{fmt(settings.kcal_max)}
              </span>
            </div>
            <ProgressBar value={totalKcal} max={settings.kcal_max} color={totalKcal > settings.kcal_max ? "bg-amber-500" : "bg-emerald-500"} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{fmt(totalProtein)} g de proteína</span>
              <span>meta {fmt(settings.protein_goal_g)} g</span>
            </div>
            <ProgressBar value={totalProtein} max={settings.protein_goal_g} color="bg-violet-500" />
          </div>
        </div>
        {tooLow && (
          <div className="mt-3">
            <Notice tone="warn">
              Esse dia fechou com {fmt(totalKcal)} kcal, abaixo de 1.500. Tente comer um pouco mais: um déficit muito agressivo não é seguro nem
              sustentável.
            </Notice>
          </div>
        )}
      </Card>

      <Card title="Adicionar refeição">
        <MealForm date={date} />
      </Card>

      {MEAL_TYPES.map((type) => {
        const list = meals.filter((m) => m.meal_type === type);
        if (list.length === 0) return null;
        const sub = list.reduce((s, m) => s + m.kcal, 0);
        return (
          <Card key={type} title={`${MEAL_LABELS[type]} · ${fmt(sub)} kcal`}>
            <ul className="space-y-2">
              {list.map((m) => (
                <MealItem key={m.id} meal={m} />
              ))}
            </ul>
          </Card>
        );
      })}

      {meals.length === 0 && <p className="text-center text-sm text-slate-500 dark:text-slate-400">Nenhuma refeição registrada neste dia.</p>}
    </div>
  );
}
