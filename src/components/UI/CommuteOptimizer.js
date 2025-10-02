/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  analyzeCommuteSpending,
  calculateMonthlyCommuteProjection,
  calculateCommuteAlternatives,
  analyzeCommutePatterns,
} from "../../utils/commuteAnalytics";

/**
 * Commute Cost Optimizer
 * Analyzes daily commute expenses and suggests alternatives
 */
export const CommuteOptimizer = ({ filteredData }) => {
  const commuteData = useMemo(() => {
    return analyzeCommuteSpending(filteredData);
  }, [filteredData]);

  const monthlyProjection = useMemo(() => {
    return calculateMonthlyCommuteProjection(commuteData);
  }, [commuteData]);

  const alternatives = useMemo(() => {
    return calculateCommuteAlternatives(commuteData);
  }, [commuteData]);

  const patterns = useMemo(() => {
    return analyzeCommutePatterns(commuteData.transactions);
  }, [commuteData]);

  // Pattern chart data
  const patternChartData = {
    labels: ["Morning (Flat→Office)", "Evening (Office→Flat)", "Other"],
    datasets: [
      {
        label: "Average Cost (₹)",
        data: [
          patterns.morning.average,
          patterns.evening.average,
          patterns.other.average,
        ],
        backgroundColor: ["#f59e0b", "#8b5cf6", "#3b82f6"],
      },
    ],
  };

  const chartOptions = {
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

  if (commuteData.count === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No commute transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          🚗 Commute Cost Optimizer
        </h2>
        <p className="text-gray-400 mt-1">
          Analyze your daily commute and find ways to save
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4">
          <p className="text-orange-100 text-sm">Total Commute Cost</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{commuteData.total.toLocaleString()}
          </p>
          <p className="text-orange-200 text-xs mt-1">
            {commuteData.count} rides
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
          <p className="text-blue-100 text-sm">Average per Ride</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{commuteData.averagePerRide.toFixed(0)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
          <p className="text-purple-100 text-sm">Rides per Day</p>
          <p className="text-3xl font-bold text-white mt-1">
            {monthlyProjection.ridesPerDay.toFixed(1)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
          <p className="text-green-100 text-sm">Daily Average</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{monthlyProjection.costPerDay.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Monthly Projection */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📊 Monthly Projection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Projected Monthly Cost</p>
            <p className="text-4xl font-bold text-white mt-2">
              ₹{monthlyProjection.costPerMonth.toFixed(0)}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Based on {commuteData.count} rides in the period
            </p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Projected Monthly Rides</p>
            <p className="text-4xl font-bold text-white mt-2">
              {monthlyProjection.ridesPerMonth.toFixed(0)}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              ~{monthlyProjection.ridesPerDay.toFixed(1)} rides per day
            </p>
          </div>
        </div>
      </div>

      {/* Commute Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🕐 Commute Patterns
          </h3>
          <div className="h-64">
            <Bar data={patternChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            📍 Direction Breakdown
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-amber-400 font-medium">
                  Morning (Flat → Office)
                </span>
                <span className="text-white font-bold">
                  ₹{patterns.morning.average.toFixed(0)}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {patterns.morning.count} rides • Total: ₹
                {patterns.morning.total.toFixed(0)}
              </p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-400 font-medium">
                  Evening (Office → Flat)
                </span>
                <span className="text-white font-bold">
                  ₹{patterns.evening.average.toFixed(0)}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {patterns.evening.count} rides • Total: ₹
                {patterns.evening.total.toFixed(0)}
              </p>
            </div>

            {patterns.other.count > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-medium">Other Rides</span>
                  <span className="text-white font-bold">
                    ₹{patterns.other.average.toFixed(0)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {patterns.other.count} rides • Total: ₹
                  {patterns.other.total.toFixed(0)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alternative Suggestions */}
      {alternatives.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            💡 Save Money with Alternatives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {alternatives.map((alt) => (
              <div
                key={alt.name}
                className={`rounded-lg p-4 border ${
                  alt.recommended
                    ? "bg-green-900/20 border-green-500/30"
                    : "bg-gray-700/50 border-gray-600"
                }`}
              >
                {alt.recommended && (
                  <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs rounded mb-2">
                    Recommended
                  </span>
                )}
                <p className="text-white font-medium mb-2">{alt.name}</p>
                <p className="text-gray-400 text-sm mb-3">{alt.description}</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Monthly Cost</span>
                    <span className="text-white font-medium">
                      ₹{alt.cost.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400 text-sm font-medium">
                      Savings
                    </span>
                    <span className="text-green-400 font-bold">
                      ₹{alt.savings.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-blue-400 text-xs mt-2">
                    Annual: ₹{(alt.savings * 12).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CommuteOptimizer.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
