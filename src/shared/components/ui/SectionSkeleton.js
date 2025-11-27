import React from "react";
import { SkeletonCard, ChartSkeleton } from "./Skeleton";

/**
 * SectionSkeleton - Loading placeholder for dashboard sections
 */
export const SectionSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* KPI Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <ChartSkeleton key={index} />
      ))}
    </div>
  </div>
);
