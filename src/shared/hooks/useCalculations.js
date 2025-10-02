import { useMemo } from "react";
import { calculateDateRange } from "../utils/calculations";

export const useKPIData = (filteredData) => {
  return useMemo(() => {
    // Validate input
    if (!filteredData || filteredData.length === 0) {
      return {
        kpiData: { income: 0, expense: 0 },
        additionalKpiData: {
          highestExpense: 0,
          averageExpense: 0,
          totalTransactions: 0,
          transferData: { transferIn: 0, transferOut: 0 },
        },
      };
    }

    const kpiData = filteredData.reduce(
      (acc, item) => {
        // Validate amount is a number
        const amount = Number(item.amount) || 0;

        // Only count actual income and expenses, not transfers between accounts
        if (item.type === "Income") {
          acc.income += Math.abs(amount);
        } else if (item.type === "Expense") {
          acc.expense += Math.abs(amount);
        }
        // Note: Transfer-In and Transfer-Out are excluded from income/expense totals
        // as they represent money movement, not wealth creation/destruction

        return acc;
      },
      { income: 0, expense: 0 }
    );

    const expenseTransactions = filteredData.filter(
      (item) => item.type === "Expense"
    );

    // Calculate transfer metrics separately
    const transferData = filteredData.reduce(
      (acc, item) => {
        const amount = Math.abs(Number(item.amount) || 0);

        if (item.type === "Transfer-In") {
          acc.transferIn += amount;
        } else if (item.type === "Transfer-Out") {
          acc.transferOut += amount;
        }
        return acc;
      },
      { transferIn: 0, transferOut: 0 }
    );

    const additionalKpiData = {
      highestExpense: Math.max(
        0,
        ...expenseTransactions.map((item) => Math.abs(Number(item.amount) || 0))
      ),
      averageExpense:
        expenseTransactions.length > 0
          ? kpiData.expense / expenseTransactions.length
          : 0,
      totalTransactions: filteredData.length,
      transferData, // Add transfer data for display
    };

    return { kpiData, additionalKpiData };
  }, [filteredData]);
};

export const useKeyInsights = (filteredData, kpiData, additionalKpiData) => {
  return useMemo(() => {
    // Validate input
    if (!filteredData || filteredData.length === 0) {
      return {
        busiestDay: "N/A",
        mostFrequentCategory: "N/A",
        avgTransactionValue: 0,
      };
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const daySpending = Array(7).fill(0);
    const categoryCounts = {};

    filteredData.forEach((item) => {
      if (item.type === "Expense") {
        const amount = Math.abs(Number(item.amount) || 0);

        if (item.date) {
          const dayIndex = item.date.getDay();
          if (dayIndex >= 0 && dayIndex < 7) {
            daySpending[dayIndex] += amount;
          }
        }
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + 1;
      }
    });

    const maxSpending = Math.max(...daySpending);
    const busiestDay =
      maxSpending > 0 ? days[daySpending.indexOf(maxSpending)] : "N/A";
    const mostFrequentCategory =
      Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "N/A";

    // Calculate more meaningful averages - absolute value of all transactions
    const totalAbsoluteValue = filteredData.reduce(
      (sum, t) => sum + Math.abs(t.amount || 0),
      0
    );
    const avgTransactionValue =
      additionalKpiData.totalTransactions > 0
        ? totalAbsoluteValue / additionalKpiData.totalTransactions
        : 0;

    return { busiestDay, mostFrequentCategory, avgTransactionValue };
  }, [filteredData, additionalKpiData]);
};

export const useAccountBalances = (data) => {
  return useMemo(() => {
    // Validate input
    if (!data || data.length === 0) {
      return [];
    }

    const balances = data.reduce((acc, { account, type, amount }) => {
      if (!account) {
        return acc;
      }
      if (!acc[account]) {
        acc[account] = 0;
      }

      const validAmount = Math.abs(Number(amount) || 0);

      // Handle all transaction types - transfers show movement between accounts
      // This gives a clear picture of where money is currently located
      if (type === "Income" || type === "Transfer-In") {
        acc[account] += validAmount;
      } else if (type === "Expense" || type === "Transfer-Out") {
        acc[account] -= validAmount;
      }

      return acc;
    }, {});

    return Object.entries(balances)
      .map(([name, balance]) => ({ name, balance }))
      .sort((a, b) => b.balance - a.balance);
  }, [data]);
};

export const useEnhancedKPIData = (filteredData, kpiData) => {
  return useMemo(() => {
    // Validate input
    if (!filteredData || filteredData.length === 0 || !kpiData) {
      return {
        savingsRate: 0,
        dailySpendingRate: 0,
        monthlyBurnRate: 0,
        netWorth: 0,
        netWorthPerMonth: 0,
        spendingVelocity: 100,
        categoryConcentration: null,
        dateRange: { days: 0, months: 0, years: 0 },
      };
    }

    const dateRange = calculateDateRange(filteredData);
    const { income, expense } = kpiData;

    // 1. Savings Rate
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    // 2. Daily Spending Rate
    const dailySpendingRate = dateRange.days > 0 ? expense / dateRange.days : 0;

    // 3. Monthly Burn Rate
    const monthlyBurnRate =
      dateRange.days > 0 ? (expense / dateRange.days) * 30.44 : 0;

    // 4. Net Worth Trend
    const netWorth = income - expense;
    const netWorthPerMonth =
      dateRange.days > 0 ? (netWorth / dateRange.days) * 30.44 : 0;

    // 5. Spending Velocity (Last 30 days vs All time)
    const last30DaysDate = new Date();
    last30DaysDate.setDate(last30DaysDate.getDate() - 30);

    const last30DaysTransactions = filteredData.filter(
      (t) => t.date >= last30DaysDate && t.type === "Expense"
    );
    const spending30d = last30DaysTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    // Calculate actual days in the last period (not always 30)
    const actualDaysInPeriod = Math.min(30, dateRange.days);
    const spendingPerDay30d =
      actualDaysInPeriod > 0 ? spending30d / actualDaysInPeriod : 0;
    const spendingVelocity =
      dailySpendingRate > 0
        ? (spendingPerDay30d / dailySpendingRate) * 100
        : 100;

    // 6. Category Concentration
    const categoryTotals = {};
    filteredData.forEach((t) => {
      if (t.type === "Expense") {
        const amount = Math.abs(Number(t.amount) || 0);
        const category = t.category || "Uncategorized";
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    });

    const topCategory = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    )[0];

    const categoryConcentration =
      topCategory && expense > 0
        ? {
            category: topCategory[0],
            amount: topCategory[1],
            percentage: (topCategory[1] / expense) * 100,
          }
        : null;

    return {
      savingsRate,
      dailySpendingRate,
      monthlyBurnRate,
      netWorth,
      netWorthPerMonth,
      spendingVelocity,
      categoryConcentration,
      dateRange,
    };
  }, [filteredData, kpiData]);
};
