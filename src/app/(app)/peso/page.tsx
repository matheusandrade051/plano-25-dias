import { getSession, getSettings } from "@/lib/auth";
import { PLAN_DAYS, addDays, fullDateBR, shortDateBR, todayISO } from "@/lib/dates";
import { fmt, fmtKg, toInputDecimal } from "@/lib/format";
import { expectedLossRange, mean, movingAverage7, nearestMilestoneDay, planDayNumber } from "@/lib/plan";
import type { WeightLog } from "@/lib/types";
import { Card, Notice, PageHeader, btnDangerCls } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { WeightChart, type ChartPoint } from "@/components/WeightChart";
import { WeightForm } from "@/components/WeightForm";
import { deleteWeight } from "./actions";

export default async function PesoPage() {
  const { supabase, user } = await getSession();
  const settings = await getSettings();
  const today = todayISO();

  const { data, error } = await supabase
    .from("weight_logs")
    .select("id, log_date, weight_kg, note")
    .eq("user_id", user.id)
    .order("log_date", { ascending: true });
  if (error) throw new Error("Não foi possível carregar os pesos. Tente de novo.");

  const logs: WeightLog[] = (data ?? []).map((l) => ({ ...l, weight_kg: Number(l.weight_kg) }));
  const avgMap = movingAverage7(logs);
  const logMap = new Map(logs.map((l) => [l.log_date, l]));

  const targetWeight = settings.start_weight_kg - settings.target_loss_kg;
  const endDate = addDays(settings.start_date, PLAN_DAYS - 1);
  const lastLogDate = logs.length ? logs[logs.length - 1].log_date : settings.start_date;
  const chartEnd = lastLogDate > endDate ? lastLogDate : endDate;

  // Um ponto por dia, do início do plano até o fim (ou último registro)
  const points: ChartPoint[] = [];
  for (let d = settings.start_date, i = 0; d <= chartEnd && i < 120; d = addDays(d, 1), i++) {
    const day = i + 1;
    const goal = day <= PLAN_DAYS ? settings.start_weight_kg - (settings.target_loss_kg * (day - 1)) / (PLAN_DAYS - 1) : null;
    const log = logMap.get(d);
    points.push({
      label: shortDateBR(d),
      weight: log ? log.weight_kg : null,
      avg: log ? Number(avgMap.get(d)?.toFixed(2)) : null,
      goal: goal !== null ? Number(goal.toFixed(2)) : null,
    });
  }

  // Pontos fora do intervalo do plano (registros antes do início)
  const before = logs.filter((l) => l.log_date < settings.start_date).map((l) => ({
    label: shortDateBR(l.log_date),
    weight: l.weight_kg,
    avg: Number(avgMap.get(l.log_date)?.toFixed(2)),
    goal: null,
  }));
  const chartData = [...before, ...points];

  const latest = logs.length ? logs[logs.length - 1] : null;
  const last7 = logs.filter((l) => l.log_date > addDays(today, -7)).map((l) => l.weight_kg);
  const weeklyAvg = mean(last7);
  const lost = latest ? settings.start_weight_kg - latest.weight_kg : 0;
  const remaining = latest ? Math.max(0, latest.weight_kg - targetWeight) : settings.target_loss_kg;

  const day = Math.max(1, Math.min(PLAN_DAYS, planDayNumber(settings.start_date, today)));
  const expected = expectedLossRange(day, settings.target_loss_kg);
  const milestoneDay = nearestMilestoneDay(day);
  const milestone = expectedLossRange(milestoneDay, settings.target_loss_kg);

  let status = "";
  if (latest) {
    if (lost < expected.min) status = "Um pouco abaixo da faixa esperada. É normal oscilar; o que vale é a tendência da média semanal.";
    else if (lost > expected.max) status = "Acima da faixa esperada. Ótimo, mas cuide para não exagerar no déficit.";
    else status = "Dentro da faixa esperada para este dia. Continue assim!";
  }

  const todayLog = logMap.get(today);
  const recent = [...logs].reverse().slice(0, 7);

  return (
    <div className="space-y-4">
      <PageHeader title="Peso" subtitle={`Peso alvo: ${fmtKg(targetWeight)}`} />

      <Card title={todayLog ? "Atualizar peso" : "Registrar peso"}>
        <WeightForm date={today} today={today} defaultWeight={todayLog ? toInputDecimal(todayLog.weight_kg) : undefined} />
      </Card>

      <Card title="Média da semana">
        {weeklyAvg !== null ? (
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{fmtKg(weeklyAvg)}</p>
        ) : (
          <p className="text-slate-500">Registre pesos para ver a média.</p>
        )}
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          O peso oscila de um dia para o outro com água, sal e comida. Olhe para a média da semana, não para um dia isolado.
        </p>
      </Card>

      <Card title="Evolução">
        {logs.length > 0 ? (
          <WeightChart data={chartData} />
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">O gráfico aparece depois do primeiro registro.</p>
        )}
      </Card>

      <Card title="Resultados">
        <dl className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="text-xs text-slate-500 dark:text-slate-400">Já perdeu</dt>
            <dd className="text-xl font-bold">{latest ? `${lost >= 0 ? "" : "+"}${fmt(Math.abs(lost), 2)} kg` : "—"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="text-xs text-slate-500 dark:text-slate-400">Falta para a meta</dt>
            <dd className="text-xl font-bold">{fmt(remaining, 2)} kg</dd>
          </div>
        </dl>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <strong>Esperado até o dia {day}:</strong> perder de {fmt(expected.min, 1)} a {fmt(expected.max, 1)} kg.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Próximo marco (dia {milestoneDay}): −{fmt(milestone.min, 1)} a −{fmt(milestone.max, 1)} kg.
          </p>
          {status && <Notice tone="info">{status}</Notice>}
        </div>
      </Card>

      {recent.length > 0 && (
        <Card title="Últimos registros">
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {recent.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <p className="font-medium">{fmtKg(l.weight_kg)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {fullDateBR(l.log_date)}
                    {l.note ? ` · ${l.note}` : ""}
                  </p>
                </div>
                <form action={deleteWeight}>
                  <input type="hidden" name="log_date" value={l.log_date} />
                  <SubmitButton className={`${btnDangerCls} min-h-10 px-3 py-1 text-sm`} pendingText="...">
                    Excluir
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
