/**
 * Financial Calculations - Canonical API
 * Single source of truth for all financial calculations
 *
 * This module exports all pure calculation functions used across the application.
 * Each function is documented with JSDoc, handles edge cases, and follows consistent patterns.
 *
 * Usage:
 * import { calculateSavingsRate, calculateDateRange } from 'src/shared/utils/calculations';
 */

// Date Range Calculations
export { calculateDateRange } from "./dateRange";

// Average Calculations
export {
  calculateDailyAverage,
  calculateMonthlyAverage,
  calculateAveragePerTransaction,
} from "./averages";

// Aggregation Calculations
export { calculateTotalIncome, calculateTotalExpense } from "./aggregations";

// Savings Calculations
export {
  calculateSavings,
  calculateSavingsRate,
  calculatePercentage,
} from "./savings";

// Category Analysis
export { groupByCategory, getTopCategories } from "./category";
