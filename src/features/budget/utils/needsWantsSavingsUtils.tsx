/**
 * Needs, Wants & Savings Budget Utilities
 * Calculate spending breakdown based on the 50/30/20 rule
 */

// @ts-nocheck

import {
  NEEDS_CATEGORIES,
  WANTS_CATEGORIES,
  SAVINGS_CATEGORIES,
  BUDGET_ALLOCATION_DEFAULTS,
} from "../../../constants";
import { parseAmount } from "../../../lib/parsers";
import { filterByType } from "../../../lib/data";
import { getMonthKey, formatPercentage } from "../../../lib/formatters";
import logger from "../../../utils/logger";

const STORAGE_KEY = "financial_dashboard_nws_allocation";

/**
 * Classify a category into Needs, Wants, or Savings
 */
export const classifyCategory = (category) => {
  if (!category) {
    return "wants"; // Default for uncategorized
  }

  const categoryLower = category.toLowerCase();

  // Check if it's in any of the predefined sets
  for (const cat of NEEDS_CATEGORIES) {
    if (categoryLower.includes(cat.toLowerCase())) {
      return "needs";
    }
  }

  for (const cat of SAVINGS_CATEGORIES) {
    if (categoryLower.includes(cat.toLowerCase())) {
      return "savings";
    }
  }

  for (const cat of WANTS_CATEGORIES) {
    if (categoryLower.includes(cat.toLowerCase())) {
      return "wants";
    }
  }

  // Default to wants for unclassified
  return "wants";
};

/**
 * Calculate Needs/Wants/Savings breakdown from transactions
 * COMPLETE REWRITE - Clean and simple logic
 */
export const calculateNWSBreakdown = (transactions) => {
  // Initialize result structure
  const result = {
    needs: 0,
    wants: 0,
    savings: 0,
    categoryDetails: {
      needs: {},
      wants: {},
      savings: {},
    },
  };

  // Early return if no data
  if (
    !transactions ||
    !Array.isArray(transactions) ||
    transactions.length === 0
  ) {
    return result;
  }

  let totalIncome = 0;
  let totalNeedsSpending = 0;
  let totalWantsSpending = 0;

  // Process each transaction
  transactions.forEach((transaction) => {
    // Get transaction details
    const category = transaction.category || "Uncategorized";
    const type = (transaction.type || "").toLowerCase().trim();
    const amount = parseAmount(transaction);

    // Skip if no valid type
    if (!type) {
      return;
    }

    // Handle income
    if (type === "income") {
      totalIncome += amount;
      return;
    }

    // Handle expenses only
    if (type === "expense") {
      // Classify the category
      const classification = classifyCategory(category);

      // Add to appropriate bucket
      result[classification] += amount;

      // Track category details
      if (!result.categoryDetails[classification][category]) {
        result.categoryDetails[classification][category] = 0;
      }
      result.categoryDetails[classification][category] += amount;

      // Track non-savings spending separately
      if (classification === "needs") {
        totalNeedsSpending += amount;
      } else if (classification === "wants") {
        totalWantsSpending += amount;
      }
    }
  });

  // Calculate actual savings (what's left after spending)
  const totalSpending = totalNeedsSpending + totalWantsSpending;
  const actualSavings = totalIncome - totalSpending;

  // If calculated savings is more than tracked savings categories, add the difference
  if (actualSavings > result.savings) {
    const untracked = actualSavings - result.savings;
    if (untracked > 0) {
      result.categoryDetails.savings["Untracked Savings"] = untracked;
      result.savings = actualSavings;
    }
  }

  return result;
};

/**
 * Calculate monthly Needs/Wants/Savings breakdown
 * COMPLETE REWRITE - Clean and simple
 */
export const calculateMonthlyNWSBreakdown = (transactions) => {
  const monthlyData = {};

  if (
    !transactions ||
    !Array.isArray(transactions) ||
    transactions.length === 0
  ) {
    return monthlyData;
  }

  // Process each transaction
  transactions.forEach((transaction) => {
    const monthKey = getMonthKey(transaction);
    const category = transaction.category || "Uncategorized";
    const type = (transaction.type || "").toLowerCase().trim();
    const amount = parseAmount(transaction);

    if (!type) {
      return;
    }

    // Initialize month if not exists
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        needs: 0,
        wants: 0,
        savings: 0,
        income: 0,
        categoryDetails: {
          needs: {},
          wants: {},
          savings: {},
        },
      };
    }

    const month = monthlyData[monthKey];

    // Handle income
    if (type === "income") {
      month.income += amount;
      return;
    }

    // Handle expenses
    if (type === "expense") {
      const classification = classifyCategory(category);

      // Add to totals
      month[classification] += amount;

      // Track details
      if (!month.categoryDetails[classification][category]) {
        month.categoryDetails[classification][category] = 0;
      }
      month.categoryDetails[classification][category] += amount;
    }
  });

  // Calculate actual savings for each month
  Object.keys(monthlyData).forEach((monthKey) => {
    const month = monthlyData[monthKey];
    const totalSpending = month.needs + month.wants;
    const actualSavings = month.income - totalSpending;

    // If actual savings is more than tracked savings, add difference
    if (actualSavings > month.savings) {
      const untracked = actualSavings - month.savings;
      if (untracked > 0) {
        month.categoryDetails.savings["Untracked Savings"] = untracked;
        month.savings = actualSavings;
      }
    }
  });

  return monthlyData;
};

/**
 * Calculate yearly Needs/Wants/Savings breakdown
 * COMPLETE REWRITE - Clean and simple
 */
export const calculateYearlyNWSBreakdown = (transactions) => {
  const yearlyData = {};

  if (
    !transactions ||
    !Array.isArray(transactions) ||
    transactions.length === 0
  ) {
    return yearlyData;
  }

  // Process each transaction
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const category = transaction.category || "Uncategorized";
    const type = (transaction.type || "").toLowerCase().trim();
    const amount = parseAmount(transaction);

    if (!type) {
      return;
    }

    // Initialize year if not exists
    if (!yearlyData[year]) {
      yearlyData[year] = {
        needs: 0,
        wants: 0,
        savings: 0,
        income: 0,
        categoryDetails: {
          needs: {},
          wants: {},
          savings: {},
        },
      };
    }

    const yearData = yearlyData[year];

    // Handle income
    if (type === "income") {
      yearData.income += amount;
      return;
    }

    // Handle expenses
    if (type === "expense") {
      const classification = classifyCategory(category);

      // Add to totals
      yearData[classification] += amount;

      // Track details
      if (!yearData.categoryDetails[classification][category]) {
        yearData.categoryDetails[classification][category] = 0;
      }
      yearData.categoryDetails[classification][category] += amount;
    }
  });

  // Calculate actual savings for each year
  Object.keys(yearlyData).forEach((year) => {
    const yearData = yearlyData[year];
    const totalSpending = yearData.needs + yearData.wants;
    const actualSavings = yearData.income - totalSpending;

    // If actual savings is more than tracked savings, add difference
    if (actualSavings > yearData.savings) {
      const untracked = actualSavings - yearData.savings;
      if (untracked > 0) {
        yearData.categoryDetails.savings["Untracked Savings"] = untracked;
        yearData.savings = actualSavings;
      }
    }
  });

  return yearlyData;
};

/**
 * Calculate percentage breakdown for Needs/Wants/Savings
 */
export const calculateNWSPercentages = (breakdown: any, income?: number) => {
  const total = breakdown.needs + breakdown.wants + breakdown.savings;

  if (total === 0) {
    return {
      needs: { amount: 0, percentage: 0, percentageOfIncome: null },
      wants: { amount: 0, percentage: 0, percentageOfIncome: null },
      savings: { amount: 0, percentage: 0, percentageOfIncome: null },
      total: 0,
      totalIncome: income ?? null,
    };
  }

  // Calculate as percentage of total spending
  const percentages = {
    needs: {
      amount: breakdown.needs,
      percentage: (breakdown.needs / total) * 100,
      percentageOfIncome: income ? (breakdown.needs / income) * 100 : null,
    },
    wants: {
      amount: breakdown.wants,
      percentage: (breakdown.wants / total) * 100,
      percentageOfIncome: income ? (breakdown.wants / income) * 100 : null,
    },
    savings: {
      amount: breakdown.savings,
      percentage: (breakdown.savings / total) * 100,
      percentageOfIncome: income ? (breakdown.savings / income) * 100 : null,
    },
    total,
    totalIncome: income ?? null,
  };

  return percentages;
};

/**
 * Compare actual spending vs. ideal 50/30/20 allocation
 */
export const compareWithIdealAllocation = (
  breakdown,
  customAllocation?: any
) => {
  const allocation = customAllocation || BUDGET_ALLOCATION_DEFAULTS;
  const total = breakdown.needs + breakdown.wants + breakdown.savings;

  if (total === 0) {
    return {
      needs: { difference: 0, status: "good" },
      wants: { difference: 0, status: "good" },
      savings: { difference: 0, status: "good" },
    };
  }

  const actualPercentages = {
    needs: (breakdown.needs / total) * 100,
    wants: (breakdown.wants / total) * 100,
    savings: (breakdown.savings / total) * 100,
  };

  const comparison: Record<string, any> = {};
  for (const [key, idealPercent] of Object.entries(
    allocation as Record<string, number>
  )) {
    const actualPercent = (actualPercentages as any)[key] ?? 0;
    const difference = actualPercent - idealPercent;

    let status;
    if (key === "savings") {
      // For savings, lower is worse
      if (difference < -10) {
        status = "critical";
      } else if (difference < -5) {
        status = "warning";
      } else {
        status = "good";
      }
    } else if (difference > 20) {
      // For needs and wants, higher is worse
      status = "critical";
    } else if (difference > 10) {
      status = "warning";
    } else {
      status = "good";
    }

    comparison[key] = {
      actual: actualPercent,
      ideal: idealPercent,
      difference,
      status,
      amount: breakdown?.[key] ?? 0,
      idealAmount: (total * idealPercent) / 100,
    };
  }

  return comparison;
};

/**
 * Get monthly income from transactions
 */
export const getMonthlyIncome = (transactions) => {
  const monthlyIncome = {};
  const incomeTransactions = filterByType(transactions, "Income");

  incomeTransactions.forEach((transaction) => {
    const monthKey = getMonthKey(transaction);
    const amount = parseAmount(transaction);

    monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + amount;
  });

  return monthlyIncome;
};

/**
 * Get yearly income from transactions
 */
export const getYearlyIncome = (transactions) => {
  const yearlyIncome = {};
  const incomeTransactions = filterByType(transactions, "Income");

  incomeTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const amount = parseAmount(transaction);

    yearlyIncome[year] = (yearlyIncome[year] || 0) + amount;
  });

  return yearlyIncome;
};

/**
 * Calculate average monthly NWS breakdown
 */
export const calculateAverageMonthlyNWS = (transactions) => {
  const monthlyBreakdown = calculateMonthlyNWSBreakdown(transactions);
  const months = Object.keys(monthlyBreakdown);

  if (months.length === 0) {
    return {
      needs: 0,
      wants: 0,
      savings: 0,
      income: 0,
    };
  }

  const totals = {
    needs: 0,
    wants: 0,
    savings: 0,
    income: 0,
  };

  months.forEach((month) => {
    totals.needs += monthlyBreakdown[month].needs;
    totals.wants += monthlyBreakdown[month].wants;
    totals.savings += monthlyBreakdown[month].savings;
    totals.income += monthlyBreakdown[month].income;
  });

  return {
    needs: totals.needs / months.length,
    wants: totals.wants / months.length,
    savings: totals.savings / months.length,
    income: totals.income / months.length,
    monthCount: months.length,
  };
};

/**
 * Save custom budget allocation to localStorage
 */
export const saveAllocation = (allocation) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allocation));
    return true;
  } catch (error) {
    logger.error("Error saving NWS allocation:", error);
    return false;
  }
};

/**
 * Load custom budget allocation from localStorage
 */
export const loadAllocation = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : BUDGET_ALLOCATION_DEFAULTS;
  } catch (error) {
    logger.error("Error loading NWS allocation:", error);
    return BUDGET_ALLOCATION_DEFAULTS;
  }
};

/**
 * Generate insights based on NWS spending patterns
 */
export const generateNWSInsights = (breakdown, income) => {
  const insights = [];
  const comparison = compareWithIdealAllocation(breakdown);

  // Check needs spending
  if (comparison.needs.difference > 15) {
    insights.push({
      type: "warning",
      category: "needs",
      message: `Your essential needs spending is ${comparison.needs.difference.toFixed(1)}% higher than recommended. Consider reviewing fixed expenses.`,
      priority: "high",
    });
  }

  // Check wants spending
  if (comparison.wants.difference > 15) {
    insights.push({
      type: "warning",
      category: "wants",
      message: `Discretionary spending is ${comparison.wants.difference.toFixed(1)}% above the ideal allocation. Look for areas to cut back.`,
      priority: "medium",
    });
  }

  // Check savings
  if (comparison.savings.difference < -10) {
    insights.push({
      type: "critical",
      category: "savings",
      message: `Your savings rate is ${Math.abs(comparison.savings.difference).toFixed(1)}% below recommended. Prioritize increasing savings.`,
      priority: "high",
    });
  } else if (comparison.savings.difference > 10) {
    insights.push({
      type: "success",
      category: "savings",
      message: `Great job! Your savings rate is ${comparison.savings.difference.toFixed(1)}% above the recommended 20%.`,
      priority: "low",
    });
  }

  // Income vs spending check
  if (income) {
    const totalSpending = breakdown.needs + breakdown.wants;
    const spendingRatio = (totalSpending / income) * 100;

    if (spendingRatio > 90) {
      insights.push({
        type: "critical",
        category: "overall",
        message: `You're spending ${spendingRatio.toFixed(1)}% of your income. This leaves little room for savings or emergencies.`,
        priority: "high",
      });
    }
  }

  return insights;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, showDecimals = true) => {
  const formatted = showDecimals
    ? amount.toFixed(2)
    : Math.round(amount).toString();
  return `₹${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export { formatPercentage };
