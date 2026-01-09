/**
 * Reimbursement Calculations Module
 *
 * Formulas:
 * 1. Total Reimbursements = Sum of all "Expense Reimbursement" income transactions
 * 2. Reimbursement Rate = (Total Reimbursements / Total Employment Income) * 100
 * 3. Average Reimbursement = Total Reimbursements / Number of Reimbursement transactions
 */

import type { Transaction } from "../../../types";

/**
 * Calculate total reimbursements received
 * @param transactions - All transactions
 * @returns Total reimbursements
 */
export const calculateTotalReimbursements = (transactions: Transaction[]): number => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  // Reimbursements are income transactions in "Expense Reimbursement" subcategory
  const reimbursementTransactions = transactions.filter(
    (t) =>
      (t.subcategory === "Expense Reimbursement" ||
        t.subcategory?.toLowerCase().includes("reimburs")) &&
      (t.type === "Income" || (t as any)["Income/Expense"] === "Income")
  );

  return reimbursementTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
};

/**
 * Calculate reimbursement transactions details
 * @param transactions - All transactions
 * @returns Reimbursement transaction details
 */
export const getReimbursementTransactions = (transactions: Transaction[]): any[] => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  return transactions
    .filter(
      (t) =>
        (t.subcategory === "Expense Reimbursement" ||
          t.subcategory?.toLowerCase().includes("reimburs")) &&
        (t.type === "Income" || (t as any)["Income/Expense"] === "Income")
    )
    .map((t) => ({
      date: t.date || (t as any).Period,
      account: t.account || (t as any).Accounts,
      amount: Math.abs(Number(t.amount || (t as any).Amount) || 0),
      note: t.note || (t as any).Note,
      category: t.category || (t as any).Category,
      subcategory: t.subcategory || (t as any).Subcategory,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Calculate average reimbursement amount
 * @param {Array} transactions - All transactions
 * @returns {number} Average reimbursement amount
 */
export const calculateAverageReimbursement = (transactions: Transaction[]) => {
  const reimbTransactions = getReimbursementTransactions(transactions);

  if (reimbTransactions.length === 0) {
    return 0;
  }

  const total = reimbTransactions.reduce((sum, t) => sum + t.amount, 0);
  return total / reimbTransactions.length;
};

/**
 * Calculate reimbursement metrics by time period
 * @param {Array} transactions - All transactions
 * @returns {Object} Reimbursement breakdown by month
 */
export const calculateReimbursementByPeriod = (transactions: Transaction[]) => {
  const reimbTransactions = getReimbursementTransactions(transactions);

  if (reimbTransactions.length === 0) {
    return {};
  }

  const byPeriod: Record<string, { total: number; count: number; transactions: any[] }> = {};

  reimbTransactions.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!byPeriod[monthKey]) {
      byPeriod[monthKey] = {
        total: 0,
        count: 0,
        transactions: [],
      };
    }

    byPeriod[monthKey].total += t.amount;
    byPeriod[monthKey].count += 1;
    byPeriod[monthKey].transactions.push(t);
  });

  return byPeriod;
};

/**
 * Calculate comprehensive reimbursement metrics
 * @param {Array} transactions - All transactions
 * @returns {Object} Complete reimbursement analysis
 */
export const calculateReimbursementMetrics = (transactions: Transaction[]) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalReimbursements: 0,
      averageReimbursement: 0,
      reimbursementCount: 0,
      byPeriod: {},
      recentTransactions: [],
      insights: [],
    };
  }

  const totalReimbursements = calculateTotalReimbursements(transactions);
  const reimbTransactions = getReimbursementTransactions(transactions);
  const averageReimbursement = calculateAverageReimbursement(transactions);
  const byPeriod = calculateReimbursementByPeriod(transactions);

  // Generate insights
  const insights = [];

  if (totalReimbursements > 0) {
    insights.push({
      title: "Total Reimbursements",
      message: `₹${totalReimbursements.toLocaleString()} received from ${reimbTransactions.length} reimbursements`,
      priority: "positive",
    });
  }

  if (averageReimbursement > 0) {
    insights.push({
      title: "Average Reimbursement",
      message: `₹${averageReimbursement.toLocaleString()} per reimbursement`,
      priority: "neutral",
    });
  }

  // Check for recent reimbursements (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentReimbursements = reimbTransactions.filter((t) => new Date(t.date) >= thirtyDaysAgo);

  if (recentReimbursements.length > 0) {
    const recentTotal = recentReimbursements.reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      title: "Recent Activity",
      message: `₹${recentTotal.toLocaleString()} reimbursed in last 30 days`,
      priority: "positive",
    });
  }

  return {
    totalReimbursements,
    averageReimbursement,
    reimbursementCount: reimbTransactions.length,
    byPeriod,
    recentTransactions: reimbTransactions.slice(0, 10), // Last 10 transactions
    insights,
  };
};
