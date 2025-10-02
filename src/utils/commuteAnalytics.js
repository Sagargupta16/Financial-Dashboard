/**
 * Commute Analytics Utilities
 * Analysis for transportation and daily commute spending
 */

import {
  calculateDateRange,
  calculateDailyAverage,
  calculateMonthlyAverage,
  calculatePerDayFrequency,
  calculatePerMonthFrequency,
} from "./calculations";

/**
 * Analyze commute spending
 */
export const analyzeCommuteSpending = (transactions) => {
  const commuteTransactions = transactions.filter(
    (t) =>
      (t.category === "Transportation" ||
        t.subcategory === "Daily Commute (Cabs, Bikes etc)") &&
      t.type === "Expense"
  );

  const breakdown = {
    total: 0,
    count: 0,
    averagePerRide: 0,
    transactions: commuteTransactions,
  };

  commuteTransactions.forEach((transaction) => {
    const amount = Math.abs(parseFloat(transaction.amount) || 0);
    breakdown.total += amount;
    breakdown.count += 1;
  });

  breakdown.averagePerRide =
    breakdown.count > 0 ? breakdown.total / breakdown.count : 0;

  // Calculate date range
  breakdown.dateRange = calculateDateRange(commuteTransactions);

  return breakdown;
};

/**
 * Calculate monthly commute projection
 */
export const calculateMonthlyCommuteProjection = (commuteData) => {
  const days = commuteData.dateRange?.days || 1;

  const ridesPerDay = calculatePerDayFrequency(commuteData.count, days);
  const costPerDay = calculateDailyAverage(commuteData.total, days);

  const monthlyProjection = {
    ridesPerMonth: calculatePerMonthFrequency(commuteData.count, days),
    costPerMonth: calculateMonthlyAverage(commuteData.total, days),
    costPerDay,
    ridesPerDay,
  };

  return monthlyProjection;
};

/**
 * Calculate alternative commute options
 */
export const calculateCommuteAlternatives = (commuteData) => {
  const monthlySpending = (commuteData.total / 30) * 30; // Normalize to 30 days

  const alternatives = [
    {
      name: "Monthly Metro Pass",
      cost: 2000,
      savings: monthlySpending - 2000,
      description: "Unlimited metro rides",
      recommended: monthlySpending > 2500,
    },
    {
      name: "Bike Rental (Monthly)",
      cost: 1500,
      savings: monthlySpending - 1500,
      description: "Own bike for daily commute",
      recommended: monthlySpending > 2000,
    },
    {
      name: "Carpool/Share Rides",
      cost: monthlySpending * 0.6,
      savings: monthlySpending * 0.4,
      description: "Share rides with colleagues",
      recommended: monthlySpending > 3000,
    },
    {
      name: "Work From Home (2 days/week)",
      cost: monthlySpending * 0.7,
      savings: monthlySpending * 0.3,
      description: "Reduce commute frequency",
      recommended: true,
    },
  ];

  return alternatives
    .filter((alt) => alt.savings > 0)
    .sort((a, b) => b.savings - a.savings);
};

/**
 * Analyze time-based commute patterns
 */
export const analyzeCommutePatterns = (transactions) => {
  const morningRides = [];
  const eveningRides = [];
  const otherRides = [];

  transactions.forEach((transaction) => {
    const note = transaction.note || "";
    const amount = Math.abs(parseFloat(transaction.amount) || 0);

    if (note.toLowerCase().includes("flat to office")) {
      morningRides.push({ transaction, amount });
    } else if (note.toLowerCase().includes("office to flat")) {
      eveningRides.push({ transaction, amount });
    } else {
      otherRides.push({ transaction, amount });
    }
  });

  const morningTotal = morningRides.reduce((sum, r) => sum + r.amount, 0);
  const eveningTotal = eveningRides.reduce((sum, r) => sum + r.amount, 0);
  const otherTotal = otherRides.reduce((sum, r) => sum + r.amount, 0);

  return {
    morning: {
      rides: morningRides,
      count: morningRides.length,
      total: morningTotal,
      average: morningRides.length > 0 ? morningTotal / morningRides.length : 0,
    },
    evening: {
      rides: eveningRides,
      count: eveningRides.length,
      total: eveningTotal,
      average: eveningRides.length > 0 ? eveningTotal / eveningRides.length : 0,
    },
    other: {
      rides: otherRides,
      count: otherRides.length,
      total: otherTotal,
      average: otherRides.length > 0 ? otherTotal / otherRides.length : 0,
    },
  };
};
