import { describe, expect, it } from "vitest";
import type { Transaction } from "../../types";
import {
  analyzeDayOfWeekPatterns,
  detectSpendingAnomalies,
  generateComprehensiveInsights,
} from "./trends";

describe("Analytics - Trends", () => {
  const createMockTransaction = (
    date: string,
    amount: number,
    type: "Income" | "Expense" = "Expense",
    category = "Food & Dining"
  ): Transaction => ({
    id: `tx-${date}-${amount}`,
    date,
    amount,
    type,
    category,
    subcategory: "Restaurants",
    account: "Credit Card",
    time: "12:00:00",
  });

  describe("analyzeDayOfWeekPatterns", () => {
    it("should return null for empty transactions", () => {
      const result = analyzeDayOfWeekPatterns([]);
      expect(result).toBeNull();
    });

    it("should calculate day of week spending patterns", () => {
      const transactions: Transaction[] = [
        createMockTransaction("2024-01-01", 1000), // Monday
        createMockTransaction("2024-01-02", 500), // Tuesday
        createMockTransaction("2024-01-06", 2000), // Saturday
        createMockTransaction("2024-01-07", 1500), // Sunday
      ];

      const result = analyzeDayOfWeekPatterns(transactions);

      expect(result).not.toBeNull();
      expect(result?.dayData).toHaveLength(7);
      expect(result?.weekendAvg).toBeGreaterThan(0);
      expect(result?.weekdayAvg).toBeGreaterThan(0);
    });

    it("should detect weekend spending spike", () => {
      const transactions: Transaction[] = [
        createMockTransaction("2024-01-01", 100), // Monday
        createMockTransaction("2024-01-06", 1000), // Saturday
        createMockTransaction("2024-01-07", 1000), // Sunday
      ];

      const result = analyzeDayOfWeekPatterns(transactions);

      expect(result?.insights).toBeDefined();
      const weekendInsight = result?.insights.find((i) => i.title.includes("Weekend"));
      expect(weekendInsight).toBeDefined();
      expect(weekendInsight?.priority).toBe("high");
    });
  });

  describe("detectSpendingAnomalies", () => {
    it("should return empty array for insufficient data", () => {
      const transactions: Transaction[] = [createMockTransaction("2024-01-01", 1000)];

      const result = detectSpendingAnomalies(transactions);
      expect(result).toEqual([]);
    });

    it("should detect unusual spending months", () => {
      const transactions: Transaction[] = [
        // Normal months (type = Expense, amount negative)
        createMockTransaction("2024-01-01", -1000, "Expense"),
        createMockTransaction("2024-01-15", -1000, "Expense"),
        createMockTransaction("2024-02-01", -1000, "Expense"),
        createMockTransaction("2024-02-15", -1000, "Expense"),
        createMockTransaction("2024-03-01", -1000, "Expense"),
        createMockTransaction("2024-03-15", -1000, "Expense"),
        createMockTransaction("2024-04-01", -1000, "Expense"),
        createMockTransaction("2024-04-15", -1000, "Expense"),
        // Anomaly month (5x normal spending)
        createMockTransaction("2024-05-01", -5000, "Expense"),
        createMockTransaction("2024-05-15", -5000, "Expense"),
      ];

      const result = detectSpendingAnomalies(transactions);

      expect(result.length).toBeGreaterThan(0);
      const anomaly = result.find((i) => i.type === "anomaly");
      expect(anomaly).toBeDefined();
      expect(anomaly?.priority).toBe("high");
    });
  });

  describe("generateComprehensiveInsights", () => {
    it("should combine all insight types", () => {
      const transactions: Transaction[] = [
        createMockTransaction("2024-01-01", 100),
        createMockTransaction("2024-01-02", 200),
        createMockTransaction("2024-01-06", 500), // Weekend
      ];

      const result = generateComprehensiveInsights(transactions);

      expect(result).toBeDefined();
      expect(result.all).toBeInstanceOf(Array);
      expect(result.byPriority).toBeDefined();
      expect(result.byType).toBeDefined();
      expect(result.dayPatterns).toBeDefined();
    });

    it("should categorize insights by priority", () => {
      const transactions: Transaction[] = [
        createMockTransaction("2024-01-01", 100),
        createMockTransaction("2024-01-06", 1000),
      ];

      const result = generateComprehensiveInsights(transactions);

      expect(result.byPriority.high).toBeInstanceOf(Array);
      expect(result.byPriority.medium).toBeInstanceOf(Array);
      expect(result.byPriority.low).toBeInstanceOf(Array);
    });

    it("should categorize insights by type", () => {
      const transactions: Transaction[] = [
        createMockTransaction("2024-01-01", 100),
        createMockTransaction("2024-01-06", 1000),
      ];

      const result = generateComprehensiveInsights(transactions);

      expect(result.byType.pattern).toBeInstanceOf(Array);
      expect(result.byType.anomaly).toBeInstanceOf(Array);
      expect(result.byType.trend).toBeInstanceOf(Array);
    });
  });
});
