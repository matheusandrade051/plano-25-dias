"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Hoje", icon: "🏠" },
  { href: "/peso", label: "Peso", icon: "⚖️" },
  { href: "/alimentacao", label: "Comida", icon: "🍽️" },
  { href: "/historico", label: "Histórico", icon: "📅" },
  { href: "/configuracoes", label: "Ajustes", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                  active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
