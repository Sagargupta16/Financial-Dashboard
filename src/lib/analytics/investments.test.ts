import { describe, expect, it } from "vitest";
import type { InvestmentTransaction } from "../../types";
import { formatCurrency } from "../formatters";
import {
  calculateInvestmentMetrics,
  calculateMonthlyPnL,
  calculateReturnPercentage,
  preparePnLChartData,
} from "./investments";

describe("Investment Analytics - Business Logic", () => {
  const createMockInvestmentTransaction = (
    date: string,
    type: "Buy" | "Sell" | "Dividend" | "Brokerage",
    amount: number
  ): InvestmentTransaction => ({
    date,
    type,
    amount,
  });

  describe("calculateMonthlyPnL", () => {
    it("should return empty array for no transactions", () => {
      const result = calculateMonthlyPnL([]);
      expect(result).toEqual([]);
    });

    it("should aggregate dividends and brokerage by month", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 5000),
        createMockInvestmentTransaction("2024-01-20", "Brokerage", 100),
        createMockInvestmentTransaction("2024-02-10", "Dividend", 3000),
      ];

      const result = calculateMonthlyPnL(transactions);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        month: "2024-01",
        amount: 4900, // 5000 - 100
        cumulative: 4900,
      });
      expect(result[1]).toEqual({
        month: "2024-02",
        amount: 3000,
        cumulative: 7900, // 4900 + 3000
      });
    });

    it("should handle negative monthly returns", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 1000),
        createMockInvestmentTransaction("2024-01-20", "Brokerage", 2000),
      ];

      const result = calculateMonthlyPnL(transactions);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-1000); // 1000 - 2000
      expect(result[0].cumulative).toBe(-1000);
    });

    it("should sort months chronologically", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-03-15", "Dividend", 3000),
        createMockInvestmentTransaction("2024-01-15", "Dividend", 1000),
        createMockInvestmentTransaction("2024-02-15", "Dividend", 2000),
      ];

      const result = calculateMonthlyPnL(transactions);

      expect(result.map((r) => r.month)).toEqual(["2024-01", "2024-02", "2024-03"]);
    });

    it("should calculate cumulative correctly over multiple months", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 1000),
        createMockInvestmentTransaction("2024-02-15", "Dividend", 2000),
        createMockInvestmentTransaction("2024-03-15", "Brokerage", 500),
      ];

      const result = calculateMonthlyPnL(transactions);

      expect(result[0].cumulative).toBe(1000);
      expect(result[1].cumulative).toBe(3000); // 1000 + 2000
      expect(result[2].cumulative).toBe(2500); // 3000 - 500
    });

    it("should ignore Buy and Sell transactions in P&L calculation", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-10", "Buy", 10000),
        createMockInvestmentTransaction("2024-01-15", "Dividend", 5000),
        createMockInvestmentTransaction("2024-01-20", "Sell", 12000),
        createMockInvestmentTransaction("2024-01-25", "Brokerage", 100),
      ];

      const result = calculateMonthlyPnL(transactions);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(4900); // Only 5000 - 100
    });
  });

  describe("preparePnLChartData", () => {
    it("should return empty chart data for no transactions", () => {
      const result = preparePnLChartData([]);

      expect(result.labels).toEqual([]);
      expect(result.datasets[0].data).toEqual([]);
    });

    it("should prepare chart data with correct structure", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 5000),
        createMockInvestmentTransaction("2024-02-15", "Dividend", 3000),
      ];

      const result = preparePnLChartData(transactions);

      expect(result.labels).toEqual(["2024-01", "2024-02"]);
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].label).toBe("Cumulative P&L");
      expect(result.datasets[0].data).toEqual([5000, 8000]);
    });

    it("should use green color for positive cumulative returns", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 5000),
      ];

      const result = preparePnLChartData(transactions);

      expect(result.datasets[0].borderColor).toBe("rgb(34, 197, 94)");
      expect(result.datasets[0].backgroundColor).toBe("rgba(34, 197, 94, 0.1)");
    });

    it("should use red color for negative cumulative returns", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Brokerage", 5000),
      ];

      const result = preparePnLChartData(transactions);

      expect(result.datasets[0].borderColor).toBe("rgb(239, 68, 68)");
      expect(result.datasets[0].backgroundColor).toBe("rgba(239, 68, 68, 0.1)");
    });
  });

  describe("calculateInvestmentMetrics", () => {
    it("should calculate metrics correctly", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 5000),
        createMockInvestmentTransaction("2024-01-20", "Brokerage", 100),
        createMockInvestmentTransaction("2024-02-15", "Dividend", 3000),
        createMockInvestmentTransaction("2024-03-15", "Brokerage", 200),
        createMockInvestmentTransaction("2024-04-15", "Dividend", 2000),
      ];

      const result = calculateInvestmentMetrics(transactions);

      // Total profit = months with positive net (Jan: 5000-100=4900, Feb: 3000, Apr: 2000) = 9900
      expect(result.totalProfit).toBe(9900);
      // Total loss = months with negative net (Mar: -200) = 200
      expect(result.totalLoss).toBe(200);
      // Net P&L = 9900 - 200 = 9700
      expect(result.netPnL).toBe(9700);
      expect(result.totalBrokerage).toBe(300);
      expect(result.profitMonths).toBe(3);
      expect(result.lossMonths).toBe(1);
    });

    it("should count profit and loss months correctly", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 5000),
        createMockInvestmentTransaction("2024-02-15", "Brokerage", 6000),
        createMockInvestmentTransaction("2024-03-15", "Dividend", 3000),
      ];

      const result = calculateInvestmentMetrics(transactions);

      expect(result.profitMonths).toBe(2); // Jan and Mar
      expect(result.lossMonths).toBe(1); // Feb
    });

    it("should calculate average monthly return", () => {
      const transactions: InvestmentTransaction[] = [
        createMockInvestmentTransaction("2024-01-15", "Dividend", 3000),
        createMockInvestmentTransaction("2024-02-15", "Dividend", 6000),
        createMockInvestmentTransaction("2024-03-15", "Brokerage", 1000),
      ];

      const result = calculateInvestmentMetrics(transactions);

      // (3000 + 6000 - 1000) / 3 months = 2666.67
      expect(result.averageMonthlyReturn).toBeCloseTo(2666.67, 2);
    });

    it("should handle zero transactions", () => {
      const result = calculateInvestmentMetrics([]);

      expect(result.totalProfit).toBe(0);
      expect(result.totalLoss).toBe(0);
      expect(result.netPnL).toBe(0);
      expect(result.totalBrokerage).toBe(0);
      expect(result.averageMonthlyReturn).toBe(0);
      expect(result.profitMonths).toBe(0);
      expect(result.lossMonths).toBe(0);
    });
  });

  describe("calculateReturnPercentage", () => {
    it("should calculate positive returns correctly", () => {
      const result = calculateReturnPercentage(100000, 120000);
      expect(result).toBe(20);
    });

    it("should calculate negative returns correctly", () => {
      const result = calculateReturnPercentage(100000, 80000);
      expect(result).toBe(-20);
    });

    it("should return 0 for zero investment", () => {
      const result = calculateReturnPercentage(0, 10000);
      expect(result).toBe(0);
    });

    it("should handle break-even scenario", () => {
      const result = calculateReturnPercentage(100000, 100000);
      expect(result).toBe(0);
    });
  });

  describe("formatCurrency", () => {
    it("should format currency with Indian locale by default", () => {
      const result = formatCurrency(100000);
      expect(result).toMatch(/₹|INR/); // Should contain rupee symbol
      expect(result).toMatch(/1,00,000|100,000/); // Should have comma separators
    });

    it("should format negative amounts", () => {
      const result = formatCurrency(-50000);
      expect(result).toContain("-");
      expect(result).toMatch(/50,000/);
    });

    it("should format zero", () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/₹|INR/);
      expect(result).toMatch(/0/);
    });
  });
});
