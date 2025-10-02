/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  calculateCategorySpending,
  calculateHealthScore,
  generateRecommendations,
} from "../../../features/budget/utils/budgetUtils";

/**
 * Financial Health Score Dashboard
 * Calculates and displays overall financial health with recommendations
 */
export const FinancialHealthScore = ({
  filteredData,
  kpiData,
  accountBalances,
}) => {
  const healthData = useMemo(() => {
    const categorySpending = calculateCategorySpending(filteredData);
    const totalExpenses = Object.values(categorySpending).reduce(
      (sum, val) => sum + val,
      0
    );

    const income = kpiData?.income || 0;
    const data = {
      income,
      expenses: totalExpenses,
      savings: income - totalExpenses,
      accountBalances: accountBalances || {},
      categorySpending,
    };

    const score = calculateHealthScore(data);
    const budgetComparison = {}; // Can be enhanced with actual budgets later
    const recommendations = generateRecommendations(budgetComparison, score);

    return { score, recommendations, data };
  }, [filteredData, kpiData, accountBalances]);

  const { score, recommendations } = healthData;

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 80) {
      return "text-green-400";
    }
    if (scoreValue >= 60) {
      return "text-yellow-400";
    }
    return "text-red-400";
  };

  const getGradient = (scoreValue) => {
    if (scoreValue >= 80) {
      return "from-green-600 to-green-700";
    }
    if (scoreValue >= 60) {
      return "from-yellow-600 to-yellow-700";
    }
    return "from-red-600 to-red-700";
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        🏆 Financial Health Score
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score */}
        <div className="md:col-span-1">
          <div
            className={`bg-gradient-to-br ${getGradient(score?.score || 0)} rounded-xl p-6 text-center`}
          >
            <p className="text-white/80 text-sm mb-2">Overall Score</p>
            <p
              className={`text-6xl font-bold ${getScoreColor(score?.score || 0)}`}
            >
              {score?.score || 0}
            </p>
            <p className="text-white/60 text-sm mt-1">out of 100</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-white text-xl font-bold">
                Grade: {score?.grade || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Savings Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {score?.savingsRate || 0}%
              </p>
              <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  style={{
                    width: `${Math.min(100, (parseFloat(score?.savingsRate) || 0) * 5)}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Emergency Fund</p>
              <p className="text-2xl font-bold text-white mt-1">
                {score?.monthsCovered || 0} months
              </p>
              <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-blue-600"
                  style={{
                    width: `${Math.min(100, (parseFloat(score?.monthsCovered) || 0 / 6) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Metric Scores */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-white font-medium mb-3">Score Breakdown</p>
            <div className="space-y-2">
              {score?.metrics &&
                Object.entries(score.metrics).map(([key, value]) => {
                  const maxScores = {
                    savingsRate: 30,
                    consistency: 20,
                    emergencyFund: 25,
                    ratio: 15,
                    categoryBalance: 10,
                  };
                  const max = maxScores[key] || 10;
                  const percentage = (value / max) * 100;

                  return (
                    <div key={key} className="flex items-center gap-3">
                      <p className="text-gray-400 text-sm w-32 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-white text-sm w-12 text-right">
                        {value}/{max}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            💡 Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => {
              let bgClass = "bg-blue-900/20 border-blue-500/30";
              let textClass = "text-blue-400";

              if (rec.type === "alert") {
                bgClass = "bg-red-900/20 border-red-500/30";
                textClass = "text-red-400";
              } else if (rec.type === "warning") {
                bgClass = "bg-yellow-900/20 border-yellow-500/30";
                textClass = "text-yellow-400";
              } else if (rec.type === "success") {
                bgClass = "bg-green-900/20 border-green-500/30";
                textClass = "text-green-400";
              }

              return (
                <div
                  key={`${rec.type}-${rec.category}-${index}`}
                  className={`rounded-lg p-4 border ${bgClass}`}
                >
                  <p className={`font-medium mb-2 ${textClass}`}>
                    {rec.message}
                  </p>
                  <p className="text-gray-300 text-sm">{rec.action}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

FinancialHealthScore.propTypes = {
  filteredData: PropTypes.array.isRequired,
  kpiData: PropTypes.object.isRequired,
  accountBalances: PropTypes.object.isRequired,
};
