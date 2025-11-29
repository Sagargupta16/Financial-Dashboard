/**
 * Average Calculations
 * Canonical implementation for daily, monthly, and transaction averages
 */

import { DAYS_PER_MONTH } from "../../../constants";

/**
 * Calculate daily average
 *
 * @param {number} total - Total amount
 * @param {number} days - Number of days
 * @returns {number} Daily average (0 if days is 0 or invalid)
 *
 * @example
 * calculateDailyAverage(30000, 30) // 1000
 * calculateDailyAverage(1000, 0) // 0 (safe handling)
 *
 * Edge cases:
 * - days = 0: returns 0
 * - negative total: returns negative average
 * - NaN inputs: returns 0
 */
export const calculateDailyAverage = (total, days) => {
  if (days === 0 || Number.isNaN(total) || Number.isNaN(days)) {
    return 0;
  }
  return total / days;
};

/**
 * Calculate monthly average from total and days
 * Uses 30.44 days per month (average accounting for leap years)
 *
 * @param {number} total - Total amount
 * @param {number} days - Number of days
 * @returns {number} Monthly average (0 if days is 0 or invalid)
 *
 * @example
 * calculateMonthlyAverage(30000, 365) // ~2475.62
 * calculateMonthlyAverage(1000, 0) // 0 (safe handling)
 *
 * Formula: (total / days) * DAYS_PER_MONTH
 *
 * Edge cases:
 * - days = 0: returns 0
 * - partial month data: extrapolates to full month
 * - NaN inputs: returns 0
 */
export const calculateMonthlyAverage = (total, days) => {
  if (days === 0 || Number.isNaN(total) || Number.isNaN(days)) {
    return 0;
  }
  return (total / days) * DAYS_PER_MONTH;
};

/**
 * Calculate average per transaction
 *
 * @param {number} total - Total amount
 * @param {number} count - Number of transactions
 * @returns {number} Average per transaction (0 if count is 0 or invalid)
 *
 * @example
 * calculateAveragePerTransaction(10000, 20) // 500
 * calculateAveragePerTransaction(1000, 0) // 0 (safe handling)
 *
 * Edge cases:
 * - count = 0: returns 0
 * - NaN inputs: returns 0
 */
export const calculateAveragePerTransaction = (total, count) => {
  if (count === 0 || Number.isNaN(total) || Number.isNaN(count)) {
    return 0;
  }
  return total / count;
};
