import Link from "next/link";
import { getSession, getSettings } from "@/lib/auth";
import { PLAN_DAYS, fullDateBR, todayISO, weekdayName, weekdayOf } from "@/lib/dates";
import { fmt, fmtKg, toInputDecimal } from "@/lib/format";
import { planDayNumber, plannedWorkout } from "@/lib/plan";
import { WORKOUT_LABELS, type WorkoutType } from "@/lib/types";
import { Card, PageHeader, ProgressBar, btnDangerCls, btnSecondaryCls } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { WeightForm } from "@/components/WeightForm";
import { DailyForm } from "@/components/DailyForm";
import { addWater, setWorkout } from "./actions";

export default async function HojePage() {
  const { supabase, user } = await getSession();
  const settings = await getSettings();
  const today = todayISO();

  const [weightRes, mealsRes, checkRes] = await Promise.all([
    supabase.from("weight_logs").select("weight_kg").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
    supabase.from("meals").select("kcal, protein_g").eq("user_id", user.id).eq("log_date", today),
    supabase.from("daily_checklist").select("*").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
  ]);
  if (weightRes.error || mealsRes.error || checkRes.error) {
    throw new Error("Não foi possível carregar os dados de hoje. Tente de novo.");
  }

  const kcal = (mealsRes.data ?? []).reduce((s, m) => s + Number(m.kcal), 0);
  const protein = (mealsRes.data ?? []).reduce((s, m) => s + Number(m.protein_g), 0);
  const water = Number(checkRes.data?.water_ml ?? 0);
  const steps = Number(checkRes.data?.steps ?? 0);
  const sleep = checkRes.data?.sleep_hours !== null && checkRes.data?.sleep_hours !== undefined ? Number(checkRes.data.sleep_hours) : null;
  const workoutDone = Boolean(checkRes.data?.workout_done);
  const todayWeight = weightRes.data ? Number(weightRes.data.weight_kg) : null;

  const day = planDayNumber(settings.start_date, today);
  const planned = plannedWorkout(weekdayOf(today));
  const loggedType = (checkRes.data?.workout_type as WorkoutType | null) ?? planned.type;

  let dayLabel = `Dia ${day} de ${PLAN_DAYS}`;
  if (day < 1) dayLabel = `Começa em ${fullDateBR(settings.start_date)}`;
  if (day > PLAN_DAYS) dayLabel = `Plano concluído (dia ${day})`;

  const kcalColor = kcal > settings.kcal_max ? "bg-amber-500" : kcal >= settings.kcal_min ? "bg-emerald-500" : "bg-sky-500";
  const kcalHint =
    kcal === 0
      ? "Nenhuma refeição registrada ainda."
      : kcal > settings.kcal_max
        ? "Passou um pouco da faixa. Sem drama, ajuste na próxima."
        : kcal >= settings.kcal_min
          ? "Dentro da faixa. Muito bem!"
          : `Faltam ${fmt(settings.kcal_min - kcal)} kcal para o mínimo.`;

  return (
    <div className="space-y-4">
      <PageHeader title={dayLabel} subtitle={`Hoje é ${weekdayName(today)}, ${fullDateBR(today)}`} />

      <Card title="Peso de hoje">
        {todayWeight !== null ? (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{fmtKg(todayWeight)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {todayWeight <= settings.start_weight_kg ? "−" : "+"}
                {fmt(Math.abs(settings.start_weight_kg - todayWeight), 2)} kg desde o início
              </p>
            </div>
            <Link href="/peso" className={`${btnSecondaryCls} min-h-11 py-2`}>
              Ver gráfico
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Pese-se de manhã, em jejum, para um registro mais comparável.</p>
            <WeightForm date={today} today={today} defaultWeight={toInputDecimal(null)} compact />
          </>
        )}
      </Card>

      <Card title="Alimentação">
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">Calorias</span>
              <span>
                {fmt(kcal)} / {fmt(settings.kcal_min)}–{fmt(settings.kcal_max)} kcal
              </span>
            </div>
            <ProgressBar value={kcal} max={settings.kcal_max} color={kcalColor} />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{kcalHint}</p>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">Proteína</span>
              <span>
                {fmt(protein)} / {fmt(settings.protein_goal_g)} g
              </span>
            </div>
            <ProgressBar value={protein} max={settings.protein_goal_g} color="bg-violet-500" />
          </div>
          <Link href="/alimentacao" className={`${btnSecondaryCls} w-full`}>
            Registrar refeição
          </Link>
        </div>
      </Card>

      <Card title="Água">
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-medium">{fmt(water)} ml</span>
          <span>meta {fmt(settings.water_goal_ml)} ml</span>
        </div>
        <ProgressBar value={water} max={settings.water_goal_ml} color="bg-sky-500" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <form action={addWater.bind(null, 250)}>
            <SubmitButton className={`${btnSecondaryCls} w-full`} pendingText="...">
              +250 ml
            </SubmitButton>
          </form>
          <form action={addWater.bind(null, 500)}>
            <SubmitButton className={`${btnSecondaryCls} w-full`} pendingText="...">
              +500 ml
            </SubmitButton>
          </form>
          <form action={addWater.bind(null, -250)}>
            <SubmitButton className={`${btnSecondaryCls} w-full text-slate-500`} pendingText="...">
              −250
            </SubmitButton>
          </form>
        </div>
      </Card>

      <Card title="Passos e sono">
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{fmt(steps)} passos</span>
            <span>meta {fmt(settings.steps_goal)}+</span>
          </div>
          <ProgressBar value={steps} max={settings.steps_goal} color="bg-orange-500" />
        </div>
        <DailyForm steps={steps} sleep={sleep !== null ? toInputDecimal(sleep, 1) : ""} />
      </Card>

      <Card title="Treino de hoje">
        <p className="text-lg font-semibold">{planned.label}</p>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{planned.detail}</p>
        {workoutDone ? (
          <form action={setWorkout.bind(null, loggedType, false)}>
            <p className="mb-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              ✅ Feito ({WORKOUT_LABELS[loggedType]})
            </p>
            <SubmitButton className={`${btnDangerCls} w-full`} pendingText="Salvando...">
              Desmarcar
            </SubmitButton>
          </form>
        ) : (
          <form action={setWorkout.bind(null, planned.type, true)}>
            <SubmitButton pendingText="Salvando...">Marcar como feito</SubmitButton>
          </form>
        )}
      </Card>
    </div>
  );
}
