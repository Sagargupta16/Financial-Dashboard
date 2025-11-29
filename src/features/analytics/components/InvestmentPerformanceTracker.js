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
import { calculateInvestmentPerformance } from "../../../lib/calculations/financial";

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass border border-gray-700/30 rounded-2xl p-8 shadow-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-4 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-2xl">
            <TrendingUp className="text-purple-300" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold gradient-text">
              Investment Performance Tracker
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              Track your stock market performance, P&L, and brokerage fees
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Capital Deployed */}
        <div className="glass border border-blue-500/30 rounded-2xl p-6 shadow-xl card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                Total Capital Deployed
              </span>
              <DollarSign
                className="text-blue-400 group-hover:scale-110 transition-transform duration-300"
                size={28}
              />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              ₹
              {totalCapitalDeployed.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs font-semibold text-blue-300/80">
              All-time deposits
            </div>
          </div>
        </div>

        {/* Realized Profits */}
        <div className="glass border border-green-500/30 rounded-2xl p-6 shadow-xl card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-green-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                Realized Profits
              </span>
              <TrendingUp
                className="text-green-400 group-hover:scale-110 transition-transform duration-300"
                size={28}
              />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              ₹
              {realizedProfits.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        {/* Realized Losses */}
        <div className="glass border border-red-500/30 rounded-2xl p-6 shadow-xl card-hover group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                Realized Losses
              </span>
              <TrendingDown
                className="text-red-400 group-hover:scale-110 transition-transform duration-300"
                size={28}
              />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              ₹
              {realizedLosses.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        {/* Net P&L */}
        <div
          className={`glass border ${netProfitLoss >= 0 ? "border-emerald-500/30" : "border-orange-500/30"} rounded-2xl p-6 shadow-xl card-hover group relative overflow-hidden`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${netProfitLoss >= 0 ? "from-emerald-600/10 to-emerald-500/5" : "from-orange-600/10 to-orange-500/5"}`}
          ></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`${netProfitLoss >= 0 ? "text-emerald-300" : "text-orange-300"} text-sm font-bold uppercase tracking-wide`}
              >
                Net P&L
              </span>
              {netProfitLoss >= 0 ? (
                <CheckCircle
                  className="text-emerald-400 group-hover:scale-110 transition-transform duration-300"
                  size={28}
                />
              ) : (
                <AlertTriangle
                  className="text-orange-400 group-hover:scale-110 transition-transform duration-300"
                  size={28}
                />
              )}
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              {netProfitLoss >= 0 ? "+" : ""}₹
              {netProfitLoss.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
            <div
              className={`text-sm font-bold ${netProfitLoss >= 0 ? "text-emerald-300" : "text-orange-300"}`}
            >
              {returnPercentage >= 0 ? "+" : ""}
              {returnPercentage.toFixed(2)}% Return
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Brokerage Fees */}
        <div className="glass border border-yellow-500/30 rounded-2xl p-6 shadow-xl card-hover group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
              Brokerage Fees
            </span>
            <CreditCard
              className="text-yellow-400 group-hover:rotate-6 transition-transform duration-300"
              size={24}
            />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">
            ₹
            {brokerageFees.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-xs font-semibold text-gray-400">
            {currentHoldings > 0
              ? `${((brokerageFees / currentHoldings) * 100).toFixed(2)}% of current holdings`
              : "N/A"}
          </div>
        </div>

        {/* Withdrawals */}
        <div className="glass border border-blue-500/30 rounded-2xl p-6 shadow-xl card-hover group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
              Total Withdrawals
            </span>
            <DollarSign
              className="text-blue-400 group-hover:rotate-6 transition-transform duration-300"
              size={24}
            />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">
            ₹
            {totalWithdrawals.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        {/* Current Holdings */}
        <div className="glass border border-indigo-500/30 rounded-2xl p-6 shadow-xl card-hover group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
              Current Holdings
            </span>
            <TrendingUp
              className="text-indigo-400 group-hover:rotate-6 transition-transform duration-300"
              size={24}
            />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">
            ₹
            {currentHoldings.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-xs font-semibold text-gray-400">
            {totalWithdrawals > 0
              ? "Net amount in market"
              : "All capital still invested"}
          </div>
        </div>

        {/* Win/Loss Ratio */}
        <div className="glass border border-purple-500/30 rounded-2xl p-6 shadow-xl card-hover group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
              Profit/Loss Ratio
            </span>
            <TrendingUp
              className="text-purple-400 group-hover:rotate-6 transition-transform duration-300"
              size={24}
            />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">
            {realizedLosses > 0
              ? (realizedProfits / realizedLosses).toFixed(2)
              : "∞"}
          </div>
          <div className="text-xs font-semibold text-gray-400">
            {realizedProfits > realizedLosses
              ? "More profits than losses"
              : "More losses than profits"}
          </div>
        </div>
      </div>

      {/* P&L Chart */}
      {chartData.labels.length > 0 && (
        <div className="glass border border-gray-700/30 rounded-2xl p-7 shadow-2xl card-hover">
          <h3 className="text-2xl font-bold gradient-text mb-6">
            Cumulative P&L Over Time
          </h3>
          <div style={{ height: "350px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="glass border border-gray-700/30 rounded-2xl p-7 shadow-2xl">
        <h3 className="text-2xl font-bold gradient-text mb-6">
          Recent Investment Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-blue-500/30">
                <th className="text-left text-gray-300 font-bold uppercase tracking-wide py-4 px-5 text-xs">
                  Date
                </th>
                <th className="text-left text-gray-300 font-bold uppercase tracking-wide py-4 px-5 text-xs">
                  Type
                </th>
                <th className="text-left text-gray-300 font-bold uppercase tracking-wide py-4 px-5 text-xs">
                  Category
                </th>
                <th className="text-right text-gray-300 font-bold uppercase tracking-wide py-4 px-5 text-xs">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((t, index) => {
                const getTypeBadgeClass = (type) => {
                  if (type === "Profit") {
                    return "bg-green-900/50 text-green-300 border-green-500/30";
                  }
                  if (type === "Loss") {
                    return "bg-red-900/50 text-red-300 border-red-500/30";
                  }
                  if (type === "Fee") {
                    return "bg-yellow-900/50 text-yellow-300 border-yellow-500/30";
                  }
                  return "bg-blue-900/50 text-blue-300 border-blue-500/30";
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
                    className="border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/60 transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="py-4 px-5 text-gray-300 text-sm font-medium group-hover:text-white transition-colors duration-300">
                      {new Date(t.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getTypeBadgeClass(t.type)}`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-300 text-sm font-medium group-hover:text-white transition-colors duration-300">
                      {t.subcategory || t.category}
                    </td>
                    <td
                      className={`py-4 px-5 text-right font-bold text-base ${getAmountClass(t.type)} group-hover:scale-105 transition-transform duration-300`}
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
      <div className="glass border border-purple-500/30 rounded-2xl p-7 shadow-2xl bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-blue-900/20">
        <h3 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
          <span className="text-3xl">💡</span> Investment Insights
        </h3>
        <div className="space-y-4">
          {netProfitLoss < 0 && (
            <div className="flex items-start gap-4 glass bg-red-900/20 border border-red-500/30 rounded-xl p-5 animate-fade-in">
              <AlertTriangle
                className="text-red-400 mt-1 flex-shrink-0"
                size={24}
              />
              <div>
                <p className="text-red-300 font-bold text-lg">
                  Net Loss Position
                </p>
                <p className="text-red-200/90 text-sm mt-2 leading-relaxed">
                  Your investments are currently at a net loss of ₹
                  {Math.abs(netProfitLoss).toLocaleString("en-IN")}. Consider
                  reviewing your strategy and diversifying your portfolio.
                </p>
              </div>
            </div>
          )}

          {brokerageFees > realizedProfits * 0.3 && (
            <div className="flex items-start gap-4 glass bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5 animate-fade-in">
              <AlertTriangle
                className="text-yellow-400 mt-1 flex-shrink-0"
                size={24}
              />
              <div>
                <p className="text-yellow-300 font-bold text-lg">
                  High Brokerage Fees
                </p>
                <p className="text-yellow-200/90 text-sm mt-2 leading-relaxed">
                  Brokerage fees are eating up{" "}
                  {((brokerageFees / realizedProfits) * 100).toFixed(0)}% of
                  your profits. Consider switching to a discount broker or
                  reducing trade frequency.
                </p>
              </div>
            </div>
          )}

          {netProfitLoss >= 0 && returnPercentage > 0 && (
            <div className="flex items-start gap-4 glass bg-green-900/20 border border-green-500/30 rounded-xl p-5 animate-fade-in">
              <CheckCircle
                className="text-green-400 mt-1 flex-shrink-0"
                size={24}
              />
              <div>
                <p className="text-green-300 font-bold text-lg">
                  Profitable Trading
                </p>
                <p className="text-green-200/90 text-sm mt-2 leading-relaxed">
                  Great job! You've made a {returnPercentage.toFixed(2)}% return
                  on your investments. Keep maintaining your winning strategy.
                </p>
              </div>
            </div>
          )}

          {realizedProfits > 0 && realizedLosses > realizedProfits && (
            <div className="flex items-start gap-4 glass bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 animate-fade-in">
              <AlertTriangle
                className="text-blue-400 mt-1 flex-shrink-0"
                size={24}
              />
              <div>
                <p className="text-blue-300 font-bold text-lg">
                  Tax Loss Harvesting Opportunity
                </p>
                <p className="text-blue-200/90 text-sm mt-2 leading-relaxed">
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
