// @ts-nocheck
/**
 * Cashback Calculations Module
 *
 * Formulas:
 * 1. Total Cashback Earned = Sum of all income transactions in "Refund & Cashbacks" category
 * 2. Cashback Shared = Sum of expenses + transfers out from "Cashback Shared" account
 * 3. Actual Cashback = Total Cashback Earned - Cashback Shared
 * 4. Cashback Rate = (Total Cashback Earned / Total Credit Card Spending) * 100
 */

/**
 * Calculate total cashback earned from all sources
 * @param {Array} transactions - All transactions
 * @returns {number} Total cashback earned
 */
export const calculateTotalCashbackEarned = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  // Cashback is income in "Refund & Cashbacks" category
  const cashbackTransactions = transactions.filter(
    (t) =>
      t.category === "Refund & Cashbacks" &&
      (t.type === "Income" || t["Income/Expense"] === "Income")
  );

  return cashbackTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );
};

/**
 * Calculate cashback shared with others
 * @param {Array} transactions - All transactions
 * @returns {number} Total cashback shared
 */
export const calculateCashbackShared = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  // Cashback shared is tracked via "Cashback Shared" account
  // Count expenses and transfers out
  const cashbackSharedTransactions = transactions.filter(
    (t) =>
      t.account === "Cashback Shared" &&
      (t.type === "Expense" ||
        t.type === "Transfer-Out" ||
        t["Income/Expense"] === "Exp." ||
        t["Income/Expense"] === "Transfer-Out")
  );

  return cashbackSharedTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );
};

/**
 * Calculate actual cashback (earned minus shared)
 * @param {Array} transactions - All transactions
 * @returns {number} Actual cashback retained
 */
export const calculateActualCashback = (transactions) => {
  const totalEarned = calculateTotalCashbackEarned(transactions);
  const totalShared = calculateCashbackShared(transactions);
  return totalEarned - totalShared;
};

/**
 * Calculate cashback by credit card
 * @param {Array} transactions - All transactions
 * @returns {Object} Cashback breakdown by card
 */
export const calculateCashbackByCard = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {};
  }

  const creditCardTransactions = transactions.filter((t) =>
    t.account?.toLowerCase().includes("credit")
  );

  const cardAccounts = [
    ...new Set(creditCardTransactions.map((t) => t.account)),
  ];

  const byCard = {};

  cardAccounts.forEach((card) => {
    const cardTransactions = transactions.filter((t) => t.account === card);

    const cashback = cardTransactions
      .filter(
        (t) =>
          t.category === "Refund & Cashbacks" &&
          (t.type === "Income" || t["Income/Expense"] === "Income")
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    const spending = cardTransactions
      .filter((t) => t.type === "Expense" || t["Income/Expense"] === "Exp.")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    const cashbackRate = spending > 0 ? (cashback / spending) * 100 : 0;

    byCard[card] = {
      cashback,
      spending,
      cashbackRate,
      transactionCount: cardTransactions.length,
    };
  });

  return byCard;
};

/**
 * Calculate comprehensive cashback metrics
 * @param {Array} transactions - All transactions
 * @returns {Object} Complete cashback analysis
 */
export const calculateCashbackMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalCashbackEarned: 0,
      cashbackShared: 0,
      actualCashback: 0,
      cashbackRate: 0,
      byCard: {},
      insights: [],
    };
  }

  const totalCashbackEarned = calculateTotalCashbackEarned(transactions);
  const cashbackShared = calculateCashbackShared(transactions);
  const actualCashback = calculateActualCashback(transactions);
  const byCard = calculateCashbackByCard(transactions);

  // Calculate overall cashback rate
  const totalCreditCardSpending = Object.values(byCard).reduce(
    (sum, card) => sum + card.spending,
    0
  );
  const cashbackRate =
    totalCreditCardSpending > 0
      ? (totalCashbackEarned / totalCreditCardSpending) * 100
      : 0;

  // Generate insights
  const insights = [];

  if (totalCashbackEarned > 0) {
    insights.push({
      title: "Total Cashback Earned",
      message: `₹${totalCashbackEarned.toLocaleString()} earned across all cards`,
      priority: "positive",
    });
  }

  if (cashbackShared > 0) {
    const sharedPercent = (cashbackShared / totalCashbackEarned) * 100;
    insights.push({
      title: "Cashback Shared",
      message: `₹${cashbackShared.toLocaleString()} shared (${sharedPercent.toFixed(1)}% of total)`,
      priority: "neutral",
    });
  }

  if (actualCashback > 0) {
    insights.push({
      title: "Actual Cashback Retained",
      message: `₹${actualCashback.toLocaleString()} after sharing`,
      priority: "positive",
    });
  }

  if (cashbackRate > 0) {
    insights.push({
      title: "Cashback Rate",
      message: `Earning ${cashbackRate.toFixed(2)}% back on credit card spending`,
      priority: cashbackRate >= 2 ? "positive" : "neutral",
    });
  }

  return {
    totalCashbackEarned,
    cashbackShared,
    actualCashback,
    cashbackRate,
    byCard,
    insights,
    breakdown: Object.entries(byCard)
      .map(([card, data]) => ({
        card,
        ...data,
      }))
      .sort((a, b) => b.cashback - a.cashback),
  };
};
