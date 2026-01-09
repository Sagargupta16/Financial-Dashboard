/**
 * Tax Planning Business Logic
 * Extracted from TaxPlanningDashboard component
 */

import type { TaxProjection, Transaction } from "../../types";

/**
 * Calculate projected tax liability for the financial year
 * Based on current income trends and remaining months
 */
export const calculateProjectedTax = (
  transactions: Transaction[],
  totalIncome: number,
  standardDeduction: number,
  totalTaxLiability: number
): TaxProjection | null => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  // Financial year runs April-March, so April = 0 months into FY
  const fyMonth = currentMonth >= 3 ? currentMonth - 3 : currentMonth + 9;
  const monthsRemaining = Math.max(0, 11 - fyMonth);

  if (monthsRemaining === 0) {
    return null;
  }

  // Look at last 3 months of salary data
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentSalaryTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);
    return (
      t.type === "Income" &&
      t.category === "Employment Income" &&
      (t.subcategory === "Salary" || t.subcategory === "Base Salary") &&
      txDate >= threeMonthsAgo &&
      txDate <= now
    );
  });

  if (recentSalaryTransactions.length === 0) {
    return null;
  }

  const totalRecentSalary = recentSalaryTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );
  const avgMonthlySalary = totalRecentSalary / recentSalaryTransactions.length;
  const projectedAnnualSalary = totalIncome + avgMonthlySalary * monthsRemaining;

  // Calculate projected taxable income
  const projectedTaxableIncome = Math.max(
    0,
    projectedAnnualSalary - standardDeduction - 2400 // Professional tax
  );

  // Calculate tax using new regime slabs (FY 2025-26)
  let projectedTax = 0;
  if (projectedTaxableIncome > 400000) {
    if (projectedTaxableIncome <= 800000) {
      // 5% on 4L-8L
      projectedTax = (projectedTaxableIncome - 400000) * 0.05;
    } else if (projectedTaxableIncome <= 1200000) {
      // 5% on 4L-8L + 10% on 8L-12L
      projectedTax = 20000 + (projectedTaxableIncome - 800000) * 0.1;
    } else if (projectedTaxableIncome <= 1600000) {
      // Above + 15% on 12L-16L
      projectedTax = 60000 + (projectedTaxableIncome - 1200000) * 0.15;
    } else if (projectedTaxableIncome <= 2000000) {
      // Above + 20% on 16L-20L
      projectedTax = 120000 + (projectedTaxableIncome - 1600000) * 0.2;
    } else if (projectedTaxableIncome <= 2400000) {
      // Above + 25% on 20L-24L
      projectedTax = 200000 + (projectedTaxableIncome - 2000000) * 0.25;
    } else {
      // Above + 30% on >24L
      projectedTax = 300000 + (projectedTaxableIncome - 2400000) * 0.3;
    }
  }

  const projectedCess = projectedTax * 0.04; // 4% health & education cess
  const projectedTotalTax = projectedTax + projectedCess;
  const additionalTaxLiability = projectedTotalTax - totalTaxLiability;

  return {
    avgMonthlySalary,
    monthsRemaining,
    projectedAnnualSalary,
    projectedTaxableIncome,
    projectedTotalTax,
    additionalTaxLiability,
    currentTax: totalTaxLiability,
  };
};

/**
 * Calculate tax for a given taxable income
 * Based on new tax regime slabs (FY 2025-26)
 */
export const calculateTaxForIncome = (taxableIncome: number): number => {
  if (taxableIncome <= 400000) {
    return 0;
  }

  let tax = 0;
  if (taxableIncome <= 800000) {
    tax = (taxableIncome - 400000) * 0.05;
  } else if (taxableIncome <= 1200000) {
    tax = 20000 + (taxableIncome - 800000) * 0.1;
  } else if (taxableIncome <= 1600000) {
    tax = 60000 + (taxableIncome - 1200000) * 0.15;
  } else if (taxableIncome <= 2000000) {
    tax = 120000 + (taxableIncome - 1600000) * 0.2;
  } else if (taxableIncome <= 2400000) {
    tax = 200000 + (taxableIncome - 2000000) * 0.25;
  } else {
    tax = 300000 + (taxableIncome - 2400000) * 0.3;
  }

  return tax;
};

/**
 * Calculate tax for a specific slab
 */
export const calculateTaxForSlab = (
  taxableIncome: number,
  slabMin: number,
  slabMax: number,
  rate: number
): number => {
  if (taxableIncome <= slabMin) {
    return 0;
  }

  const effectiveIncome = Math.min(taxableIncome - slabMin, slabMax - slabMin);
  const previousSlabsTax = calculateTaxForIncome(slabMin);

  return (
    Math.min(effectiveIncome * rate, previousSlabsTax + effectiveIncome * rate) - previousSlabsTax
  );
};
