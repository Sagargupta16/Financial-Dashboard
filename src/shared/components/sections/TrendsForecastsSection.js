import React from "react";
import PropTypes from "prop-types";
import {
  NetWorthTrendChart,
  CumulativeCategoryTrendChart,
  SeasonalSpendingHeatmap,
  YearOverYearComparisonChart,
  SpendingForecastChart,
  AccountBalanceProgressionChart,
  DayWeekSpendingPatternsChart,
} from "../../../features/charts/components";

/**
 * Trends & Forecasts Section - Advanced analytics and predictions
 */
export const TrendsForecastsSection = ({ chartRefs, filteredData }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Net Worth Trend */}
      <NetWorthTrendChart
        filteredData={filteredData}
        chartRef={chartRefs.netWorth}
      />

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

TrendsForecastsSection.propTypes = {
  chartRefs: PropTypes.object.isRequired,
  filteredData: PropTypes.array.isRequired,
};
