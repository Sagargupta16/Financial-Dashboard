/**
 * Net Balance Breakdown Calculations
 * Categorizes accounts into Cash, Investments, Deposits, and Debt
 */

type AccountCategory = "cash" | "investments" | "deposit" | "debt" | "other";

/**
 * Categorize account types based on account names
 * @param accountName - Name of the account
 * @returns Category: 'cash', 'investment', 'deposit', 'debt', 'other'
 */
export const categorizeAccount = (accountName: string): AccountCategory => {
  if (!accountName) {
    return "other";
  }

  const name = accountName.toLowerCase();

  // Cash/In-hand: Bank accounts, UPI, Wallets
  const cashKeywords = [
    "bank",
    "upi",
    "gpay",
    "phonepe",
    "paytm",
    "wallet",
    "amazon wallet",
    "cash",
    "sbi",
    "hdfc",
    "icici",
    "axis",
  ];
  if (cashKeywords.some((keyword) => name.includes(keyword))) {
    return "cash";
  }

  // Investments: Stocks, Mutual Funds, Investment accounts
  const investmentKeywords = [
    "grow",
    "stock",
    "mutual",
    "fund",
    "mf",
    "equity",
    "investment",
    "invest",
    "zerodha",
    "upstox",
    "demat",
  ];
  if (
    investmentKeywords.some((keyword) => name.includes(keyword)) &&
    !name.includes("fam") &&
    !name.includes("friend")
  ) {
    return "investments" as AccountCategory;
  }

  // Debt: Credit Cards
  const debtKeywords = ["credit card", "credit", "cc"];
  if (debtKeywords.some((keyword) => name.includes(keyword))) {
    return "debt";
  }

  // Deposits/Friends/Family
  const depositKeywords = [
    "friend",
    "fam",
    "family",
    "deposit",
    "fd",
    "rd",
    "loan",
    "lend",
    "borrowed",
    "land",
    "property",
    "flat",
  ];
  if (depositKeywords.some((keyword) => name.includes(keyword))) {
    return "deposit";
  }

  return "other";
};

import type { Transaction } from "../../../types";

interface AccountDetail {
  account: string;
  balance: number;
}

export interface NetBalanceBreakdown {
  cash: number;
  investments: number;
  deposits: number;
  debt: number;
  other: number;
  total: number;
  byAccount: {
    cash?: AccountDetail[];
    investments?: AccountDetail[];
    deposits?: AccountDetail[];
    debt?: AccountDetail[];
    other?: AccountDetail[];
  };
}

/**
 * Calculate net balance breakdown by category
 * @param transactions - All transactions
 * @returns Breakdown of balances by category
 */
export const calculateNetBalanceBreakdown = (
  transactions: Transaction[]
): NetBalanceBreakdown => {
  if (!transactions || transactions.length === 0) {
    return {
      cash: 0,
      investments: 0,
      deposits: 0,
      debt: 0,
      other: 0,
      total: 0,
      byAccount: {},
    };
  }

  // First calculate balance per account
  const accountBalances: Record<string, number> = {};

  transactions.forEach(({ account, type, amount }) => {
    if (!account) {
      return;
    }
    if (!accountBalances[account]) {
      accountBalances[account] = 0;
    }

    const validAmount = Math.abs(Number(amount) || 0);

    // For proper account balance tracking:
    // Income/Transfer-In ADD to the account
    // Expense/Transfer-Out SUBTRACT from the account
    if (type === "Income" || type === "Transfer-In") {
      accountBalances[account] += validAmount;
    } else if (type === "Expense" || type === "Transfer-Out") {
      accountBalances[account] -= validAmount;
    }
  });

  // Categorize accounts and sum by category
  const breakdown: {
    cash: number;
    investments: number;
    deposits: number;
    debt: number;
    other: number;
    total: number;
    byAccount: Record<string, Array<{ name: string; balance: number }>>;
  } = {
    cash: 0,
    investments: 0,
    deposits: 0,
    debt: 0,
    other: 0,
    total: 0,
    byAccount: {},
  };

  Object.entries(accountBalances).forEach(([account, balance]) => {
    const category = categorizeAccount(account) as string;

    // Special handling for debt: negative balances in any account are debt
    // Positive balances in credit card accounts are also debt (money owed)
    if (balance < 0 || category === "debt") {
      breakdown.debt += Math.abs(balance);
      if (!breakdown.byAccount.debt) {
        breakdown.byAccount.debt = [];
      }
      breakdown.byAccount.debt.push({
        name: account,
        balance: Math.abs(balance),
      });
    } else {
      // Positive balances in other categories
      // Map "investment" and "deposit" to correct property names
      const propName =
        category === "investment"
          ? "investments"
          : category === "deposit"
            ? "deposits"
            : category;
      if (
        propName === "investments" ||
        propName === "deposits" ||
        propName === "cash" ||
        propName === "other"
      ) {
        breakdown[propName] += balance;

        // Store individual account info
        if (!breakdown.byAccount[category]) {
          breakdown.byAccount[category] = [];
        }
        breakdown.byAccount[category].push({
          name: account,
          balance,
        });
      }
    }
  });

  // Calculate total (cash + investments + deposits - debt)
  // Note: breakdown.debt is already positive (absolute value)
  breakdown.total =
    breakdown.cash +
    breakdown.investments +
    breakdown.deposits -
    breakdown.debt;

  return breakdown;
};

/**
 * Get insights about balance breakdown
 * @param {Object} breakdown - Balance breakdown
 * @returns {Array} Array of insights
 */
export const getBalanceBreakdownInsights = (breakdown: NetBalanceBreakdown) => {
  const insights = [];

  // Cash concentration
  const cashPercentage =
    breakdown.total > 0 ? (breakdown.cash / breakdown.total) * 100 : 0;

  if (cashPercentage > 70) {
    insights.push({
      title: "High Cash Holdings",
      message: `${cashPercentage.toFixed(0)}% of your assets are in cash. Consider investing some for better returns.`,
      priority: "medium",
    });
  }

  // Debt warning
  if (breakdown.debt < 0) {
    const debtAmount = Math.abs(breakdown.debt);
    insights.push({
      title: "Credit Card Debt",
      message: `You have ₹${debtAmount.toLocaleString()} in credit card debt. Focus on paying this down.`,
      priority: "high",
    });
  }

  // Investment appreciation
  if (breakdown.investments > 0) {
    const investmentPercentage =
      breakdown.total > 0 ? (breakdown.investments / breakdown.total) * 100 : 0;

    insights.push({
      title: "Investment Portfolio",
      message: `${investmentPercentage.toFixed(0)}% of your assets are invested. Keep building your investment portfolio!`,
      priority: "positive",
    });
  }

  return insights;
};

/**
 * Calculate net balance breakdown from account balances (Excel data)
 * @param {Array|Object} accountBalances - Account balances from uploaded file
 * @returns {Object} Breakdown of balances by category
 */
export const calculateNetBalanceBreakdownFromAccounts = (
  accountBalances: any
) => {
  const breakdown: {
    cash: number;
    investments: number;
    deposits: number;
    debt: number;
    other: number;
    total: number;
    byAccount: Record<string, Array<{ name: string; balance: number }>>;
  } = {
    cash: 0,
    investments: 0,
    deposits: 0,
    debt: 0,
    other: 0,
    total: 0,
    byAccount: {},
  };

  if (!accountBalances) {
    return breakdown;
  }

  // Handle both array [{name, balance}] and object {name: balance} formats
  const entries = Array.isArray(accountBalances)
    ? accountBalances.map((acc) => [acc.name, acc.balance])
    : Object.entries(accountBalances);

  entries.forEach(([name, balance]) => {
    const balanceNum = Number.parseFloat(balance) || 0;
    const category = categorizeAccount(name) as string;

    // Credit card or negative balance = debt
    if (balanceNum < 0 || category === "debt") {
      const debtAmount = Math.abs(balanceNum);
      breakdown.debt += debtAmount;

      if (!breakdown.byAccount.debt) {
        breakdown.byAccount.debt = [];
      }
      breakdown.byAccount.debt.push({
        name: name,
        balance: debtAmount,
      });
    } else if (balanceNum > 0) {
      // Positive balance - categorize
      // Map "investment" and "deposit" to correct property names
      const propName =
        category === "investment"
          ? "investments"
          : category === "deposit"
            ? "deposits"
            : category;
      if (
        propName === "investments" ||
        propName === "deposits" ||
        propName === "cash" ||
        propName === "other"
      ) {
        breakdown[propName] += balanceNum;

        if (!breakdown.byAccount[category]) {
          breakdown.byAccount[category] = [];
        }
        breakdown.byAccount[category].push({
          name: name,
          balance: balanceNum,
        });
      }
    }
  });

  // Calculate total (cash + investments + deposits - debt)
  breakdown.total =
    breakdown.cash +
    breakdown.investments +
    breakdown.deposits -
    breakdown.debt;

  return breakdown;
};
