import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  );
}
