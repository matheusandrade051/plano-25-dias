import { getSession, getSettings } from "@/lib/auth";
import { PLAN_DAYS, addDays, diffDays, fullDateBR, todayISO, weekdayName } from "@/lib/dates";
import { fmt } from "@/lib/format";
import { mean, planDayNumber } from "@/lib/plan";
import { WORKOUT_LABELS, type WorkoutType } from "@/lib/types";
import { Card, PageHeader } from "@/components/ui";

type DayRow = {
  date: string;
  weight: number | null;
  kcal: number;
  hasMeals: boolean;
  protein: number;
  water: number;
  steps: number;
  workoutDone: boolean;
  workoutType: WorkoutType | null;
};

export default async function HistoricoPage() {
  const { supabase, user } = await getSession();
  const settings = await getSettings();
  const today = todayISO();

  const [w, m, c] = await Promise.all([
    supabase.from("weight_logs").select("log_date, weight_kg").eq("user_id", user.id),
    supabase.from("meals").select("log_date, kcal, protein_g").eq("user_id", user.id),
    supabase.from("daily_checklist").select("log_date, water_ml, steps, workout_done, workout_type").eq("user_id", user.id),
  ]);
  if (w.error || m.error || c.error) throw new Error("Não foi possível carregar o histórico. Tente de novo.");

  const rows = new Map<string, DayRow>();
  const get = (date: string): DayRow => {
    let r = rows.get(date);
    if (!r) {
      r = { date, weight: null, kcal: 0, hasMeals: false, protein: 0, water: 0, steps: 0, workoutDone: false, workoutType: null };
      rows.set(date, r);
    }
    return r;
  };

  // Todos os dias do plano já iniciados
  const lastPlanDate = addDays(settings.start_date, PLAN_DAYS - 1);
  const until = today < lastPlanDate ? today : lastPlanDate;
  for (let d = settings.start_date; d <= until; d = addDays(d, 1)) get(d);

  for (const x of w.data ?? []) get(x.log_date).weight = Number(x.weight_kg);
  for (const x of m.data ?? []) {
    const r = get(x.log_date);
    r.kcal += Number(x.kcal);
    r.protein += Number(x.protein_g);
    r.hasMeals = true;
  }
  for (const x of c.data ?? []) {
    const r = get(x.log_date);
    r.water = Number(x.water_ml);
    r.steps = Number(x.steps);
    r.workoutDone = Boolean(x.workout_done);
    r.workoutType = (x.workout_type as WorkoutType | null) ?? null;
  }

  const list = [...rows.values()].sort((a, b) => (a.date < b.date ? 1 : -1));

  // Resumo semanal (semanas do plano: dias 1–7, 8–14, 15–21, 22–25)
  const weeks = new Map<number, DayRow[]>();
  for (const r of list) {
    const day = planDayNumber(settings.start_date, r.date);
    if (day < 1 || day > PLAN_DAYS) continue;
    const wk = Math.floor((day - 1) / 7) + 1;
    weeks.set(wk, [...(weeks.get(wk) ?? []), r]);
  }
  const weekSummaries = [...weeks.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([wk, days]) => ({
      wk,
      avgWeight: mean(days.filter((d) => d.weight !== null).map((d) => d.weight as number)),
      avgKcal: mean(days.filter((d) => d.hasMeals).map((d) => d.kcal)),
      workouts: days.filter((d) => d.workoutDone).length,
      from: days[days.length - 1].date,
      to: days[0].date,
    }));

  return (
    <div className="space-y-4">
      <PageHeader title="Histórico" subtitle="Seus dias, do mais recente ao mais antigo." />

      {weekSummaries.length > 0 && (
        <Card title="Resumo semanal">
          <ul className="space-y-3">
            {weekSummaries.map((s) => (
              <li key={s.wk} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="font-semibold">
                  Semana {s.wk}{" "}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({fullDateBR(s.from).slice(0, 5)} a {fullDateBR(s.to).slice(0, 5)})
                  </span>
                </p>
                <dl className="mt-1 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Peso médio</dt>
                    <dd className="font-semibold">{s.avgWeight !== null ? `${fmt(s.avgWeight, 2)} kg` : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Média kcal</dt>
                    <dd className="font-semibold">{s.avgKcal !== null ? fmt(s.avgKcal) : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Treinos</dt>
                    <dd className="font-semibold">{s.workouts}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Dias">
        {list.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Ainda não há registros.</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {list.map((r) => {
              const day = diffDays(settings.start_date, r.date) + 1;
              return (
                <li key={r.date} className="py-3">
                  <p className="font-semibold">
                    {fullDateBR(r.date)}{" "}
                    <span className="text-xs font-normal capitalize text-slate-500 dark:text-slate-400">
                      {weekdayName(r.date)}
                      {day >= 1 && day <= PLAN_DAYS ? ` · dia ${day}` : ""}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    ⚖️ {r.weight !== null ? `${fmt(r.weight, 2)} kg` : "—"} · 🔥 {fmt(r.kcal)} kcal · 🥩 {fmt(r.protein)} g
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    💧 {fmt(r.water)} ml · 👟 {fmt(r.steps)} · 🏋️{" "}
                    {r.workoutDone ? `Feito${r.workoutType ? ` (${WORKOUT_LABELS[r.workoutType]})` : ""}` : "Não"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
