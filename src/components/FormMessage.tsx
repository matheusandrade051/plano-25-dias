import type { ActionState } from "@/lib/types";
import { Notice } from "./ui";

export function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error) return <Notice tone="error">{state.error}</Notice>;
  if (state.ok && state.message) return <Notice tone="ok">{state.message}</Notice>;
  return null;
}
