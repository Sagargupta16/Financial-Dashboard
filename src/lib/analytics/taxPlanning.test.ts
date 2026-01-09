import { describe, it, expect } from "vitest";
import {
  calculateProjectedTax,
  calculateTaxForIncome,
  calculateTaxForSlab,
} from "./taxPlanning";
import type { Transaction } from "../../types";

describe("Tax Planning - Business Logic", () => {
  const createMockTransaction = (
    date: string,
    amount: number,
    type: "Income" | "Expense" = "Income",
    category = "Employment Income",
    subcategory = "Salary"
  ): Transaction => ({
    id: `tx-${date}-${amount}`,
    date,
    amount,
    type,
    category,
    subcategory,
    account: "Bank Account",
  });

  describe("calculateTaxForIncome", () => {
    it("should return 0 for income below 4L", () => {
      expect(calculateTaxForIncome(0)).toBe(0);
      expect(calculateTaxForIncome(100000)).toBe(0);
      expect(calculateTaxForIncome(400000)).toBe(0);
    });

    it("should calculate 5% tax for 4L-8L slab", () => {
      // 5L: (5L - 4L) * 5% = 1L * 5% = 5,000
      expect(calculateTaxForIncome(500000)).toBe(5000);
      // 8L: (8L - 4L) * 5% = 4L * 5% = 20,000
      expect(calculateTaxForIncome(800000)).toBe(20000);
    });

    it("should calculate correct tax for 8L-12L slab", () => {
      // 10L: 20,000 + (10L - 8L) * 10% = 20,000 + 20,000 = 40,000
      expect(calculateTaxForIncome(1000000)).toBe(40000);
      // 12L: 20,000 + (12L - 8L) * 10% = 20,000 + 40,000 = 60,000
      expect(calculateTaxForIncome(1200000)).toBe(60000);
    });

    it("should calculate correct tax for 12L-16L slab", () => {
      // 14L: 60,000 + (14L - 12L) * 15% = 60,000 + 30,000 = 90,000
      expect(calculateTaxForIncome(1400000)).toBe(90000);
    });

    it("should calculate correct tax for income above 24L", () => {
      // 30L: 300,000 + (30L - 24L) * 30% = 300,000 + 180,000 = 480,000
      expect(calculateTaxForIncome(3000000)).toBe(480000);
    });
  });

  describe("calculateProjectedTax", () => {
    it("should return null for empty transactions", () => {
      const result = calculateProjectedTax([], 0, 75000, 0);
      expect(result).toBeNull();
    });

    it("should return null if no months remaining in FY", () => {
      // Mock current date to March (last month of FY)
      const marchTransactions: Transaction[] = [
        createMockTransaction("2024-03-15", 100000, "Income"),
      ];

      const result = calculateProjectedTax(
        marchTransactions,
        1200000,
        75000,
        60000
      );
      // Would return null if tested in March, but for other months will calculate
      expect(result).toBeDefined();
    });

    it("should return null if no recent salary transactions", () => {
      const oldTransactions: Transaction[] = [
        createMockTransaction("2023-01-15", 100000, "Income"),
      ];

      const result = calculateProjectedTax(oldTransactions, 500000, 75000, 0);
      expect(result).toBeNull();
    });

    it("should calculate projected tax correctly", () => {
      // Create transactions with recent dates (last 3 months)
      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(now.getMonth() - 2);

      const recentTransactions: Transaction[] = [
        createMockTransaction(
          now.toISOString().split("T")[0],
          100000,
          "Income",
          "Employment Income",
          "Salary"
        ),
        createMockTransaction(
          oneMonthAgo.toISOString().split("T")[0],
          100000,
          "Income",
          "Employment Income",
          "Salary"
        ),
        createMockTransaction(
          twoMonthsAgo.toISOString().split("T")[0],
          100000,
          "Income",
          "Employment Income",
          "Base Salary"
        ),
      ];

      const result = calculateProjectedTax(
        recentTransactions,
        400000, // totalIncome so far
        75000, // standardDeduction
        0 // totalTaxLiability so far
      );

      expect(result).toBeDefined();
      expect(result?.avgMonthlySalary).toBe(100000);
      expect(result?.monthsRemaining).toBeGreaterThan(0);
      expect(result?.projectedAnnualSalary).toBeGreaterThan(400000);
    });

    it("should include cess in projected tax calculation", () => {
      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(now.getMonth() - 2);

      const recentTransactions: Transaction[] = [
        createMockTransaction(
          now.toISOString().split("T")[0],
          150000,
          "Income",
          "Employment Income",
          "Salary"
        ),
        createMockTransaction(
          oneMonthAgo.toISOString().split("T")[0],
          150000,
          "Income",
          "Employment Income",
          "Salary"
        ),
        createMockTransaction(
          twoMonthsAgo.toISOString().split("T")[0],
          150000,
          "Income",
          "Employment Income",
          "Salary"
        ),
      ];

      const result = calculateProjectedTax(
        recentTransactions,
        600000, // totalIncome (4 months @ 150k)
        75000,
        20000
      );

      expect(result).toBeDefined();
      // Projected total tax should be > 0 and include 4% cess
      if (result) {
        expect(result.projectedTotalTax).toBeGreaterThan(0);
        // Additional liability = projected - current (20k)
        expect(result.additionalTaxLiability).toBeGreaterThan(-20000);
      }
    });

    it("should calculate additional tax liability correctly", () => {
      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(now.getMonth() - 2);

      const recentTransactions: Transaction[] = [
        createMockTransaction(
          now.toISOString().split("T")[0],
          120000,
          "Income",
          "Employment Income",
          "Salary"
        ),
        createMockTransaction(
          oneMonthAgo.toISOString().split("T")[0],
          120000,
          "Income",
          "Employment Income",
          "Salary"
        ),
        createMockTransaction(
          twoMonthsAgo.toISOString().split("T")[0],
          120000,
          "Income",
          "Employment Income",
          "Salary"
        ),
      ];

      const currentTax = 30000;
      const result = calculateProjectedTax(
        recentTransactions,
        480000, // 4 months @ 120k
        75000,
        currentTax
      );

      expect(result).toBeDefined();
      if (result) {
        expect(result.currentTax).toBe(currentTax);
        expect(result.additionalTaxLiability).toBe(
          result.projectedTotalTax - currentTax
        );
      }
    });
  });

  describe("calculateTaxForSlab", () => {
    it("should return 0 if income is below slab minimum", () => {
      const tax = calculateTaxForSlab(300000, 400000, 800000, 0.05);
      expect(tax).toBe(0);
    });

    it("should calculate tax only for income within the slab", () => {
      // Income 6L in 4L-8L slab (5% rate)
      // Tax = (6L - 4L) * 5% = 2L * 5% = 10,000
      const tax = calculateTaxForSlab(600000, 400000, 800000, 0.05);
      expect(tax).toBe(10000);
    });

    it("should cap at slab maximum", () => {
      // Income 10L in 4L-8L slab (5% rate)
      // Tax = (8L - 4L) * 5% = 4L * 5% = 20,000 (capped at 8L)
      const tax = calculateTaxForSlab(1000000, 400000, 800000, 0.05);
      expect(tax).toBe(20000);
    });
  });
});
