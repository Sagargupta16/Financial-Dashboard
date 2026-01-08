/**
 * Category Analysis Calculations
 * Canonical implementation for grouping and analyzing transactions by category
 */

import type { Transaction } from "../../../types";

interface CategoryData {
  total: number;
  count: number;
  transactions: Transaction[];
}

/**
 * Group transactions by category with totals
 *
 * @param transactions - Array of transaction objects
 * @returns Category-grouped data: { [category]: { total, count, transactions } }
 *
 * @example
 * groupByCategory(transactions)
 * // {
 * //   "Food": { total: 15000, count: 45, transactions: [...] },
 * //   "Transport": { total: 5000, count: 20, transactions: [...] }
 * // }
 *
 * Groups all transactions by category, calculating total spend and count per category
 *
 * Edge cases:
 * - Empty array: returns {}
 * - Missing category: uses "Uncategorized"
 * - Invalid amounts: treated as 0
 */
export const groupByCategory = (
  transactions: Transaction[]
): Record<string, CategoryData> => {
  if (!transactions || transactions.length === 0) {
    return {};
  }

  return transactions.reduce((acc: Record<string, CategoryData>, t) => {
    const category = t.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        count: 0,
        transactions: [],
      };
    }
    acc[category].total += Math.abs(Number(t.amount) || 0);
    acc[category].count++;
    acc[category].transactions.push(t);
    return acc;
  }, {});
};

/**
 * Get top categories by spending
 *
 * @param {Array<Object>} transactions - Array of transaction objects
 * @param {number} limit - Maximum number of categories to return (default: 10)
 * @returns {Array<Object>} Top categories sorted by total: [{ category, total, count }, ...]
 *
 * @example
 * getTopCategories(transactions, 5)
 * // [
 * //   { category: "Food", total: 15000, count: 45 },
 * //   { category: "Transport", total: 5000, count: 20 },
 * //   ...
 * // ]
 *
 * Filters for expenses only, groups by category, and returns top N sorted by total
 *
 * Edge cases:
 * - Empty array: returns []
 * - limit > available categories: returns all categories
 * - limit = 0: returns []
 */
export const getTopCategories = (transactions: Transaction[], limit = 10) => {
  const grouped = groupByCategory(
    transactions.filter((t: Transaction) => t.type === "Expense")
  );

  return Object.entries(grouped)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};
