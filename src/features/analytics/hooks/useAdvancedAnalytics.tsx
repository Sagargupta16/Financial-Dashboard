import { useMemo } from "react";
import {
  calculateCashFlowForecast,
  calculateCategoryBudgetStatus,
  calculateCategoryTrends,
  calculateDateRange,
  calculateDayOfMonthPattern,
  calculateGoalProgress,
  calculateIncomeStability,
  calculateMonthlyComparison,
  calculateMonthlyHealthRatio,
  detectAnomalies,
  detectRecurringTransactions,
} from "../../../lib/calculations";
import type { Transaction } from "../../../types";

/**
 * Custom hook for advanced financial analytics
 * Provides sophisticated insights and predictions
 */
export const useAdvancedAnalytics = (transactions: Transaction[]) => {
  // 1. Month-over-Month Spending Comparison
  const monthlyComparison = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }
    return calculateMonthlyComparison(transactions);
  }, [transactions]);

  // 2. Category Budget Tracking
  const categoryBudgets = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // You can pass custom budgets here, or let it auto-generate suggestions
    const budgets = {
      // Example budgets (can be customized or loaded from user preferences)
      // "Food": 15000,
      // "Transport": 5000,
      // "Shopping": 10000,
    };

    return calculateCategoryBudgetStatus(transactions, budgets);
  }, [transactions]);

  // 3. Cash Flow Forecast (30 days ahead)
  const cashFlowForecast = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }
    return calculateCashFlowForecast(transactions, 30);
  }, [transactions]);

  // 4. Recurring Transaction Detection
  const recurringTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return detectRecurringTransactions(transactions);
  }, [transactions]);

  // 5. Spending Anomaly Detection
  const anomalies = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return detectAnomalies(transactions, 2); // 2 standard deviations
  }, [transactions]);

  // 6. Day-of-Month Spending Pattern
  const dayOfMonthPattern = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return calculateDayOfMonthPattern(transactions);
  }, [transactions]);

  // 7. Category Trend Analysis
  const categoryTrends = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return calculateCategoryTrends(transactions);
  }, [transactions]);

  // 8. Income Stability Score
  const incomeStability = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }
    return calculateIncomeStability(transactions);
  }, [transactions]);

  // 9. Monthly Health Ratio
  const monthlyHealthRatio = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return calculateMonthlyHealthRatio(transactions);
  }, [transactions]);

  // 10. Savings Goal Progress (Example: Goal of ₹100,000)
  const savingsGoalProgress = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }

    const dateRange = calculateDateRange(transactions);
    const income = transactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const expense = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const currentBalance = income - expense;
    const monthlyNetIncome = ((income - expense) / dateRange.days) * 30.44;
    const goal = 100000; // Example goal - can be customized

    return calculateGoalProgress(currentBalance, goal, monthlyNetIncome);
  }, [transactions]);

  // Summary insights - Quick overview of key findings
  const insights = useMemo(() => {
    const summary = {
      hasMonthlyGrowth: (monthlyComparison?.avgGrowth ?? 0) > 0,
      monthlyTrend: monthlyComparison?.trend || "unknown",
      recurringCount: recurringTransactions?.length || 0,
      anomalyCount: anomalies?.length || 0,
      incomeStability: incomeStability?.rating || "Unknown",
      cashFlowStatus: cashFlowForecast?.status || "unknown",
      averageMonthlyHealth:
        monthlyHealthRatio && monthlyHealthRatio.length > 0
          ? monthlyHealthRatio.reduce((sum, m) => sum + m.ratio, 0) / monthlyHealthRatio.length
          : 0,
    };

    return summary;
  }, [
    monthlyComparison,
    recurringTransactions,
    anomalies,
    incomeStability,
    cashFlowForecast,
    monthlyHealthRatio,
  ]);

  return {
    // Individual analytics
    monthlyComparison,
    categoryBudgets,
    cashFlowForecast,
    recurringTransactions,
    anomalies,
    dayOfMonthPattern,
    categoryTrends,
    incomeStability,
    monthlyHealthRatio,
    savingsGoalProgress,

    // Summary insights
    insights,
  };
};

export default useAdvancedAnalytics;
