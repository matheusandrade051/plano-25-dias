export const TIMEZONE = "America/Sao_Paulo";
export const PLAN_DAYS = 25;

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isISODate(value: string | null | undefined): value is string {
  if (!value || !ISO_RE.test(value)) return false;
  const d = new Date(value + "T12:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Data de hoje (AAAA-MM-DD) no fuso de São Paulo. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Diferença em dias (b - a). */
export function diffDays(a: string, b: string): number {
  const da = new Date(a + "T12:00:00Z").getTime();
  const db = new Date(b + "T12:00:00Z").getTime();
  return Math.round((db - da) / 86_400_000);
}

/** 0 = domingo ... 6 = sábado */
export function weekdayOf(iso: string): number {
  return new Date(iso + "T12:00:00Z").getUTCDay();
}

const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export function weekdayName(iso: string): string {
  return WEEKDAYS[weekdayOf(iso)];
}

/** 25/11 */
export function shortDateBR(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** 25/11/2026 */
export function fullDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
