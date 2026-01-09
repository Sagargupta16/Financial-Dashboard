/**
 * Investment Analytics Business Logic
 * Extracted from InvestmentPerformanceTracker component
 */

import type { ChartData, InvestmentTransaction } from "../../types";

/**
 * Monthly P&L aggregation result
 */
export interface MonthlyPnL {
  month: string;
  amount: number;
  cumulative: number;
}

/**
 * Aggregate investment transactions into monthly P&L
 * Calculates net profit/loss per month from dividends and brokerage fees
 */
export const calculateMonthlyPnL = (transactions: InvestmentTransaction[]): MonthlyPnL[] => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Aggregate by month
  const monthlyPnL: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyPnL[month]) {
        monthlyPnL[month] = 0;
      }

      // Add dividends as positive, subtract brokerage as negative
      if (t.type === "Dividend") {
        monthlyPnL[month] += t.amount;
      } else if (t.type === "Brokerage") {
        monthlyPnL[month] -= t.amount;
      }
    }
  });

  // Convert to sorted array with cumulative values
  const sortedMonths = Object.keys(monthlyPnL).sort((a, b) => a.localeCompare(b));

  let cumulative = 0;
  return sortedMonths.map((month) => {
    const amount = monthlyPnL[month];
    cumulative += amount;
    return {
      month,
      amount,
      cumulative,
    };
  });
};

/**
 * Prepare chart data for cumulative P&L visualization
 * Returns chart-ready data structure for react-chartjs-2
 */
export const preparePnLChartData = (transactions: InvestmentTransaction[]): ChartData => {
  const monthlyData = calculateMonthlyPnL(transactions);

  if (monthlyData.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          label: "Cumulative P&L",
          data: [],
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
        },
      ],
    };
  }

  const finalCumulative = monthlyData.at(-1)?.cumulative ?? 0;
  const isProfit = finalCumulative >= 0;

  return {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Cumulative P&L",
        data: monthlyData.map((d) => d.cumulative),
        borderColor: isProfit ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
        backgroundColor: isProfit ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
      },
    ],
  };
};

/**
 * Calculate investment metrics summary
 */
export interface InvestmentMetricsSummary {
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  totalBrokerage: number;
  averageMonthlyReturn: number;
  profitMonths: number;
  lossMonths: number;
}

export const calculateInvestmentMetrics = (
  transactions: InvestmentTransaction[]
): InvestmentMetricsSummary => {
  const monthlyData = calculateMonthlyPnL(transactions);

  const totalProfit = monthlyData.filter((m) => m.amount > 0).reduce((sum, m) => sum + m.amount, 0);

  const totalLoss = Math.abs(
    monthlyData.filter((m) => m.amount < 0).reduce((sum, m) => sum + m.amount, 0)
  );

  const netPnL = totalProfit - totalLoss;

  const totalBrokerage = transactions
    .filter((t) => t.type === "Brokerage")
    .reduce((sum, t) => sum + t.amount, 0);

  const profitMonths = monthlyData.filter((m) => m.amount > 0).length;
  const lossMonths = monthlyData.filter((m) => m.amount < 0).length;

  const averageMonthlyReturn =
    monthlyData.length > 0
      ? monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length
      : 0;

  return {
    totalProfit,
    totalLoss,
    netPnL,
    totalBrokerage,
    averageMonthlyReturn,
    profitMonths,
    lossMonths,
  };
};

/**

 * Calculate return percentage
 */
export const calculateReturnPercentage = (invested: number, currentValue: number): number => {
  if (invested === 0) {
    return 0;
  }
  return ((currentValue - invested) / invested) * 100;
};
