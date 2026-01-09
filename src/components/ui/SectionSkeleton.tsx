import { ChartSkeleton, SkeletonCard } from "./Skeleton";

/**
 * SectionSkeleton - Loading placeholder for dashboard sections
 */
export const SectionSkeleton = () => {
  const cardIds = Array.from({ length: 4 }, (_, i) => `card-${Date.now()}-${i}`);
  const chartIds = Array.from({ length: 2 }, (_, i) => `chart-${Date.now()}-${i}`);

  return (
    <div className="space-y-8 animate-pulse">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardIds.map((id) => (
          <SkeletonCard key={id} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartIds.map((id) => (
          <ChartSkeleton key={id} />
        ))}
      </div>
    </div>
  );
};

export default SectionSkeleton;
