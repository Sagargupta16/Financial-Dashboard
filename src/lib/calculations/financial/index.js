/**
 * Unified Financial Calculations
 * Single source of truth for all financial calculations
 * No duplicates - clean, simple, easy to maintain
 */

import {
  PERCENT,
  TAX_SLABS_NEW_REGIME,
  CESS_RATE,
  STANDARD_DEDUCTION,
  SECTION_80C_LIMIT,
  DEFAULT_PROFESSIONAL_TAX,
  HRA_METRO_PERCENT,
  INVESTMENT_CATEGORIES,
  INVESTMENT_ACCOUNTS,
  MEAL_VOUCHER_DAILY_LIMIT,
  DAYS_IN_YEAR,
} from "../../../constants";

import {
  calculateDateRange,
  calculateDailyAverage,
  calculateMonthlyAverage,
} from "../index";

// ============================================================================
// BASIC CALCULATIONS
// ============================================================================

// Re-export canonical implementations for external consumers
export {
  calculateDateRange,
  calculateDailyAverage,
  calculateMonthlyAverage,
  calculateAveragePerTransaction,
  calculateTotalIncome,
  calculateTotalExpense,
  calculateSavings,
  calculateSavingsRate,
  calculatePercentage,
  groupByCategory,
  getTopCategories,
} from "../index";

// ============================================================================
// INVESTMENT PERFORMANCE
// ============================================================================

/**
 * Calculate investment performance metrics
 */
export const calculateInvestmentPerformance = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalCapitalDeployed: 0,
      totalWithdrawals: 0,
      currentHoldings: 0,
      netInvestedCapital: 0,
      realizedProfits: 0,
      realizedLosses: 0,
      netProfitLoss: 0,
      brokerageFees: 0,
      netReturn: 0,
      returnPercentage: 0,
      transactions: [],
    };
  }

  const invTransactions = transactions.filter(
    (t) =>
      INVESTMENT_CATEGORIES.has(t.category) ||
      INVESTMENT_ACCOUNTS.has(t.account) ||
      (t.subcategory &&
        (t.subcategory.includes("Stock") ||
          t.subcategory.includes("F&O") ||
          t.subcategory.includes("Brokerage")))
  );

  let totalCapitalDeployed = 0; // Total money moved INTO investments
  let totalWithdrawals = 0; // Total money moved OUT of investments
  let realizedProfits = 0;
  let realizedLosses = 0;
  let brokerageFees = 0;

  const transactionDetails = invTransactions.map((t) => {
    const amount = Math.abs(Number(t.amount) || 0);
    const isProfit =
      t.subcategory?.includes("Profit") ||
      t.category === "Investment Income" ||
      t.type === "Income";
    const isLoss =
      t.subcategory?.includes("Loss") ||
      t.category === "Investment Charges & Loss";
    const isFee =
      t.subcategory?.includes("Brokerage") || t.subcategory?.includes("Fees");

    if (t.type === "Transfer-Out" && !isLoss && !isFee) {
      totalCapitalDeployed += amount;
    } else if (t.type === "Transfer-In" && !isProfit) {
      totalWithdrawals += amount;
    } else if (isProfit) {
      realizedProfits += amount;
    } else if (isLoss) {
      realizedLosses += amount;
    } else if (isFee) {
      brokerageFees += amount;
    }

    let transactionType = t.type;
    if (isProfit) {
      transactionType = "Profit";
    } else if (isLoss) {
      transactionType = "Loss";
    } else if (isFee) {
      transactionType = "Fee";
    }

    return {
      date: t.date,
      category: t.category,
      subcategory: t.subcategory,
      amount,
      type: transactionType,
      note: t.note,
    };
  });

  // Current Holdings = Capital Deployed - Withdrawals
  const currentHoldings = totalCapitalDeployed - totalWithdrawals;

  // Net Invested Capital = Current Holdings (still in market)
  const netInvestedCapital = currentHoldings;

  const netProfitLoss = realizedProfits - realizedLosses - brokerageFees;
  const netReturn = netProfitLoss;

  // Return % calculation - uses totalCapitalDeployed for accurate portfolio return
  // Formula: (Net Return / Total Capital Deployed) × 100
  // This represents total portfolio return including withdrawn capital
  // Fixed as per audit report recommendation (Issue #1 - MEDIUM Priority)
  const returnPercentage =
    totalCapitalDeployed > 0 ? (netReturn / totalCapitalDeployed) * PERCENT : 0;

  return {
    totalCapitalDeployed,
    totalWithdrawals,
    currentHoldings,
    netInvestedCapital,
    realizedProfits,
    realizedLosses,
    netProfitLoss,
    brokerageFees,
    netReturn,
    returnPercentage,
    transactions: transactionDetails.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    ),
  };
};

// ============================================================================
// TAX PLANNING
// ============================================================================

/**
 * Calculate gross salary from net (post-tax) salary
 * This function reverse-calculates the gross income needed to result in the given net income
 * after all deductions and taxes under the new tax regime.
 *
 * @param {number} netIncome - Post-tax income received
 * @param {number} professionalTax - Annual professional tax (default: ₹2,400)
 * @param {number} mealVoucherExemption - Annual meal voucher exemption (default: ₹18,250)
 * @returns {object} - { grossIncome, taxableIncome, estimatedTax, cess, totalTaxLiability }
 */
export const calculateGrossFromNet = (
  netIncome,
  professionalTax = DEFAULT_PROFESSIONAL_TAX,
  mealVoucherExemption = MEAL_VOUCHER_DAILY_LIMIT * DAYS_IN_YEAR
) => {
  // Start with an initial guess (net income is typically 70-90% of gross)
  let grossIncome = netIncome / 0.8; // Initial guess: net is 80% of gross
  let iterations = 0;
  const maxIterations = 50;
  const tolerance = 1; // ₹1 accuracy is sufficient

  // Newton-Raphson method to converge to correct gross income
  while (iterations < maxIterations) {
    // Calculate taxable income from current gross estimate
    const taxableIncome = Math.max(
      0,
      grossIncome - STANDARD_DEDUCTION - professionalTax - mealVoucherExemption
    );

    // Calculate tax on this taxable income
    let estimatedTax;
    if (taxableIncome <= TAX_SLABS_NEW_REGIME[0].max) {
      estimatedTax = 0;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[1].max) {
      estimatedTax =
        (taxableIncome - TAX_SLABS_NEW_REGIME[0].max) *
        TAX_SLABS_NEW_REGIME[1].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[2].max) {
      estimatedTax =
        20000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[1].max) *
          TAX_SLABS_NEW_REGIME[2].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[3].max) {
      estimatedTax =
        60000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[2].max) *
          TAX_SLABS_NEW_REGIME[3].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[4].max) {
      estimatedTax =
        120000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[3].max) *
          TAX_SLABS_NEW_REGIME[4].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[5].max) {
      estimatedTax =
        200000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[4].max) *
          TAX_SLABS_NEW_REGIME[5].rate;
    } else {
      estimatedTax =
        300000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[5].max) *
          TAX_SLABS_NEW_REGIME[6].rate;
    }

    const cess = estimatedTax * CESS_RATE;
    const totalTaxLiability = estimatedTax + cess + professionalTax;

    // Calculate net income from this gross
    const calculatedNet = grossIncome - totalTaxLiability;

    // Check if we're close enough
    const error = calculatedNet - netIncome;
    if (Math.abs(error) < tolerance) {
      return {
        grossIncome: Math.round(grossIncome),
        taxableIncome: Math.round(taxableIncome),
        estimatedTax: Math.round(estimatedTax),
        cess: Math.round(cess),
        totalTaxLiability: Math.round(totalTaxLiability),
        netIncome: Math.round(calculatedNet),
        standardDeduction: STANDARD_DEDUCTION,
        professionalTax,
        mealVoucherExemption,
      };
    }

    // Adjust gross income estimate
    // If calculated net is too high, increase gross (need to pay more tax)
    // If calculated net is too low, decrease gross (paying too much tax)
    grossIncome += error;

    iterations++;
  }

  // Return best estimate if didn't converge
  const taxableIncome = Math.max(
    0,
    grossIncome - STANDARD_DEDUCTION - professionalTax - mealVoucherExemption
  );
  let estimatedTax = 0;
  if (taxableIncome > TAX_SLABS_NEW_REGIME[0].max) {
    if (taxableIncome <= TAX_SLABS_NEW_REGIME[1].max) {
      estimatedTax =
        (taxableIncome - TAX_SLABS_NEW_REGIME[0].max) *
        TAX_SLABS_NEW_REGIME[1].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[2].max) {
      estimatedTax =
        20000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[1].max) *
          TAX_SLABS_NEW_REGIME[2].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[3].max) {
      estimatedTax =
        60000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[2].max) *
          TAX_SLABS_NEW_REGIME[3].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[4].max) {
      estimatedTax =
        120000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[3].max) *
          TAX_SLABS_NEW_REGIME[4].rate;
    } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[5].max) {
      estimatedTax =
        200000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[4].max) *
          TAX_SLABS_NEW_REGIME[5].rate;
    } else {
      estimatedTax =
        300000 +
        (taxableIncome - TAX_SLABS_NEW_REGIME[5].max) *
          TAX_SLABS_NEW_REGIME[6].rate;
    }
  }
  const cess = estimatedTax * CESS_RATE;

  return {
    grossIncome: Math.round(grossIncome),
    taxableIncome: Math.round(taxableIncome),
    estimatedTax: Math.round(estimatedTax),
    cess: Math.round(cess),
    totalTaxLiability: Math.round(estimatedTax + cess + professionalTax),
    netIncome,
    standardDeduction: STANDARD_DEDUCTION,
    professionalTax,
    mealVoucherExemption,
    note: "Estimation did not fully converge after 50 iterations",
  };
};

/**
 * Calculate tax planning metrics with financial year breakdown
 */
export const calculateTaxPlanning = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      overall: getDefaultTaxPlanningData(),
      byFinancialYear: {},
      availableYears: [],
    };
  }

  const { getAllFinancialYears, getFinancialYear } = require("../../data");
  const availableYears = getAllFinancialYears(transactions);

  // Group transactions by financial year
  const transactionsByFY = {};
  availableYears.forEach((fy) => {
    transactionsByFY[fy] = transactions.filter(
      (t) => getFinancialYear(t.date) === fy
    );
  });

  // Calculate tax planning for each FY
  const byFinancialYear = {};
  availableYears.forEach((fy) => {
    byFinancialYear[fy] = calculateTaxPlanningForYear(transactionsByFY[fy]);
  });

  // Calculate overall (all years combined)
  const overall = calculateTaxPlanningForYear(transactions);

  return {
    overall,
    byFinancialYear,
    availableYears,
  };
};

/**
 * Helper: Get default tax planning data structure
 */
const getDefaultTaxPlanningData = () => ({
  totalIncome: 0,
  salaryIncome: 0,
  bonusIncome: 0,
  rsuIncome: 0,
  otherIncome: 0,
  section80CInvestments: 0,
  section80CDeduction: 0,
  hraExemption: 0,
  professionalTax: 0,
  epfDeduction: 0,
  mealVoucherExemption: 0,
  standardDeduction: 0,
  taxableIncome: 0,
  estimatedTax: 0,
  cess: 0,
  totalTaxLiability: 0,
  deductions: [],
  recommendations: [],
  taxRegime: "new",
});

/**
 * Calculate tax planning for a specific set of transactions (one FY)
 */
const calculateTaxPlanningForYear = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      salaryIncome: 0,
      bonusIncome: 0,
      rsuIncome: 0,
      otherIncome: 0,
      section80CInvestments: 0,
      section80CDeduction: 0,
      hraExemption: 0,
      professionalTax: 0,
      epfDeduction: 0,
      mealVoucherExemption: 0,
      standardDeduction: 75000,
      taxableIncome: 0,
      estimatedTax: 0,
      cess: 0,
      totalTaxLiability: 0,
      deductions: [],
      recommendations: [],
      taxRegime: "new",
    };
  }

  // Calculate total income by category
  const incomeTransactions = transactions.filter((t) => t.type === "Income");

  const salaryIncome = incomeTransactions
    .filter(
      (t) =>
        t.category === "Employment Income" &&
        (t.subcategory === "Salary" || t.subcategory === "Base Salary")
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const bonusIncome = incomeTransactions
    .filter(
      (t) =>
        t.subcategory === "Bonuses" ||
        t.subcategory === "Bonus" ||
        t.subcategory === "Joining Bonus" ||
        t.note?.toLowerCase().includes("bonus")
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const rsuIncome = incomeTransactions
    .filter(
      (t) =>
        t.subcategory?.includes("RSU") ||
        t.subcategory?.includes("Stock") ||
        t.note?.toLowerCase().includes("rsu") ||
        t.note?.toLowerCase().includes("esop")
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const otherIncome = totalIncome - salaryIncome - bonusIncome - rsuIncome;

  // Calculate HRA exemption (actual rent paid)
  const rentPaid = transactions
    .filter(
      (t) =>
        t.type === "Expense" &&
        (t.subcategory === "Rent" || t.category === "Rent")
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // Calculate actual HRA received from employer
  const actualHRAReceived = transactions
    .filter(
      (t) =>
        t.type === "Income" &&
        (t.subcategory?.includes("HRA") ||
          t.subcategory?.includes("House Rent Allowance") ||
          t.note?.toLowerCase().includes("hra") ||
          t.note?.toLowerCase().includes("house rent allowance"))
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // HRA exemption per Income Tax Act Section 10(13A)
  // Exempt amount = Minimum of:
  // 1. Actual HRA received
  // 2. Rent paid minus 10% of salary
  // 3. 50% of salary (metro) or 40% (non-metro)
  // Fixed as per audit report recommendation (Issue #2 - LOW Priority)
  const hraExemption = Math.min(
    actualHRAReceived,
    Math.max(0, rentPaid - salaryIncome * 0.1),
    salaryIncome * HRA_METRO_PERCENT
  );

  // 80C investments (PPF, ELSS, LIC, etc.)
  const section80CCategories = ["PPF", "ELSS", "LIC", "Tax Saving FD", "EPF"];
  const section80CInvestments = transactions
    .filter(
      (t) =>
        t.type === "Expense" &&
        (section80CCategories.some((cat) => t.subcategory?.includes(cat)) ||
          t.category === "Tax Saving Investments")
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const section80CLimit = SECTION_80C_LIMIT;
  const section80CDeduction = Math.min(section80CInvestments, section80CLimit);

  // EPF deduction (employee contribution)
  const epfDeduction = transactions
    .filter(
      (t) =>
        t.type === "Expense" &&
        (t.subcategory?.includes("EPF") ||
          t.note?.toLowerCase().includes("epf"))
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // Professional tax (actual paid or estimated)
  const professionalTax =
    transactions
      .filter(
        (t) =>
          t.subcategory?.includes("Professional Tax") ||
          t.note?.toLowerCase().includes("professional tax")
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0) ||
    DEFAULT_PROFESSIONAL_TAX;

  // Meal Voucher exemption (₹50/day tax-free)
  const mealVoucherTransactions = transactions.filter(
    (t) =>
      t.subcategory?.includes("Meal") ||
      t.subcategory?.includes("Food Card") ||
      t.note?.toLowerCase().includes("sodexo") ||
      t.note?.toLowerCase().includes("meal voucher")
  );
  const mealVoucherExemption = Math.min(
    mealVoucherTransactions.reduce(
      (sum, t) => sum + Math.abs(Number(t.amount) || 0),
      0
    ),
    MEAL_VOUCHER_DAILY_LIMIT * DAYS_IN_YEAR
  );

  // Standard Deduction (fixed amount)
  const standardDeduction = STANDARD_DEDUCTION;

  // Calculate taxable income (new regime)
  const taxableIncome = Math.max(
    0,
    totalIncome - standardDeduction - professionalTax - mealVoucherExemption
  );

  // Calculate estimated tax based on new regime slabs
  let estimatedTax = 0;
  // Use tax slab constants
  if (taxableIncome <= TAX_SLABS_NEW_REGIME[0].max) {
    // ₹0 - ₹4,00,000: 0%
    // estimatedTax is already 0
  } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[1].max) {
    // ₹4,00,000 - ₹8,00,000: 5%
    estimatedTax =
      (taxableIncome - TAX_SLABS_NEW_REGIME[0].max) *
      TAX_SLABS_NEW_REGIME[1].rate;
  } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[2].max) {
    // ₹8,00,000 - ₹12,00,000: 10%
    estimatedTax =
      20000 +
      (taxableIncome - TAX_SLABS_NEW_REGIME[1].max) *
        TAX_SLABS_NEW_REGIME[2].rate;
  } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[3].max) {
    // ₹12,00,000 - ₹16,00,000: 15%
    estimatedTax =
      60000 +
      (taxableIncome - TAX_SLABS_NEW_REGIME[2].max) *
        TAX_SLABS_NEW_REGIME[3].rate;
  } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[4].max) {
    // ₹16,00,000 - ₹20,00,000: 20%
    estimatedTax =
      120000 +
      (taxableIncome - TAX_SLABS_NEW_REGIME[3].max) *
        TAX_SLABS_NEW_REGIME[4].rate;
  } else if (taxableIncome <= TAX_SLABS_NEW_REGIME[5].max) {
    // ₹20,00,000 - ₹24,00,000: 25%
    estimatedTax =
      200000 +
      (taxableIncome - TAX_SLABS_NEW_REGIME[4].max) *
        TAX_SLABS_NEW_REGIME[5].rate;
  } else {
    // Above ₹24,00,000: 30%
    estimatedTax =
      300000 +
      (taxableIncome - TAX_SLABS_NEW_REGIME[5].max) *
        TAX_SLABS_NEW_REGIME[6].rate;
  }

  // Add 4% Health and Education Cess
  const cess = estimatedTax * CESS_RATE;
  const totalTaxLiability = estimatedTax + cess + professionalTax;

  // Calculate net income (post-tax) from gross income
  const netIncome = totalIncome - totalTaxLiability;

  // Also calculate reverse: what gross income would result in this net income
  // This helps users understand their actual pre-tax salary if they only know post-tax
  const reverseCalculation = calculateGrossFromNet(
    totalIncome, // Assuming current income is NET (post-tax)
    professionalTax,
    mealVoucherExemption
  );

  const deductions = [
    {
      name: "Standard Deduction",
      amount: standardDeduction,
      limit: 75000,
      used: standardDeduction,
    },
    {
      name: "Professional Tax",
      amount: professionalTax,
      limit: 2400,
      used: professionalTax,
    },
    {
      name: "Meal Voucher (Tax-Free)",
      amount: mealVoucherExemption,
      limit: mealVoucherExemption,
      used: mealVoucherExemption,
    },
  ];

  // Note: NEW regime doesn't allow 80C and HRA deductions
  // But we track them for comparison
  if (section80CInvestments > 0) {
    deductions.push({
      name: "Section 80C (Not applicable in New Regime)",
      amount: 0,
      limit: section80CLimit,
      used: section80CInvestments,
      note: "Switch to Old Regime to claim",
    });
  }

  if (hraExemption > 0) {
    deductions.push({
      name: "HRA (Not applicable in New Regime)",
      amount: 0,
      limit: rentPaid,
      used: rentPaid,
      note: "Switch to Old Regime to claim",
    });
  }

  const recommendations = [];

  // Recommendation: Consider Old Regime if 80C + HRA > benefit from higher slabs
  const potentialOldRegimeDeduction = section80CDeduction + hraExemption;
  if (potentialOldRegimeDeduction > 100000) {
    recommendations.push({
      priority: "high",
      message: `You have ₹${potentialOldRegimeDeduction.toLocaleString()} in 80C + HRA. Consider comparing with Old Regime.`,
      action: "Compare tax regimes",
    });
  }

  // Recommendation: Maximize 80C if not done
  if (section80CInvestments < section80CLimit) {
    const remaining = section80CLimit - section80CInvestments;
    recommendations.push({
      priority: "medium",
      message: `You can invest ₹${remaining.toLocaleString()} more in 80C to maximize deductions (if using Old Regime).`,
      action: "Invest in ELSS/PPF/Tax-saving FD",
    });
  }

  // Recommendation: Track meal vouchers
  if (mealVoucherExemption === 0) {
    recommendations.push({
      priority: "low",
      message:
        "Consider opting for meal vouchers from employer (up to ₹50/day tax-free).",
      action: "Check with HR for meal voucher option",
    });
  }

  return {
    totalIncome,
    netIncome,
    reverseCalculation, // Gross income if totalIncome is treated as net (post-tax)
    salaryIncome,
    bonusIncome,
    rsuIncome,
    otherIncome,
    section80CInvestments,
    section80CDeduction,
    hraExemption,
    professionalTax,
    epfDeduction,
    mealVoucherExemption,
    standardDeduction,
    taxableIncome,
    estimatedTax,
    cess,
    totalTaxLiability,
    deductions,
    recommendations,
    taxRegime: "new",
  };
};

// ============================================================================
// FAMILY & HOUSING
// ============================================================================

/**
 * Calculate family expense metrics
 */
export const calculateFamilyExpenses = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalFamilyExpense: 0,
      monthlyAverage: 0,
      breakdown: [],
      topExpenses: [],
      bySubcategory: {},
      insights: [],
    };
  }

  const familyTransactions = transactions.filter(
    (t) => t.type === "Expense" && t.category === "Family"
  );

  const totalFamilyExpense = familyTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const dateRange = calculateDateRange(familyTransactions);
  const monthlyAverage = calculateMonthlyAverage(
    totalFamilyExpense,
    dateRange.days
  );

  // Group by subcategory
  const bySubcategory = familyTransactions.reduce((acc, t) => {
    const sub = t.subcategory || "Other";
    if (!acc[sub]) {
      acc[sub] = { total: 0, count: 0, transactions: [] };
    }
    acc[sub].total += Math.abs(Number(t.amount) || 0);
    acc[sub].count++;
    acc[sub].transactions.push(t);
    return acc;
  }, {});

  // Create breakdown array for charts
  const breakdown = Object.entries(bySubcategory).map(([name, data]) => ({
    name,
    total: data.total,
    amount: data.total,
    count: data.count,
    average: data.count > 0 ? data.total / data.count : 0,
    percentage:
      totalFamilyExpense > 0 ? (data.total / totalFamilyExpense) * PERCENT : 0,
  }));

  // Get top expenses
  const topExpenses = familyTransactions
    .map((t) => ({
      date: t.date,
      subcategory: t.subcategory || "Other",
      amount: Math.abs(Number(t.amount) || 0),
      note: t.note,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const insights = [];
  const sortedBreakdown = [...breakdown].sort((a, b) => b.amount - a.amount);
  const topSubcategory = sortedBreakdown[0];

  if (topSubcategory) {
    insights.push({
      title: "Top Family Expense",
      message: `${topSubcategory.name}: ₹${topSubcategory.amount.toLocaleString()}`,
      priority: "info",
    });
  }

  return {
    totalFamilyExpense,
    monthlyAverage,
    breakdown,
    topExpenses,
    bySubcategory,
    insights,
  };
};

/**
 * Calculate housing expense metrics
 */
export const calculateHousingExpenses = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalHousing: 0,
      totalRent: 0,
      totalUtilities: 0,
      monthlyRentAverage: 0,
      rentPayments: [],
      utilities: [],
      trends: [],
      hraEligible: 0,
    };
  }

  const housingTransactions = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      (t.category === "Housing" || t.subcategory === "Rent")
  );

  const totalHousing = housingTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const rentTransactions = housingTransactions.filter(
    (t) => t.subcategory === "Rent"
  );

  const totalRent = rentTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const utilityTransactions = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      (t.subcategory?.includes("Utilities") ||
        t.subcategory?.includes("Electricity") ||
        t.subcategory?.includes("Water") ||
        t.subcategory?.includes("Gas"))
  );

  const totalUtilities = utilityTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const monthlyRentAverage =
    rentTransactions.length > 0 ? totalRent / rentTransactions.length : 0;

  const rentPayments = rentTransactions
    .map((t) => ({
      date: t.date,
      amount: Math.abs(Number(t.amount) || 0),
      note: t.note,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const utilities = utilityTransactions
    .map((t) => ({
      date: t.date,
      subcategory: t.subcategory || "Utility",
      amount: Math.abs(Number(t.amount) || 0),
      note: t.note,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate monthly trends
  const monthlyData = {};
  rentTransactions.forEach((t) => {
    const month = new Date(t.date).toISOString().slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { rent: 0, utilities: 0 };
    }
    monthlyData[month].rent += Math.abs(Number(t.amount) || 0);
  });

  utilityTransactions.forEach((t) => {
    const month = new Date(t.date).toISOString().slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { rent: 0, utilities: 0 };
    }
    monthlyData[month].utilities += Math.abs(Number(t.amount) || 0);
  });

  const trends = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      rent: data.rent,
      utilities: data.utilities,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const hraEligible = Math.min(totalRent * 0.9, totalRent);

  return {
    totalHousing,
    totalRent,
    totalUtilities,
    monthlyRentAverage,
    rentPayments,
    utilities,
    trends,
    hraEligible,
  };
};

// ============================================================================
// CREDIT CARDS & FOOD
// ============================================================================

/**
 * Calculate credit card metrics
 */
export const calculateCreditCardMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalSpending: 0,
      totalCashback: 0,
      totalCreditCardSpending: 0,
      cashbackRate: 0,
      byCard: {},
      cardBreakdown: [],
      insights: [],
    };
  }

  const cardAccounts = transactions
    .filter((t) => t.account?.toLowerCase().includes("credit"))
    .map((t) => t.account);

  const uniqueCards = [...new Set(cardAccounts)];

  const byCard = uniqueCards.reduce((acc, card) => {
    const cardTransactions = transactions.filter((t) => t.account === card);
    const expenseTransactions = cardTransactions.filter(
      (t) => t.type === "Expense"
    );

    const spending = expenseTransactions.reduce(
      (sum, t) => sum + Math.abs(Number(t.amount) || 0),
      0
    );

    const cashback = cardTransactions
      .filter(
        (t) =>
          t.subcategory?.includes("Cashback") ||
          t.subcategory?.includes("Reward")
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    // Calculate top category for this card
    const categoryTotals = expenseTransactions.reduce((cats, t) => {
      const cat = t.category || "Other";
      cats[cat] = (cats[cat] || 0) + Math.abs(Number(t.amount) || 0);
      return cats;
    }, {});

    const topCategoryEntry = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    )[0];

    const topCategory = topCategoryEntry || ["Other", 0];

    acc[card] = {
      spending,
      cashback,
      transactionCount: expenseTransactions.length,
      average:
        expenseTransactions.length > 0
          ? spending / expenseTransactions.length
          : 0,
      topCategory,
    };
    return acc;
  }, {});

  // Create breakdown array for charts
  const cardBreakdown = Object.entries(byCard).map(([card, data]) => ({
    card,
    total: data.spending || 0,
    cashback: data.cashback || 0,
    count: data.transactionCount || 0,
    average: data.average || 0,
    topCategory: data.topCategory || ["Other", 0],
  }));

  const totalSpending = Object.values(byCard).reduce(
    (sum, card) => sum + card.spending,
    0
  );
  const totalCashback = Object.values(byCard).reduce(
    (sum, card) => sum + card.cashback,
    0
  );

  const totalCreditCardSpending = totalSpending;
  const cashbackRate =
    totalSpending > 0 ? (totalCashback / totalSpending) * PERCENT : 0;

  const insights = [];
  if (totalCashback > 0) {
    insights.push({
      title: "Cashback Earned",
      message: `₹${totalCashback.toLocaleString()} earned (${cashbackRate.toFixed(2)}% back)`,
      priority: "positive",
    });
  }

  return {
    totalSpending,
    totalCashback,
    totalCreditCardSpending,
    cashbackRate,
    byCard,
    cardBreakdown,
    insights,
  };
};

/**
 * Calculate food expense metrics
 */
export const calculateFoodMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalFood: 0,
      totalFoodSpending: 0,
      monthlyAverage: 0,
      dailyAverage: 0,
      deliveryApps: 0,
      groceries: 0,
      diningOut: 0,
      officeCafeteria: 0,
      bySubcategory: {},
      breakdown: [],
      monthlyTrends: [],
      insights: [],
    };
  }

  const foodTransactions = transactions.filter((t) => {
    if (t.type !== "Expense") {
      return false;
    }
    const category = (t.category || "").toLowerCase();
    return category.includes("food") || category.includes("drink");
  });

  const totalFood = foodTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const dateRange = calculateDateRange(foodTransactions);
  const monthlyAverage = calculateMonthlyAverage(totalFood, dateRange.days);
  const dailyAverage = calculateDailyAverage(totalFood, dateRange.days);

  const bySubcategory = foodTransactions.reduce((acc, t) => {
    const sub = t.subcategory || t.Subcategory || "Other";
    if (!acc[sub]) {
      acc[sub] = { total: 0, count: 0 };
    }
    acc[sub].total += Math.abs(Number(t.amount) || 0);
    acc[sub].count++;
    return acc;
  }, {});

  // Extract specific categories with case-insensitive matching
  let deliveryApps = 0;
  let groceries = 0;
  let diningOut = 0;
  let officeCafeteria = 0;

  Object.entries(bySubcategory).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("delivery") ||
      lowerKey.includes("swiggy") ||
      lowerKey.includes("zomato")
    ) {
      deliveryApps += value.total;
    }
    if (lowerKey.includes("grocer") || lowerKey.includes("supermarket")) {
      groceries += value.total;
    }
    if (lowerKey.includes("dining") || lowerKey.includes("restaurant")) {
      diningOut += value.total;
    }
    if (lowerKey.includes("cafeteria") || lowerKey.includes("canteen")) {
      officeCafeteria += value.total;
    }
  });

  // Create breakdown array for charts
  const breakdown = Object.entries(bySubcategory).map(([name, data]) => ({
    name,
    amount: data.total,
    total: data.total,
    count: data.count,
  }));

  // Calculate monthly trends
  const monthlyData = {};
  foodTransactions.forEach((t) => {
    const month = new Date(t.date).toISOString().slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, count: 0 };
    }
    monthlyData[month].total += Math.abs(Number(t.amount) || 0);
    monthlyData[month].count++;
  });

  const monthlyTrends = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const insights = [];
  const sortedBreakdown = [...breakdown].sort((a, b) => b.amount - a.amount);
  const topSubcategory = sortedBreakdown[0];

  if (topSubcategory) {
    insights.push({
      title: "Top Food Category",
      message: `${topSubcategory.name}: ₹${topSubcategory.amount.toLocaleString()}`,
      priority: "info",
    });
  }

  return {
    totalFood,
    totalFoodSpending: totalFood,
    monthlyAverage,
    dailyAverage,
    deliveryApps,
    groceries,
    diningOut,
    officeCafeteria,
    bySubcategory,
    breakdown,
    monthlyTrends,
    insights,
  };
};

/**
 * Calculate commute expense metrics
 */
export const calculateCommuteMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalCommute: 0,
      totalTransportation: 0,
      monthlyAverage: 0,
      dailyAverage: 0,
      dailyCommute: 0,
      intercityTravel: 0,
      byMode: {},
      breakdown: [],
      insights: [],
    };
  }

  const commuteTransactions = transactions.filter((t) => {
    if (t.type !== "Expense") {
      return false;
    }
    const category = (t.category || "").toLowerCase();
    return (
      category.includes("transport") ||
      category.includes("commute") ||
      category.includes("travel")
    );
  });

  const totalCommute = commuteTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const dateRange = calculateDateRange(commuteTransactions);
  const monthlyAverage = calculateMonthlyAverage(totalCommute, dateRange.days);
  const dailyAverage = calculateDailyAverage(totalCommute, dateRange.days);

  const byMode = commuteTransactions.reduce((acc, t) => {
    const mode = t.subcategory || t.Subcategory || "Other";
    if (!acc[mode]) {
      acc[mode] = { total: 0, count: 0 };
    }
    acc[mode].total += Math.abs(Number(t.amount) || 0);
    acc[mode].count++;
    return acc;
  }, {});

  // Extract specific categories with case-insensitive matching
  let dailyCommute = 0;
  let intercityTravel = 0;

  Object.entries(byMode).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("daily") ||
      lowerKey.includes("auto") ||
      lowerKey.includes("metro") ||
      lowerKey.includes("bus") ||
      lowerKey.includes("cab") ||
      lowerKey.includes("taxi") ||
      lowerKey.includes("uber") ||
      lowerKey.includes("ola")
    ) {
      dailyCommute += value.total;
    }
    if (
      lowerKey.includes("intercity") ||
      lowerKey.includes("train") ||
      lowerKey.includes("flight") ||
      lowerKey.includes("railway")
    ) {
      intercityTravel += value.total;
    }
  });

  // Create breakdown array for charts
  const breakdown = Object.entries(byMode).map(([name, data]) => ({
    name,
    total: data.total,
    amount: data.total,
    count: data.count,
    average: data.count > 0 ? data.total / data.count : 0,
    percentage: totalCommute > 0 ? (data.total / totalCommute) * PERCENT : 0,
  }));

  const insights = [];
  const sortedBreakdown = [...breakdown].sort((a, b) => b.amount - a.amount);
  const topMode = sortedBreakdown[0];

  if (topMode) {
    insights.push({
      title: "Primary Transport Mode",
      message: `${topMode.name}: ₹${topMode.amount.toLocaleString()}`,
      priority: "info",
    });
  }

  return {
    totalCommute,
    totalTransportation: totalCommute,
    monthlyAverage,
    dailyAverage,
    dailyCommute,
    intercityTravel,
    byMode,
    breakdown,
    insights,
  };
};

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

/**
 * Format number with decimals
 */
export const formatNumber = (number, decimals = 2) => {
  return number.toFixed(decimals);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};
