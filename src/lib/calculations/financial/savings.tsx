/**
 * Savings Calculations
 * Canonical implementation for savings and savings rate calculations
 */

import { PERCENT } from "../../../constants";

/**
 * Calculate savings (income minus expense)
 *
 * @param income - Total income
 * @param expense - Total expense
 * @returns Savings amount (can be negative if expenses exceed income)
 *
 * @example
 * calculateSavings(100000, 70000) // 30000
 * calculateSavings(50000, 60000) // -10000 (deficit)
 *
 * Edge cases:
 * - Negative income/expense: calculated as-is (unusual but allowed)
 * - NaN inputs: treated as 0
 */
export const calculateSavings = (income: number, expense: number): number => {
  const validIncome = Number(income) || 0;
  const validExpense = Number(expense) || 0;
  return validIncome - validExpense;
};

/**
 * Calculate savings rate percentage
 *
 * @param income - Total income
 * @param expense - Total expense
 * @returns Savings rate as percentage (0-100+)
 *
 * @example
 * calculateSavingsRate(100000, 70000) // 30 (30% savings)
 * calculateSavingsRate(100000, 80000) // 20 (20% savings)
 * calculateSavingsRate(0, 5000) // 0 (no income, 0% savings)
 * calculateSavingsRate(50000, 60000) // -20 (negative savings/deficit)
 *
 * Formula: ((income - expense) / income) * 100
 *
 * Edge cases:
 * - income = 0: returns 0 (division by zero protection)
 * - expense > income: returns negative percentage (deficit)
 * - NaN inputs: treated as 0
 */
export const calculateSavingsRate = (
  income: number,
  expense: number
): number => {
  const validIncome = Number(income) || 0;
  const validExpense = Number(expense) || 0;

  if (validIncome === 0) {
    return 0;
  }

  return ((validIncome - validExpense) / validIncome) * PERCENT;
};

/**
 * Calculate percentage (generic utility)
 *
 * @param part - Part value
 * @param total - Total value
 * @returns Percentage (0-100+)
 *
 * @example
 * calculatePercentage(25, 100) // 25
 * calculatePercentage(50, 200) // 25
 * calculatePercentage(10, 0) // 0 (safe handling)
 *
 * Formula: (part / total) * 100
 *
 * Edge cases:
 * - total = 0: returns 0
 * - part > total: returns > 100
 * - NaN inputs: treated as 0
 */
export const calculatePercentage = (part: number, total: number): number => {
  const validPart = Number(part) || 0;
  const validTotal = Number(total) || 0;

  if (validTotal === 0) {
    return 0;
  }

  return (validPart / validTotal) * PERCENT;
};
