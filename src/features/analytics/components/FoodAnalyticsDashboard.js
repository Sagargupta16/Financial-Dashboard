/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  analyzeFoodSpending,
  calculateDailyFoodAverage,
  calculateFoodSavingsPotential,
  getFoodFrequencyInsights,
  compareHomeCookingVsEatingOut,
} from "../utils/foodAnalytics";

/**
 * Food Analytics Dashboard
 * Comprehensive analysis of food and dining spending
 */
export const FoodAnalyticsDashboard = ({ filteredData }) => {
  const foodAnalysis = useMemo(() => {
    return analyzeFoodSpending(filteredData);
  }, [filteredData]);

  const dailyAverage = useMemo(() => {
    return calculateDailyFoodAverage(
      foodAnalysis.breakdown,
      foodAnalysis.dateRange
    );
  }, [foodAnalysis]);

  const savingsPotential = useMemo(() => {
    return calculateFoodSavingsPotential(
      foodAnalysis.breakdown,
      foodAnalysis.dateRange
    );
  }, [foodAnalysis]);

  const frequencyInsights = useMemo(() => {
    return getFoodFrequencyInsights(
      foodAnalysis.breakdown,
      foodAnalysis.dateRange
    );
  }, [foodAnalysis]);

  const cookingComparison = useMemo(() => {
    return compareHomeCookingVsEatingOut(foodAnalysis.breakdown);
  }, [foodAnalysis]);

  // Chart data for breakdown
  const breakdownChartData = {
    labels: [
      "Office Cafeteria",
      "Delivery Apps",
      "Groceries",
      "Dining Out",
      "Snacks",
      "Parties",
    ],
    datasets: [
      {
        data: [
          foodAnalysis.breakdown.officeCafeteria.total,
          foodAnalysis.breakdown.deliveryApps.total,
          foodAnalysis.breakdown.groceries.total,
          foodAnalysis.breakdown.diningOut.total,
          foodAnalysis.breakdown.snacks.total,
          foodAnalysis.breakdown.parties.total,
        ],
        backgroundColor: [
          "#ef4444", // red
          "#f97316", // orange
          "#10b981", // green
          "#8b5cf6", // purple
          "#f59e0b", // amber
          "#ec4899", // pink
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", padding: 15 },
      },
    },
  };

  // Daily average bar chart
  const dailyBarData = {
    labels: [
      "Office",
      "Delivery",
      "Groceries",
      "Dining Out",
      "Snacks",
      "Parties",
    ],
    datasets: [
      {
        label: "Daily Average (₹)",
        data: [
          dailyAverage.officeCafeteria,
          dailyAverage.deliveryApps,
          dailyAverage.groceries,
          dailyAverage.diningOut,
          dailyAverage.snacks,
          dailyAverage.parties,
        ],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      x: {
        ticks: { color: "#fff" },
        grid: { display: false },
      },
    },
  };

  if (foodAnalysis.totalCount === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No food & dining transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          🍽️ Food Analytics Dashboard
        </h2>
        <p className="text-gray-400 mt-1">
          Comprehensive analysis of your food and dining spending
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4">
          <p className="text-red-100 text-sm">Total Food Spending</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{foodAnalysis.totalSpent.toLocaleString()}
          </p>
          <p className="text-red-200 text-xs mt-1">
            {foodAnalysis.totalCount} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4">
          <p className="text-orange-100 text-sm">Office Cafeteria</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{foodAnalysis.breakdown.officeCafeteria.total.toLocaleString()}
          </p>
          <p className="text-orange-200 text-xs mt-1">
            {foodAnalysis.breakdown.officeCafeteria.count} visits
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
          <p className="text-purple-100 text-sm">Delivery Apps</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{foodAnalysis.breakdown.deliveryApps.total.toLocaleString()}
          </p>
          <p className="text-purple-200 text-xs mt-1">
            {foodAnalysis.breakdown.deliveryApps.count} orders
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
          <p className="text-green-100 text-sm">Avg per Transaction</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{foodAnalysis.averagePerTransaction.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown Pie Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Food Spending Breakdown
          </h3>
          <div className="h-64">
            <Doughnut data={breakdownChartData} options={chartOptions} />
          </div>
        </div>

        {/* Daily Average Bar Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Average Spending
          </h3>
          <div className="h-64">
            <Bar data={dailyBarData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Frequency Insights */}
      {frequencyInsights.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            📊 Frequency Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {frequencyInsights.map((insight) => (
              <div
                key={insight.category}
                className="bg-gray-700/50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{insight.icon}</span>
                  <div>
                    <p className="text-white font-medium">{insight.category}</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {typeof insight.frequency === "string"
                        ? insight.frequency
                        : `${insight.frequency?.toFixed(2) || 0}x`}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Home Cooking vs Eating Out */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          🏠 Home Cooking vs Eating Out
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Home Cooking (Groceries)</span>
              <span className="text-white font-medium">
                {cookingComparison.homeCookingPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-500"
                style={{ width: `${cookingComparison.homeCookingPercent}%` }}
              />
            </div>
            <p className="text-xl font-bold text-white mt-2">
              ₹{cookingComparison.homeCooking.toLocaleString()}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">
                Eating Out (Delivery + Restaurants)
              </span>
              <span className="text-white font-medium">
                {cookingComparison.eatingOutPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500"
                style={{ width: `${cookingComparison.eatingOutPercent}%` }}
              />
            </div>
            <p className="text-xl font-bold text-white mt-2">
              ₹{cookingComparison.eatingOut.toLocaleString()}
            </p>
          </div>
        </div>
        <div
          className={`mt-4 p-4 rounded-lg border ${
            cookingComparison.balance === "good"
              ? "bg-green-900/20 border-green-500/30"
              : "bg-yellow-900/20 border-yellow-500/30"
          }`}
        >
          <p
            className={`font-medium ${
              cookingComparison.balance === "good"
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            {cookingComparison.recommendation}
          </p>
        </div>
      </div>

      {/* Savings Potential */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          💰 Savings Potential
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {savingsPotential.map((scenario) => (
            <div
              key={scenario.name}
              className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-4"
            >
              <p className="text-gray-300 text-sm mb-2">{scenario.name}</p>
              <p className="text-2xl font-bold text-green-400">
                ₹{scenario.monthlySavings?.toFixed(0) || 0}
              </p>
              <p className="text-gray-400 text-xs mt-1">per month</p>
              <p className="text-blue-400 text-sm mt-2">
                Annual: ₹{scenario.annualSavings?.toFixed(0) || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FoodAnalyticsDashboard.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
