/**
 * Date Range Calculations
 * Canonical implementation for date-related financial calculations
 */

import {
  DAYS_PER_MONTH,
  MONTHS_PER_YEAR,
  MILLISECONDS_PER_DAY,
} from "../../../constants";
import type { Transaction } from "../../../types";

export interface DateRangeResult {
  days: number;
  months: number;
  years: number;
  startDate: Date | null;
  endDate: Date | null;
  totalDays: number;
  totalMonths: number;
  totalYears: number;
}

/**
 * Calculate date range and duration from transactions
 *
 * @param transactions - Array of transaction objects with date property
 * @returns Date range information
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
export const calculateDateRange = (
  transactions: Transaction[]
): DateRangeResult => {
  if (!transactions || transactions.length === 0) {
    return {
      days: 0,
      months: 0,
      years: 0,
      startDate: null,
      endDate: null,
      totalDays: 0,
      totalMonths: 0,
      totalYears: 0,
    };
  }

  const dates = transactions
    .map((t) => new Date(t.date))
    .filter((d) => !Number.isNaN(d.getTime()));

  if (dates.length === 0) {
    return {
      days: 0,
      months: 0,
      years: 0,
      startDate: null,
      endDate: null,
      totalDays: 0,
      totalMonths: 0,
      totalYears: 0,
    };
  }

  const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY
  );

  // Ensure at least 1 day if transactions exist (handles same-day transactions)
  const days = Math.max(1, daysDiff);
  const months = days / DAYS_PER_MONTH;
  const years = months / MONTHS_PER_YEAR;

  return {
    days,
    months,
    years,
    startDate,
    endDate,
    totalDays: days,
    totalMonths: months,
    totalYears: years,
  };
};
