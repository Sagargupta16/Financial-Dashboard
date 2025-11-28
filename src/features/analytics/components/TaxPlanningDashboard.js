/* eslint-disable max-lines-per-function */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  FileText,
  DollarSign,
  Shield,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { calculateTaxPlanning } from "../../../shared/utils/financialCalculations";

/**
 * Tax Planning Dashboard
 * Income tax calculations, deductions, and planning
 */
export const TaxPlanningDashboard = ({ filteredData }) => {
  const taxPlanningData = useMemo(() => {
    return calculateTaxPlanning(filteredData);
  }, [filteredData]);

  const { overall, byFinancialYear, availableYears } = taxPlanningData;

  // State for selected financial year
  const [selectedFY, setSelectedFY] = useState(
    availableYears.length > 0 ? availableYears[0] : "overall"
  );

  // Get data for selected FY or overall
  const taxData =
    selectedFY === "overall" ? overall : byFinancialYear[selectedFY] || overall;

  const {
    totalIncome,
    salaryIncome,
    bonusIncome,
    rsuIncome,
    otherIncome,
    taxableIncome,
    estimatedTax,
    cess,
    totalTaxLiability,
    deductions,
    recommendations,
    standardDeduction,
    taxRegime,
  } = taxData;

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", padding: 15 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
  };

  const postTaxIncome = totalIncome - totalTaxLiability;
  const effectiveTaxRate =
    totalIncome > 0 ? (totalTaxLiability / totalIncome) * 100 : 0;

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
                {availableYears.map((fy) => (
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
        {/* Total Income */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">
              Total Income
            </span>
            <DollarSign className="text-blue-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹{totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-blue-100 mt-1">Gross Annual Income</div>
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
              Total Tax Liability
            </span>
            <TrendingDown className="text-red-200" size={24} />
          </div>
          <div className="text-3xl font-bold text-white">
            ₹
            {totalTaxLiability.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-sm text-red-100 mt-1">
            {effectiveTaxRate.toFixed(2)}% Effective Rate
          </div>
          <div className="text-xs text-red-200 mt-1">
            Tax: ₹
            {estimatedTax.toLocaleString("en-IN", { maximumFractionDigits: 0 })}{" "}
            + Cess: ₹
            {cess.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
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
            {postTaxIncome.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-sm text-green-100 mt-1">Take Home Amount</div>
        </div>
      </div>

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
              <span className="text-gray-300">RSU Income:</span>
              <span className="text-white font-medium">
                ₹
                {rsuIncome.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
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
          {deductions.map((deduction) => (
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
                <td className="py-3 px-4 text-gray-300">₹0 - ₹3,00,000</td>
                <td className="py-3 px-4 text-center text-gray-300">0%</td>
                <td className="py-3 px-4 text-right text-gray-300">₹0</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹3,00,001 - ₹6,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">5%</td>
                <td className="py-3 px-4 text-right text-green-400">
                  ₹
                  {(taxableIncome > 300000
                    ? Math.min((taxableIncome - 300000) * 0.05, 15000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹6,00,001 - ₹9,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">10%</td>
                <td className="py-3 px-4 text-right text-yellow-400">
                  ₹
                  {(taxableIncome > 600000
                    ? Math.min((taxableIncome - 600000) * 0.1, 30000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹9,00,001 - ₹12,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">15%</td>
                <td className="py-3 px-4 text-right text-orange-400">
                  ₹
                  {(taxableIncome > 900000
                    ? Math.min((taxableIncome - 900000) * 0.15, 45000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 text-gray-300">
                  ₹12,00,001 - ₹15,00,000
                </td>
                <td className="py-3 px-4 text-center text-gray-300">20%</td>
                <td className="py-3 px-4 text-right text-red-400">
                  ₹
                  {(taxableIncome > 1200000
                    ? Math.min((taxableIncome - 1200000) * 0.2, 60000)
                    : 0
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Above ₹15,00,000</td>
                <td className="py-3 px-4 text-center text-gray-300">30%</td>
                <td className="py-3 px-4 text-right text-red-500">
                  ₹
                  {(taxableIncome > 1500000
                    ? (taxableIncome - 1500000) * 0.3
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
            {recommendations.map((rec, idx) => {
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
              Standard deduction of ₹50,000 is automatically applied for
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

TaxPlanningDashboard.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
