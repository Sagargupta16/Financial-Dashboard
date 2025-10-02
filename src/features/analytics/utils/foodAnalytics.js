/**
 * Food Analytics Utilities
 * Specialized analysis for food and dining transactions
 */

import {
  calculateDateRange,
  calculateDailyAverage,
  calculatePerDayFrequency,
  calculatePerWeekFrequency,
  calculatePerMonthFrequency,
  calculateSavingsPotential,
} from "../../../shared/utils/calculations";

/**
 * Food subcategories based on actual data
 */
export const FOOD_SUBCATEGORIES = {
  OFFICE_CAFETERIA: "Office Cafeteria",
  DELIVERY_APPS: "Delivery Apps (Zomoto, Swiggy etc)",
  GROCERIES: "Groceries",
  SNACKS: "Snacks & Beverages",
  DINING_OUT: "Dinning Out/Restaurants",
  PARTIES: "Parties & Treats",
};

/**
 * Analyze food spending by subcategory
 */
export const analyzeFoodSpending = (transactions) => {
  const foodCategory = "Food & Dining";
  const foodTransactions = transactions.filter(
    (t) => t.category === foodCategory && t.type === "Expense"
  );

  const breakdown = {
    officeCafeteria: { transactions: [], total: 0, count: 0 },
    deliveryApps: { transactions: [], total: 0, count: 0 },
    groceries: { transactions: [], total: 0, count: 0 },
    snacks: { transactions: [], total: 0, count: 0 },
    diningOut: { transactions: [], total: 0, count: 0 },
    parties: { transactions: [], total: 0, count: 0 },
    other: { transactions: [], total: 0, count: 0 },
  };

  foodTransactions.forEach((transaction) => {
    const amount = Math.abs(parseFloat(transaction.amount) || 0);
    const subcategory = transaction.subcategory || "";

    if (subcategory.includes("Office Cafeteria")) {
      breakdown.officeCafeteria.transactions.push(transaction);
      breakdown.officeCafeteria.total += amount;
      breakdown.officeCafeteria.count += 1;
    } else if (subcategory.includes("Delivery Apps")) {
      breakdown.deliveryApps.transactions.push(transaction);
      breakdown.deliveryApps.total += amount;
      breakdown.deliveryApps.count += 1;
    } else if (subcategory.includes("Groceries")) {
      breakdown.groceries.transactions.push(transaction);
      breakdown.groceries.total += amount;
      breakdown.groceries.count += 1;
    } else if (subcategory.includes("Snacks")) {
      breakdown.snacks.transactions.push(transaction);
      breakdown.snacks.total += amount;
      breakdown.snacks.count += 1;
    } else if (
      subcategory.includes("Dinning Out") ||
      subcategory.includes("Restaurants")
    ) {
      breakdown.diningOut.transactions.push(transaction);
      breakdown.diningOut.total += amount;
      breakdown.diningOut.count += 1;
    } else if (subcategory.includes("Parties")) {
      breakdown.parties.transactions.push(transaction);
      breakdown.parties.total += amount;
      breakdown.parties.count += 1;
    } else {
      breakdown.other.transactions.push(transaction);
      breakdown.other.total += amount;
      breakdown.other.count += 1;
    }
  });

  const totalSpent = Object.values(breakdown).reduce(
    (sum, cat) => sum + cat.total,
    0
  );
  const totalCount = Object.values(breakdown).reduce(
    (sum, cat) => sum + cat.count,
    0
  );

  // Calculate date range from all food transactions
  const allFoodTransactions = Object.values(breakdown).flatMap(
    (cat) => cat.transactions
  );
  const dateRange = calculateDateRange(allFoodTransactions);

  return {
    breakdown,
    totalSpent,
    totalCount,
    dateRange,
    averagePerTransaction: totalCount > 0 ? totalSpent / totalCount : 0,
  };
};

/**
 * Calculate daily food spending average
 */
export const calculateDailyFoodAverage = (breakdown, dateRange) => {
  const days = dateRange?.days || 1;

  const dailyBreakdown = {
    officeCafeteria: calculateDailyAverage(
      breakdown.officeCafeteria.total,
      days
    ),
    deliveryApps: calculateDailyAverage(breakdown.deliveryApps.total, days),
    groceries: calculateDailyAverage(breakdown.groceries.total, days),
    snacks: calculateDailyAverage(breakdown.snacks.total, days),
    diningOut: calculateDailyAverage(breakdown.diningOut.total, days),
    parties: calculateDailyAverage(breakdown.parties.total, days),
  };

  return dailyBreakdown;
};

/**
 * Calculate food savings potential
 */
export const calculateFoodSavingsPotential = (breakdown, dateRange) => {
  const days = dateRange?.days || 1;

  const scenarios = [
    {
      name: "Reduce Delivery by 30%",
      category: "deliveryApps",
      reduction: 0.3,
      ...calculateSavingsPotential(breakdown.deliveryApps.total, days, 0.3),
    },
    {
      name: "Reduce Office Cafeteria by 20%",
      category: "officeCafeteria",
      reduction: 0.2,
      ...calculateSavingsPotential(breakdown.officeCafeteria.total, days, 0.2),
    },
    {
      name: "Cook at Home (Reduce Dining Out 50%)",
      category: "diningOut",
      reduction: 0.5,
      ...calculateSavingsPotential(breakdown.diningOut.total, days, 0.5),
    },
    {
      name: "Pack Lunch (Reduce Cafeteria 40%)",
      category: "officeCafeteria",
      reduction: 0.4,
      ...calculateSavingsPotential(breakdown.officeCafeteria.total, days, 0.4),
    },
  ];

  return scenarios.sort((a, b) => b.monthlySavings - a.monthlySavings);
};

/**
 * Get food frequency insights
 */
export const getFoodFrequencyInsights = (breakdown, dateRange) => {
  const insights = [];
  const days = dateRange?.days || 1;

  // Office cafeteria frequency
  if (breakdown.officeCafeteria.count > 0) {
    const perDay = calculatePerDayFrequency(
      breakdown.officeCafeteria.count,
      days
    );
    insights.push({
      category: "Office Cafeteria",
      frequency: perDay.toFixed(2),
      description: `You visit the office cafeteria ${perDay.toFixed(2)} times per day`,
      icon: "🍽️",
    });
  }

  // Delivery frequency
  if (breakdown.deliveryApps.count > 0) {
    const perWeek = calculatePerWeekFrequency(
      breakdown.deliveryApps.count,
      days
    );
    insights.push({
      category: "Delivery Apps",
      frequency: perWeek.toFixed(1),
      description: `You order food delivery ${perWeek.toFixed(1)} times per week`,
      icon: "🛵",
    });
  }

  // Dining out frequency
  if (breakdown.diningOut.count > 0) {
    const perMonth = calculatePerMonthFrequency(
      breakdown.diningOut.count,
      days
    );
    insights.push({
      category: "Dining Out",
      frequency: perMonth.toFixed(0),
      description: `You eat at restaurants ${perMonth.toFixed(0)} times per month`,
      icon: "🍴",
    });
  }

  return insights;
};

/**
 * Compare home cooking vs eating out
 */
export const compareHomeCookingVsEatingOut = (breakdown) => {
  const homeCooking = breakdown.groceries.total;
  const eatingOut =
    breakdown.deliveryApps.total +
    breakdown.diningOut.total +
    breakdown.parties.total;

  const total = homeCooking + eatingOut;
  const homeCookingPercent = total > 0 ? (homeCooking / total) * 100 : 0;
  const eatingOutPercent = total > 0 ? (eatingOut / total) * 100 : 0;

  return {
    homeCooking,
    eatingOut,
    homeCookingPercent,
    eatingOutPercent,
    balance: homeCookingPercent >= 40 ? "good" : "needs_improvement",
    recommendation:
      homeCookingPercent < 40
        ? "Consider cooking at home more to save money"
        : "Good balance between home cooking and eating out",
  };
};
