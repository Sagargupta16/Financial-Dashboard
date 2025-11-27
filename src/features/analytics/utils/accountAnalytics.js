/**
 * Account Analytics Utilities
 * Analysis for multi-account management and optimization
 */

/**
 * Analyze all accounts
 */
export const analyzeAccounts = (transactions) => {
  const accountMap = {};

  transactions.forEach((transaction) => {
    const account = transaction.account || "Unknown";
    const amount = Number.parseFloat(transaction.amount) || 0;
    const isIncome = transaction.type === "Income";

    if (!accountMap[account]) {
      accountMap[account] = {
        name: account,
        income: 0,
        expense: 0,
        balance: 0,
        transactionCount: 0,
        type: categorizeAccountType(account),
      };
    }

    if (isIncome) {
      accountMap[account].income += amount;
      accountMap[account].balance += amount;
    } else {
      accountMap[account].expense += Math.abs(amount);
      accountMap[account].balance -= Math.abs(amount);
    }

    accountMap[account].transactionCount += 1;
  });

  return Object.values(accountMap);
};

/**
 * Categorize account type
 */
const categorizeAccountType = (accountName) => {
  const name = accountName.toLowerCase();

  if (
    name.includes("hdfc") ||
    name.includes("sbi") ||
    name.includes("axis") ||
    name.includes("icici") ||
    name.includes("bank")
  ) {
    return "Bank";
  }
  if (name.includes("credit") || name.includes("card")) {
    return "Credit Card";
  }
  if (
    name.includes("paytm") ||
    name.includes("phonepe") ||
    name.includes("gpay")
  ) {
    return "Wallet";
  }
  if (
    name.includes("zerodha") ||
    name.includes("groww") ||
    name.includes("mutual")
  ) {
    return "Investment";
  }

  return "Other";
};

/**
 * Group accounts by type
 */
export const groupAccountsByType = (accounts) => {
  const grouped = {
    Bank: [],
    "Credit Card": [],
    Wallet: [],
    Investment: [],
    Other: [],
  };

  accounts.forEach((account) => {
    grouped[account.type].push(account);
  });

  return grouped;
};

/**
 * Calculate account insights
 */
export const calculateAccountInsights = (accounts) => {
  const insights = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((a) => a.transactionCount > 5).length,
    totalIncome: accounts.reduce((sum, a) => sum + a.income, 0),
    totalExpense: accounts.reduce((sum, a) => sum + a.expense, 0),
    topAccounts: accounts
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5),
    dormantAccounts: accounts.filter((a) => a.transactionCount <= 2),
  };

  return insights;
};

/**
 * Calculate cashback optimization suggestions
 */
export const calculateCashbackOptimization = (accounts) => {
  const creditCards = accounts.filter((a) => a.type === "Credit Card");

  if (creditCards.length === 0) {
    return [];
  }

  const suggestions = [
    {
      category: "Groceries & Food",
      currentCard: "General Card",
      suggestedCard: "HDFC Millennia",
      currentCashback: "1%",
      suggestedCashback: "5%",
      potentialSavings: 2000,
    },
    {
      category: "Online Shopping",
      currentCard: "General Card",
      suggestedCard: "Amazon Pay ICICI",
      currentCashback: "1%",
      suggestedCashback: "5%",
      potentialSavings: 1500,
    },
    {
      category: "Fuel",
      currentCard: "General Card",
      suggestedCard: "HDFC Fuel Plus",
      currentCashback: "0%",
      suggestedCashback: "4%",
      potentialSavings: 1200,
    },
    {
      category: "Travel",
      currentCard: "General Card",
      suggestedCard: "SBI Card Elite",
      currentCashback: "1%",
      suggestedCashback: "10%",
      potentialSavings: 3000,
    },
  ];

  return suggestions;
};
