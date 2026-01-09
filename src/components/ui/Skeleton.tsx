import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

/**
 * Card Skeleton - Loading placeholder for KPI cards
 */
export const SkeletonCard = () => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
      <Skeleton className="h-5 w-24 bg-gray-700" />
      <Skeleton className="h-8 w-32 bg-gray-700" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-gray-700" />
        <Skeleton className="h-3 w-4/5 bg-gray-700" />
      </div>
    </div>
  );
};

/**
 * Chart Skeleton - Loading placeholder for chart sections
 */
export const ChartSkeleton = () => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
      <Skeleton className="h-6 w-40 bg-gray-700" />
      <Skeleton className="h-64 w-full bg-gray-700 rounded-lg" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20 bg-gray-700" />
        <Skeleton className="h-4 w-20 bg-gray-700" />
      </div>
    </div>
  );
};

export { Skeleton };
