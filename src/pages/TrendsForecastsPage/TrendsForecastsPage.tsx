// @ts-nocheck
import {
  AccountBalanceProgressionChart,
  CumulativeCategoryTrendChart,
  DayWeekSpendingPatternsChart,
  NetWorthTrendChart,
  SeasonalSpendingHeatmap,
  SmartInsightsPanel,
  SpendingForecastChart,
  YearOverYearComparisonChart,
} from "../../features/charts/components";

/**
 * Trends & Forecasts Section - Advanced analytics and predictions
 */
export const TrendsForecastsPage = ({ chartRefs, filteredData }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Smart Insights Panel - NEW! */}
      <SmartInsightsPanel filteredData={filteredData} />

      {/* Net Worth Trend */}
      <NetWorthTrendChart filteredData={filteredData} chartRef={chartRefs.netWorth} />

      {/* Cumulative & Advanced Analytics - Merged Section */}
      <div className="bg-gray-800/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Cumulative & Advanced Financial Analytics
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {/* Cumulative Category Trend */}
          <CumulativeCategoryTrendChart
            filteredData={filteredData}
            chartRef={chartRefs.cumulativeCategoryTrend}
          />

          {/* Seasonal Spending Heatmap */}
          <SeasonalSpendingHeatmap
            filteredData={filteredData}
            chartRef={chartRefs.seasonalSpendingHeatmap}
          />

          {/* Year-over-Year Comparison */}
          <YearOverYearComparisonChart
            filteredData={filteredData}
            chartRef={chartRefs.yearOverYearComparison}
          />

          {/* Spending Forecast */}
          <SpendingForecastChart
            filteredData={filteredData}
            chartRef={chartRefs.spendingForecast}
          />

          {/* Account Balance Progression */}
          <AccountBalanceProgressionChart
            filteredData={filteredData}
            chartRef={chartRefs.accountBalanceProgression}
          />

          {/* Day/Week Spending Patterns */}
          <DayWeekSpendingPatternsChart
            filteredData={filteredData}
            chartRef={chartRefs.dayWeekSpendingPatterns}
          />
        </div>
      </div>
    </div>
  );
};
