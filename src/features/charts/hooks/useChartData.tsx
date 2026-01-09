import { useMemo } from "react";
import type { Transaction } from "../../../types";

/**
 * Custom hook to generate chart data from filtered transaction data
 * @param {Array} filteredData - Array of filtered transaction objects
 * @param {Object} kpiData - Object containing income and expense totals
 * @param {string} drilldownCategory - Selected category for subcategory breakdown
 * @returns {Object} Object containing all chart data configurations
 */

export const useChartData = (
  filteredData: Transaction[],
  kpiData: { income: number; expense: number },
  drilldownCategory: string
) => {
  const toDate = (value: unknown): Date | null => {
    if (!value) {
      return null;
    }
    const date = new Date(value as any);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  };

  const doughnutChartData = useMemo(
    () => ({
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [kpiData.income, kpiData.expense],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderColor: "#1f2937",
          borderWidth: 4,
        },
      ],
    }),
    [kpiData]
  );

  const barChartData = useMemo(() => {
    const expenses = filteredData
      .filter((d) => d.type === "Expense")
      .reduce<Record<string, number>>((acc, item) => {
        const key = String(item.category ?? "Uncategorized");
        acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
        return acc;
      }, {});
    const sorted = Object.entries(expenses)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    return {
      labels: sorted.map(([c]) => c),
      datasets: [
        {
          label: "Expenses",
          data: sorted.map(([, a]) => a),
          backgroundColor: "#3b82f6",
          borderRadius: 8,
        },
      ],
    };
  }, [filteredData]);

  const incomeSourcesChartData = useMemo(() => {
    const incomes = filteredData
      .filter((d) => d.type === "Income" && d.category !== "In-pocket")
      .reduce<Record<string, number>>((acc, item) => {
        const key = String(item.category ?? "Uncategorized");
        acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
        return acc;
      }, {});
    const sorted = Object.entries(incomes).sort(([, a], [, b]) => b - a);
    return {
      labels: sorted.map(([c]) => c),
      datasets: [
        {
          label: "Income",
          data: sorted.map(([, a]) => a),
          backgroundColor: "#10b981",
          borderRadius: 8,
        },
      ],
    };
  }, [filteredData]);

  const spendingByAccountChartData = useMemo(() => {
    // Only include actual expenses, not internal transfers between your own accounts
    const spending = filteredData
      .filter((d) => d.type === "Expense")
      .reduce<Record<string, number>>((acc, item) => {
        const key = String(item.account ?? "Unknown");
        acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
        return acc;
      }, {});
    const sorted = Object.entries(spending).sort(([, a], [, b]) => b - a);
    return {
      labels: sorted.map(([acc]) => acc),
      datasets: [
        {
          data: sorted.map(([, a]) => a),
          backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#eab308", "#6b7280"],
          borderColor: "#1f2937",
          borderWidth: 4,
        },
      ],
    };
  }, [filteredData]);

  const lineChartData = useMemo(() => {
    const monthly = filteredData.reduce<Record<string, { income: number; expense: number }>>(
      (acc, item) => {
        if (item.category === "In-pocket") {
          return acc;
        }
        const date = toDate(item.date);
        if (!date) {
          return acc;
        }
        const month = date.toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { income: 0, expense: 0 };
        }
        if (item.type === "Income") {
          acc[month].income += Number(item.amount) || 0;
        } else if (item.type === "Expense") {
          acc[month].expense += Number(item.amount) || 0;
        }
        return acc;
      },
      {}
    );
    const sortedMonths = Object.keys(monthly).sort((a, b) => a.localeCompare(b));

    // Convert YYYY-MM format to readable month labels
    const formatMonthLabel = (monthString: string) => {
      const [year, month] = monthString.split("-");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[Number.parseInt(month, 10) - 1]} ${year}`;
    };

    return {
      labels: sortedMonths.map(formatMonthLabel),
      datasets: [
        {
          label: "Income",
          data: sortedMonths.map((m) => monthly[m].income),
          borderColor: "#22c55e",
          backgroundColor: "#22c55e",
          tension: 0.3,
          fill: false,
        },
        {
          label: "Expense",
          data: sortedMonths.map((m) => monthly[m].expense),
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          tension: 0.3,
          fill: false,
        },
      ],
    };
  }, [filteredData, toDate]);

  const spendingByDayData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const spending = new Array(7).fill(0);
    filteredData.forEach((item) => {
      if (item.type === "Expense") {
        const date = toDate(item.date);
        if (!date) {
          return;
        }
        spending[date.getDay()] += Number(item.amount) || 0;
      }
    });
    return {
      labels: days,
      datasets: [
        {
          label: "Spending",
          data: spending,
          backgroundColor: "#8b5cf6",
          borderRadius: 8,
        },
      ],
    };
  }, [filteredData, toDate]);

  const subcategoryBreakdownData = useMemo(() => {
    if (!drilldownCategory) {
      return { labels: [], datasets: [] };
    }
    const spending = filteredData
      .filter((item) => item.type === "Expense" && item.category === drilldownCategory)
      .reduce<Record<string, number>>((acc, item) => {
        const sub = String(item.subcategory ?? "Uncategorized");
        acc[sub] = (acc[sub] || 0) + (Number(item.amount) || 0);
        return acc;
      }, {});
    const sorted = Object.entries(spending).sort(([, a], [, b]) => b - a);
    return {
      labels: sorted.map(([s]) => s),
      datasets: [
        {
          label: "Spending",
          data: sorted.map(([, a]) => a),
          backgroundColor: "#ec4899",
          borderRadius: 8,
        },
      ],
    };
  }, [filteredData, drilldownCategory]);

  return {
    doughnutChartData,
    barChartData,
    incomeSourcesChartData,
    spendingByAccountChartData,
    lineChartData,
    spendingByDayData,
    subcategoryBreakdownData,
  };
};
