// @ts-nocheck
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAdvancedAnalytics } from "../../features/analytics/hooks/useAdvancedAnalytics";

/**
 * Advanced Analytics Dashboard Component
 * Displays all 10 new advanced calculations in a beautiful UI
 *
 * USAGE:
 * Import this in any section:
 * import { AdvancedAnalyticsDashboard } from './path/to/AdvancedAnalyticsDashboard';
 *
 * Use it:
 * <AdvancedAnalyticsDashboard filteredData={filteredData} />
 */

// eslint-disable-next-line max-lines-per-function, complexity
export const AdvancedAnalyticsDashboard = ({ filteredData }) => {
  const analytics = useAdvancedAnalytics(filteredData);

  // Loading state
  if (!analytics || !filteredData || filteredData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Upload transaction data to see advanced analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🚀 Advanced Analytics</h2>
        <p className="text-gray-400">Powered by your new calculation engine</p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Trend */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Monthly Trend</span>
            {analytics.monthlyComparison?.avgGrowth > 0 ? (
              <TrendingUp className="text-red-400" size={20} />
            ) : (
              <TrendingDown className="text-green-400" size={20} />
            )}
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.monthlyComparison?.trend || "Stable"}
          </div>
          <div className="text-sm text-gray-400">
            {analytics.monthlyComparison?.avgGrowth > 0 ? "+" : ""}
            {analytics.monthlyComparison?.avgGrowth?.toFixed(1)}% avg growth
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Subscriptions</span>
            <Calendar className="text-purple-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.recurringTransactions?.filter((r) => r.isMonthly).length || 0}
          </div>
          <div className="text-sm text-gray-400">
            ₹
            {analytics.recurringTransactions
              ?.filter((r) => r.isMonthly)
              .reduce((sum, s) => sum + s.amount, 0)
              .toFixed(0) || 0}
            /month
          </div>
        </div>

        {/* Anomalies */}
        <div
          className={`rounded-xl p-4 ${
            analytics.anomalies?.length > 0
              ? "bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30"
              : "bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Unusual Transactions</span>
            <AlertTriangle
              className={analytics.anomalies?.length > 0 ? "text-red-400" : "text-green-400"}
              size={20}
            />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.anomalies?.length || 0}</div>
          <div className="text-sm text-gray-400">
            {analytics.anomalies?.length > 0 ? "Review recommended" : "All normal"}
          </div>
        </div>

        {/* Income Stability */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Income Stability</span>
            <DollarSign className="text-green-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.incomeStability?.rating || "N/A"}
          </div>
          <div className="text-sm text-gray-400">
            {((analytics.incomeStability?.stability || 0) * 100).toFixed(0)}% stable
          </div>
        </div>
      </div>

      {/* Recurring Subscriptions */}
      {analytics.recurringTransactions && analytics.recurringTransactions.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="text-purple-400" size={24} />
            Recurring Subscriptions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.recurringTransactions
              .filter((t) => t.isMonthly)
              .slice(0, 6)
              .map((sub) => (
                <div
                  key={`recurring-${sub.category}-${sub.frequency.toFixed(0)}`}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{sub.category}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Every {sub.frequency.toFixed(0)} days
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Next: {sub.nextExpected.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-400">₹{sub.amount.toFixed(0)}</p>
                      <p className="text-xs text-gray-400">{sub.count} times</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Monthly Recurring</span>
              <span className="text-2xl font-bold text-purple-400">
                ₹
                {analytics.recurringTransactions
                  .filter((r) => r.isMonthly)
                  .reduce((sum, s) => sum + s.amount, 0)
                  .toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Alerts */}
      {analytics.anomalies && analytics.anomalies.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            Unusual Transactions ({analytics.anomalies.length})
          </h3>

          <div className="space-y-3">
            {analytics.anomalies.slice(0, 5).map((anom) => (
              <div
                key={`anomaly-${anom.date}-${anom.amount}`}
                className={`rounded-lg p-4 ${
                  anom.severity === "high"
                    ? "bg-red-900/40 border border-red-500/50"
                    : "bg-yellow-900/40 border border-yellow-500/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          anom.severity === "high" ? "bg-red-600" : "bg-yellow-600"
                        }`}
                      >
                        {anom.severity.toUpperCase()}
                      </span>
                      <span className="font-medium text-white">{anom.category}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{anom.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(anom.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-white">
                      ₹{Math.abs(anom.amount).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-400">{anom.deviation}σ deviation</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Flow Forecast */}
      {analytics.cashFlowForecast && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="text-blue-400" size={24} />
            30-Day Cash Flow Forecast
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Daily Income</p>
              <p className="text-2xl font-bold text-green-400">
                ₹{analytics.cashFlowForecast.dailyIncome.toFixed(0)}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Daily Expense</p>
              <p className="text-2xl font-bold text-red-400">
                ₹{analytics.cashFlowForecast.dailyExpense.toFixed(0)}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Net Daily</p>
              <p
                className={`text-2xl font-bold ${
                  analytics.cashFlowForecast.netDaily > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                ₹{analytics.cashFlowForecast.netDaily.toFixed(0)}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Forecasted (30d)</p>
              <p
                className={`text-2xl font-bold ${
                  analytics.cashFlowForecast.forecastedBalance > 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ₹{analytics.cashFlowForecast.forecastedBalance.toFixed(0)}
              </p>
            </div>
          </div>

          <div
            className={(() => {
              const status = analytics.cashFlowForecast.status;
              if (status === "growing") {
                return "rounded-lg p-4 bg-green-900/20 border border-green-500/30";
              }
              if (status === "declining") {
                return "rounded-lg p-4 bg-red-900/20 border border-red-500/30";
              }
              return "rounded-lg p-4 bg-yellow-900/20 border border-yellow-500/30";
            })()}
          >
            <p className="text-lg font-medium text-white">
              Status: <span className="capitalize">{analytics.cashFlowForecast.status}</span>
            </p>
            {analytics.cashFlowForecast.daysUntilZero !== Infinity && (
              <p className="text-sm text-gray-300 mt-1">
                ⚠️ At current rate, balance reaches zero in{" "}
                {Math.floor(analytics.cashFlowForecast.daysUntilZero)} days
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category Trends - Top 5 */}
      {analytics.categoryTrends && analytics.categoryTrends.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Category Growth Trends (Top 5)</h3>

          <div className="space-y-4">
            {analytics.categoryTrends.slice(0, 5).map((cat) => (
              <div key={`category-trend-${cat.category}`} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white">{cat.category}</span>
                  <span
                    className={(() => {
                      if (cat.direction === "increasing") {
                        return "text-lg font-bold text-red-400";
                      }
                      if (cat.direction === "decreasing") {
                        return "text-lg font-bold text-green-400";
                      }
                      return "text-lg font-bold text-gray-400";
                    })()}
                  >
                    {cat.trend > 0 ? "+" : ""}
                    {cat.trend.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-600 h-2 rounded-full overflow-hidden">
                  <div
                    className={(() => {
                      if (cat.direction === "increasing") {
                        return "h-2 transition-all bg-red-500";
                      }
                      if (cat.direction === "decreasing") {
                        return "h-2 transition-all bg-green-500";
                      }
                      return "h-2 transition-all bg-gray-500";
                    })()}
                    style={{ width: `${Math.min(Math.abs(cat.trend), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{cat.direction}</span>
                  <span>₹{cat.monthlyAverage.toFixed(0)}/month avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Health Ratio */}
      {analytics.monthlyHealthRatio && analytics.monthlyHealthRatio.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Monthly Financial Health</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.monthlyHealthRatio.slice(-6).map((month) => (
              <div
                key={`monthly-health-${month.month}`}
                className={(() => {
                  if (month.status === "healthy") {
                    return "rounded-lg p-4 bg-green-900/20 border border-green-500/30";
                  }
                  if (month.status === "tight") {
                    return "rounded-lg p-4 bg-yellow-900/20 border border-yellow-500/30";
                  }
                  return "rounded-lg p-4 bg-red-900/20 border border-red-500/30";
                })()}
              >
                <p className="text-sm text-gray-400 mb-2">{month.month}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{month.ratio.toFixed(0)}%</span>
                  <span className="text-sm text-gray-400">of income</span>
                </div>
                <p
                  className={(() => {
                    if (month.status === "healthy") {
                      return "text-xs mt-2 font-medium text-green-400";
                    }
                    if (month.status === "tight") {
                      return "text-xs mt-2 font-medium text-yellow-400";
                    }
                    return "text-xs mt-2 font-medium text-red-400";
                  })()}
                >
                  {month.status.toUpperCase()}
                  {month.surplus > 0 && ` (+₹${month.surplus.toFixed(0)})`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Insights */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Average Monthly Health</p>
            <p className="text-2xl font-bold text-white">
              {analytics.insights?.averageMonthlyHealth?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Cash Flow Status</p>
            <p className="text-2xl font-bold text-white capitalize">
              {analytics.insights?.cashFlowStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
