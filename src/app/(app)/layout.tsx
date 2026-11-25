import { BottomNav } from "@/components/BottomNav";
import { getSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getSession(); // redireciona para /login se não houver sessão
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-28 pt-6">
      {children}
      <BottomNav />
    </div>
  );
}
