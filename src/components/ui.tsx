import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export const btnPrimaryCls =
  "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-emerald-700 disabled:opacity-60";

export const btnSecondaryCls =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98] hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800";

export const btnDangerCls =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-red-300 bg-white px-5 py-3 text-base font-semibold text-red-700 transition active:scale-[0.98] hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {title && <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h2>}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </header>
  );
}

export function ProgressBar({
  value,
  max,
  color = "bg-emerald-500",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "ok"; children: ReactNode }) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
    warn: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
    error: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  };
  return <p className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</p>;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
    </label>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`} />;
}
