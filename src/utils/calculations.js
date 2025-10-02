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

  const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
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
