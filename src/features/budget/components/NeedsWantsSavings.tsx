/* eslint-disable max-lines-per-function */
import { useEffect, useMemo, useState } from "react";
import { BUDGET_ALLOCATION_DEFAULTS, NWS_COLORS } from "../../../constants";
import { filterByType } from "../../../lib/data";
import { parseAmount } from "../../../lib/parsers";
import type { Transaction } from "../../../types";
import {
  calculateNWSBreakdown,
  calculateNWSPercentages,
  compareWithIdealAllocation,
  formatCurrency,
  formatPercentage,
  generateNWSInsights,
  loadAllocation,
  saveAllocation,
} from "../utils/needsWantsSavingsUtils";

type AllocationKey = "needs" | "wants" | "savings";
type Allocation = Record<AllocationKey, number>;

interface NeedsWantsSavingsProps {
  transactions: Transaction[];
}

/**
 * Needs, Wants & Savings Budget Breakdown Component
 * Shows spending breakdown based on 50/30/20 budgeting rule
 */
export const NeedsWantsSavings = ({ transactions }: NeedsWantsSavingsProps) => {
  const [customAllocation, setCustomAllocation] = useState(
    BUDGET_ALLOCATION_DEFAULTS as Allocation
  );
  const [editMode, setEditMode] = useState(false);
  const [tempAllocation, setTempAllocation] = useState(BUDGET_ALLOCATION_DEFAULTS as Allocation);

  // Load saved allocation on mount
  useEffect(() => {
    const saved = loadAllocation();
    setCustomAllocation(saved);
    setTempAllocation(saved);
  }, []);

  // Calculate total income
  const totalIncome = useMemo(() => {
    const incomeTransactions = filterByType(transactions, "Income");
    return incomeTransactions.reduce((sum: number, t: any) => sum + parseAmount(t), 0);
  }, [transactions]);

  // Calculate breakdown
  const breakdown = useMemo(() => {
    return calculateNWSBreakdown(transactions);
  }, [transactions]);

  // Calculate percentages
  const percentages = useMemo(() => {
    return calculateNWSPercentages(breakdown, totalIncome);
  }, [breakdown, totalIncome]);

  // Compare with ideal allocation
  const comparison = useMemo(() => {
    return compareWithIdealAllocation(breakdown, customAllocation);
  }, [breakdown, customAllocation]);

  // Generate insights
  const insights = useMemo(() => {
    return generateNWSInsights(breakdown, totalIncome);
  }, [breakdown, totalIncome]);

  const handleAllocationChange = (category: AllocationKey, value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    setTempAllocation((prev) => ({
      ...prev,
      [category]: numValue,
    }));
  };

  const saveAllocationChanges = () => {
    // Validate that total equals 100
    const total = tempAllocation.needs + tempAllocation.wants + tempAllocation.savings;

    if (Math.abs(total - 100) > 0.1) {
      alert("Total allocation must equal 100%");
      return;
    }

    setCustomAllocation(tempAllocation);
    saveAllocation(tempAllocation);
    setEditMode(false);
  };

  const resetToDefault = () => {
    setTempAllocation(BUDGET_ALLOCATION_DEFAULTS);
  };

  const cancelEdit = () => {
    setTempAllocation(customAllocation);
    setEditMode(false);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      good: "bg-green-900/30 text-green-400 border-green-500/30",
      warning: "bg-yellow-900/30 text-yellow-400 border-yellow-500/30",
      critical: "bg-red-900/30 text-red-400 border-red-500/30",
    };
    return badges[status] || badges.good;
  };

  const getProgressBarColor = (category: AllocationKey) => {
    const colors: Record<AllocationKey, string> = {
      needs: "bg-blue-500",
      wants: "bg-amber-500",
      savings: "bg-green-500",
    };
    return colors[category];
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="text-center text-gray-400">
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  const categories: Array<{
    key: AllocationKey;
    label: string;
    icon: string;
    color: string;
  }> = [
    { key: "needs", label: "Needs", icon: "🏠", color: NWS_COLORS.needs },
    { key: "wants", label: "Wants", icon: "🎉", color: NWS_COLORS.wants },
    { key: "savings", label: "Savings", icon: "💰", color: NWS_COLORS.savings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-white">50/30/20 Budget Breakdown</h3>
          <p className="text-gray-400 mt-1">Track your spending across Needs, Wants, and Savings</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAllocationChanges}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Customize Allocation
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(({ key, label, icon, color }) => {
          const data = comparison[key] || {};
          const percentage = percentages[key] || {
            amount: 0,
            percentage: 0,
            percentageOfIncome: null,
          };

          return (
            <div
              key={key}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{label}</h4>
                    {editMode ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={tempAllocation[key]}
                          onChange={(e) => handleAllocationChange(key, e.target.value)}
                          className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          min="0"
                          max="100"
                          step="1"
                        />
                        <span className="text-gray-400 text-sm">%</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Target: {customAllocation[key]}%</p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(data?.status || "good")}`}
                >
                  {data?.status === "good" ? "✓ On Track" : "⚠ Review"}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <div className="text-3xl font-bold" style={{ color }}>
                  {formatCurrency(percentage?.amount || 0)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {formatPercentage((percentage?.percentage || 0) / 100)} of total spending
                  {percentage?.percentageOfIncome && (
                    <span className="ml-2">
                      • {formatPercentage((percentage.percentageOfIncome || 0) / 100)} of income
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Actual</span>
                  <span>
                    {formatCurrency(data?.amount || 0)} / {formatCurrency(data?.idealAmount || 0)}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(key)} transition-all duration-500`}
                    style={{
                      width: `${Math.min(((data?.actual || 0) / (data?.ideal || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  {(data?.difference || 0) > 0 ? "+" : ""}
                  {formatPercentage((data?.difference || 0) / 100)} vs target
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Breakdown */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Spending Distribution</h4>

        {/* Stacked Progress Bar */}
        <div className="mb-6">
          <div className="h-8 bg-gray-700 rounded-lg overflow-hidden flex">
            {categories.map(({ key, color }) => {
              const width = percentages[key]?.percentage || 0;
              return (
                <div
                  key={key}
                  className="flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: color,
                  }}
                >
                  {width > 10 && `${width.toFixed(0)}%`}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {categories.map(({ key, label, icon, color }) => (
              <div key={key} className="flex items-center gap-2">
                <span>{icon}</span>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-300">
                  {label}: {formatPercentage((percentages[key]?.percentage || 0) / 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div>
            <p className="text-sm text-gray-400">Total Spending</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(percentages?.total || 0)}
            </p>
          </div>
          {(percentages?.totalIncome || 0) > 0 && (
            <div>
              <p className="text-sm text-gray-400">Total Income</p>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(percentages?.totalIncome || 0)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">💡 Insights</h4>
          <div className="space-y-3">
            {insights.map((insight) => {
              type InsightLevel = "success" | "warning" | "critical";
              const iconMap = {
                success: "✅",
                warning: "⚠️",
                critical: "🚨",
              };

              const colorMap = {
                success: "text-green-400 bg-green-900/20 border-green-500/30",
                warning: "text-yellow-400 bg-yellow-900/20 border-yellow-500/30",
                critical: "text-red-400 bg-red-900/20 border-red-500/30",
              };

              const insightType: InsightLevel = (insight?.type as InsightLevel) ?? "success";

              return (
                <div
                  key={`${insight.category}-${insight.type}`}
                  className={`p-4 rounded-lg border ${colorMap[insightType]}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{iconMap[insightType]}</span>
                    <p className="flex-1 text-sm">{insight.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Details */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Category Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(({ key, label, icon }) => {
            const details = (breakdown?.categoryDetails?.[key] ?? {}) as Record<string, number>;
            const sortedCategories = Object.entries(details).sort(([, a], [, b]) => b - a);

            return (
              <div key={key}>
                <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                  <span>{icon}</span>
                  {label}
                </h5>
                <div className="space-y-2">
                  {sortedCategories.length > 0 ? (
                    sortedCategories.slice(0, 5).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 truncate">{category}</span>
                        <span className="text-white font-medium">
                          {formatCurrency(Number(amount) || 0, false)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No transactions</p>
                  )}
                  {sortedCategories.length > 5 && (
                    <p className="text-xs text-gray-500 italic">
                      +{sortedCategories.length - 5} more categories
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
