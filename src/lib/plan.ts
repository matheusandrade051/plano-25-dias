import { PLAN_DAYS, addDays, diffDays } from "./dates";
import type { WeightLog, WorkoutType } from "./types";

export type PlannedWorkout = { type: WorkoutType; label: string; detail: string };

/** Treino previsto por dia da semana (0 = domingo). */
export function plannedWorkout(weekday: number): PlannedWorkout {
  switch (weekday) {
    case 1:
    case 3:
    case 5:
      return { type: "forca", label: "Treino de força", detail: "Musculação ou treino com peso do corpo." };
    case 2:
    case 4:
      return { type: "cardio", label: "Cardio", detail: "Caminhada rápida, bicicleta ou corrida leve." };
    case 0:
      return { type: "descanso", label: "Descanso ativo", detail: "Alongamento ou uma caminhada tranquila." };
    default:
      return { type: "caminhada", label: "Dia livre", detail: "Sem treino fixo: uma caminhada ajuda." };
  }
}

// Marcos esperados de perda (kg) para um plano de 7 kg: [dia, mínimo, máximo]
const MILESTONES: [number, number, number][] = [
  [0, 0, 0],
  [7, 2.5, 3.5],
  [14, 4, 5],
  [25, 6, 7],
];

/** Faixa esperada de perda acumulada no dia `day` (1 = primeiro dia), com interpolação. */
export function expectedLossRange(day: number, targetLossKg: number): { min: number; max: number } {
  const d = Math.max(0, Math.min(PLAN_DAYS, day));
  const scale = targetLossKg / 7;
  for (let i = 1; i < MILESTONES.length; i++) {
    const [d1, min1, max1] = MILESTONES[i - 1];
    const [d2, min2, max2] = MILESTONES[i];
    if (d <= d2) {
      const t = (d - d1) / (d2 - d1);
      return {
        min: (min1 + (min2 - min1) * t) * scale,
        max: (max1 + (max2 - max1) * t) * scale,
      };
    }
  }
  return { min: 6 * scale, max: 7 * scale };
}

/** Marco mais próximo do dia atual (para exibir na comparação). */
export function nearestMilestoneDay(day: number): number {
  const days = [7, 14, 25];
  return days.find((d) => day <= d) ?? 25;
}

/** Média móvel de 7 dias corridos (inclui o dia) para cada registro. */
export function movingAverage7(logs: WeightLog[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const log of logs) {
    const start = addDays(log.log_date, -6);
    const window = logs.filter((l) => l.log_date >= start && l.log_date <= log.log_date);
    const avg = window.reduce((s, l) => s + Number(l.weight_kg), 0) / window.length;
    result.set(log.log_date, avg);
  }
  return result;
}

/** Número do dia do plano (1 = dia de início). Pode ser < 1 ou > PLAN_DAYS. */
export function planDayNumber(startDate: string, date: string): number {
  return diffDays(startDate, date) + 1;
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
