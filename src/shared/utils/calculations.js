/**
 * Centralized Calculation Utilities
 * All shared formulas and calculations in one place
 */

/**
 * Calculate actual date range from transactions
 */
export const calculateDateRange = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { days: 0, months: 0, years: 0 };
  }

  const dates = transactions
    .map((t) => new Date(t.date))
    .filter((d) => !isNaN(d.getTime()));

  if (dates.length === 0) {
    return { days: 0, months: 0, years: 0 };
  }

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // Calculate days, ensuring at least 1 day if dates exist (prevents division by zero)
  const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
  const days = daysDiff === 0 ? 1 : daysDiff; // At least 1 day
  const months = days / 30.44; // Average days per month
  const years = months / 12;

  return {
    days,
    months,
    years,
    minDate,
    maxDate,
  };
};

/**
 * Calculate per-day frequency
 */
export const calculatePerDayFrequency = (count, totalDays) => {
  if (totalDays === 0) {
    return 0;
  }
  return count / totalDays;
};

/**
 * Calculate per-month frequency
 */
export const calculatePerMonthFrequency = (count, totalDays) => {
  if (totalDays === 0) {
    return 0;
  }
  return (count / totalDays) * 30.44; // Average days per month
};

/**
 * Calculate per-week frequency
 */
export const calculatePerWeekFrequency = (count, totalDays) => {
  if (totalDays === 0) {
    return 0;
  }
  return (count / totalDays) * 7;
};

/**
 * Calculate daily average amount
 */
export const calculateDailyAverage = (total, totalDays) => {
  if (totalDays === 0) {
    return 0;
  }
  return total / totalDays;
};

/**
 * Calculate monthly average amount
 */
export const calculateMonthlyAverage = (total, totalDays) => {
  if (totalDays === 0) {
    return 0;
  }
  return (total / totalDays) * 30.44;
};

/**
 * Calculate average per transaction
 */
export const calculateAveragePerTransaction = (total, count) => {
  if (count === 0) {
    return 0;
  }
  return total / count;
};

/**
 * Calculate percentage of total
 */
export const calculatePercentage = (part, total) => {
  if (total === 0) {
    return 0;
  }
  return (part / total) * 100;
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return `₹${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Format number with decimals
 */
export const formatNumber = (number, decimals = 2) => {
  return number.toFixed(decimals);
};

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
  const growthRates = months.map((month, i) => {
    if (i === 0) {
      return 0;
    }
    return calculateGrowthRate(
      byMonth[month].total,
      byMonth[months[i - 1]].total
    );
  });

  const avgGrowth =
    growthRates.length > 1
      ? growthRates.slice(1).reduce((a, b) => a + b, 0) /
        (growthRates.length - 1)
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
 * 4. Detect Recurring Transactions
 * Find recurring patterns (subscriptions, salaries, etc.)
 */
export const detectRecurringTransactions = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const patterns = {};

  transactions.forEach((t) => {
    // Group by category and rounded amount
    const key = `${t.category || "Unknown"}-${t.type}-${Math.round(Math.abs(t.amount || 0))}`;
    if (!patterns[key]) {
      patterns[key] = {
        category: t.category,
        type: t.type,
        amount: Math.abs(t.amount || 0),
        dates: [],
      };
    }
    if (t.date) {
      patterns[key].dates.push(new Date(t.date));
    }
  });

  return Object.entries(patterns)
    .filter(([_, data]) => data.dates.length >= 3) // At least 3 occurrences
    .map(([key, data]) => {
      const dates = data.dates.sort((a, b) => a - b);
      const intervals = [];

      for (let i = 1; i < dates.length; i++) {
        intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
      }

      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const lastDate = dates[dates.length - 1];
      const nextExpected = new Date(
        lastDate.getTime() + avgInterval * 24 * 60 * 60 * 1000
      );

      return {
        category: data.category,
        type: data.type,
        amount: data.amount,
        frequency: avgInterval,
        count: dates.length,
        isMonthly: avgInterval >= 28 && avgInterval <= 32,
        isWeekly: avgInterval >= 6 && avgInterval <= 8,
        isBiWeekly: avgInterval >= 13 && avgInterval <= 15,
        nextExpected,
        lastOccurrence: lastDate,
        pattern: key,
      };
    })
    .sort((a, b) => b.amount - a.amount);
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

  const byDay = Array(31)
    .fill(0)
    .map(() => ({ total: 0, count: 0 }));

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
      const midPoint = new Date(
        (dateRange.minDate.getTime() + dateRange.maxDate.getTime()) / 2
      );

      const firstHalf = filterByDateRange(
        catTransactions,
        dateRange.minDate,
        midPoint
      );
      const secondHalf = filterByDateRange(
        catTransactions,
        midPoint,
        dateRange.maxDate
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
