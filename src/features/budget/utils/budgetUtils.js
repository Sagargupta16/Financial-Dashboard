/**
 * Budget and Planning Utilities - Redesigned for Perfect Calculations
 * Simplified, accurate budget tracking with trend analysis
 */

import logger from "../../../utils/logger";
import {
  calculateTotalLiquidAssets,
  calculateTotalInvestments,
  calculateTotalDeposits,
  calculateTotalDebt,
  scoreConsistency,
  scoreEmergencyFund,
  scoreIncomeExpenseRatio,
  scoreDebtManagement,
  getFinancialGrade,
} from "../../../lib/calculations";
import { parseAmount, filterByType, getMonthKey } from "../../../lib/data";

// Storage keys for budget data
const BUDGET_KEY = "financial_dashboard_budgets";
const GOALS_KEY = "financial_dashboard_goals";

/**
 * ==========================================
 * BUDGET MANAGEMENT
 * ==========================================
 */

/**
 * Load budgets from localStorage
 */
export const loadBudgets = () => {
  try {
    const data = localStorage.getItem(BUDGET_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    logger.error("Error loading budgets:", error);
    return {};
  }
};

/**
 * Save budgets to localStorage
 */
export const saveBudgets = (budgets) => {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    return true;
  } catch (error) {
    logger.error("Error saving budgets:", error);
    return false;
  }
};

/**
 * Calculate total spending by category using optimized helpers
 */
export const calculateCategorySpending = (transactions) => {
  const spending = {};
  const expenses = filterByType(transactions, "Expense");

  expenses.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    const amount = parseAmount(transaction);

    spending[category] = (spending[category] || 0) + amount;
  });

  return spending;
}; /**
 * Calculate spending trends over time
 */
export const calculateSpendingTrends = (transactions) => {
  const monthlySpending = {};
  const expenses = filterByType(transactions, "Expense");

  expenses.forEach((transaction) => {
    const monthKey = getMonthKey(transaction);
    const category = transaction.category || "Uncategorized";
    const amount = parseAmount(transaction);

    if (!monthlySpending[monthKey]) {
      monthlySpending[monthKey] = {};
    }
    monthlySpending[monthKey][category] =
      (monthlySpending[monthKey][category] || 0) + amount;
  });

  return monthlySpending;
};

/**
 * Calculate 3-month average spending per category
 */
export const calculateAverageSpending = (transactions) => {
  const trends = calculateSpendingTrends(transactions);
  const months = Object.keys(trends)
    .sort((a, b) => a.localeCompare(b))
    .slice(-3); // Last 3 months

  if (months.length === 0) {
    return {};
  }

  const categoryTotals = {};
  months.forEach((month) => {
    Object.entries(trends[month]).forEach(([category, amount]) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
  });

  const averages = {};
  Object.entries(categoryTotals).forEach(([category, total]) => {
    averages[category] = total / months.length;
  });

  return averages;
};

/**
 * Enhanced budget comparison with trend analysis
 */
export const calculateBudgetComparison = (actualSpending, budgets) => {
  const comparison = {};

  Object.keys(actualSpending).forEach((category) => {
    const actual = actualSpending[category];
    const budget = budgets[category] || 0;

    if (budget > 0) {
      const remaining = budget - actual;
      const percentage = (actual / budget) * 100;

      // More nuanced status based on percentage
      let status = "good";
      if (percentage >= 100) {
        status = "over";
      } else if (percentage >= 90) {
        status = "critical"; // New: nearly over budget
      } else if (percentage >= 75) {
        status = "warning";
      }

      comparison[category] = {
        budget,
        actual,
        remaining,
        percentage: Math.round(percentage),
        status,
      };
    }
  });

  return comparison;
};

/**
 * Suggest budgets based on spending patterns
 */
export const suggestBudgets = (transactions) => {
  const averages = calculateAverageSpending(transactions);
  const suggestions = {};

  Object.entries(averages).forEach(([category, average]) => {
    // Add 10% buffer to average spending for realistic budgets
    suggestions[category] = Math.round(average * 1.1);
  });

  return suggestions;
};

/**
 * ==========================================
 * GOAL MANAGEMENT
 * ==========================================
 */

/**
 * Load goals from localStorage
 */
export const loadGoals = () => {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    logger.error("Error loading goals:", error);
    return [];
  }
};

/**
 * Save goals to localStorage
 */
export const saveGoals = (goals) => {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    return true;
  } catch (error) {
    logger.error("Error saving goals:", error);
    return false;
  }
};

/**
 * Calculate comprehensive goal progress with accurate projections
 */
export const calculateGoalProgress = (goal, currentAmount) => {
  const progress = Math.min(100, (currentAmount / goal.targetAmount) * 100);
  const remaining = Math.max(0, goal.targetAmount - currentAmount);

  // Calculate time remaining
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const daysRemaining = Math.max(
    0,
    Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  );
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

  // Required monthly savings to meet goal
  const requiredMonthlySavings =
    monthsRemaining > 0 ? remaining / monthsRemaining : 0;

  // Projected completion based on current savings rate
  const monthlySavings = goal.monthlySavings || 0;
  let projectedDate = null;
  let onTrack = false;

  if (monthlySavings > 0 && remaining > 0) {
    const monthsNeeded = Math.ceil(remaining / monthlySavings);
    projectedDate = new Date(
      now.getTime() + monthsNeeded * 30 * 24 * 60 * 60 * 1000
    );
    onTrack = projectedDate <= deadline;
  } else if (remaining <= 0) {
    projectedDate = now;
    onTrack = true;
  }

  // Determine status
  let status = "behind";
  if (remaining <= 0) {
    status = "completed";
  } else if (onTrack) {
    status = "on-track";
  }

  return {
    progress: Math.round(progress * 10) / 10, // One decimal place
    remaining,
    daysRemaining,
    monthsRemaining,
    requiredMonthlySavings: Math.round(requiredMonthlySavings),
    projectedDate,
    onTrack,
    status,
  };
};

/**
 * ==========================================
 * RECURRING PAYMENTS DETECTION
 * ==========================================
 */

/**
 * Detect recurring payments (simplified algorithm)
 */
export const detectRecurringPayments = (transactions) => {
  const recurring = [];
  const categoryGroups = {};

  const expenses = filterByType(transactions, "Expense");

  // Group by category and similar amounts
  expenses.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    const amount = parseAmount(transaction);
    const date = new Date(transaction.date);

    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }

    categoryGroups[category].push({ amount, date, transaction });
  });

  // Analyze each category for recurring patterns
  Object.entries(categoryGroups).forEach(([category, items]) => {
    // Group by similar amounts (within 10% variance)
    const amountGroups = {};

    items.forEach(({ amount, date, transaction }) => {
      const baseAmount = Math.round(amount / 100) * 100; // Round to nearest 100

      if (!amountGroups[baseAmount]) {
        amountGroups[baseAmount] = [];
      }
      amountGroups[baseAmount].push({ amount, date, transaction });
    });

    // Check for recurring patterns
    Object.entries(amountGroups).forEach(([baseAmount, groupItems]) => {
      if (groupItems.length >= 3) {
        // Sort by date
        groupItems.sort((a, b) => a.date - b.date);

        // Calculate intervals between payments
        const intervals = [];
        for (let i = 1; i < groupItems.length; i++) {
          const days = Math.round(
            (groupItems[i].date - groupItems[i - 1].date) /
              (1000 * 60 * 60 * 24)
          );
          intervals.push(days);
        }

        // Check if intervals are consistent (within 5 days variance)
        const avgInterval =
          intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const isConsistent = intervals.every(
          (interval) => Math.abs(interval - avgInterval) <= 5
        );

        if (isConsistent) {
          // Determine frequency
          let frequency = "monthly";
          if (avgInterval <= 10) {
            frequency = "weekly";
          } else if (avgInterval >= 80 && avgInterval <= 100) {
            frequency = "quarterly";
          } else if (avgInterval >= 350) {
            frequency = "yearly";
          }

          // Calculate next payment date
          const lastDate = groupItems[groupItems.length - 1].date;
          const nextDate = new Date(
            lastDate.getTime() + avgInterval * 24 * 60 * 60 * 1000
          );

          recurring.push({
            category,
            amount: Number.parseFloat(baseAmount),
            frequency,
            interval: Math.round(avgInterval),
            occurrences: groupItems.length,
            lastDate,
            nextDate,
            description: groupItems[0].transaction.Note || category,
          });
        }
      }
    });
  });

  return recurring.sort((a, b) => b.amount - a.amount);
};

/**
 * ==========================================
 * FINANCIAL HEALTH SCORE
 * ==========================================
 */

/**
 * Calculate spending variance (lower is better - indicates consistent spending)
 */
const calculateSpendingVariance = (transactions) => {
  const monthlyTotals = {};
  const expenses = filterByType(transactions, "Expense");

  // Group by month
  expenses.forEach((transaction) => {
    const monthKey = getMonthKey(transaction);
    const amount = parseAmount(transaction);
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amount;
  });

  const values = Object.values(monthlyTotals);
  if (values.length < 2) {
    return 0; // Need at least 2 months
  }

  // Calculate coefficient of variation (CV)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  return cv;
};

/**
 * Calculate comprehensive financial health score (0-100)
 */
export const calculateHealthScore = (data) => {
  const {
    income,
    expenses,
    savings,
    accountBalances,
    allAccountBalances, // All accounts including credit cards
    investments,
    deposits,
    filteredData,
  } = data;

  // Ensure valid numbers
  const validIncome = Number.parseFloat(income) || 0;
  const validExpenses = Number.parseFloat(expenses) || 0;
  const validSavings = Number.parseFloat(savings) || 0;

  const metrics = {};
  const details = {};

  // Calculate totals
  const totalInvestments = calculateTotalInvestments(investments);
  const totalDeposits = calculateTotalDeposits(deposits);
  const totalLiquidAssets = calculateTotalLiquidAssets(accountBalances);
  const totalDebt = calculateTotalDebt(allAccountBalances || accountBalances); // Use all accounts for debt

  // Calculate average monthly expenses from actual transaction data (last 3 months)
  let averageMonthlyExpenses = validExpenses; // Fallback to current month
  if (filteredData && filteredData.length > 0) {
    const monthlyExpenseTotals = {};
    const expenseTransactions = filterByType(filteredData, "Expense");

    expenseTransactions.forEach((transaction) => {
      const monthKey = getMonthKey(transaction);
      const amount = parseAmount(transaction);
      monthlyExpenseTotals[monthKey] =
        (monthlyExpenseTotals[monthKey] || 0) + amount;
    });

    const expenseValues = Object.values(monthlyExpenseTotals);
    if (expenseValues.length > 0) {
      // Calculate average from last 3 months (or all available months if less than 3)
      const recentMonths = Object.keys(monthlyExpenseTotals)
        .sort((a, b) => a.localeCompare(b))
        .slice(-3);
      const recentExpenses = recentMonths.map(
        (month) => monthlyExpenseTotals[month]
      );
      averageMonthlyExpenses =
        recentExpenses.reduce((sum, val) => sum + val, 0) /
        recentExpenses.length;
    }
  }

  // Final fallback: if still 0, use total expenses from category spending
  if (averageMonthlyExpenses === 0 && expenses > 0) {
    averageMonthlyExpenses = expenses;
  }

  // 1. Savings Rate (0-30 points) - Most important metric
  const savingsRate = validIncome > 0 ? (validSavings / validIncome) * 100 : 0;
  metrics.savingsRate = Math.min(30, Math.round((savingsRate / 20) * 30)); // 20% savings = full 30 points
  details.savingsRate = savingsRate;

  // 2. Emergency Fund Coverage (0-25 points)
  // Emergency fund should use ONLY liquid bank cash, not investments/deposits
  // Calculate months covered using average monthly expenses from transaction history
  const monthsCovered =
    averageMonthlyExpenses > 0 ? totalLiquidAssets / averageMonthlyExpenses : 0;
  metrics.emergencyFund = scoreEmergencyFund(monthsCovered);
  details.monthsCovered = monthsCovered;
  details.averageMonthlyExpenses = averageMonthlyExpenses;

  // 3. Debt Management (0-20 points)
  const debtToIncomeRatio =
    validIncome > 0 ? (totalDebt / (validIncome * 12)) * 100 : 0;
  metrics.debtManagement = scoreDebtManagement(debtToIncomeRatio);
  details.debtToIncomeRatio = debtToIncomeRatio;
  details.totalDebt = totalDebt; // Store raw debt value

  // 4. Income/Expense Balance (0-15 points)
  const incomeExpenseRatio =
    validExpenses > 0 ? validIncome / validExpenses : 1;
  metrics.incomeExpenseRatio = scoreIncomeExpenseRatio(incomeExpenseRatio);
  details.incomeExpenseRatio = incomeExpenseRatio;

  // 5. Spending Consistency (0-10 points)
  const variance = filteredData ? calculateSpendingVariance(filteredData) : 20;
  metrics.consistency = scoreConsistency(variance);
  details.spendingVariance = variance;

  // Calculate total score
  const totalScore = Object.values(metrics).reduce((sum, val) => sum + val, 0);

  return {
    score: Math.min(100, Math.round(totalScore)),
    metrics,
    details,
    grade: getFinancialGrade(totalScore),
    // Formatted values for display
    savingsRate: details.savingsRate.toFixed(1),
    monthsCovered: details.monthsCovered.toFixed(1),
    averageMonthlyExpenses: details.averageMonthlyExpenses.toFixed(0),
    totalLiquidAssets: totalLiquidAssets.toFixed(0),
    emergencyFundAmount: totalLiquidAssets.toFixed(0),
    totalInvestments: totalInvestments.toFixed(0),
    totalDeposits: totalDeposits.toFixed(0),
    totalDebt: totalDebt.toFixed(0),
    debtToIncomeRatio: details.debtToIncomeRatio.toFixed(1),
    incomeExpenseRatio: details.incomeExpenseRatio.toFixed(2),
  };
};

/**
 * Generate actionable recommendations based on financial health
 */
export const generateRecommendations = (budgetComparison, healthScore) => {
  const recommendations = [];

  // Budget-specific recommendations
  if (budgetComparison && Object.keys(budgetComparison).length > 0) {
    Object.entries(budgetComparison).forEach(([category, data]) => {
      if (data.status === "over") {
        recommendations.push({
          type: "alert",
          category,
          message: `${category} is ₹${Math.abs(data.remaining).toFixed(0)} over budget`,
          action: `Reduce ${category} spending by ${(data.percentage - 100).toFixed(0)}% next month`,
        });
      } else if (data.status === "critical") {
        recommendations.push({
          type: "warning",
          category,
          message: `${category} at ${data.percentage}% of budget`,
          action: `Monitor ${category} spending carefully for rest of month`,
        });
      }
    });
  }

  // Health score recommendations
  if (!healthScore) {
    return recommendations;
  }

  const savingsRate = Number.parseFloat(healthScore.savingsRate) || 0;
  const monthsCovered = Number.parseFloat(healthScore.monthsCovered) || 0;
  const debtRatio = Number.parseFloat(healthScore.debtToIncomeRatio) || 0;
  const score = healthScore.score || 0;

  // Savings recommendations
  if (savingsRate < 10) {
    recommendations.push({
      type: "alert",
      category: "Savings",
      message: `Low savings rate: ${savingsRate.toFixed(1)}% (Target: 20%+)`,
      action: "Aim to save at least 10-20% of your monthly income",
    });
  } else if (savingsRate < 20) {
    recommendations.push({
      type: "tip",
      category: "Savings",
      message: `Good savings rate: ${savingsRate.toFixed(1)}%`,
      action: "Increase to 20%+ for excellent financial health",
    });
  } else {
    recommendations.push({
      type: "success",
      category: "Savings",
      message: `Excellent savings rate: ${savingsRate.toFixed(1)}%! 🎉`,
      action: "Continue your disciplined saving habits",
    });
  }

  // Emergency fund recommendations
  if (monthsCovered < 3) {
    recommendations.push({
      type: "alert",
      category: "Emergency Fund",
      message: `Emergency fund covers only ${monthsCovered.toFixed(1)} months`,
      action: "Build emergency fund to cover 3-6 months of expenses",
    });
  } else if (monthsCovered < 6) {
    recommendations.push({
      type: "tip",
      category: "Emergency Fund",
      message: `Emergency fund covers ${monthsCovered.toFixed(1)} months`,
      action: "Almost there! Target is 6 months coverage",
    });
  } else {
    recommendations.push({
      type: "success",
      category: "Emergency Fund",
      message: `Strong emergency fund: ${monthsCovered.toFixed(1)} months! 💪`,
      action: "Well protected against financial emergencies",
    });
  }

  // Debt recommendations
  if (debtRatio > 40) {
    recommendations.push({
      type: "alert",
      category: "Debt",
      message: `High debt-to-income ratio: ${debtRatio.toFixed(1)}%`,
      action: "Prioritize debt repayment - aim for <36% of annual income",
    });
  } else if (debtRatio > 30) {
    recommendations.push({
      type: "warning",
      category: "Debt",
      message: `Moderate debt burden: ${debtRatio.toFixed(1)}%`,
      action: "Keep debt under control and avoid taking on more",
    });
  }

  // Overall health assessment
  if (score >= 80) {
    recommendations.push({
      type: "success",
      category: "Overall",
      message: "Excellent financial health! 🌟",
      action: "Maintain your great financial habits",
    });
  } else if (score >= 60) {
    recommendations.push({
      type: "tip",
      category: "Overall",
      message: "Good financial health, room for improvement",
      action: "Focus on increasing savings and building emergency fund",
    });
  } else {
    recommendations.push({
      type: "warning",
      category: "Overall",
      message: "Financial health needs attention",
      action:
        "Focus on: 1) Reduce expenses 2) Increase savings 3) Build emergency fund",
    });
  }

  return recommendations;
};
