/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  analyzeAccounts,
  groupAccountsByType,
  calculateAccountInsights,
  calculateCashbackOptimization,
} from "../../utils/accountAnalytics";

/**
 * Multi-Account Dashboard
 * Comprehensive view of all accounts and optimization suggestions
 */
export const AccountDashboard = ({ filteredData }) => {
  const accounts = useMemo(() => {
    return analyzeAccounts(filteredData);
  }, [filteredData]);

  const groupedAccounts = useMemo(() => {
    return groupAccountsByType(accounts);
  }, [accounts]);

  const insights = useMemo(() => {
    return calculateAccountInsights(accounts);
  }, [accounts]);

  const cashbackSuggestions = useMemo(() => {
    return calculateCashbackOptimization(accounts);
  }, [accounts]);

  // Account type distribution chart
  const typeChartData = {
    labels: Object.keys(groupedAccounts).filter(
      (type) => groupedAccounts[type].length > 0
    ),
    datasets: [
      {
        data: Object.keys(groupedAccounts)
          .filter((type) => groupedAccounts[type].length > 0)
          .map((type) => groupedAccounts[type].length),
        backgroundColor: [
          "#3b82f6",
          "#f59e0b",
          "#8b5cf6",
          "#10b981",
          "#ef4444",
        ],
      },
    ],
  };

  // Top accounts by transactions chart
  const topAccountsChartData = {
    labels: insights.topAccounts.map((a) => a.name.substring(0, 20)),
    datasets: [
      {
        label: "Transactions",
        data: insights.topAccounts.map((a) => a.transactionCount),
        backgroundColor: "#8b5cf6",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#fff" } },
    },
  };

  const barChartOptions = {
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

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No account data found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          🏦 Multi-Account Dashboard
        </h2>
        <p className="text-gray-400 mt-1">
          Manage and optimize all your financial accounts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
          <p className="text-blue-100 text-sm">Total Accounts</p>
          <p className="text-3xl font-bold text-white mt-1">
            {insights.totalAccounts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
          <p className="text-green-100 text-sm">Active Accounts</p>
          <p className="text-3xl font-bold text-white mt-1">
            {insights.activeAccounts}
          </p>
          <p className="text-green-200 text-xs mt-1">&gt;5 transactions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
          <p className="text-purple-100 text-sm">Total Income</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{(insights.totalIncome / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4">
          <p className="text-orange-100 text-sm">Total Expense</p>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{(insights.totalExpense / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            📊 Account Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={typeChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🔥 Most Active Accounts
          </h3>
          <div className="h-64">
            <Bar data={topAccountsChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Account Type Breakdown */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          💳 Accounts by Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(groupedAccounts).map((type) => {
            const typeAccounts = groupedAccounts[type];
            if (typeAccounts.length === 0) {
              return null;
            }

            const totalTransactions = typeAccounts.reduce(
              (sum, a) => sum + a.transactionCount,
              0
            );

            return (
              <div key={type} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-medium">{type}</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    {typeAccounts.length}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  {totalTransactions} total transactions
                </p>
                <div className="space-y-1">
                  {typeAccounts.slice(0, 3).map((account) => (
                    <div
                      key={account.name}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-300 truncate">
                        {account.name.substring(0, 20)}
                      </span>
                      <span className="text-gray-400">
                        {account.transactionCount}
                      </span>
                    </div>
                  ))}
                  {typeAccounts.length > 3 && (
                    <p className="text-gray-500 text-xs mt-1">
                      +{typeAccounts.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cashback Optimization */}
      {cashbackSuggestions.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            💰 Cashback Optimization
          </h3>
          <p className="text-gray-400 mb-4">
            Maximize your rewards by using the right cards for each category
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cashbackSuggestions.map((suggestion) => (
              <div
                key={suggestion.category}
                className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg p-4"
              >
                <p className="text-white font-medium mb-3">
                  {suggestion.category}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Card</span>
                    <span className="text-gray-300">
                      {suggestion.currentCard}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Cashback</span>
                    <span className="text-red-400">
                      {suggestion.currentCashback}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Suggested Card</span>
                    <span className="text-blue-400 font-medium">
                      {suggestion.suggestedCard}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">New Cashback</span>
                    <span className="text-green-400 font-medium">
                      {suggestion.suggestedCashback}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex justify-between">
                      <span className="text-green-400 font-medium">
                        Monthly Savings
                      </span>
                      <span className="text-green-400 font-bold">
                        ₹{suggestion.potentialSavings}
                      </span>
                    </div>
                    <p className="text-blue-400 text-xs mt-1">
                      Annual: ₹{suggestion.potentialSavings * 12}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 font-medium mb-1">
              💡 Total Potential Savings
            </p>
            <p className="text-2xl font-bold text-white">
              ₹
              {cashbackSuggestions
                .reduce((sum, s) => sum + s.potentialSavings, 0)
                .toLocaleString()}
              /month
            </p>
            <p className="text-blue-400 text-sm mt-1">
              ₹
              {(
                cashbackSuggestions.reduce(
                  (sum, s) => sum + s.potentialSavings,
                  0
                ) * 12
              ).toLocaleString()}
              /year with optimized card usage
            </p>
          </div>
        </div>
      )}

      {/* Dormant Accounts Alert */}
      {insights.dormantAccounts.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">
            ⚠️ Dormant Accounts
          </h3>
          <p className="text-gray-400 mb-4">
            {insights.dormantAccounts.length} accounts with ≤2 transactions.
            Consider closing to simplify management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {insights.dormantAccounts.slice(0, 6).map((account) => (
              <div
                key={account.name}
                className="bg-gray-700/50 rounded p-2 text-sm"
              >
                <span className="text-gray-300 truncate block">
                  {account.name}
                </span>
                <span className="text-gray-500 text-xs">
                  {account.transactionCount} transactions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

AccountDashboard.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
