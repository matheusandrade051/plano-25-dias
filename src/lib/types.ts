export type MealType = "cafe_da_manha" | "almoco" | "lanche" | "jantar" | "extra";
export type WorkoutType = "forca" | "cardio" | "caminhada" | "descanso";

export const MEAL_TYPES: MealType[] = ["cafe_da_manha", "almoco", "lanche", "jantar", "extra"];

export const MEAL_LABELS: Record<MealType, string> = {
  cafe_da_manha: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
  extra: "Extra",
};

export const WORKOUT_TYPES: WorkoutType[] = ["forca", "cardio", "caminhada", "descanso"];

export const WORKOUT_LABELS: Record<WorkoutType, string> = {
  forca: "Força",
  cardio: "Cardio",
  caminhada: "Caminhada",
  descanso: "Descanso ativo",
};

export type Settings = {
  user_id: string;
  start_date: string;
  start_weight_kg: number;
  target_loss_kg: number;
  kcal_min: number;
  kcal_max: number;
  protein_goal_g: number;
  water_goal_ml: number;
  steps_goal: number;
};

export type WeightLog = {
  id: string;
  log_date: string;
  weight_kg: number;
  note: string | null;
};

export type Meal = {
  id: string;
  log_date: string;
  meal_type: MealType;
  description: string;
  kcal: number;
  protein_g: number;
};

export type Checklist = {
  log_date: string;
  water_ml: number;
  steps: number;
  workout_done: boolean;
  workout_type: WorkoutType | null;
  sleep_hours: number | null;
  note: string | null;
};

export type ActionState = { ok?: boolean; error?: string; message?: string } | null;
