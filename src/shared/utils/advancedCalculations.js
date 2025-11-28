/**
 * Advanced Financial Calculations
 * Comprehensive utility functions for new features
 */

/**
 * Investment Performance Analysis
 */
export const calculateInvestmentPerformance = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      realizedProfits: 0,
      realizedLosses: 0,
      netProfitLoss: 0,
      brokerageFees: 0,
      netReturn: 0,
      returnPercentage: 0,
      transactions: [],
    };
  }

  const investmentCategories = new Set([
    "Investment Charges & Loss",
    "Investment Income",
    "Invest",
    "Grow Stocks",
  ]);

  const investmentAccounts = new Set(["Grow Stocks", "Zerodha", "Upstox"]);

  const invTransactions = transactions.filter(
    (t) =>
      investmentCategories.has(t.category) ||
      investmentAccounts.has(t.account) ||
      (t.subcategory &&
        (t.subcategory.includes("Stock") ||
          t.subcategory.includes("F&O") ||
          t.subcategory.includes("Brokerage")))
  );

  let totalDeposits = 0;
  let totalWithdrawals = 0;
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
      totalDeposits += amount;
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

  const netProfitLoss = realizedProfits - realizedLosses - brokerageFees;
  const netReturn = netProfitLoss;
  const returnPercentage =
    totalDeposits > 0 ? (netReturn / totalDeposits) * 100 : 0;

  return {
    totalDeposits,
    totalWithdrawals,
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

/**
 * Tax Planning Calculations
 */
export const calculateTaxPlanning = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      salaryIncome: 0,
      otherIncome: 0,
      section80CInvestments: 0,
      hraExemption: 0,
      professionalTax: 0,
      taxableIncome: 0,
      estimatedTax: 0,
      deductions: [],
      recommendations: [],
    };
  }

  // Calculate total income
  const incomeTransactions = transactions.filter((t) => t.type === "Income");
  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const salaryIncome = incomeTransactions
    .filter(
      (t) => t.category === "Employment Income" && t.subcategory === "Salary"
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const bonusIncome = incomeTransactions
    .filter((t) => t.subcategory === "Bonuses")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const otherIncome = totalIncome - salaryIncome - bonusIncome;

  // Calculate HRA (House Rent Allowance) exemption
  const rentPaid = transactions
    .filter((t) => t.type === "Expense" && t.subcategory === "Rent")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // Simplified HRA calculation (actual formula is complex)
  const hraExemption = Math.min(rentPaid * 0.9, salaryIncome * 0.4);

  // 80C investments (PPF, ELSS, LIC, etc.)
  const section80CInvestments = transactions
    .filter(
      (t) =>
        (t.type === "Expense" || t.type === "Transfer-Out") &&
        (t.category?.includes("Insurance") ||
          t.subcategory?.includes("PPF") ||
          t.subcategory?.includes("ELSS") ||
          t.subcategory?.includes("LIC") ||
          t.subcategory?.includes("Tax Saver"))
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const section80CLimit = 150000; // ₹1.5 lakh limit
  const section80CDeduction = Math.min(section80CInvestments, section80CLimit);

  // Professional Tax (usually fixed per state)
  const professionalTax = 2400; // Standard PT for most states

  // Calculate taxable income
  const standardDeduction = 50000; // Standard deduction for salaried
  const taxableIncome = Math.max(
    0,
    totalIncome -
      standardDeduction -
      section80CDeduction -
      hraExemption -
      professionalTax
  );

  // Estimate tax (New Tax Regime FY 2025-26)
  let estimatedTax = 0;
  if (taxableIncome > 300000) {
    estimatedTax += (Math.min(taxableIncome, 600000) - 300000) * 0.05;
  }
  if (taxableIncome > 600000) {
    estimatedTax += (Math.min(taxableIncome, 900000) - 600000) * 0.1;
  }
  if (taxableIncome > 900000) {
    estimatedTax += (Math.min(taxableIncome, 1200000) - 900000) * 0.15;
  }
  if (taxableIncome > 1200000) {
    estimatedTax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.2;
  }
  if (taxableIncome > 1500000) {
    estimatedTax += (taxableIncome - 1500000) * 0.3;
  }

  const deductions = [
    { name: "Standard Deduction", amount: standardDeduction, utilized: true },
    {
      name: "80C Investments",
      amount: section80CDeduction,
      limit: section80CLimit,
      utilized: section80CInvestments > 0,
      remaining: section80CLimit - section80CInvestments,
    },
    { name: "HRA Exemption", amount: hraExemption, utilized: rentPaid > 0 },
    { name: "Professional Tax", amount: professionalTax, utilized: true },
  ];

  const recommendations = [];
  if (section80CInvestments < section80CLimit) {
    recommendations.push({
      type: "tax_saving",
      title: "Maximize 80C Deduction",
      message: `You can save ₹${(section80CLimit - section80CInvestments).toLocaleString()} more in 80C investments to save tax of ₹${((section80CLimit - section80CInvestments) * 0.3).toLocaleString()}`,
      priority: "high",
    });
  }

  if (rentPaid === 0 && salaryIncome > 0) {
    recommendations.push({
      type: "tax_saving",
      title: "Claim HRA",
      message: "If you pay rent, claim HRA exemption to reduce taxable income",
      priority: "medium",
    });
  }

  return {
    totalIncome,
    salaryIncome,
    bonusIncome,
    otherIncome,
    section80CInvestments,
    section80CDeduction,
    hraExemption,
    professionalTax,
    standardDeduction,
    taxableIncome,
    estimatedTax,
    deductions,
    recommendations,
  };
};

/**
 * Family Expense Analysis
 */
export const calculateFamilyExpenses = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalFamilyExpense: 0,
      monthlyAverage: 0,
      breakdown: [],
      trends: [],
      topExpenses: [],
    };
  }

  const familyTransactions = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      (t.category === "Family" || t.subcategory?.includes("Family"))
  );

  const totalFamilyExpense = familyTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  // Monthly breakdown
  const monthlyData = {};
  familyTransactions.forEach((t) => {
    if (t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0, transactions: [] };
      }
      monthlyData[month].total += Math.abs(Number(t.amount) || 0);
      monthlyData[month].count++;
      monthlyData[month].transactions.push(t);
    }
  });

  const monthlyAverage =
    Object.keys(monthlyData).length > 0
      ? totalFamilyExpense / Object.keys(monthlyData).length
      : 0;

  // Subcategory breakdown
  const subcategoryBreakdown = {};
  familyTransactions.forEach((t) => {
    const subcat = t.subcategory || "Other";
    if (!subcategoryBreakdown[subcat]) {
      subcategoryBreakdown[subcat] = 0;
    }
    subcategoryBreakdown[subcat] += Math.abs(Number(t.amount) || 0);
  });

  const breakdown = Object.entries(subcategoryBreakdown)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage:
        totalFamilyExpense > 0 ? (amount / totalFamilyExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const trends = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topExpenses = familyTransactions
    .map((t) => ({
      date: t.date,
      amount: Math.abs(Number(t.amount) || 0),
      note: t.note,
      subcategory: t.subcategory,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  return {
    totalFamilyExpense,
    monthlyAverage,
    breakdown,
    trends,
    topExpenses,
  };
};

/**
 * Housing & Rent Analysis
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
        t.subcategory?.includes("Electricity"))
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
      type: t.subcategory,
      amount: Math.abs(Number(t.amount) || 0),
      note: t.note,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Monthly trends
  const monthlyData = {};
  housingTransactions.forEach((t) => {
    if (t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { rent: 0, utilities: 0, other: 0 };
      }
      const amount = Math.abs(Number(t.amount) || 0);
      if (t.subcategory === "Rent") {
        monthlyData[month].rent += amount;
      } else if (t.subcategory?.includes("Utilities")) {
        monthlyData[month].utilities += amount;
      } else {
        monthlyData[month].other += amount;
      }
    }
  });

  const trends = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      rent: data.rent,
      utilities: data.utilities,
      other: data.other,
      total: data.rent + data.utilities + data.other,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalHousing,
    totalRent,
    totalUtilities,
    monthlyRentAverage,
    rentPayments,
    utilities,
    trends,
  };
};

/**
 * Credit Card Analysis
 */
export const calculateCreditCardMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalCreditCardSpending: 0,
      totalCashback: 0,
      cardBreakdown: [],
      monthlySpending: [],
      categorySpending: [],
    };
  }

  // Identify credit card accounts
  const creditCardAccounts = [
    "Swiggy HDFC Credit Card",
    "Tata Neu Rupay HDFC Credit Card",
    "HDFC Credit Card",
  ];

  const cardTransactions = transactions.filter(
    (t) =>
      t.type === "Expense" &&
      creditCardAccounts.some((card) => t.account?.includes(card))
  );

  const totalCreditCardSpending = cardTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  // Calculate cashback
  const cashbackTransactions = transactions.filter(
    (t) =>
      t.category === "Refund & Cashbacks" ||
      t.subcategory?.includes("Cashback") ||
      t.category === "Cashback Shared"
  );

  const totalCashback = cashbackTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  // Card-wise breakdown
  const cardData = {};
  cardTransactions.forEach((t) => {
    const card = t.account;
    if (!cardData[card]) {
      cardData[card] = { total: 0, count: 0, categories: {} };
    }
    const amount = Math.abs(Number(t.amount) || 0);
    cardData[card].total += amount;
    cardData[card].count++;

    const category = t.category || "Other";
    if (!cardData[card].categories[category]) {
      cardData[card].categories[category] = 0;
    }
    cardData[card].categories[category] += amount;
  });

  const cardBreakdown = Object.entries(cardData)
    .map(([card, data]) => ({
      card,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
      topCategory: Object.entries(data.categories).sort(
        ([, a], [, b]) => b - a
      )[0],
    }))
    .sort((a, b) => b.total - a.total);

  // Monthly spending
  const monthlyData = {};
  cardTransactions.forEach((t) => {
    if (t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += Math.abs(Number(t.amount) || 0);
    }
  });

  const monthlySpending = Object.entries(monthlyData)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Category spending
  const categoryData = {};
  cardTransactions.forEach((t) => {
    const category = t.category || "Other";
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += Math.abs(Number(t.amount) || 0);
  });

  const categorySpending = Object.entries(categoryData)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalCreditCardSpending > 0
          ? (amount / totalCreditCardSpending) * 100
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalCreditCardSpending,
    totalCashback,
    cashbackRate:
      totalCreditCardSpending > 0
        ? (totalCashback / totalCreditCardSpending) * 100
        : 0,
    cardBreakdown,
    monthlySpending,
    categorySpending,
  };
};

/**
 * Food Spending Analysis
 */
export const calculateFoodMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalFoodSpending: 0,
      deliveryApps: 0,
      groceries: 0,
      officeCafeteria: 0,
      diningOut: 0,
      breakdown: [],
      dailyAverage: 0,
      monthlyTrends: [],
    };
  }

  const foodTransactions = transactions.filter(
    (t) => t.type === "Expense" && t.category === "Food & Dining"
  );

  const totalFoodSpending = foodTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  // Calculate subcategory totals
  const deliveryApps = foodTransactions
    .filter((t) => t.subcategory?.includes("Delivery Apps"))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const groceries = foodTransactions
    .filter((t) => t.subcategory === "Groceries")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const officeCafeteria = foodTransactions
    .filter((t) => t.subcategory === "Office Cafeteria")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const diningOut = foodTransactions
    .filter(
      (t) =>
        t.subcategory?.includes("Dinning Out") ||
        t.subcategory?.includes("Restaurants")
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // Breakdown by subcategory
  const subcategoryData = {};
  foodTransactions.forEach((t) => {
    const subcat = t.subcategory || "Other";
    if (!subcategoryData[subcat]) {
      subcategoryData[subcat] = { total: 0, count: 0 };
    }
    subcategoryData[subcat].total += Math.abs(Number(t.amount) || 0);
    subcategoryData[subcat].count++;
  });

  const breakdown = Object.entries(subcategoryData)
    .map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
      percentage:
        totalFoodSpending > 0 ? (data.total / totalFoodSpending) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Daily average
  const dateRange = foodTransactions.reduce(
    (range, t) => {
      const date = new Date(t.date);
      return {
        min: Math.min(date, range.min),
        max: Math.max(date, range.max),
      };
    },
    { min: new Date(), max: new Date(0) }
  );

  const daysDiff =
    Math.ceil((dateRange.max - dateRange.min) / (1000 * 60 * 60 * 24)) || 1;
  const dailyAverage = totalFoodSpending / daysDiff;

  // Monthly trends
  const monthlyData = {};
  foodTransactions.forEach((t) => {
    if (t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += Math.abs(Number(t.amount) || 0);
      monthlyData[month].count++;
    }
  });

  const monthlyTrends = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalFoodSpending,
    deliveryApps,
    groceries,
    officeCafeteria,
    diningOut,
    breakdown,
    dailyAverage,
    monthlyTrends,
  };
};

/**
 * Transportation/Commute Analysis
 */
export const calculateCommuteMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalTransportation: 0,
      dailyCommute: 0,
      intercityTravel: 0,
      dailyAverage: 0,
      monthlyTrends: [],
      breakdown: [],
    };
  }

  const transportTransactions = transactions.filter(
    (t) => t.type === "Expense" && t.category === "Transportation"
  );

  const totalTransportation = transportTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );

  const dailyCommute = transportTransactions
    .filter((t) => t.subcategory?.includes("Daily Commute"))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const intercityTravel = transportTransactions
    .filter((t) => t.subcategory?.includes("InterCity"))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // Calculate daily average for commute
  const commuteTransactions = transportTransactions.filter((t) =>
    t.subcategory?.includes("Daily Commute")
  );

  const dateRange = commuteTransactions.reduce(
    (range, t) => {
      const date = new Date(t.date);
      return {
        min: Math.min(date, range.min),
        max: Math.max(date, range.max),
      };
    },
    { min: new Date(), max: new Date(0) }
  );

  const daysDiff =
    Math.ceil((dateRange.max - dateRange.min) / (1000 * 60 * 60 * 24)) || 1;
  const dailyAverage = dailyCommute / daysDiff;

  // Monthly trends
  const monthlyData = {};
  transportTransactions.forEach((t) => {
    if (t.date) {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { dailyCommute: 0, intercity: 0, other: 0 };
      }
      const amount = Math.abs(Number(t.amount) || 0);
      if (t.subcategory?.includes("Daily Commute")) {
        monthlyData[month].dailyCommute += amount;
      } else if (t.subcategory?.includes("InterCity")) {
        monthlyData[month].intercity += amount;
      } else {
        monthlyData[month].other += amount;
      }
    }
  });

  const monthlyTrends = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      dailyCommute: data.dailyCommute,
      intercity: data.intercity,
      other: data.other,
      total: data.dailyCommute + data.intercity + data.other,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Subcategory breakdown
  const subcategoryData = {};
  transportTransactions.forEach((t) => {
    const subcat = t.subcategory || "Other";
    if (!subcategoryData[subcat]) {
      subcategoryData[subcat] = { total: 0, count: 0 };
    }
    subcategoryData[subcat].total += Math.abs(Number(t.amount) || 0);
    subcategoryData[subcat].count++;
  });

  const breakdown = Object.entries(subcategoryData)
    .map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
      percentage:
        totalTransportation > 0 ? (data.total / totalTransportation) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalTransportation,
    dailyCommute,
    intercityTravel,
    dailyAverage,
    monthlyTrends,
    breakdown,
  };
};
