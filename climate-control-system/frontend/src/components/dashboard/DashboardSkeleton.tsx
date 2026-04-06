import { Skeleton } from "../ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-64" />
        ))}
      </div>
    </div>
  );
}
