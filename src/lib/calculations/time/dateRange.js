/**
 * Date Range Calculations
 * Canonical implementation for date-related financial calculations
 */

import {
  DAYS_PER_MONTH,
  MONTHS_PER_YEAR,
  MILLISECONDS_PER_DAY,
} from "../../../constants";

/**
 * Calculate date range and duration from transactions
 *
 * @param {Array<Object>} transactions - Array of transaction objects with date property
 * @returns {Object} Date range information
 * @returns {number} returns.days - Total days in the range (minimum 1 if transactions exist)
 * @returns {number} returns.months - Total months (days / 30.44)
 * @returns {number} returns.years - Total years (months / 12)
 * @returns {Date|null} returns.startDate - Earliest transaction date (null if no valid dates)
 * @returns {Date|null} returns.endDate - Latest transaction date (null if no valid dates)
 *
 * @example
 * const range = calculateDateRange(transactions);
 * // { days: 365, months: 12, years: 1, startDate: Date, endDate: Date }
 *
 * Edge cases:
 * - Empty array: returns { days: 0, months: 0, years: 0, startDate: null, endDate: null }
 * - All invalid dates: returns { days: 0, months: 0, years: 0, startDate: null, endDate: null }
 * - Same-day transactions: returns { days: 1, months: 0.033, years: 0.003, ... }
 */
export const calculateDateRange = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { days: 0, months: 0, years: 0, startDate: null, endDate: null };
  }

  const dates = transactions
    .map((t) => new Date(t.date))
    .filter((d) => !Number.isNaN(d.getTime()));

  if (dates.length === 0) {
    return { days: 0, months: 0, years: 0, startDate: null, endDate: null };
  }

  const startDate = new Date(Math.min(...dates));
  const endDate = new Date(Math.max(...dates));

  const daysDiff = Math.ceil((endDate - startDate) / MILLISECONDS_PER_DAY);

  // Ensure at least 1 day if transactions exist (handles same-day transactions)
  const days = Math.max(1, daysDiff);
  const months = days / DAYS_PER_MONTH;
  const years = months / MONTHS_PER_YEAR;

  return { days, months, years, startDate, endDate };
};
