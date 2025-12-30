/**
 * Smart Insights Generator
 * Generates AI-style personalized financial insights and recommendations
 */

import {
  calculateDateRange,
  calculatePerDayFrequency,
  calculateSavingsPotential,
} from "../calculations";

// Helper functions to reduce complexity
const analyzeDeliverySpending = (transactions, dateRange) => {
  const deliveryTransactions = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      (t.subcategory?.includes("Delivery") ||
        t.subcategory?.includes("Swiggy") ||
        t.subcategory?.includes("Zomato"))
  );

  if (deliveryTransactions.length === 0) {
    return null;
  }

  const total = deliveryTransactions.reduce((sum, t) => sum + t.amount, 0);
  const avgPerOrder = total / deliveryTransactions.length;
  const totalDays = dateRange.totalDays || 1;
  const ordersPerWeek =
    calculatePerDayFrequency(deliveryTransactions.length, totalDays) * 7;

  if (ordersPerWeek <= 3) {
    return null;
  }

  const savings = calculateSavingsPotential(total, totalDays, 0.3);

  if (!savings || !savings.monthlySavings || !savings.yearlySavings) {
    return null;
  }

  return {
    type: "saving-opportunity",
    priority: "high",
    icon: "💰",
    title: "Delivery App Savings Potential",
    message: `You order food ${ordersPerWeek.toFixed(1)} times per week (avg ₹${avgPerOrder.toFixed(0)} per order). Reducing by 30% could save ₹${savings.monthlySavings.toFixed(0)} per month (₹${savings.yearlySavings.toFixed(0)} per year)`,
    actionable: true,
    category: "Food",
  };
};

const analyzeWeekendPattern = (transactions) => {
  const weekdaySpending = [];
  const weekendSpending = [];
  const weekdayDays = new Set();
  const weekendDays = new Set();

  transactions.forEach((t) => {
    if (t.type === "Expense" && t.date) {
      const amount = Math.abs(Number(t.amount) || 0);
      const day = t.date.getDay();
      const dateKey = t.date.toISOString().split("T")[0]; // "2025-12-30"

      if (day === 0 || day === 6) {
        weekendSpending.push(amount);
        weekendDays.add(dateKey);
      } else {
        weekdaySpending.push(amount);
        weekdayDays.add(dateKey);
      }
    }
  });

  if (weekendDays.size === 0 || weekdayDays.size === 0) {
    return null;
  }

  // Calculate per-DAY average (not per-transaction)
  const totalWeekendSpending = weekendSpending.reduce((a, b) => a + b, 0);
  const totalWeekdaySpending = weekdaySpending.reduce((a, b) => a + b, 0);

  const avgWeekend = totalWeekendSpending / weekendDays.size;
  const avgWeekday = totalWeekdaySpending / weekdayDays.size;

  if (avgWeekend <= avgWeekday * 1.5) {
    return null;
  }

  return {
    type: "pattern-detected",
    priority: "medium",
    icon: "📊",
    title: "Weekend Spending Pattern",
    message: `You spend ${((avgWeekend / avgWeekday - 1) * 100).toFixed(0)}% more on weekends (₹${avgWeekend.toFixed(0)}/day) compared to weekdays (₹${avgWeekday.toFixed(0)}/day)`,
    actionable: false,
  };
};

const analyzeSavingsRate = (expenseTransactions, incomeTransactions) => {
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  if (savingsRate >= 25) {
    return {
      type: "achievement",
      priority: "positive",
      icon: "🎉",
      title: "Excellent Savings Rate!",
      message: `You're saving ${savingsRate.toFixed(1)}% of your income - that's excellent! Keep it up!`,
      actionable: false,
    };
  }

  if (savingsRate < 10 && savingsRate > 0) {
    return {
      type: "warning",
      priority: "high",
      icon: "⚠️",
      title: "Low Savings Rate",
      message: `You're only saving ${savingsRate.toFixed(1)}% of income. Aim for at least 20% for financial health.`,
      actionable: true,
    };
  }

  return null;
};

const analyzeHighFrequencyCategory = (expenseTransactions, dateRange) => {
  const categoryCounts = {};
  expenseTransactions.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const topCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (!topCategory) {
    return null;
  }

  const frequency = calculatePerDayFrequency(
    topCategory[1],
    dateRange.totalDays || 1
  );
  if (frequency <= 0.5) {
    return null;
  }

  return {
    type: "pattern-detected",
    priority: "low",
    icon: "🔄",
    title: "High-Frequency Category",
    message: `You make ${topCategory[1]} transactions in ${topCategory[0]} (${(frequency * 7).toFixed(1)} times per week on average)`,
    actionable: false,
    category: topCategory[0],
  };
};

const analyzeCafeteriaSpending = (transactions, dateRange) => {
  const cafeteriaTransactions = transactions.filter(
    (t) => t.type === "Expense" && t.subcategory?.includes("Office Cafeteria")
  );

  if (cafeteriaTransactions.length === 0) {
    return null;
  }

  const total = cafeteriaTransactions.reduce((sum, t) => sum + t.amount, 0);
  const perDay = calculatePerDayFrequency(
    cafeteriaTransactions.length,
    dateRange.totalDays || 1
  );
  const avgAmount = total / cafeteriaTransactions.length;

  if (perDay <= 0.3) {
    return null;
  }

  const packLunchSavings = calculateSavingsPotential(
    total,
    dateRange.totalDays || 1,
    0.5
  );
  return {
    type: "saving-opportunity",
    priority: "medium",
    icon: "🍱",
    title: "Pack Lunch Savings",
    message: `You eat at the office cafeteria ${perDay.toFixed(1)} times per day (avg ₹${avgAmount.toFixed(0)} per meal). Packing lunch 50% of the time could save ₹${packLunchSavings.monthlySavings.toFixed(0)} per month`,
    actionable: true,
    category: "Food",
  };
};

const analyzeLargeTransactions = (expenseTransactions, totalExpense) => {
  const avgExpense = totalExpense / expenseTransactions.length;
  const largeTransactions = expenseTransactions.filter(
    (t) => t.amount > avgExpense * 3
  );

  if (largeTransactions.length === 0 || largeTransactions.length >= 10) {
    return null;
  }

  const totalLarge = largeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const percentOfTotal = (totalLarge / totalExpense) * 100;

  return {
    type: "pattern-detected",
    priority: "low",
    icon: "💳",
    title: "Large Transactions Detected",
    message: `You have ${largeTransactions.length} large transaction${largeTransactions.length > 1 ? "s" : ""} accounting for ${percentOfTotal.toFixed(0)}% of your expenses`,
    actionable: false,
  };
};

export const generateSmartInsights = (transactions) => {
  const insights = [];
  const dateRange = calculateDateRange(transactions);

  if ((dateRange.totalDays || 0) === 0 || transactions.length === 0) {
    return insights;
  }

  const expenseTransactions = transactions.filter((t) => t.type === "Expense");
  const incomeTransactions = transactions.filter((t) => t.type === "Income");
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Analyze different aspects and collect insights
  const analysisResults = [
    analyzeDeliverySpending(transactions, dateRange),
    analyzeWeekendPattern(transactions),
    analyzeSavingsRate(expenseTransactions, incomeTransactions),
    analyzeHighFrequencyCategory(expenseTransactions, dateRange),
    analyzeCafeteriaSpending(transactions, dateRange),
    analyzeLargeTransactions(expenseTransactions, totalExpense),
  ];

  // Filter out null results and add to insights
  analysisResults.forEach((result) => {
    if (result) {
      insights.push(result);
    }
  });

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, positive: 3, low: 4 };
  return insights.sort(
    (a, b) =>
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
  );
};
