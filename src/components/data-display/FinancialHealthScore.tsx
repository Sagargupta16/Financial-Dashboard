import { useMemo } from "react";
import {
  calculateCategorySpending,
  calculateHealthScore,
  generateRecommendations,
} from "../../features/budget/utils/budgetUtils";
import { getGradient, getScoreColor, prepareHealthData } from "../../lib/analytics/healthScore";

interface ScoreDisplayProps {
  score?: {
    score?: number;
    grade?: string;
    savingsRate?: number;
    incomeStability?: number;
    debtToIncome?: number;
    expenseConsistency?: number;
    cashFlowHealth?: number;
  };
}

interface RecommendationCardProps {
  rec: {
    type?: string;
    category?: string;
    message?: string;
    action?: string;
  };
  index: number;
}

type HealthDataInput = Record<string, unknown>;

interface FinancialHealthScoreProps {
  filteredData: HealthDataInput[];
  kpiData: HealthDataInput;
  accountBalances?: HealthDataInput;
  allAccountBalances?: HealthDataInput;
  investments?: HealthDataInput;
  deposits?: HealthDataInput;
}

/**
 * Main Score Display Component
 */
const ScoreDisplay = ({ score }: ScoreDisplayProps) => (
  <div className="md:col-span-1">
    <div
      className={`bg-gradient-to-br ${getGradient(score?.score || 0)} rounded-xl p-6 text-center`}
    >
      <p className="text-white/80 text-sm mb-2">Overall Score</p>
      <p className={`text-6xl font-bold ${getScoreColor(score?.score || 0)}`}>
        {score?.score || 0}
      </p>
      <p className="text-white/60 text-sm mt-1">out of 100</p>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white text-xl font-bold">Grade: {score?.grade || "N/A"}</p>
      </div>
    </div>
  </div>
);

/**
 * Recommendation Card Component
 */
const RecommendationCard = ({ rec, index }: RecommendationCardProps) => {
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
      <p className={`font-medium mb-2 ${textClass}`}>{rec.message}</p>
      <p className="text-gray-300 text-sm">{rec.action}</p>
    </div>
  );
};

/**
 * Financial Health Score Dashboard
 * Calculates and displays overall financial health with recommendations
 */
export const FinancialHealthScore = ({
  filteredData,
  kpiData,
  accountBalances,
  allAccountBalances,
  investments,
  deposits,
}: FinancialHealthScoreProps) => {
  const healthData = useMemo(
    () =>
      prepareHealthData({
        filteredData,
        kpiData,
        accountBalances,
        allAccountBalances,
        investments,
        deposits,
        calculateCategorySpending,
        calculateHealthScore,
        generateRecommendations,
      }),
    [filteredData, kpiData, accountBalances, allAccountBalances, investments, deposits]
  );

  const { score, recommendations } = healthData;

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">🏆 Financial Health Score</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score */}
        <ScoreDisplay score={score} />

        {/* Metrics Breakdown */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Savings Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{score?.savingsRate || 0}%</p>
              <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  style={{
                    width: `${Math.min(100, (Number.parseFloat(score?.savingsRate) || 0) * 5)}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Emergency Fund</p>
              <p className="text-2xl font-bold text-white mt-1">
                {score?.monthsCovered || 0} months
              </p>
              <p className="text-gray-400 text-xs mt-1">
                ₹{Number.parseInt(score?.emergencyFundAmount || 0, 10).toLocaleString("en-IN")} / ₹
                {Number.parseInt(score?.averageMonthlyExpenses || 0, 10).toLocaleString("en-IN")}
              </p>
              <p className="text-gray-500 text-xs">Cash / Avg Monthly</p>
              <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-blue-600"
                  style={{
                    width: `${Math.min(100, ((Number.parseFloat(score?.monthsCovered) || 0) / 6) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Assets Breakdown */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Liquid Assets</p>
              <p className="text-xl font-bold text-green-400 mt-1">
                ₹{Number.parseInt(score?.totalLiquidAssets || 0, 10).toLocaleString("en-IN")}
              </p>
              <p className="text-gray-400 text-xs mt-1">Bank</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Investments</p>
              <p className="text-xl font-bold text-blue-400 mt-1">
                ₹{Number.parseInt(score?.totalInvestments || 0, 10).toLocaleString("en-IN")}
              </p>
              <p className="text-gray-400 text-xs mt-1">MF, Stocks</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Deposits</p>
              <p className="text-xl font-bold text-purple-400 mt-1">
                ₹{Number.parseInt(score?.totalDeposits || 0, 10).toLocaleString("en-IN")}
              </p>
              <p className="text-gray-400 text-xs mt-1">FD, Loans</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Debt</p>
              <p className="text-xl font-bold text-red-400 mt-1">
                ₹{Number.parseInt(score?.totalDebt || 0, 10).toLocaleString("en-IN")}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {Number.parseFloat(score?.debtToIncomeRatio || 0).toFixed(1)}% of income
              </p>
            </div>
          </div>

          {/* Metric Scores */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-white font-medium mb-3">Score Breakdown</p>
            <div className="space-y-3">
              {score?.metrics &&
                Object.entries(score.metrics).map(([key, value]) => {
                  const metricInfo: Record<string, { max: number; label: string; detail: string }> =
                    {
                      savingsRate: {
                        max: 25,
                        label: "Savings Rate",
                        detail: `${score?.savingsRate || 0}%`,
                      },
                      consistency: {
                        max: 15,
                        label: "Spending Consistency",
                        detail: "Moderate",
                      },
                      emergencyFund: {
                        max: 25,
                        label: "Emergency Fund",
                        detail: `${score?.monthsCovered || 0} months`,
                      },
                      ratio: {
                        max: 15,
                        label: "Income/Expense Ratio",
                        detail: `${score?.details?.ratio?.toFixed(2) || 1}x`,
                      },
                      categoryBalance: {
                        max: 10,
                        label: "Category Balance",
                        detail: "Diversified",
                      },
                      debtManagement: {
                        max: 10,
                        label: "Debt Management",
                        detail: `${score?.debtToIncomeRatio || 0}% DTI`,
                      },
                    };

                  const info = metricInfo[key] || {
                    max: 10,
                    label: key,
                    detail: "",
                  };
                  const percentage = ((value as number) / info.max) * 100;

                  // Dynamic color based on performance
                  let barColor = "from-red-600 to-red-700";
                  if (percentage >= 80) {
                    barColor = "from-green-600 to-green-700";
                  } else if (percentage >= 60) {
                    barColor = "from-yellow-600 to-yellow-700";
                  } else if (percentage >= 40) {
                    barColor = "from-orange-600 to-orange-700";
                  }

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-gray-300 text-sm font-medium">{info.label}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-400 text-xs">{info.detail}</p>
                          <p className="text-white text-sm font-semibold">
                            {value as number}/{info.max}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
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
          <h3 className="text-lg font-semibold text-white mb-4">💡 Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec: RecommendationCardProps["rec"], index: number) => (
              <RecommendationCard
                key={`${rec.type}-${rec.category}-${index}`}
                rec={rec}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
