/**
 * Extended Calculation Utilities
 * Additional financial calculations used across the application
 */

import {
  calculateDateRange as canonicalDateRange,
  calculateDailyAverage as canonicalDailyAverage,
  calculateAveragePerTransaction as canonicalAveragePerTransaction,
  calculatePercentage as canonicalPercentage,
} from "./index";

export const calculateDateRange = (data) => {
  const canonical = canonicalDateRange(data);
  return {
    startDate: canonical.startDate,
    endDate: canonical.endDate,
    totalDays: canonical.days,
    days: canonical.days,
  };
};

export const calculateDailyAverage = canonicalDailyAverage;
export const calculateMonthlyAverage = (total, totalMonths) =>
  totalMonths > 0 ? total / totalMonths : 0;
export const calculateAveragePerTransaction = canonicalAveragePerTransaction;
export const calculatePercentage = canonicalPercentage;

export const calculatePerDayFrequency = (count, totalDays) =>
  totalDays === 0 ? 0 : count / totalDays;
export const calculatePerMonthFrequency = (count, totalDays) =>
  totalDays === 0 ? 0 : (count / totalDays) * 30.44;
export const calculatePerWeekFrequency = (count, totalDays) =>
  totalDays === 0 ? 0 : (count / totalDays) * 7;

export const formatNumber = (number, decimals = 2) =>
  number === null || number === undefined || Number.isNaN(number)
    ? "0"
    : Number(number).toFixed(decimals);

/**
 * Calculate savings potential with percentage
 */
export const calculateSavingsPotential = (
  total,
  totalDays,
  reductionPercentage
) => {
  const monthlyAmount = calculateMonthlyAverage(total, totalDays);
  const monthlySavings = monthlyAmount * reductionPercentage;
  const annualSavings = monthlySavings * 12;

  return {
    monthlyAmount,
    monthlySavings,
    annualSavings,
    percentage: reductionPercentage * 100,
  };
};

/**
 * Group transactions by category
 */
export const groupByCategory = (transactions) => {
  const grouped = {};

  transactions.forEach((transaction) => {
    const category = transaction.category || "Uncategorized";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(transaction);
  });

  return grouped;
};

/**
 * Filter transactions by date range
 */
export const filterByDateRange = (transactions, startDate, endDate) => {
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= startDate && date <= endDate;
  });
};

/**
 * Filter transactions by type
 */
export const filterByType = (transactions, type) => {
  return transactions.filter((t) => t.type === type);
};

/**
 * Calculate compound metrics
 */
export const calculateMetrics = (transactions, category = null) => {
  let filtered = transactions;

  if (category) {
    filtered = transactions.filter((t) => t.category === category);
  }

  const expenseTransactions = filtered.filter((t) => t.type === "Expense");
  const dateRange = calculateDateRange(filtered);

  const total = expenseTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount || 0),
    0
  );
  const count = expenseTransactions.length;

  return {
    total,
    count,
    dateRange,
    averagePerTransaction: calculateAveragePerTransaction(total, count),
    dailyAverage: calculateDailyAverage(total, dateRange.days),
    monthlyAverage: calculateMonthlyAverage(total, dateRange.days),
    frequencyPerDay: calculatePerDayFrequency(count, dateRange.days),
    frequencyPerWeek: calculatePerWeekFrequency(count, dateRange.days),
    frequencyPerMonth: calculatePerMonthFrequency(count, dateRange.days),
  };
};

/**
 * Calculate growth rate between two periods
 */
export const calculateGrowthRate = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return 0;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * Round to nearest value
 */
export const roundTo = (number, nearest = 1) => {
  return Math.round(number / nearest) * nearest;
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (values, window = 7) => {
  if (values.length < window) {
    return values;
  }

  const result = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const windowValues = values.slice(start, i + 1);
    const average =
      windowValues.reduce((sum, v) => sum + v, 0) / windowValues.length;
    result.push(average);
  }

  return result;
};

/**
 * Validate data completeness
 */
export const validateDataCompleteness = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      isValid: false,
      message: "No transactions found",
      suggestions: ["Upload your financial data to see insights"],
    };
  }

  const hasDate = transactions.some((t) => t.date);
  const hasAmount = transactions.some((t) => t.amount);
  const hasType = transactions.some((t) => t.type);

  if (!hasDate || !hasAmount || !hasType) {
    return {
      isValid: false,
      message: "Incomplete transaction data",
      suggestions: [
        "Ensure your data has date, amount, and type fields",
        "Check the CSV/Excel file format",
      ],
    };
  }

  return {
    isValid: true,
    message: "Data is valid",
    suggestions: [],
  };
};

/**
 * ADVANCED CALCULATIONS - New Features
 */

/**
 * 1. Calculate Month-over-Month Comparison
 * Track spending trends across months
 */
/**
 * Calculate monthly comparison - Month-over-Month trend analysis
 * Shows how spending changes from one month to the next
 */
export const calculateMonthlyComparison = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { byMonth: {}, growthRates: [], avgGrowth: 0, trend: "stable" };
  }

  const byMonth = {};

  transactions.forEach((t) => {
    if (t.type === "Expense" && t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7); // "2025-09"
      if (!byMonth[month]) {
        byMonth[month] = { total: 0, count: 0 };
      }
      byMonth[month].total += Math.abs(t.amount || 0);
      byMonth[month].count++;
    }
  });

  const months = Object.keys(byMonth).sort((a, b) => a.localeCompare(b));

  // Calculate Month-over-Month growth rates (compare each month to previous month)
  const growthRates = [];
  for (let i = 1; i < months.length; i++) {
    const currentMonth = months[i];
    const previousMonth = months[i - 1];

    if (byMonth[previousMonth] && byMonth[currentMonth]) {
      const growth = calculateGrowthRate(
        byMonth[currentMonth].total,
        byMonth[previousMonth].total
      );
      growthRates.push(growth);
    }
  }

  // Calculate average of last 3-6 months for more relevant trend
  const recentMonthsCount = Math.min(6, growthRates.length);
  const recentGrowthRates =
    recentMonthsCount > 0 ? growthRates.slice(-recentMonthsCount) : growthRates;

  const avgGrowth =
    recentGrowthRates.length > 0
      ? recentGrowthRates.reduce((a, b) => a + b, 0) / recentGrowthRates.length
      : 0;

  let trend = "stable";
  if (avgGrowth > 5) {
    trend = "increasing";
  } else if (avgGrowth < -5) {
    trend = "decreasing";
  }

  return {
    byMonth,
    months,
    growthRates,
    avgGrowth,
    trend,
    comparison: "month-over-month", // Indicate this is MoM not YoY
  };
};

/**
 * 2. Calculate Category Budget vs Actual
 * Track spending against category limits
 */
export const calculateCategoryBudgetStatus = (transactions, budgets = {}) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const categorySpending = {};

  transactions
    .filter((t) => t.type === "Expense")
    .forEach((t) => {
      const cat = t.category || "Uncategorized";
      categorySpending[cat] =
        (categorySpending[cat] || 0) + Math.abs(t.amount || 0);
    });

  // If no budgets provided, create suggestions based on spending
  const allCategories = Object.keys(categorySpending);
  const budgetCategories =
    Object.keys(budgets).length > 0 ? Object.keys(budgets) : allCategories;

  return budgetCategories.map((category) => {
    const spent = categorySpending[category] || 0;
    const budget = budgets[category] || spent * 1.2; // Suggest 20% buffer if no budget
    const remaining = budget - spent;
    const percentUsed = calculatePercentage(spent, budget);

    let status = "under";
    if (spent > budget) {
      status = "over";
    } else if (spent > budget * 0.9) {
      status = "warning";
    }

    return {
      category,
      spent,
      budget,
      remaining,
      percentUsed,
      status,
    };
  });
};

/**
 * 3. Calculate Cash Flow Forecast
 * Predict future balance based on current trends
 */
export const calculateCashFlowForecast = (transactions, forecastDays = 30) => {
  if (!transactions || transactions.length === 0) {
    return {
      forecastedBalance: 0,
      dailyIncome: 0,
      dailyExpense: 0,
      netDaily: 0,
      daysUntilZero: Infinity,
      projection: [],
    };
  }

  const dateRange = calculateDateRange(transactions);
  const income = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const expense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const dailyIncome = calculateDailyAverage(income, dateRange.days);
  const dailyExpense = calculateDailyAverage(expense, dateRange.days);
  const netDaily = dailyIncome - dailyExpense;
  const currentBalance = income - expense;

  // Create daily projection
  const projection = [];
  for (let i = 1; i <= forecastDays; i++) {
    projection.push({
      day: i,
      balance: currentBalance + netDaily * i,
      income: dailyIncome * i,
      expense: dailyExpense * i,
    });
  }

  let status = "stable";
  if (netDaily > 0) {
    status = "growing";
  } else if (netDaily < 0) {
    status = "declining";
  }

  return {
    forecastedBalance: currentBalance + netDaily * forecastDays,
    dailyIncome,
    dailyExpense,
    netDaily,
    daysUntilZero:
      netDaily < 0 ? Math.abs(currentBalance / netDaily) : Infinity,
    projection,
    status,
  };
};

/**
 * Classify frequency based on average interval
 * @param {number} avgInterval - Average days between occurrences
 * @returns {Object} frequency classification and isRecurring flag
 */
const classifyFrequency = (avgInterval) => {
  const frequencyRanges = [
    { min: 360, max: 370, name: "annually" },
    { min: 175, max: 185, name: "semi-annually" },
    { min: 85, max: 95, name: "quarterly" },
    { min: 60, max: 70, name: "bi-monthly" },
    { min: 27, max: 33, name: "monthly" },
    { min: 13, max: 16, name: "bi-weekly" },
    { min: 6, max: 8, name: "weekly" },
  ];

  for (const range of frequencyRanges) {
    if (avgInterval >= range.min && avgInterval <= range.max) {
      return { frequency: range.name, isRecurring: true };
    }
  }

  return { frequency: "irregular", isRecurring: false };
};

/**
 * 4. Detect Recurring Transactions
 * Find recurring patterns (subscriptions, salaries, etc.)
 */
/**
 * Detect Recurring Transactions (Subscriptions, Bills, etc.)
 * Improved algorithm with better accuracy and flexibility
 */
export const detectRecurringTransactions = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Step 1: Group transactions by description/note (more accurate than category+amount)
  const groupByDescription = {};

  transactions.forEach((t) => {
    // Skip Income transactions (Salary, etc.) - only track expense subscriptions
    if (t.type === "Income" || t.type === "Transfer-In") {
      return;
    }

    // Use note/description as primary identifier, fallback to category
    const description = (t.note || t.description || t.category || "Unknown")
      .trim()
      .toLowerCase();
    const amount = Math.abs(Number(t.amount) || 0);

    // Skip very small amounts (likely not subscriptions)
    if (amount < 10) {
      return;
    }

    // Create a flexible key that groups similar transactions
    // Round amount to nearest 10 for slight variations (e.g., ₹499 vs ₹500)
    const amountKey = Math.round(amount / 10) * 10;
    const key = `${description}-${t.type}-${amountKey}`;

    if (!groupByDescription[key]) {
      groupByDescription[key] = {
        description: t.note || t.description || t.category || "Unknown",
        category: t.category,
        type: t.type,
        amounts: [],
        dates: [],
        transactions: [],
      };
    }

    groupByDescription[key].amounts.push(amount);
    groupByDescription[key].dates.push(new Date(t.date));
    groupByDescription[key].transactions.push(t);
  });

  // Step 2: Analyze each group for recurring patterns
  const recurring = [];

  Object.entries(groupByDescription).forEach(([_key, data]) => {
    // Need at least 2 occurrences (lowered from 3 for better detection)
    if (data.dates.length < 2) {
      return;
    }

    const dates = data.dates.sort((a, b) => a - b);
    const amounts = data.amounts; // Calculate intervals between transactions
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      const daysBetween = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
      intervals.push(daysBetween);
    }

    // Calculate average interval and standard deviation
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) /
      intervals.length;
    const stdDev = Math.sqrt(variance);

    // Check if intervals are consistent (low standard deviation = recurring)
    // Allow for some flexibility: stdDev should be less than 20% of average
    const isConsistent = stdDev < avgInterval * 0.2 || intervals.length === 1;

    // Classify the frequency using helper function
    const { frequency, isRecurring } = isConsistent
      ? classifyFrequency(avgInterval)
      : { frequency: "irregular", isRecurring: false };

    // Only include if it's actually recurring
    if (isRecurring) {
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const lastDate = dates[dates.length - 1];
      const nextExpected = new Date(
        lastDate.getTime() + avgInterval * 24 * 60 * 60 * 1000
      );

      // Check if subscription is still active (last occurrence within 2x interval)
      const daysSinceLastOccurrence =
        (Date.now() - lastDate) / (1000 * 60 * 60 * 24);
      const isActive = daysSinceLastOccurrence < avgInterval * 2;

      recurring.push({
        description: data.description,
        category: data.category,
        type: data.type,
        averageAmount: avgAmount,
        minAmount: Math.min(...amounts),
        maxAmount: Math.max(...amounts),
        frequency,
        intervalDays: Math.round(avgInterval),
        count: dates.length,
        consistency: ((1 - stdDev / avgInterval) * 100).toFixed(1), // Percentage
        isActive,
        firstOccurrence: dates[0],
        lastOccurrence: lastDate,
        nextExpected,
        daysSinceLastOccurrence: Math.round(daysSinceLastOccurrence),
        // Monthly equivalent for budgeting
        monthlyEquivalent: (avgAmount / avgInterval) * 30.44,
      });
    }
  });

  // Sort by monthly equivalent (highest impact first)
  return recurring.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
};

/**
 * 5. Detect Spending Anomalies
 * Flag unusual transactions using statistical analysis
 */
export const detectAnomalies = (transactions, sensitivity = 2) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const expenses = transactions.filter((t) => t.type === "Expense");
  if (expenses.length < 3) {
    return [];
  }

  const amounts = expenses.map((t) => Math.abs(t.amount || 0));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance =
    amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  return expenses
    .filter((t) => {
      const amount = Math.abs(t.amount || 0);
      return amount > mean + sensitivity * stdDev;
    })
    .map((t) => {
      const amount = Math.abs(t.amount || 0);
      let severity = "low";
      if (amount > mean + 3 * stdDev) {
        severity = "high";
      } else if (amount > mean + 2 * stdDev) {
        severity = "medium";
      }

      return {
        ...t,
        deviation: ((amount - mean) / stdDev).toFixed(2),
        severity,
        message: `${amount.toFixed(0)} is ${(
          ((amount - mean) / mean) *
          100
        ).toFixed(0)}% above average`,
      };
    })
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
};

/**
 * 6. Calculate Day-of-Month Spending Pattern
 * When in the month do you spend most?
 */
export const calculateDayOfMonthPattern = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const byDay = new Array(31).fill(0).map(() => ({ total: 0, count: 0 }));

  transactions
    .filter((t) => t.type === "Expense" && t.date)
    .forEach((t) => {
      const day = new Date(t.date).getDate() - 1; // 0-indexed
      if (day >= 0 && day < 31) {
        byDay[day].total += Math.abs(t.amount || 0);
        byDay[day].count++;
      }
    });

  return byDay.map((data, i) => ({
    day: i + 1,
    total: data.total,
    count: data.count,
    average: data.count > 0 ? data.total / data.count : 0,
  }));
};

/**
 * 7. Calculate Category Trend Analysis
 * Is spending in each category going up or down?
 */
export const calculateCategoryTrends = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const categories = [
    ...new Set(
      transactions
        .filter((t) => t.type === "Expense")
        .map((t) => t.category || "Uncategorized")
    ),
  ];

  return categories
    .map((category) => {
      const catTransactions = transactions.filter(
        (t) =>
          (t.category || "Uncategorized") === category && t.type === "Expense"
      );

      if (catTransactions.length < 2) {
        return null;
      }

      const dateRange = calculateDateRange(catTransactions);

      // Check if we have valid dates
      if (!dateRange.startDate || !dateRange.endDate) {
        return null;
      }

      const midPoint = new Date(
        (dateRange.startDate.getTime() + dateRange.endDate.getTime()) / 2
      );

      const firstHalf = filterByDateRange(
        catTransactions,
        dateRange.startDate,
        midPoint
      );
      const secondHalf = filterByDateRange(
        catTransactions,
        midPoint,
        dateRange.endDate
      );

      const firstTotal = firstHalf.reduce(
        (sum, t) => sum + Math.abs(t.amount || 0),
        0
      );
      const secondTotal = secondHalf.reduce(
        (sum, t) => sum + Math.abs(t.amount || 0),
        0
      );

      const trend = calculateGrowthRate(secondTotal, firstTotal);

      let direction = "stable";
      if (trend > 10) {
        direction = "increasing";
      } else if (trend < -10) {
        direction = "decreasing";
      }

      return {
        category,
        firstHalfTotal: firstTotal,
        secondHalfTotal: secondTotal,
        trend,
        direction,
        monthlyAverage: calculateMonthlyAverage(
          firstTotal + secondTotal,
          dateRange.days
        ),
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => Math.abs(b.trend) - Math.abs(a.trend));
};

/**
 * 8. Calculate Income Stability Score
 * How consistent is your income?
 */
export const calculateIncomeStability = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      stability: 0,
      isStable: false,
      averageIncome: 0,
      variance: 0,
      coefficientOfVariation: 0,
    };
  }

  const income = transactions.filter((t) => t.type === "Income");

  if (income.length < 2) {
    return {
      stability: 1,
      isStable: true,
      averageIncome: income.length > 0 ? Math.abs(income[0].amount || 0) : 0,
      variance: 0,
      coefficientOfVariation: 0,
    };
  }

  const amounts = income.map((t) => Math.abs(t.amount || 0));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance =
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    amounts.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  let rating = "Volatile";
  if (coefficientOfVariation < 0.1) {
    rating = "Very Stable";
  } else if (coefficientOfVariation < 0.2) {
    rating = "Stable";
  } else if (coefficientOfVariation < 0.4) {
    rating = "Moderate";
  }

  return {
    stability: Math.max(0, 1 - Math.min(coefficientOfVariation, 1)), // 0-1 scale
    isStable: coefficientOfVariation < 0.15, // Less than 15% variation
    averageIncome: mean,
    variance,
    coefficientOfVariation,
    rating,
  };
};

/**
 * 9. Calculate Monthly Health Ratio
 * Track monthly financial health (expense-to-income ratio)
 */
export const calculateMonthlyHealthRatio = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const byMonth = {};

  transactions.forEach((t) => {
    if (t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!byMonth[month]) {
        byMonth[month] = { income: 0, expense: 0 };
      }

      if (t.type === "Income") {
        byMonth[month].income += Math.abs(t.amount || 0);
      }
      if (t.type === "Expense") {
        byMonth[month].expense += Math.abs(t.amount || 0);
      }
    }
  });

  return Object.entries(byMonth)
    .map(([month, data]) => {
      let status = "healthy";
      if (data.expense > data.income) {
        status = "deficit";
      } else if (data.expense > data.income * 0.9) {
        status = "tight";
      }

      return {
        month,
        income: data.income,
        expense: data.expense,
        ratio: calculatePercentage(data.expense, data.income),
        surplus: data.income - data.expense,
        isHealthy: data.expense < data.income * 0.8, // Spending less than 80%
        status,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * 10. Calculate Savings Goal Progress
 * Days/months until you reach a savings goal
 */
export const calculateGoalProgress = (
  currentBalance,
  goal,
  monthlyNetIncome
) => {
  if (goal <= 0 || currentBalance >= goal) {
    return {
      remaining: 0,
      monthsNeeded: 0,
      percentComplete: 100,
      estimatedDate: new Date(),
      isAchievable: true,
      status: "completed",
    };
  }

  if (monthlyNetIncome <= 0) {
    return {
      remaining: goal - currentBalance,
      monthsNeeded: Infinity,
      percentComplete: calculatePercentage(currentBalance, goal),
      estimatedDate: null,
      isAchievable: false,
      status: "not-achievable",
    };
  }

  const remaining = goal - currentBalance;
  const monthsNeeded = remaining / monthlyNetIncome;
  const estimatedDate = new Date(
    Date.now() + monthsNeeded * 30.44 * 24 * 60 * 60 * 1000
  );

  return {
    remaining,
    monthsNeeded: Math.ceil(monthsNeeded),
    percentComplete: calculatePercentage(currentBalance, goal),
    estimatedDate,
    isAchievable: true,
    status: monthsNeeded <= 12 ? "on-track" : "long-term",
    monthlyRequired: remaining / 12, // Amount needed per month to reach in 1 year
  };
};

// ============================================================================
// FINANCIAL HEALTH SCORE CALCULATIONS
// ============================================================================

/**
 * Calculate total from object or array
 */
export const calculateTotal = (data) => {
  if (!data) {
    return 0;
  }

  if (Array.isArray(data)) {
    return data.reduce((sum, item) => {
      const value =
        typeof item === "object" ? item.balance || item.amount || 0 : item;
      return sum + (Number.parseFloat(value) || 0);
    }, 0);
  }

  if (typeof data === "object") {
    return Object.values(data).reduce(
      (sum, val) => sum + (Number.parseFloat(val) || 0),
      0
    );
  }

  return 0;
};

/**
 * Calculate total liquid assets (bank balances only)
 */
export const calculateTotalLiquidAssets = (accountBalances) => {
  let totalBalance = 0;

  if (accountBalances && typeof accountBalances === "object") {
    if (Array.isArray(accountBalances)) {
      totalBalance = accountBalances.reduce(
        (sum, acc) => sum + (Number.parseFloat(acc.balance) || 0),
        0
      );
    } else {
      totalBalance = Object.values(accountBalances).reduce(
        (sum, val) => sum + (Number.parseFloat(val) || 0),
        0
      );
    }
  }

  return totalBalance;
};

/**
 * Calculate total investments
 */
export const calculateTotalInvestments = (investments = {}) => {
  return calculateTotal(investments);
};

/**
 * Calculate total deposits
 */
export const calculateTotalDeposits = (deposits = {}) => {
  return calculateTotal(deposits);
};

/**
 * Calculate total debt from account balances
 */
export const calculateTotalDebt = (accountBalances) => {
  let totalDebt = 0;

  if (accountBalances && typeof accountBalances === "object") {
    const balances = Array.isArray(accountBalances)
      ? accountBalances
      : Object.entries(accountBalances).map(([name, balance]) => ({
          name,
          balance,
        }));

    balances.forEach(({ name, balance }) => {
      const nameLower = (name || "").toLowerCase();
      const balanceNum = Number.parseFloat(balance) || 0;

      // Negative balances = debt
      if (balanceNum < 0) {
        totalDebt += Math.abs(balanceNum);
      }
      // Positive credit card balances = debt owed
      else if (balanceNum > 0 && nameLower.includes("credit card")) {
        totalDebt += balanceNum;
      }
    });
  }

  return totalDebt;
};

/**
 * Calculate savings rate percentage
 */
export const calculateSavingsRate = (savings, income) => {
  const validIncome = Number.parseFloat(income) || 0;
  const validSavings = Number.parseFloat(savings) || 0;
  return validIncome > 0 ? (validSavings / validIncome) * 100 : 0;
};

/**
 * Calculate debt to income ratio
 */
export const calculateDebtToIncomeRatio = (debt, income) => {
  const validIncome = Number.parseFloat(income) || 0;
  const validDebt = Number.parseFloat(debt) || 0;
  return validIncome > 0 ? (validDebt / validIncome) * 100 : 0;
};

/**
 * Calculate emergency fund months covered
 */
export const calculateEmergencyFundMonths = (liquidAssets, monthlyExpenses) => {
  const validLiquid = Number.parseFloat(liquidAssets) || 0;
  const validExpenses = Number.parseFloat(monthlyExpenses) || 0;
  return validExpenses > 0 ? validLiquid / validExpenses : 0;
};

/**
 * Calculate income to expense ratio
 */
export const calculateIncomeExpenseRatio = (income, expenses) => {
  const validIncome = Number.parseFloat(income) || 0;
  const validExpenses = Number.parseFloat(expenses) || 0;
  return validExpenses > 0 ? validIncome / validExpenses : 1;
};

// ============================================================================
// FINANCIAL HEALTH SCORING FUNCTIONS
// ============================================================================

/**
 * Score: Spending Consistency (0-15 points)
 */
export const scoreConsistency = (variance) => {
  if (variance <= 15) {
    return 15;
  }
  if (variance <= 25) {
    return 12;
  }
  if (variance <= 35) {
    return 8;
  }
  return 5;
};

/**
 * Score: Emergency Fund (0-25 points)
 */
export const scoreEmergencyFund = (monthsCovered) => {
  if (monthsCovered >= 6) {
    return 25;
  }
  if (monthsCovered >= 3) {
    return 20;
  }
  if (monthsCovered >= 1) {
    return 10;
  }
  return 5;
};

/**
 * Score: Income/Expense Ratio (0-15 points)
 */
export const scoreIncomeExpenseRatio = (ratio) => {
  if (ratio >= 1.5) {
    return 15;
  }
  if (ratio >= 1.2) {
    return 12;
  }
  if (ratio >= 1) {
    return 8;
  }
  return 3;
};

/**
 * Score: Category Balance (0-10 points)
 */
export const scoreCategoryBalance = (maxCategoryPercent) => {
  if (maxCategoryPercent <= 30) {
    return 10;
  }
  if (maxCategoryPercent <= 40) {
    return 7;
  }
  if (maxCategoryPercent <= 50) {
    return 4;
  }
  return 2;
};

/**
 * Score: Debt Management (0-10 points)
 */
export const scoreDebtManagement = (debtToIncomeRatio) => {
  if (debtToIncomeRatio === 0) {
    return 10;
  }
  if (debtToIncomeRatio <= 20) {
    return 8;
  }
  if (debtToIncomeRatio <= 36) {
    return 6;
  }
  if (debtToIncomeRatio <= 50) {
    return 3;
  }
  return 0;
};

/**
 * Score: Savings Rate (0-25 points)
 * Dynamic calculation: 20% savings = full points
 */
export const scoreSavingsRate = (savingsRatePercent) => {
  return Math.min(25, Math.round((savingsRatePercent / 20) * 25));
};

/**
 * Get letter grade from score (0-100)
 */
export const getFinancialGrade = (score) => {
  if (score >= 90) {
    return "A+";
  }
  if (score >= 85) {
    return "A";
  }
  if (score >= 80) {
    return "A-";
  }
  if (score >= 75) {
    return "B+";
  }
  if (score >= 70) {
    return "B";
  }
  if (score >= 65) {
    return "B-";
  }
  if (score >= 60) {
    return "C+";
  }
  if (score >= 55) {
    return "C";
  }
  if (score >= 50) {
    return "C-";
  }
  return "D";
};
