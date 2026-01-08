/* eslint-disable max-lines-per-function */
import { useMemo, useState } from "react";
import {
  FileText,
  DollarSign,
  Shield,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { calculateTaxPlanning } from "../../../lib/calculations/financial";

interface TaxPlanningDashboardProps {
  filteredData: any[];
}

/**
 * Helper function to create chart options
 */
const createChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: "#fff", padding: 15 },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || "";
          const value = context.parsed;
          return `${label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
        },
      },
    },
  },
});

/**
 * Helper function to calculate projected tax for the year
 */
const calculateProjectedTax = (
  filteredData: any[],
  totalIncome: number,
  standardDeduction: number,
  totalTaxLiability: number
) => {
  if (!filteredData || filteredData.length === 0) {
    return null;
  }

  // Get current date and financial year info
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11 (0 = January)

  // Calculate which month of FY we're in (0-11, where 0 = April)
  const fyMonth = currentMonth >= 3 ? currentMonth - 3 : currentMonth + 9;

  // Months remaining AFTER current month
  const monthsRemaining = Math.max(0, 11 - fyMonth);

  if (monthsRemaining === 0) {
    return null; // Last month of FY, no projection needed
  }

  // Get salary transactions from last 3-4 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentSalaryTransactions = filteredData.filter((t) => {
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

  // Calculate average monthly salary from recent months
  const totalRecentSalary = recentSalaryTransactions.reduce(
    (sum, t) => sum + Math.abs(Number(t.amount) || 0),
    0
  );
  const avgMonthlySalary = totalRecentSalary / recentSalaryTransactions.length;

  // Project total annual income
  const projectedAnnualSalary =
    totalIncome + avgMonthlySalary * monthsRemaining;

  // Calculate projected tax (simplified - using new regime calculation)
  const projectedTaxableIncome = Math.max(
    0,
    projectedAnnualSalary - standardDeduction - 2400 // Professional tax estimate
  );

  // Calculate tax using FY 2025-26 slabs
  let projectedTax = 0;
  if (projectedTaxableIncome > 400000) {
    if (projectedTaxableIncome <= 800000) {
      projectedTax = (projectedTaxableIncome - 400000) * 0.05;
    } else if (projectedTaxableIncome <= 1200000) {
      projectedTax = 20000 + (projectedTaxableIncome - 800000) * 0.1;
    } else if (projectedTaxableIncome <= 1600000) {
      projectedTax = 60000 + (projectedTaxableIncome - 1200000) * 0.15;
    } else if (projectedTaxableIncome <= 2000000) {
      projectedTax = 120000 + (projectedTaxableIncome - 1600000) * 0.2;
    } else if (projectedTaxableIncome <= 2400000) {
      projectedTax = 200000 + (projectedTaxableIncome - 2000000) * 0.25;
    } else {
      projectedTax = 300000 + (projectedTaxableIncome - 2400000) * 0.3;
    }
  }

  const projectedCess = projectedTax * 0.04;
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
 * Tax Planning Dashboard
 * Income tax calculations, deductions, and planning
 */

export const TaxPlanningDashboard = ({
  filteredData,
}: TaxPlanningDashboardProps) => {
  type TaxPlanningResult = {
    overall: any;
    byFinancialYear: Record<string, any>;
    availableYears: string[];
  };

  const taxPlanningData = useMemo<TaxPlanningResult>(() => {
    return calculateTaxPlanning(filteredData) as TaxPlanningResult;
  }, [filteredData]);

  const { overall, byFinancialYear, availableYears } = taxPlanningData;

  // State for selected financial year
  const [selectedFY, setSelectedFY] = useState<string>(
    availableYears.length > 0 ? availableYears[0] : "overall"
  );

  // Get data for selected FY or overall
  const taxData =
    selectedFY === "overall" ? overall : byFinancialYear[selectedFY] || overall;

  const {
    totalIncome = 0,
    actualTdsPaid = 0,
    calculatedGrossIncome = 0,
    salaryIncome = 0,
    bonusIncome = 0,
    rsuIncome = 0,
    rsuGrossIncome = 0,
    rsuTaxPaid = 0,
    otherIncome = 0,
    taxableIncome = 0,
    estimatedTax = 0,
    cess = 0,
    totalTaxLiability = 0,
    deductions = [],
    recommendations = [],
    standardDeduction = 0,
    taxRegime = "New Regime",
  } = taxData || {};

  // Chart data for income breakdown
  const incomeChartData = {
    labels: ["Salary", "Bonus", "RSU", "Other Income"],
    datasets: [
      {
        data: [salaryIncome, bonusIncome, rsuIncome, otherIncome],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981"],
        borderColor: "#1f2937",
        borderWidth: 3,
      },
    ],
  };

  // Chart data for tax breakdown
  const deductionsChartData = {
    labels: ["Taxable Income", "Deductions", "Tax"],
    datasets: [
      {
        data: [taxableIncome, totalIncome - taxableIncome, estimatedTax],
        backgroundColor: ["#ef4444", "#10b981", "#f59e0b"],
        borderColor: "#1f2937",
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = createChartOptions();

  // Calculate projected annual tax based on recent salary trends
  const projectedTaxData = useMemo(
    () =>
      calculateProjectedTax(
        filteredData,
        totalIncome,
        standardDeduction,
        totalTaxLiability
      ),
    [filteredData, totalIncome, standardDeduction, totalTaxLiability]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              📋 Tax Planning Dashboard
            </h2>
            <p className="text-blue-100">
              Plan your taxes, maximize deductions, and optimize your savings
            </p>
          </div>

          {/* Financial Year Selector */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="fy-select"
                className="text-white text-sm font-medium"
              >
                Select FY:
              </label>
              <select
                id="fy-select"
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="bg-white/20 text-white rounded-lg px-4 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="overall" className="bg-gray-800">
                  Overall (All Years)
                </option>
                {availableYears.map((fy: string) => (
                  <option key={fy} value={fy} className="bg-gray-800">
                    {fy}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mt-2 inline-block bg-white/20 rounded-full px-3 py-1 text-sm text-white">
          Tax Regime: {taxRegime === "new" ? "NEW" : "OLD"} | Standard
          Deduction: ₹{standardDeduction.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income (Post-TDS) */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">
              {selectedFY === "FY 2024-25" && calculatedGrossIncome > 0
                ? "Gross Income"
                : "Net Income Received"}
            </span>
            <DollarSign className="text-blue-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {(selectedFY === "FY 2024-25" && calculatedGrossIncome > 0
              ? calculatedGrossIncome
              : totalIncome
            ).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-sm text-blue-100 mt-1">
            {selectedFY === "FY 2024-25" && calculatedGrossIncome > 0
              ? "Before TDS (calculated)"
              : "Post-TDS (as recorded)"}
          </div>
          {selectedFY === "FY 2024-25" && calculatedGrossIncome > 0 && (
            <div className="text-xs text-blue-200 mt-1">
              Net: ₹
              {totalIncome.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          )}
        </div>

        {/* Taxable Income */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100 text-sm font-medium">
              Taxable Income
            </span>
            <FileText className="text-orange-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {taxableIncome.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-sm text-orange-100 mt-1">After Deductions</div>
        </div>

        {/* Estimated Tax */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100 text-sm font-medium">
              {selectedFY === "FY 2024-25" && actualTdsPaid > 0
                ? "Actual Tax Paid"
                : "Estimated Tax"}
            </span>
            <TrendingDown className="text-red-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {(selectedFY === "FY 2024-25" && actualTdsPaid > 0
              ? actualTdsPaid
              : totalTaxLiability
            ).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-sm text-red-100 mt-1">
            {selectedFY === "FY 2024-25" && actualTdsPaid > 0
              ? "Calculated using reverse TDS"
              : "On recorded income"}
          </div>
          <div className="text-xs text-red-200 mt-1">
            {selectedFY === "FY 2024-25" && actualTdsPaid > 0 ? (
              `Salary TDS: ₹${((actualTdsPaid || 0) - (rsuTaxPaid || 0)).toLocaleString("en-IN", { maximumFractionDigits: 0 })} + RSU: ₹${(rsuTaxPaid || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
            ) : (
              <>
                Tax: ₹
                {(estimatedTax || 0).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
                {cess > 0 &&
                  ` + Cess: ₹${(cess || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                {rsuTaxPaid > 0 &&
                  ` + RSU: ₹${(rsuTaxPaid || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
              </>
            )}
          </div>
        </div>

        {/* Post-Tax Income */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">
              Post-Tax Income
            </span>
            <Shield className="text-green-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {(totalIncome - totalTaxLiability).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-sm text-green-100 mt-1">Take Home Amount</div>
        </div>
      </div>

      {/* Important Note about Tax Calculation */}
      <div
        className={`${
          selectedFY === "FY 2024-25" && actualTdsPaid > 0
            ? "bg-green-900/30 border-green-500/50"
            : "bg-yellow-900/30 border-yellow-500/50"
        } border rounded-xl p-4 flex items-start gap-3`}
      >
        {selectedFY === "FY 2024-25" && actualTdsPaid > 0 ? (
          <>
            <CheckCircle2
              className="text-green-400 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-green-100">
              <strong className="text-green-300">
                FY 2024-25 Calculation:
              </strong>{" "}
              Using reverse TDS formula to calculate actual gross income and TDS
              paid.
              <span className="block mt-2 text-green-200">
                • <strong>Gross Income:</strong> ₹
                {calculatedGrossIncome.toLocaleString("en-IN")}
                <br />• <strong>Net Received:</strong> ₹
                {totalIncome.toLocaleString("en-IN")}
                <br />• <strong>Actual TDS Paid:</strong> ₹
                {actualTdsPaid.toLocaleString("en-IN")}
                <br />
              </span>
              <span className="block mt-2 text-green-300 text-xs">
                Formula: Gross = ₹15L + (Net - ₹13.44L) / 0.688, where 0.688 = 1
                - (30% × 1.04)
              </span>
            </div>
          </>
        ) : (
          <>
            <AlertCircle
              className="text-yellow-400 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-yellow-100">
              <strong className="text-yellow-300">Important:</strong> Income
              shown is POST-TDS (net amount received after tax deduction). Tax
              calculated here is based on this net income, so it will be LOWER
              than actual TDS paid.
              {(selectedFY === "FY 2022-23" || selectedFY === "FY 2023-24") && (
                <span className="block mt-2 text-yellow-200">
                  <strong>{selectedFY}:</strong> Your income was below taxable
                  limit (₹2.5L under old slabs) - ₹0 tax paid.
                </span>
              )}
              <span className="block mt-2 text-yellow-300 font-medium">
                💡 For accurate TDS tracking: Add a &quot;TDS Paid&quot; expense
                entry for each salary month with the TDS amount deducted.
              </span>
            </div>
          </>
        )}
      </div>

      {/* Projected Annual Tax (Based on Recent Salary) */}
      {projectedTaxData && projectedTaxData.monthsRemaining > 0 && (
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 shadow-lg border border-purple-700/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <TrendingDown className="text-purple-400" size={24} />
                Year-End Tax Projection
              </h3>
              <p className="text-purple-200 text-sm">
                Based on last 3 months average for next{" "}
                {projectedTaxData.monthsRemaining} month(s)
              </p>
            </div>
            <div className="bg-purple-500/20 rounded-lg px-4 py-2">
              <div className="text-xs text-purple-300">Months Remaining</div>
              <div className="text-2xl font-bold text-purple-400">
                {projectedTaxData.monthsRemaining}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">
                Avg Monthly Salary
              </div>
              <div className="text-lg font-bold text-white">
                ₹
                {projectedTaxData.avgMonthlySalary.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-xs text-gray-400 mt-1">(Last 3 months)</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">
                Projected Annual Income
              </div>
              <div className="text-lg font-bold text-blue-400">
                ₹
                {projectedTaxData.projectedAnnualSalary.toLocaleString(
                  "en-IN",
                  { maximumFractionDigits: 0 }
                )}
              </div>
              <div className="text-xs text-green-400 mt-1">
                +₹
                {(
                  projectedTaxData.projectedAnnualSalary - totalIncome
                ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}{" "}
                in next {projectedTaxData.monthsRemaining} month(s)
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">
                Projected Total Tax
              </div>
              <div className="text-lg font-bold text-orange-400">
                ₹
                {projectedTaxData.projectedTotalTax.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Current: ₹
                {projectedTaxData.currentTax.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">
                Additional Tax Liability
              </div>
              <div className="text-lg font-bold text-red-400">
                ₹
                {Math.max(
                  0,
                  projectedTaxData.additionalTaxLiability
                ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                {projectedTaxData.monthsRemaining} months remaining
              </div>
            </div>
          </div>

          <div className="mt-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-yellow-400 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-yellow-200">
                <strong>Note:</strong> This projection assumes your next{" "}
                {projectedTaxData.monthsRemaining} month(s) salary will match
                the last 3 months average. Current month's salary is already
                included in your income. Actual tax may vary based on bonuses,
                deductions, and other income sources.
                {projectedTaxData.additionalTaxLiability > 0 && (
                  <span className="block mt-2">
                    💡 <strong>Tip:</strong> Consider setting aside ₹
                    {Math.ceil(
                      projectedTaxData.additionalTaxLiability /
                        projectedTaxData.monthsRemaining
                    ).toLocaleString("en-IN")}{" "}
                    per month for the next {projectedTaxData.monthsRemaining}{" "}
                    month(s) to cover the projected liability.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">
            Income Breakdown
          </h3>
          <div style={{ height: "300px" }}>
            <Doughnut data={incomeChartData} options={chartOptions} />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Salary Income:</span>
              <span className="text-white font-medium">
                ₹
                {salaryIncome.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Bonus Income:</span>
              <span className="text-white font-medium">
                ₹
                {bonusIncome.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">RSU Income (Received):</span>
              <span className="text-white font-medium">
                ₹
                {rsuIncome.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            {rsuGrossIncome > 0 && (
              <>
                <div className="flex justify-between text-sm border-t border-gray-600 pt-2 mt-2">
                  <span className="text-gray-400 text-xs">
                    RSU Gross (Pre-tax):
                  </span>
                  <span className="text-gray-400 text-xs font-medium">
                    ₹
                    {rsuGrossIncome.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400 text-xs">
                    RSU Tax Paid (31.2%):
                  </span>
                  <span className="text-red-400 text-xs font-medium">
                    -₹
                    {rsuTaxPaid.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Other Income:</span>
              <span className="text-white font-medium">
                ₹
                {otherIncome.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Tax & Deductions */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">
            Tax & Deductions
          </h3>
          <div style={{ height: "300px" }}>
            <Doughnut data={deductionsChartData} options={chartOptions} />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Total Deductions:</span>
              <span className="text-green-400 font-medium">
                ₹
                {(totalIncome - taxableIncome).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Tax Liability:</span>
              <span className="text-red-400 font-medium">
                ₹
                {estimatedTax.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deductions Detail */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Tax Deductions Claimed
        </h3>
        <div className="space-y-4">
          {deductions.map((deduction: any) => (
            <div key={deduction.name} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {deduction.utilized ? (
                    <CheckCircle2 className="text-green-400" size={20} />
                  ) : (
                    <AlertCircle className="text-gray-400" size={20} />
                  )}
                  <span className="text-white font-medium">
                    {deduction.name}
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-400">
                  ₹
                  {deduction.amount.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              {deduction.limit && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>
                      Utilized: ₹
                      {(
                        deduction.limit - (deduction.remaining || 0)
                      ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                    <span>
                      Remaining: ₹
                      {(deduction.remaining || 0).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${((deduction.limit - (deduction.remaining || 0)) / deduction.limit) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tax Slabs */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Tax Slabs (New Regime FY 2025-26)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-300 py-3 px-4">
                  Income Range
                </th>
                <th className="text-center text-gray-300 py-3 px-4">
                  Tax Rate
                </th>
                <th className="text-right text-gray-300 py-3 px-4">Your Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">₹0 - ₹4,00,000</td>
                <td className="py-3 px-4 text-center text-gray-300">0%</td>
                <td className="py-3 px-4 text-right text-gray-300">₹0</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹4,00,001 - ₹8,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">5%</td>
                <td className="py-3 px-4 text-right text-green-400">
                  ₹
                  {(taxableIncome > 400000
                    ? Math.min((taxableIncome - 400000) * 0.05, 20000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹8,00,001 - ₹12,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">10%</td>
                <td className="py-3 px-4 text-right text-yellow-400">
                  ₹
                  {(taxableIncome > 800000
                    ? Math.min((taxableIncome - 800000) * 0.1, 40000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹12,00,001 - ₹16,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">15%</td>
                <td className="py-3 px-4 text-right text-orange-400">
                  ₹
                  {(taxableIncome > 1200000
                    ? Math.min((taxableIncome - 1200000) * 0.15, 60000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹16,00,001 - ₹20,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">20%</td>
                <td className="py-3 px-4 text-right text-red-400">
                  ₹
                  {(taxableIncome > 1600000
                    ? Math.min((taxableIncome - 1600000) * 0.2, 80000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹20,00,001 - ₹24,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">25%</td>
                <td className="py-3 px-4 text-right text-red-400">
                  ₹
                  {(taxableIncome > 2000000
                    ? Math.min((taxableIncome - 2000000) * 0.25, 100000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Above ₹24,00,000</td>
                <td className="py-3 px-4 text-center text-gray-300">30%</td>
                <td className="py-3 px-4 text-right text-red-500">
                  ₹
                  {(taxableIncome > 2400000
                    ? (taxableIncome - 2400000) * 0.3
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 shadow-lg border border-blue-700/50">
          <h3 className="text-xl font-bold text-white mb-4">
            💡 Tax Saving Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec: any) => {
              const isHigh = rec.priority === "high";
              const isMedium = rec.priority === "medium";

              let containerClass;
              if (isHigh) {
                containerClass = "bg-red-500/10 border-red-500/30";
              } else if (isMedium) {
                containerClass = "bg-yellow-500/10 border-yellow-500/30";
              } else {
                containerClass = "bg-blue-500/10 border-blue-500/30";
              }

              let iconClass;
              if (isHigh) {
                iconClass = "text-red-400";
              } else if (isMedium) {
                iconClass = "text-yellow-400";
              } else {
                iconClass = "text-blue-400";
              }

              let titleClass;
              if (isHigh) {
                titleClass = "text-red-300";
              } else if (isMedium) {
                titleClass = "text-yellow-300";
              } else {
                titleClass = "text-blue-300";
              }

              let messageClass;
              if (isHigh) {
                messageClass = "text-red-200/80";
              } else if (isMedium) {
                messageClass = "text-yellow-200/80";
              } else {
                messageClass = "text-blue-200/80";
              }

              return (
                <div
                  key={rec.message}
                  className={`flex items-start gap-3 rounded-lg p-4 border ${containerClass}`}
                >
                  <AlertCircle className={iconClass} size={20} />
                  <div>
                    <p className={`font-medium ${titleClass}`}>{rec.title}</p>
                    <p className={`text-sm mt-1 ${messageClass}`}>
                      {rec.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          📌 Important Notes
        </h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              This is an estimate based on the New Tax Regime for FY 2025-26
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              Standard deduction of ₹75,000 is automatically applied for
              salaried individuals
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              80C limit is ₹1,50,000 for investments like PPF, ELSS, LIC, etc.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              HRA exemption is calculated based on actual rent paid (simplified
              calculation)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              Please consult with a certified CA for accurate tax filing and
              planning
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
