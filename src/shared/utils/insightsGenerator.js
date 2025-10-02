/**
 * Smart Insights Generator
 * Generates AI-style personalized financial insights and recommendations
 */

import {
  calculateDateRange,
  calculatePerDayFrequency,
  calculateSavingsPotential,
} from "./calculations";

export const generateSmartInsights = (transactions) => {
  const insights = [];
  const dateRange = calculateDateRange(transactions);

  if (dateRange.days === 0 || transactions.length === 0) {
    return insights;
  }

  // 1. Delivery app spending insight
  const deliveryTransactions = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      (t.subcategory?.includes("Delivery") ||
        t.subcategory?.includes("Swiggy") ||
        t.subcategory?.includes("Zomato") ||
        t.subcategory?.includes("Zomoto"))
  );

  if (deliveryTransactions.length > 0) {
    const total = deliveryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const avgPerOrder = total / deliveryTransactions.length;
    const ordersPerWeek =
      calculatePerDayFrequency(deliveryTransactions.length, dateRange.days) * 7;

    if (ordersPerWeek > 3) {
      const savings = calculateSavingsPotential(total, dateRange.days, 0.3);
      insights.push({
        type: "saving-opportunity",
        priority: "high",
        icon: "💰",
        title: "Delivery App Savings Potential",
        message: `You order food ${ordersPerWeek.toFixed(1)}x/week (avg ₹${avgPerOrder.toFixed(0)}/order). Reducing by 30% could save ₹${savings.monthlySavings.toFixed(0)}/month (₹${savings.yearlySavings.toFixed(0)}/year)`,
        actionable: true,
        category: "Food",
      });
    }
  }

  // 2. Weekend spending pattern
  const weekdaySpending = [];
  const weekendSpending = [];

  transactions.forEach((t) => {
    if (t.type === "Expense" && t.date) {
      const day = t.date.getDay();
      if (day === 0 || day === 6) {
        weekendSpending.push(t.amount);
      } else {
        weekdaySpending.push(t.amount);
      }
    }
  });

  if (weekendSpending.length > 0 && weekdaySpending.length > 0) {
    const avgWeekend =
      weekendSpending.reduce((a, b) => a + b, 0) / weekendSpending.length;
    const avgWeekday =
      weekdaySpending.reduce((a, b) => a + b, 0) / weekdaySpending.length;

    if (avgWeekend > avgWeekday * 1.5) {
      insights.push({
        type: "pattern-detected",
        priority: "medium",
        icon: "📊",
        title: "Weekend Spending Pattern",
        message: `You spend ${((avgWeekend / avgWeekday - 1) * 100).toFixed(0)}% more on weekends (₹${avgWeekend.toFixed(0)}/day) vs weekdays (₹${avgWeekday.toFixed(0)}/day)`,
        actionable: false,
      });
    }
  }

  // 3. Savings achievement
  const expenseTransactions = transactions.filter((t) => t.type === "Expense");
  const incomeTransactions = transactions.filter((t) => t.type === "Income");

  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  if (savingsRate >= 25) {
    insights.push({
      type: "achievement",
      priority: "positive",
      icon: "🎉",
      title: "Excellent Savings Rate!",
      message: `You're saving ${savingsRate.toFixed(1)}% of your income - that's excellent! Keep it up!`,
      actionable: false,
    });
  } else if (savingsRate < 10 && savingsRate > 0) {
    insights.push({
      type: "warning",
      priority: "high",
      icon: "⚠️",
      title: "Low Savings Rate",
      message: `You're only saving ${savingsRate.toFixed(1)}% of income. Aim for at least 20% for financial health.`,
      actionable: true,
    });
  }

  // 4. High-frequency categories
  const categoryCounts = {};
  expenseTransactions.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const topCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (topCategory) {
    const frequency = calculatePerDayFrequency(topCategory[1], dateRange.days);
    if (frequency > 0.5) {
      // More than once every 2 days
      insights.push({
        type: "pattern-detected",
        priority: "low",
        icon: "🔄",
        title: "High-Frequency Category",
        message: `You make ${topCategory[1]} transactions in ${topCategory[0]} (${(frequency * 7).toFixed(1)}x/week on average)`,
        actionable: false,
        category: topCategory[0],
      });
    }
  }

  // 5. Office Cafeteria insight (specific to your data)
  const cafeteriaTransactions = transactions.filter(
    (t) => t.type === "Expense" && t.subcategory?.includes("Office Cafeteria")
  );

  if (cafeteriaTransactions.length > 0) {
    const total = cafeteriaTransactions.reduce((sum, t) => sum + t.amount, 0);
    const perDay = calculatePerDayFrequency(
      cafeteriaTransactions.length,
      dateRange.days
    );
    const avgAmount = total / cafeteriaTransactions.length;

    if (perDay > 0.3) {
      // More than 2-3 times per week
      const packLunchSavings = calculateSavingsPotential(
        total,
        dateRange.days,
        0.5
      );
      insights.push({
        type: "saving-opportunity",
        priority: "medium",
        icon: "🍱",
        title: "Pack Lunch Savings",
        message: `You eat at office cafeteria ${perDay.toFixed(2)}x/day (avg ₹${avgAmount.toFixed(0)}/meal). Packing lunch 50% of the time could save ₹${packLunchSavings.monthlySavings.toFixed(0)}/month`,
        actionable: true,
        category: "Food",
      });
    }
  }

  // 6. Large transaction alert
  const largeTransactions = expenseTransactions.filter((t) => {
    const avgExpense = totalExpense / expenseTransactions.length;
    return t.amount > avgExpense * 3; // 3x above average
  });

  if (largeTransactions.length > 0 && largeTransactions.length < 10) {
    const totalLarge = largeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentOfTotal = (totalLarge / totalExpense) * 100;

    insights.push({
      type: "pattern-detected",
      priority: "low",
      icon: "💳",
      title: "Large Transactions Detected",
      message: `You have ${largeTransactions.length} large transaction${largeTransactions.length > 1 ? "s" : ""} accounting for ${percentOfTotal.toFixed(0)}% of your expenses`,
      actionable: false,
    });
  }

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, positive: 3, low: 4 };
  return insights.sort(
    (a, b) =>
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
  );
};
