import { useMemo } from "react";

export const useKPIData = (filteredData) => {
  return useMemo(() => {
    const kpiData = filteredData.reduce(
      (acc, item) => {
        // Only count actual income and expenses, not transfers between accounts
        if (item.type === "Income") {acc.income += item.amount;}
        else if (item.type === "Expense") {acc.expense += item.amount;}
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
        if (item.type === "Transfer-In") {
          acc.transferIn += item.amount;
        } else if (item.type === "Transfer-Out") {
          acc.transferOut += item.amount;
        }
        return acc;
      },
      { transferIn: 0, transferOut: 0 }
    );

    const additionalKpiData = {
      highestExpense: Math.max(
        0,
        ...expenseTransactions.map((item) => item.amount)
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
        if (item.date) {daySpending[item.date.getDay()] += item.amount;}
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + 1;
      }
    });

    const busiestDay = days[daySpending.indexOf(Math.max(...daySpending))];
    const mostFrequentCategory =
      Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "N/A";
    const totalValue = kpiData.income + kpiData.expense;
    const avgTransactionValue =
      additionalKpiData.totalTransactions > 0
        ? totalValue / additionalKpiData.totalTransactions
        : 0;

    return { busiestDay, mostFrequentCategory, avgTransactionValue };
  }, [filteredData, kpiData, additionalKpiData]);
};

export const useAccountBalances = (data) => {
  return useMemo(() => {
    const balances = data.reduce((acc, { account, type, amount }) => {
      if (!account) {return acc;}
      if (!acc[account]) {acc[account] = 0;}

      // Handle all transaction types - transfers show movement between accounts
      // This gives a clear picture of where money is currently located
      if (type === "Income" || type === "Transfer-In") {
        acc[account] += amount;
      } else if (type === "Expense" || type === "Transfer-Out") {
        acc[account] -= amount;
      }

      return acc;
    }, {});

    return Object.entries(balances)
      .map(([name, balance]) => ({ name, balance }))
      .sort((a, b) => b.balance - a.balance);
  }, [data]);
};
