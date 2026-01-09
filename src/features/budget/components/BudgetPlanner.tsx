/* eslint-disable max-lines-per-function */
import { useEffect, useState } from "react";
import type { Transaction } from "../../../types";
import {
  calculateAverageSpending,
  calculateBudgetComparison,
  calculateCategorySpending,
  detectRecurringPayments,
  loadBudgets,
  saveBudgets,
  suggestBudgets,
} from "../utils/budgetUtils";

type BudgetMap = Record<string, number>;
type BudgetStatus = "good" | "warning" | "critical" | "over";
type ComparisonEntry = {
  budget: number;
  actual: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
};
type ComparisonMap = Record<string, ComparisonEntry>;
type RecurringPayment = {
  category: string;
  amount: number;
  interval: number;
  frequency: string;
  nextDate: Date;
  occurrences: number;
};

interface BudgetPlannerProps {
  filteredData: Transaction[];
}

/**
 * Budget Planning Dashboard - Simplified and Accurate
 * Replaces over-engineered SpendingSimulator with practical budget tracking
 */
export const BudgetPlanner = ({ filteredData }: BudgetPlannerProps) => {
  const [actualSpending, setActualSpending] = useState<BudgetMap>({});
  const [averageSpending, setAverageSpending] = useState<BudgetMap>({});
  const [budgets, setBudgets] = useState<BudgetMap>({});
  const [comparison, setComparison] = useState<ComparisonMap>({});
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tempBudgets, setTempBudgets] = useState<BudgetMap>({});

  // Calculate spending data
  useEffect(() => {
    const spending = calculateCategorySpending(filteredData);
    const averages = calculateAverageSpending(filteredData);
    const recurring = detectRecurringPayments(filteredData);

    setActualSpending(spending);
    setAverageSpending(averages);
    setRecurringPayments(recurring);
  }, [filteredData]);

  // Load budgets
  useEffect(() => {
    const saved = loadBudgets();
    setBudgets(saved);
    setTempBudgets(saved);
  }, []);

  // Calculate comparison whenever budgets or spending changes
  useEffect(() => {
    const comp = calculateBudgetComparison(actualSpending, budgets);
    setComparison(comp);
  }, [actualSpending, budgets]);

  const handleBudgetChange = (category: string, value: string) => {
    setTempBudgets((prev) => ({
      ...prev,
      [category]: Number.parseFloat(value) || 0,
    }));
  };

  const saveBudgetChanges = () => {
    setBudgets(tempBudgets);
    saveBudgets(tempBudgets);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setTempBudgets(budgets);
    setEditMode(false);
  };

  const applySuggestedBudgets = () => {
    const suggested = suggestBudgets(filteredData);
    setTempBudgets(suggested);
  };

  const getOverallUsageColor = (percentage: number) => {
    if (percentage >= 100) {
      return "bg-red-500";
    }
    if (percentage >= 90) {
      return "bg-orange-500";
    }
    if (percentage >= 75) {
      return "bg-yellow-500";
    }
    return "bg-green-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400 bg-green-900/20 border-green-500/30";
      case "warning":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-500/30";
      case "critical":
        return "text-orange-400 bg-orange-900/20 border-orange-500/30";
      case "over":
        return "text-red-400 bg-red-900/20 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-800/50 border-gray-600";
    }
  };

  const categories = Object.keys(actualSpending).sort(
    (a, b) => (actualSpending[b] ?? 0) - (actualSpending[a] ?? 0)
  );

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No expense data available for budget planning</p>
      </div>
    );
  }

  const totalActual = Object.values(actualSpending).reduce((sum, val) => sum + val, 0);
  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
  const totalRemaining = totalBudget - totalActual;
  const overallPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">💰 Budget Planner</h2>
          <p className="text-gray-400 mt-1">
            Track spending against budgets with 3-month trend analysis
          </p>
        </div>
        <div className="flex gap-3">
          {editMode ? (
            <>
              <button
                type="button"
                onClick={applySuggestedBudgets}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Use Suggested
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveBudgetChanges}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Save Budgets
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Edit Budgets
            </button>
          )}
        </div>
      </div>

      {/* Overall Summary */}
      {totalBudget > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Budget</p>
            <p className="text-2xl font-bold text-white mt-1">₹{totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-white mt-1">₹{totalActual.toLocaleString()}</p>
          </div>
          <div
            className={`rounded-xl p-4 border ${
              totalRemaining >= 0
                ? "bg-green-900/20 border-green-500/30"
                : "bg-red-900/20 border-red-500/30"
            }`}
          >
            <p className={`text-sm ${totalRemaining >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalRemaining >= 0 ? "Remaining" : "Over Budget"}
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${
                totalRemaining >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ₹{Math.abs(totalRemaining).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Overall Usage</p>
            <p className="text-2xl font-bold text-white mt-1">{overallPercentage.toFixed(0)}%</p>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getOverallUsageColor(overallPercentage)}`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Budgets */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Category Budgets</h3>
        <div className="space-y-4">
          {categories.map((category) => {
            const actual = actualSpending[category];
            const average = averageSpending[category] || actual;
            const budget = editMode ? tempBudgets[category] || 0 : budgets[category] || 0;
            const comp = comparison[category];

            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{category}</span>
                  <div className="flex items-center gap-4">
                    {editMode ? (
                      <input
                        type="number"
                        value={tempBudgets[category] || ""}
                        onChange={(e) => handleBudgetChange(category, e.target.value)}
                        placeholder={`${Math.round(average)}`}
                        className="w-32 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Budget: ₹{budget.toLocaleString()}
                      </span>
                    )}
                    <span className="text-white text-sm font-medium">
                      Spent: ₹{actual.toLocaleString()}
                    </span>
                  </div>
                </div>

                {budget > 0 && comp && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getOverallUsageColor(comp.percentage)}`}
                          style={{
                            width: `${Math.min(100, comp.percentage)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium w-16 text-right ${getStatusColor(comp.status).split(" ")[0]}`}
                      >
                        {comp.percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">
                        3-Month Avg: ₹{Math.round(average).toLocaleString()}
                      </span>
                      <span className={comp.remaining >= 0 ? "text-green-400" : "text-red-400"}>
                        {comp.remaining >= 0 ? "Remaining" : "Over"}: ₹
                        {Math.abs(comp.remaining).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                {!budget && !editMode && (
                  <p className="text-xs text-gray-500">
                    No budget set • 3-Month Avg: ₹{Math.round(average).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Payments */}
      {recurringPayments.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🔄 Recurring Payments Detected</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurringPayments.slice(0, 6).map((payment) => (
              <div
                key={`${payment.category}-${payment.amount}-${payment.interval}`}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{payment.category}</h4>
                  <span className="text-xs text-gray-400 capitalize">{payment.frequency}</span>
                </div>
                <p className="text-2xl font-bold text-blue-400 mb-2">
                  ₹{payment.amount.toLocaleString()}
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Next Payment: {payment.nextDate.toLocaleDateString()}</p>
                  <p>Occurrences: {payment.occurrences}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {editMode && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">
            💡 <strong>Tip:</strong> Click "Use Suggested" to automatically set budgets based on
            your 3-month average spending (with 10% buffer). You can then adjust individual
            categories as needed.
          </p>
        </div>
      )}
    </div>
  );
};
