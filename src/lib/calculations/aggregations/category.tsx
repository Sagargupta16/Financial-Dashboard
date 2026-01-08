// @ts-nocheck
/**
 * Category Analysis Calculations
 * Canonical implementation for grouping and analyzing transactions by category
 */

/**
 * Group transactions by category with totals
 *
 * @param {Array<Object>} transactions - Array of transaction objects
 * @returns {Object} Category-grouped data: { [category]: { total, count, transactions } }
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
export const groupByCategory = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {};
  }

  return transactions.reduce((acc, t) => {
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
export const getTopCategories = (transactions, limit = 10) => {
  const grouped = groupByCategory(
    transactions.filter((t) => t.type === "Expense")
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
