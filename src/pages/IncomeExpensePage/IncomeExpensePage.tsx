// @ts-nocheck
import {
  EnhancedMonthlyTrendsChart,
  EnhancedSpendingByAccountChart,
  EnhancedTopExpenseCategoriesChart,
  EnhancedTopIncomeSourcesChart,
  IncomeVsExpenseChart,
  SpendingByDayChart,
  SubcategoryBreakdownChart,
} from "../../features/charts/components";

/**
 * Income & Expense Section - Core spending and earning analysis
 */
export const IncomeExpensePage = ({
  chartData,
  chartRefs,
  filteredData,
  uniqueValues,
  drilldownCategory,
  setDrilldownCategory,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Income vs Expense Doughnut */}
      <IncomeVsExpenseChart data={chartData.doughnutChartData} chartRef={chartRefs.doughnut} />

      {/* Top Expense Categories */}
      <EnhancedTopExpenseCategoriesChart filteredData={filteredData} chartRef={chartRefs.bar} />

      {/* Top Income Sources */}
      <EnhancedTopIncomeSourcesChart
        filteredData={filteredData}
        chartRef={chartRefs.incomeSources}
      />

      {/* Spending by Account */}
      <EnhancedSpendingByAccountChart
        filteredData={filteredData}
        chartRef={chartRefs.spendingByAccount}
      />

      {/* Monthly Trends */}
      <EnhancedMonthlyTrendsChart filteredData={filteredData} chartRef={chartRefs.line} />

      {/* Detailed Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Day */}
        <SpendingByDayChart data={chartData.spendingByDayData} chartRef={chartRefs.spendingByDay} />

        {/* Subcategory Breakdown */}
        <SubcategoryBreakdownChart
          data={chartData.subcategoryBreakdownData}
          chartRef={chartRefs.subcategoryBreakdown}
          categories={uniqueValues.expenseCategories}
          selectedCategory={drilldownCategory}
          onCategoryChange={setDrilldownCategory}
        />
      </div>
    </div>
  );
};
