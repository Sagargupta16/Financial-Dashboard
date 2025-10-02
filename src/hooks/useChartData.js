/* eslint-disable */
import { useMemo } from "react";

import { truncateLabel } from "../utils/chartUtils";

export const useChartData = (filteredData, kpiData, drilldownCategory) => {
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
      .reduce((acc, i) => {
        acc[i.category] = (acc[i.category] || 0) + i.amount;
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
      .reduce((acc, i) => {
        acc[i.category] = (acc[i.category] || 0) + i.amount;
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
      .reduce((acc, i) => {
        acc[i.account] = (acc[i.account] || 0) + i.amount;
        return acc;
      }, {});
    const sorted = Object.entries(spending).sort(([, a], [, b]) => b - a);
    return {
      labels: sorted.map(([acc]) => acc),
      datasets: [
        {
          data: sorted.map(([, a]) => a),
          backgroundColor: [
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
            "#f97316",
            "#eab308",
            "#6b7280",
          ],
          borderColor: "#1f2937",
          borderWidth: 4,
        },
      ],
    };
  }, [filteredData]);

  const lineChartData = useMemo(() => {
    const monthly = filteredData.reduce((acc, item) => {
      if (item.category === "In-pocket") {
        return acc;
      }
      const month = item.date.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      if (item.type === "Income") {
        acc[month].income += item.amount;
      } else if (item.type === "Expense") {
        acc[month].expense += item.amount;
      }
      return acc;
    }, {});
    const sortedMonths = Object.keys(monthly).sort();

    // Convert YYYY-MM format to readable month labels
    const formatMonthLabel = (monthString) => {
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
      return `${monthNames[parseInt(month) - 1]} ${year}`;
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
  }, [filteredData]);

  const spendingByDayData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const spending = Array(7).fill(0);
    filteredData.forEach((item) => {
      if (item.type === "Expense" && item.date) {
        spending[item.date.getDay()] += item.amount;
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
  }, [filteredData]);

  const subcategoryBreakdownData = useMemo(() => {
    if (!drilldownCategory) {
      return { labels: [], datasets: [] };
    }
    const spending = filteredData
      .filter((i) => i.type === "Expense" && i.category === drilldownCategory)
      .reduce((acc, i) => {
        const sub = i.subcategory || "Uncategorized";
        acc[sub] = (acc[sub] || 0) + i.amount;
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
