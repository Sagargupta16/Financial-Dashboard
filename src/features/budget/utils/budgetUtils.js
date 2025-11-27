/**
 * Budget and Goal Management Utilities
 * Handles budget calculations, goal tracking, and localStorage persistence
 */

// Import centralized calculation formulas
import {
  calculateTotalLiquidAssets,
  calculateTotalInvestments,
  calculateTotalDeposits,
  calculateTotalDebt,
  scoreConsistency,
  scoreEmergencyFund,
  scoreIncomeExpenseRatio,
  scoreCategoryBalance,
  scoreDebtManagement,
  getFinancialGrade,
} from "../../../shared/utils/calculations";

// Storage keys for budget data
const BUDGET_KEY = "financial_dashboard_budgets";
const GOALS_KEY = "financial_dashboard_goals";
const SCENARIOS_KEY = "financial_dashboard_scenarios";

/**
 * Get all budgets from localStorage
 */
export const loadBudgets = () => {
  try {
    const data = localStorage.getItem(BUDGET_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error loading budgets:", error);
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
    console.error("Error saving budgets:", error);
    return false;
  }
};

/**
 * Calculate category spending from transactions
 */
export const calculateCategorySpending = (transactions) => {
  const spending = {};

  transactions.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    const amount = Math.abs(Number.parseFloat(transaction.amount) || 0);
    const type = transaction.type;

    // Only count expenses
    if (type === "Expense") {
      spending[category] = (spending[category] || 0) + amount;
    }
  });

  return spending;
};

/**
 * Calculate budget vs actual comparison
 */
export const calculateBudgetComparison = (budgets, actualSpending) => {
  const comparison = {};
  const categories = new Set([
    ...Object.keys(budgets),
    ...Object.keys(actualSpending),
  ]);

  categories.forEach((category) => {
    const budget = budgets[category] || 0;
    const actual = actualSpending[category] || 0;
    const remaining = budget - actual;
    const percentage = budget > 0 ? (actual / budget) * 100 : 0;

    let status = "good";
    if (percentage > 100) {
      status = "over";
    } else if (percentage > 80) {
      status = "warning";
    }

    comparison[category] = {
      budget,
      actual,
      remaining,
      percentage,
      status,
    };
  });

  return comparison;
};

/**
 * Load goals from localStorage
 */
export const loadGoals = () => {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading goals:", error);
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
    console.error("Error saving goals:", error);
    return false;
  }
};

/**
 * Calculate goal progress
 */
export const calculateGoalProgress = (goal, currentAmount) => {
  const progress = (currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - currentAmount;

  // Calculate required monthly savings
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const monthsRemaining = Math.max(
    1,
    Math.ceil((deadline - now) / (1000 * 60 * 60 * 24 * 30))
  );
  const requiredMonthlySavings = remaining / monthsRemaining;

  // Projected completion date based on current rate
  const projectedMonths =
    goal.monthlySavings > 0 ? Math.ceil(remaining / goal.monthlySavings) : null;
  const projectedDate = projectedMonths
    ? new Date(now.getTime() + projectedMonths * 30 * 24 * 60 * 60 * 1000)
    : null;

  return {
    progress: Math.min(100, progress),
    remaining,
    monthsRemaining,
    requiredMonthlySavings,
    projectedDate,
    onTrack: projectedDate ? projectedDate <= deadline : false,
  };
};

/**
 * Load scenarios from localStorage
 */
export const loadScenarios = () => {
  try {
    const data = localStorage.getItem(SCENARIOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading scenarios:", error);
    return [];
  }
};

/**
 * Save scenarios to localStorage
 */
export const saveScenarios = (scenarios) => {
  try {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
    return true;
  } catch (error) {
    console.error("Error saving scenarios:", error);
    return false;
  }
};

/**
 * Calculate simulated spending based on adjustments
 */
export const calculateSimulatedSpending = (actualSpending, adjustments) => {
  const simulated = {};

  Object.keys(actualSpending).forEach((category) => {
    const actual = actualSpending[category];
    const adjustment = adjustments[category] || 0; // percentage
    simulated[category] = actual * (1 + adjustment / 100);
  });

  return simulated;
};

/**
 * Calculate total impact of spending changes
 */
export const calculateImpact = (actualSpending, simulatedSpending) => {
  const actualTotal = Object.values(actualSpending).reduce(
    (sum, val) => sum + val,
    0
  );
  const simulatedTotal = Object.values(simulatedSpending).reduce(
    (sum, val) => sum + val,
    0
  );

  const monthlySavings = actualTotal - simulatedTotal;
  const annualSavings = monthlySavings * 12;
  const percentageChange =
    actualTotal > 0 ? (monthlySavings / actualTotal) * 100 : 0;

  return {
    actualTotal,
    simulatedTotal,
    monthlySavings,
    annualSavings,
    percentageChange,
  };
};

/**
 * Detect recurring transactions
 */
export const detectRecurringPayments = (transactions) => {
  const recurring = [];
  const categoryGroups = {};

  // Group by category and similar amounts
  transactions.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    const amount = Math.abs(Number.parseFloat(transaction.amount) || 0);
    const date = new Date(transaction.date);

    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }

    categoryGroups[category].push({ amount, date, transaction });
  });

  // Analyze each category for recurring patterns
  Object.entries(categoryGroups).forEach(([category, transactions]) => {
    // Group by similar amounts (within 10% variance)
    const amountGroups = {};

    transactions.forEach(({ amount, date, transaction }) => {
      const baseAmount = Math.round(amount / 100) * 100; // Round to nearest 100
      if (!amountGroups[baseAmount]) {
        amountGroups[baseAmount] = [];
      }
      amountGroups[baseAmount].push({ amount, date, transaction });
    });

    // Check for recurring patterns
    Object.entries(amountGroups).forEach(([baseAmount, items]) => {
      if (items.length >= 3) {
        // Need at least 3 occurrences
        // Sort by date
        items.sort((a, b) => a.date - b.date);

        // Calculate intervals
        const intervals = [];
        for (let i = 1; i < items.length; i++) {
          const days = Math.round(
            (items[i].date - items[i - 1].date) / (1000 * 60 * 60 * 24)
          );
          intervals.push(days);
        }

        // Check if intervals are consistent (within 3 days variance)
        const avgInterval =
          intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const isConsistent = intervals.every(
          (interval) => Math.abs(interval - avgInterval) <= 3
        );

        if (isConsistent) {
          // Determine frequency
          let frequency = "monthly";
          if (avgInterval <= 10) {
            frequency = "weekly";
          } else if (avgInterval >= 80) {
            frequency = "quarterly";
          } else if (avgInterval >= 350) {
            frequency = "yearly";
          }

          // Calculate next payment date
          const lastDate = items[items.length - 1].date;
          const nextDate = new Date(
            lastDate.getTime() + avgInterval * 24 * 60 * 60 * 1000
          );

          recurring.push({
            category,
            amount: Number.parseFloat(baseAmount),
            frequency,
            interval: Math.round(avgInterval),
            occurrences: items.length,
            lastDate,
            nextDate,
            description: items[0].transaction.Note || category,
          });
        }
      }
    });
  });

  return recurring.sort((a, b) => b.amount - a.amount);
};

/**
 * Calculate consistency score
 */
// Note: All calculation and scoring functions now imported from shared/utils/calculations.js
// Using imported functions directly with aliases for compatibility

const calculateConsistencyScore = scoreConsistency;
const calculateEmergencyFundScore = scoreEmergencyFund;
const calculateRatioScore = scoreIncomeExpenseRatio;
const calculateCategoryBalanceScore = scoreCategoryBalance;
const calculateDebtScore = scoreDebtManagement;

/**
 * Calculate spending variance (coefficient of variation)
 */
const calculateSpendingVariance = (_expenses) => {
  // This would need historical data - placeholder for now
  return 20; // Default moderate variance
};

/**
 * Calculate financial health score (0-100)
 */
export const calculateHealthScore = (data) => {
  const { income, expenses, savings, accountBalances, investments, deposits } =
    data;

  // Ensure we have valid numbers
  const validIncome = Number.parseFloat(income) || 0;
  const validExpenses = Number.parseFloat(expenses) || 0;
  const validSavings = Number.parseFloat(savings) || 0;

  const metrics = {};
  const details = {}; // Store calculation details for visualization

  // Calculate total wealth for reference
  const totalInvestments = calculateTotalInvestments(investments);
  const totalDeposits = calculateTotalDeposits(deposits);
  const totalLiquidAssets = calculateTotalLiquidAssets(accountBalances);

  // Calculate debt (only current balances, not historical transactions)
  const totalDebt = calculateTotalDebt(accountBalances);
  const debtToIncomeRatio =
    validIncome > 0 ? (totalDebt / validIncome) * 100 : 0;

  // 1. Savings Rate (0-25 points) - Reduced from 30 to make room for debt
  const savingsRate = validIncome > 0 ? (validSavings / validIncome) * 100 : 0;
  const savingsScore = Math.min(25, Math.round((savingsRate / 20) * 25)); // 20% savings = full points
  metrics.savingsRate = savingsScore;
  details.savingsRate = savingsRate;

  // 2. Spending Consistency (0-15 points) - Reduced from 20
  const variance = calculateSpendingVariance(validExpenses);
  metrics.consistency = calculateConsistencyScore(variance);
  details.consistency = variance;

  // 3. Emergency Fund (0-25 points)
  // Emergency fund should cover 6 months of expenses with liquid bank assets
  const monthlyExpenses = validExpenses;
  const monthsCovered =
    monthlyExpenses > 0 ? totalLiquidAssets / monthlyExpenses : 0;
  metrics.emergencyFund = calculateEmergencyFundScore(monthsCovered);
  details.monthsCovered = monthsCovered;

  // 4. Income/Expense Ratio (0-15 points)
  const ratio = validExpenses > 0 ? validIncome / validExpenses : 1;
  metrics.ratio = calculateRatioScore(ratio);
  details.ratio = ratio;

  // 5. Category Balance (0-10 points)
  const categorySpending = data.categorySpending || {};
  const categoryPercentages = Object.values(categorySpending).map((amount) =>
    validExpenses > 0 ? (amount / validExpenses) * 100 : 0
  );
  const maxCategoryPercent = Math.max(...categoryPercentages, 0);
  metrics.categoryBalance = calculateCategoryBalanceScore(maxCategoryPercent);
  details.maxCategoryPercent = maxCategoryPercent;

  // 6. Debt Management (0-10 points) - NEW
  metrics.debtManagement = calculateDebtScore(debtToIncomeRatio);
  details.debtToIncomeRatio = debtToIncomeRatio;

  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0);

  const result = {
    score: Math.min(100, Math.round(score)),
    metrics,
    details, // Add calculation details
    grade: getFinancialGrade(score),
    savingsRate: details.savingsRate.toFixed(1),
    monthsCovered: details.monthsCovered.toFixed(1),
    totalLiquidAssets: totalLiquidAssets.toFixed(0),
    emergencyFundAmount: totalLiquidAssets.toFixed(0),
    totalInvestments: totalInvestments.toFixed(0),
    totalDeposits: totalDeposits.toFixed(0),
    totalDebt: totalDebt.toFixed(0),
    debtToIncomeRatio: details.debtToIncomeRatio.toFixed(1),
  };

  return result;
};

/**
 * Generate smart recommendations based on spending patterns
 */
export const generateRecommendations = (budgetComparison, healthScore) => {
  const recommendations = [];

  // Budget-based recommendations
  if (budgetComparison && Object.keys(budgetComparison).length > 0) {
    Object.entries(budgetComparison).forEach(([category, data]) => {
      if (data.status === "over") {
        recommendations.push({
          type: "warning",
          category,
          message: `${category} is over budget by ₹${Math.abs(data.remaining).toFixed(0)}`,
          action: `Reduce ${category} spending by ${(data.percentage - 100).toFixed(0)}%`,
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
  const score = healthScore.score || 0;

  if (savingsRate < 10) {
    recommendations.push({
      type: "alert",
      category: "Savings",
      message: `Savings rate is ${savingsRate.toFixed(1)}% (Target: 20%+)`,
      action: "Try to save at least 10-20% of your income",
    });
  } else if (savingsRate < 15) {
    recommendations.push({
      type: "tip",
      category: "Savings",
      message: `Savings rate is ${savingsRate.toFixed(1)}% (Good, but aim higher)`,
      action: "Increase savings rate to 20% for excellent financial health",
    });
  }

  if (monthsCovered < 3) {
    recommendations.push({
      type: "alert",
      category: "Emergency Fund",
      message: `Emergency fund covers ${monthsCovered.toFixed(1)} months (Target: 6 months)`,
      action: "Build emergency fund to cover 3-6 months of expenses",
    });
  } else if (monthsCovered < 6) {
    recommendations.push({
      type: "tip",
      category: "Emergency Fund",
      message: `Emergency fund covers ${monthsCovered.toFixed(1)} months (On track!)`,
      action: "Continue building to reach 6-month target",
    });
  }

  if (score >= 80) {
    recommendations.push({
      type: "success",
      category: "Overall",
      message: "Excellent financial health! 🎉",
      action: "Keep up the great work with your current financial habits",
    });
  } else if (score < 60) {
    recommendations.push({
      type: "warning",
      category: "Overall",
      message: "Financial health needs attention",
      action: "Focus on increasing savings rate and building emergency fund",
    });
  }

  return recommendations;
};
