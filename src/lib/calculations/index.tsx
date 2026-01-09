// @ts-nocheck
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

// Average Calculations
export {
  calculateAveragePerTransaction,
  calculateDailyAverage,
  calculateMonthlyAverage,
} from "./aggregations/averages";
// Category Analysis
export { getTopCategories, groupByCategory } from "./aggregations/category";

// Aggregation Calculations
export {
  calculateTotalExpense,
  calculateTotalIncome,
} from "./aggregations/totals";
// Cashback Calculations
export {
  calculateActualCashback,
  calculateCashbackByCard,
  calculateCashbackMetrics,
  calculateCashbackShared,
  calculateTotalCashbackEarned,
} from "./financial/cashback";
// Reimbursement Calculations
export {
  calculateAverageReimbursement,
  calculateReimbursementByPeriod,
  calculateReimbursementMetrics,
  calculateTotalReimbursements,
  getReimbursementTransactions,
} from "./financial/reimbursement";
// Savings Calculations
export {
  calculatePercentage,
  calculateSavings,
  calculateSavingsRate,
} from "./financial/savings";
// Re-export all legacy functions for backwards compatibility
export {
  calculateCashFlowForecast,
  calculateCategoryBudgetStatus,
  calculateCategoryTrends,
  calculateDayOfMonthPattern,
  calculateDebtToIncomeRatio,
  calculateEmergencyFundMonths,
  calculateGoalProgress,
  calculateGrowthRate,
  calculateIncomeExpenseRatio,
  calculateIncomeStability,
  calculateMetrics,
  calculateMonthlyComparison,
  calculateMonthlyHealthRatio,
  calculateMovingAverage,
  calculatePerDayFrequency,
  calculatePerMonthFrequency,
  calculatePerWeekFrequency,
  calculateSavingsPotential,
  calculateTotal,
  calculateTotalDebt,
  calculateTotalDeposits,
  calculateTotalInvestments,
  calculateTotalLiquidAssets,
  detectAnomalies,
  detectRecurringTransactions,
  filterByDateRange,
  filterByType,
  formatNumber,
  getFinancialGrade,
  roundTo,
  scoreCategoryBalance,
  scoreConsistency,
  scoreDebtManagement,
  scoreEmergencyFund,
  scoreIncomeExpenseRatio,
  scoreSavingsRate,
  validateDataCompleteness,
} from "./legacy";
// Date Range Calculations
export { calculateDateRange } from "./time/dateRange";
