/* eslint-disable max-lines-per-function */
/**
 * Trend Insights Generator
 * Automatically detects patterns and generates actionable insights
 */

import { getMonthKey } from "./dataUtils";
import { detectSeasonality, detectOutliers } from "./forecastUtils";

/**
 * Analyze spending patterns by day of week
 * @param {Array} transactions - Transaction data
 * @returns {Object} Day of week analysis
 */
export const analyzeDayOfWeekPatterns = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const expenses = transactions.filter(
    (t) => t.type === "Expense" && t.category !== "In-pocket"
  );

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayData = dayNames.map(() => ({ total: 0, count: 0 }));

  expenses.forEach((t) => {
    const dayOfWeek = new Date(t.date).getDay();
    dayData[dayOfWeek].total += Math.abs(t.amount || 0);
    dayData[dayOfWeek].count += 1;
  });

  const totalSpending = dayData.reduce((sum, d) => sum + d.total, 0);
  const avgDaily = totalSpending / 7;

  const insights = [];

  // Find highest spending day
  const maxDay = dayData.reduce(
    (max, d, i) => (d.total > dayData[max].total ? i : max),
    0
  );
  const maxDayPercent = ((dayData[maxDay].total / totalSpending) * 100).toFixed(
    0
  );

  if (dayData[maxDay].total > avgDaily * 1.5) {
    insights.push({
      type: "pattern",
      priority: "medium",
      title: `${dayNames[maxDay]} is Your Peak Spending Day`,
      message: `You spend ${maxDayPercent}% more on ${dayNames[maxDay]}s compared to average (₹${dayData[maxDay].total.toLocaleString()})`,
      action: "Consider meal prepping or avoiding shopping on this day",
    });
  }

  // Weekend vs Weekday comparison
  const weekendTotal = dayData[0].total + dayData[6].total;
  const weekdayTotal = dayData.slice(1, 6).reduce((sum, d) => sum + d.total, 0);
  const weekendAvg = weekendTotal / 2;
  const weekdayAvg = weekdayTotal / 5;

  if (weekendAvg > weekdayAvg * 1.3) {
    const difference = ((weekendAvg / weekdayAvg - 1) * 100).toFixed(0);
    insights.push({
      type: "pattern",
      priority: "high",
      title: "Weekend Spending Spike Detected",
      message: `Weekend spending is ${difference}% higher than weekdays (₹${weekendAvg.toLocaleString()} vs ₹${weekdayAvg.toLocaleString()})`,
      action: "Plan weekend budgets or activities to control spending",
    });
  }

  return {
    dayData: dayData.map((d, i) => ({
      day: dayNames[i],
      total: d.total,
      count: d.count,
      average: d.count > 0 ? d.total / d.count : 0,
    })),
    insights,
    weekendAvg,
    weekdayAvg,
  };
};

/**
 * Detect spending anomalies
 * @param {Array} transactions - Transaction data
 * @returns {Array} Anomaly insights
 */
export const detectSpendingAnomalies = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const insights = [];
  const expenses = transactions.filter(
    (t) => t.type === "Expense" && t.category !== "In-pocket"
  );

  // Group by month
  const monthlyData = {};
  expenses.forEach((t) => {
    const month = getMonthKey(t.date);
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, byCategory: {} };
    }
    monthlyData[month].total += Math.abs(t.amount || 0);

    if (!monthlyData[month].byCategory[t.category]) {
      monthlyData[month].byCategory[t.category] = 0;
    }
    monthlyData[month].byCategory[t.category] += Math.abs(t.amount || 0);
  });

  const months = Object.keys(monthlyData).sort();
  if (months.length < 3) {
    return insights;
  }

  // Check overall spending anomalies
  const monthlyTotals = months.map((m) => monthlyData[m].total);
  const { outliers } = detectOutliers(monthlyTotals);

  outliers.forEach(({ index }) => {
    const month = months[index];
    const amount = monthlyData[month].total;
    const avg = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
    const percentDiff = (((amount - avg) / avg) * 100).toFixed(0);

    const monthDate = new Date(month + "-01");
    const monthName = monthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (amount > avg) {
      insights.push({
        type: "anomaly",
        priority: "high",
        title: `Unusual Spending in ${monthName}`,
        message: `Spending was ${percentDiff}% higher than average (₹${amount.toLocaleString()} vs ₹${avg.toLocaleString()})`,
        action: "Review large expenses in this month",
      });
    }
  });

  // Check category-level anomalies in recent months
  const recentMonths = months.slice(-3);
  const allCategories = new Set();
  expenses.forEach((t) => allCategories.add(t.category));

  allCategories.forEach((category) => {
    const categoryData = months.map(
      (m) => monthlyData[m].byCategory[category] || 0
    );
    const recentAvg =
      recentMonths.reduce(
        (sum, m) => sum + (monthlyData[m].byCategory[category] || 0),
        0
      ) / recentMonths.length;
    const historicalAvg =
      categoryData.reduce((a, b) => a + b, 0) / categoryData.length;

    if (
      recentAvg > historicalAvg * 1.4 &&
      recentAvg > 1000 &&
      categoryData.length >= 3
    ) {
      const increase = (
        ((recentAvg - historicalAvg) / historicalAvg) *
        100
      ).toFixed(0);
      insights.push({
        type: "trend",
        priority: "medium",
        title: `${category} Spending Trending Up`,
        message: `Last 3 months average is ${increase}% higher (₹${recentAvg.toLocaleString()} vs ₹${historicalAvg.toLocaleString()})`,
        action: `Review ${category} expenses and identify unnecessary costs`,
      });
    }
  });

  return insights;
};

/**
 * Analyze seasonal patterns and generate insights
 * @param {Array} transactions - Transaction data
 * @returns {Object} Seasonal analysis
 */
export const analyzeSeasonalPatterns = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const insights = [];
  const expenses = transactions.filter(
    (t) => t.type === "Expense" && t.category !== "In-pocket"
  );

  // Group by month
  const monthlyData = {};
  expenses.forEach((t) => {
    const month = getMonthKey(t.date);
    monthlyData[month] = (monthlyData[month] || 0) + Math.abs(t.amount || 0);
  });

  const seasonalAnalysis = detectSeasonality(monthlyData);

  if (seasonalAnalysis.hasSeasonality) {
    // Find peak months
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const peakMonths = Object.entries(seasonalAnalysis.indices)
      .filter(([, index]) => index > 1.2)
      .map(([month, index]) => ({
        month: monthNames[parseInt(month, 10) - 1],
        index,
        percent: ((index - 1) * 100).toFixed(0),
      }))
      .sort((a, b) => b.index - a.index);

    if (peakMonths.length > 0) {
      const topPeak = peakMonths[0];
      insights.push({
        type: "seasonal",
        priority: "high",
        title: `${topPeak.month} is Historically High Spending`,
        message: `Spending is typically ${topPeak.percent}% above average in ${topPeak.month}`,
        action: `Budget ₹${(seasonalAnalysis.overallAverage * topPeak.index).toLocaleString()} for ${topPeak.month}`,
      });
    }

    // Find low months (savings opportunities)
    const lowMonths = Object.entries(seasonalAnalysis.indices)
      .filter(([, index]) => index < 0.8)
      .map(([month, index]) => ({
        month: monthNames[parseInt(month, 10) - 1],
        index,
        percent: ((1 - index) * 100).toFixed(0),
      }))
      .sort((a, b) => a.index - b.index);

    if (lowMonths.length > 0) {
      const topLow = lowMonths[0];
      insights.push({
        type: "seasonal",
        priority: "low",
        title: `${topLow.month} Shows Lower Spending`,
        message: `Historically ${topLow.percent}% below average - good for savings`,
        action: "Consider extra savings or debt payments in this month",
      });
    }
  }

  return {
    ...seasonalAnalysis,
    insights,
  };
};

/**
 * Generate budget forecast alerts
 * @param {Array} transactions - Transaction data
 * @param {Object} budgets - User budgets by category
 * @returns {Array} Budget forecast alerts
 */
export const generateBudgetForecastAlerts = (transactions, budgets) => {
  if (
    !transactions ||
    transactions.length === 0 ||
    !budgets ||
    Object.keys(budgets).length === 0
  ) {
    return [];
  }

  const insights = [];
  const currentMonth = getMonthKey(new Date());
  const currentMonthExpenses = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      t.category !== "In-pocket" &&
      getMonthKey(t.date) === currentMonth
  );

  // Group current month by category
  const categorySpending = {};
  currentMonthExpenses.forEach((t) => {
    categorySpending[t.category] =
      (categorySpending[t.category] || 0) + Math.abs(t.amount || 0);
  });

  // Get current day of month
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const daysRemaining = daysInMonth - currentDay;
  const monthProgress = currentDay / daysInMonth;

  Object.entries(budgets).forEach(([category, budget]) => {
    const spent = categorySpending[category] || 0;
    const remaining = budget - spent;
    const projectedSpending = monthProgress > 0 ? spent / monthProgress : spent;
    const projectedOverrun = projectedSpending - budget;

    if (projectedOverrun > 0 && daysRemaining > 0) {
      const overrunPercent = ((projectedOverrun / budget) * 100).toFixed(0);
      insights.push({
        type: "budget-alert",
        priority: "high",
        title: `${category} Budget at Risk`,
        message: `On track to exceed budget by ₹${projectedOverrun.toLocaleString()} (${overrunPercent}%)`,
        action: `Reduce daily spending to ₹${(remaining / daysRemaining).toLocaleString()} or less`,
      });
    } else if (spent > budget * 0.8 && spent < budget) {
      insights.push({
        type: "budget-warning",
        priority: "medium",
        title: `${category} Budget 80% Used`,
        message: `₹${remaining.toLocaleString()} remaining for ${daysRemaining} days`,
        action: `Limit to ₹${(remaining / daysRemaining).toLocaleString()}/day`,
      });
    }
  });

  return insights;
};

/**
 * Comprehensive insights generation
 * @param {Array} transactions - All transactions
 * @param {Object} budgets - User budgets
 * @returns {Object} All insights categorized
 */
export const generateComprehensiveInsights = (transactions, budgets = {}) => {
  const dayPatterns = analyzeDayOfWeekPatterns(transactions);
  const anomalies = detectSpendingAnomalies(transactions);
  const seasonal = analyzeSeasonalPatterns(transactions);
  const budgetAlerts = generateBudgetForecastAlerts(transactions, budgets);

  // Combine all insights
  const allInsights = [
    ...(dayPatterns?.insights || []),
    ...anomalies,
    ...(seasonal?.insights || []),
    ...budgetAlerts,
  ];

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  allInsights.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    all: allInsights,
    byType: {
      pattern: allInsights.filter((i) => i.type === "pattern"),
      anomaly: allInsights.filter((i) => i.type === "anomaly"),
      trend: allInsights.filter((i) => i.type === "trend"),
      seasonal: allInsights.filter((i) => i.type === "seasonal"),
      budgetAlert: allInsights.filter(
        (i) => i.type === "budget-alert" || i.type === "budget-warning"
      ),
    },
    byPriority: {
      high: allInsights.filter((i) => i.priority === "high"),
      medium: allInsights.filter((i) => i.priority === "medium"),
      low: allInsights.filter((i) => i.priority === "low"),
    },
    dayPatterns,
    seasonal,
  };
};
