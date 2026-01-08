// @ts-nocheck
/**
 * Aggregation Calculations
 * Canonical implementation for income, expense, and total calculations
 */

/**
 * Calculate total income from transactions
 *
 * @param {Array<Object>} transactions - Array of transaction objects
 * @returns {number} Total income amount
 *
 * @example
 * calculateTotalIncome(transactions) // 500000
 * calculateTotalIncome([]) // 0
 *
 * Filters for type === "Income" and sums absolute amounts
 *
 * Edge cases:
 * - Empty array: returns 0
 * - No income transactions: returns 0
 * - Invalid amounts: treated as 0
 * - Negative amounts: converted to absolute (positive)
 */
export const calculateTotalIncome = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }
  return transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
};

/**
 * Calculate total expense from transactions
 *
 * @param {Array<Object>} transactions - Array of transaction objects
 * @returns {number} Total expense amount
 *
 * @example
 * calculateTotalExpense(transactions) // 350000
 * calculateTotalExpense([]) // 0
 *
 * Filters for type === "Expense" and sums absolute amounts
 *
 * Edge cases:
 * - Empty array: returns 0
 * - No expense transactions: returns 0
 * - Invalid amounts: treated as 0
 * - Negative amounts: converted to absolute (positive)
 */
export const calculateTotalExpense = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }
  return transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
};
