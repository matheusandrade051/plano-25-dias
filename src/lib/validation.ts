import { z } from "zod";
import { isISODate } from "./dates";
import { parseDecimal } from "./format";
import { MEAL_TYPES, WORKOUT_TYPES } from "./types";

export const isoDate = z
  .string()
  .refine((v) => isISODate(v), { message: "Data inválida." });

/** Campo decimal obrigatório que aceita vírgula ou ponto. */
export function decimalField(label: string, min: number, max: number) {
  return z
    .any()
    .transform((v, ctx) => {
      const n = parseDecimal(v);
      if (n === null) {
        ctx.addIssue({ code: "custom", message: `${label}: informe um número válido (ex.: 97,8).` });
        return z.NEVER;
      }
      return n;
    })
    .pipe(
      z.number().min(min, { message: `${label}: mínimo ${min}.` }).max(max, { message: `${label}: máximo ${max}.` }),
    );
}

/** Campo inteiro opcional (vazio vira 0 ou o valor padrão). */
export function intField(label: string, min: number, max: number, fallback = 0) {
  return z
    .any()
    .transform((v, ctx) => {
      if (v === null || v === undefined || String(v).trim() === "") return fallback;
      const n = parseDecimal(v);
      if (n === null) {
        ctx.addIssue({ code: "custom", message: `${label}: informe um número válido.` });
        return z.NEVER;
      }
      return Math.round(n);
    })
    .pipe(
      z.number().min(min, { message: `${label}: mínimo ${min}.` }).max(max, { message: `${label}: máximo ${max}.` }),
    );
}

export const weightSchema = z.object({
  log_date: isoDate,
  weight_kg: decimalField("Peso", 30, 400),
  note: z.string().trim().max(200, "Observação muito longa.").optional(),
});

export const mealSchema = z.object({
  log_date: isoDate,
  meal_type: z.enum(MEAL_TYPES as [string, ...string[]], { message: "Tipo de refeição inválido." }),
  description: z.string().trim().min(1, "Descreva a refeição.").max(200, "Descrição muito longa."),
  kcal: intField("Calorias", 0, 10000),
  protein_g: intField("Proteína", 0, 1000),
});

export const dailySchema = z.object({
  log_date: isoDate,
  steps: intField("Passos", 0, 100000),
  sleep_hours: z
    .any()
    .transform((v, ctx) => {
      if (v === null || v === undefined || String(v).trim() === "") return null;
      const n = parseDecimal(v);
      if (n === null || n < 0 || n > 24) {
        ctx.addIssue({ code: "custom", message: "Sono: informe horas entre 0 e 24 (ex.: 7,5)." });
        return z.NEVER;
      }
      return n;
    }),
});

export const workoutTypeSchema = z.enum(WORKOUT_TYPES as [string, ...string[]]);

export const settingsSchema = z
  .object({
    start_date: isoDate,
    start_weight_kg: decimalField("Peso inicial", 30, 400),
    target_loss_kg: decimalField("Meta de perda", 0.5, 99),
    kcal_min: intField("Calorias mínimas", 500, 10000),
    kcal_max: intField("Calorias máximas", 500, 10000),
    protein_goal_g: intField("Meta de proteína", 0, 1000),
    water_goal_ml: intField("Meta de água", 0, 20000),
    steps_goal: intField("Meta de passos", 0, 100000),
  })
  .refine((v) => v.kcal_min <= v.kcal_max, {
    message: "As calorias mínimas não podem ser maiores que as máximas.",
    path: ["kcal_min"],
  });

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}
