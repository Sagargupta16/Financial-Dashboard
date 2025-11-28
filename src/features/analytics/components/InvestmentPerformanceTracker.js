/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import { calculateInvestmentPerformance } from "../../../shared/utils/financialCalculations";

/**
 * Investment Performance Tracker
 * Track stock market performance, P&L, brokerage fees
 */
export const InvestmentPerformanceTracker = ({ filteredData }) => {
  const investmentData = useMemo(() => {
    return calculateInvestmentPerformance(filteredData);
  }, [filteredData]);

  const {
    totalCapitalDeployed,
    totalWithdrawals,
    currentHoldings,
    realizedProfits,
    realizedLosses,
    netProfitLoss,
    brokerageFees,
    returnPercentage,
    transactions,
  } = investmentData;

  // Prepare chart data for P&L over time
  const chartData = useMemo(() => {
    const monthlyPnL = {};

    transactions.forEach((t) => {
      if (t.date) {
        const month = new Date(t.date).toISOString().slice(0, 7);
        if (!monthlyPnL[month]) {
          monthlyPnL[month] = 0;
        }
        if (t.type === "Profit") {
          monthlyPnL[month] += t.amount;
        } else if (t.type === "Loss" || t.type === "Fee") {
          monthlyPnL[month] -= t.amount;
        }
      }
    });

    const sortedMonths = Object.keys(monthlyPnL).sort((a, b) =>
      a.localeCompare(b)
    );
    const cumulativePnL = [];
    let cumulative = 0;

    sortedMonths.forEach((month) => {
      cumulative += monthlyPnL[month];
      cumulativePnL.push(cumulative);
    });

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Cumulative P&L",
          data: cumulativePnL,
          borderColor:
            cumulative >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
          backgroundColor:
            cumulative >= 0
              ? "rgba(34, 197, 94, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#fff" },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `P&L: ₹${context.parsed.y.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
      y: {
        ticks: {
          color: "#9ca3af",
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`,
        },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">
          📈 Investment Performance Tracker
        </h2>
        <p className="text-purple-100">
          Track your stock market performance, P&L, and brokerage fees
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Capital Deployed */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">
              Total Capital Deployed
            </span>
            <DollarSign className="text-blue-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {totalCapitalDeployed.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-xs text-blue-200 mt-1">All-time deposits</div>
        </div>

        {/* Realized Profits */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">
              Realized Profits
            </span>
            <TrendingUp className="text-green-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {realizedProfits.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        {/* Realized Losses */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100 text-sm font-medium">
              Realized Losses
            </span>
            <TrendingDown className="text-red-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {realizedLosses.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        {/* Net P&L */}
        <div
          className={`bg-gradient-to-br ${netProfitLoss >= 0 ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600"} rounded-xl p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`${netProfitLoss >= 0 ? "text-emerald-100" : "text-orange-100"} text-sm font-medium`}
            >
              Net P&L
            </span>
            {netProfitLoss >= 0 ? (
              <CheckCircle className="text-emerald-200" size={24} />
            ) : (
              <AlertTriangle className="text-orange-200" size={24} />
            )}
          </div>
          <div className="text-3xl font-bold text-white">
            {netProfitLoss >= 0 ? "+" : ""}₹
            {netProfitLoss.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-sm mt-1 text-white/80">
            {returnPercentage >= 0 ? "+" : ""}
            {returnPercentage.toFixed(2)}% Return
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Brokerage Fees */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm font-medium">
              Brokerage Fees
            </span>
            <CreditCard className="text-yellow-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹
            {brokerageFees.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {currentHoldings > 0
              ? `${((brokerageFees / currentHoldings) * 100).toFixed(2)}% of current holdings`
              : "N/A"}
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm font-medium">
              Total Withdrawals
            </span>
            <DollarSign className="text-blue-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹
            {totalWithdrawals.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        {/* Current Holdings */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm font-medium">
              Current Holdings
            </span>
            <TrendingUp className="text-indigo-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹
            {currentHoldings.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {totalWithdrawals > 0
              ? "Net amount in market"
              : "All capital still invested"}
          </div>
        </div>

        {/* Win/Loss Ratio */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm font-medium">
              Profit/Loss Ratio
            </span>
            <TrendingUp className="text-purple-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            {realizedLosses > 0
              ? (realizedProfits / realizedLosses).toFixed(2)
              : "∞"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {realizedProfits > realizedLosses
              ? "More profits than losses"
              : "More losses than profits"}
          </div>
        </div>
      </div>

      {/* P&L Chart */}
      {chartData.labels.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">
            Cumulative P&L Over Time
          </h3>
          <div style={{ height: "300px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Recent Investment Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-300 py-3 px-4">Date</th>
                <th className="text-left text-gray-300 py-3 px-4">Type</th>
                <th className="text-left text-gray-300 py-3 px-4">Category</th>
                <th className="text-right text-gray-300 py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((t, idx) => {
                const getTypeBadgeClass = (type) => {
                  if (type === "Profit") {
                    return "bg-green-500/20 text-green-300";
                  }
                  if (type === "Loss") {
                    return "bg-red-500/20 text-red-300";
                  }
                  if (type === "Fee") {
                    return "bg-yellow-500/20 text-yellow-300";
                  }
                  return "bg-blue-500/20 text-blue-300";
                };

                const getAmountClass = (type) => {
                  if (type === "Profit") {
                    return "text-green-400";
                  }
                  if (type === "Loss" || type === "Fee") {
                    return "text-red-400";
                  }
                  return "text-gray-300";
                };

                const getAmountPrefix = (type) => {
                  if (type === "Profit") {
                    return "+";
                  }
                  if (type === "Loss" || type === "Fee") {
                    return "-";
                  }
                  return "";
                };

                return (
                  <tr
                    key={`${t.date}-${t.type}-${t.amount}`}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {new Date(t.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeClass(t.type)}`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {t.subcategory || t.category}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${getAmountClass(t.type)}`}
                    >
                      {getAmountPrefix(t.type)}₹
                      {t.amount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl p-6 shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">
          💡 Investment Insights
        </h3>
        <div className="space-y-3">
          {netProfitLoss < 0 && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <AlertTriangle className="text-red-400 mt-0.5" size={20} />
              <div>
                <p className="text-red-300 font-medium">Net Loss Position</p>
                <p className="text-red-200/80 text-sm mt-1">
                  Your investments are currently at a net loss of ₹
                  {Math.abs(netProfitLoss).toLocaleString("en-IN")}. Consider
                  reviewing your strategy and diversifying your portfolio.
                </p>
              </div>
            </div>
          )}

          {brokerageFees > realizedProfits * 0.3 && (
            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
              <div>
                <p className="text-yellow-300 font-medium">
                  High Brokerage Fees
                </p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  Brokerage fees are eating up{" "}
                  {((brokerageFees / realizedProfits) * 100).toFixed(0)}% of
                  your profits. Consider switching to a discount broker or
                  reducing trade frequency.
                </p>
              </div>
            </div>
          )}

          {netProfitLoss >= 0 && returnPercentage > 0 && (
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <CheckCircle className="text-green-400 mt-0.5" size={20} />
              <div>
                <p className="text-green-300 font-medium">Profitable Trading</p>
                <p className="text-green-200/80 text-sm mt-1">
                  Great job! You've made a {returnPercentage.toFixed(2)}% return
                  on your investments. Keep maintaining your winning strategy.
                </p>
              </div>
            </div>
          )}

          {realizedProfits > 0 && realizedLosses > realizedProfits && (
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <AlertTriangle className="text-blue-400 mt-0.5" size={20} />
              <div>
                <p className="text-blue-300 font-medium">
                  Tax Loss Harvesting Opportunity
                </p>
                <p className="text-blue-200/80 text-sm mt-1">
                  You have realized losses that can offset your gains for tax
                  purposes. Consult with a tax advisor to optimize your tax
                  liability.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

InvestmentPerformanceTracker.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
