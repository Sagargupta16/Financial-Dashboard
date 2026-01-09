// @ts-nocheck
import {
  EnhancedSubcategoryBreakdownChart,
  MultiCategoryTimeAnalysisChart,
  TreemapChart,
} from "../../features/charts/components";

/**
 * Category Analysis Section - Deep dive into spending categories
 */
export const CategoryAnalysisPage = ({
  chartRefs,
  filteredData,
  uniqueValues,
  drilldownCategory,
  setDrilldownCategory,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Treemap Chart */}
      <TreemapChart filteredData={filteredData} chartRef={chartRefs.treemap} />

      {/* Time-based Category Analysis */}
      <div className="bg-gray-800/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Time-based Category Analysis</h2>
        <div className="grid grid-cols-1 gap-6">
          {/* Enhanced Subcategory Breakdown */}
          <EnhancedSubcategoryBreakdownChart
            filteredData={filteredData}
            chartRef={chartRefs.enhancedSubcategoryBreakdown}
            categories={uniqueValues.expenseCategories}
            selectedCategory={drilldownCategory}
            onCategoryChange={setDrilldownCategory}
          />

          {/* Multi-Category Time Analysis */}
          <MultiCategoryTimeAnalysisChart
            filteredData={filteredData}
            chartRef={chartRefs.multiCategoryTimeAnalysis}
            categories={uniqueValues.expenseCategories}
          />
        </div>
      </div>
    </div>
  );
};
