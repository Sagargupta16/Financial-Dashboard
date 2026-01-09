/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Calendar, Home, TrendingUp, Users, Zap } from "lucide-react";
import { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  calculateFamilyExpenses,
  calculateHousingExpenses,
} from "../../../lib/calculations/financial";
import type { Transaction } from "../../../types";

interface FamilyHousingManagerProps {
  filteredData: Transaction[];
}

/**
 * Family & Housing Expense Manager
 * Track family expenses, rent, and housing costs
 */
export const FamilyHousingManager = ({ filteredData }: FamilyHousingManagerProps) => {
  const familyData = useMemo(() => {
    return calculateFamilyExpenses(filteredData);
  }, [filteredData]);

  const housingData = useMemo(() => {
    return calculateHousingExpenses(filteredData);
  }, [filteredData]);

  // Family spending chart
  const familyChartData = {
    labels: familyData.breakdown.map((b: any) => b.name),
    datasets: [
      {
        label: "Family Expense by Type",
        data: familyData.breakdown.map((b: any) => b.amount),
        backgroundColor: "rgba(139, 92, 246, 0.7)",
        borderColor: "rgb(139, 92, 246)",
        borderWidth: 2,
      },
    ],
  };

  // Housing trends chart
  const housingTrendsData = {
    labels: housingData.trends.map((t: any) => t.month),
    datasets: [
      {
        label: "Rent",
        data: housingData.trends.map((t: any) => t.rent),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Utilities",
        data: housingData.trends.map((t: any) => t.utilities),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#fff" },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            const label = context.dataset?.label || "";
            const value = context.parsed.y || context.parsed;
            return `${label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
      y: {
        ticks: {
          color: "#9ca3af",
          callback: (value: string | number) => `₹${(Number(value) / 1000).toFixed(0)}k`,
        },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">👨‍👩‍👧 Family & Housing Manager</h2>
        <p className="text-purple-100">Track family support and housing expenses</p>
      </div>

      {/* Family Expenses Section */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="text-purple-400" size={28} />
          Family Expenses
        </h3>

        {/* Family Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Family Expense */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">Total Family Expense</span>
              <Users className="text-purple-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {familyData.totalFamilyExpense.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-sm text-purple-100 mt-1">All-time total</div>
          </div>

          {/* Monthly Average */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-pink-100 text-sm font-medium">Monthly Average</span>
              <Calendar className="text-pink-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {familyData.monthlyAverage.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-sm text-pink-100 mt-1">Per month</div>
          </div>

          {/* Categories */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-100 text-sm font-medium">Expense Categories</span>
              <TrendingUp className="text-indigo-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">{familyData.breakdown.length}</div>
            <div className="text-sm text-indigo-100 mt-1">Different types</div>
          </div>
        </div>

        {/* Family Spending Breakdown */}
        {familyData.breakdown.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
            <h4 className="text-xl font-bold text-white mb-4">Family Spending Breakdown</h4>
            <div style={{ height: "300px" }}>
              <Bar data={familyChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Top Family Expenses */}
        {familyData.topExpenses.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-4">Top Family Expenses</h4>
            <div className="space-y-3">
              {familyData.topExpenses.map((expense: any) => (
                <div
                  key={`${expense.date}-${expense.amount}`}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {new Date(expense.date).toLocaleDateString("en-IN")}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {expense.note || expense.subcategory || "Family Expense"}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    ₹
                    {expense.amount.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Housing Expenses Section */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Home className="text-blue-400" size={28} />
          Housing & Rent
        </h3>

        {/* Housing Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Housing */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Total Housing</span>
              <Home className="text-blue-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {housingData.totalHousing.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Rent */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-100 text-sm font-medium">Total Rent</span>
              <Calendar className="text-cyan-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {housingData.totalRent.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Utilities */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm font-medium">Total Utilities</span>
              <Zap className="text-yellow-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {housingData.totalUtilities.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Monthly Rent Avg */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-100 text-sm font-medium">Avg Rent/Month</span>
              <TrendingUp className="text-indigo-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {housingData.monthlyRentAverage.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        {/* Housing Trends */}
        {housingData.trends.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
            <h4 className="text-xl font-bold text-white mb-4">Housing Expenses Over Time</h4>
            <div style={{ height: "300px" }}>
              <Line data={housingTrendsData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Recent Rent Payments */}
        {housingData.rentPayments.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
            <h4 className="text-xl font-bold text-white mb-4">Recent Rent Payments</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {housingData.rentPayments.slice(0, 6).map((payment: any) => (
                <div
                  key={`${payment.date}-${payment.amount}`}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
                >
                  <div>
                    <div className="text-white font-medium">
                      {new Date(payment.date).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-gray-400 text-sm">{payment.note || "Rent Payment"}</div>
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    ₹
                    {payment.amount.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Utilities */}
        {housingData.utilities.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-4">Recent Utility Bills</h4>
            <div className="space-y-2">
              {housingData.utilities.slice(0, 8).map((utility: any) => (
                <div
                  key={`${utility.date}-${utility.amount}`}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <div className="text-white text-sm">
                      {new Date(utility.date).toLocaleDateString("en-IN")}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {utility.type || utility.note || "Utility"}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-yellow-400">
                    ₹
                    {utility.amount.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tax Benefit Info */}
      {housingData.totalRent > 0 && (
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-6 shadow-lg border border-green-700/50">
          <h3 className="text-xl font-bold text-white mb-4">💰 Tax Benefits</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <Home className="text-green-400 mt-0.5" size={20} />
              <div>
                <p className="text-green-300 font-medium">HRA Exemption Eligible</p>
                <p className="text-green-200/80 text-sm mt-1">
                  Your annual rent of ₹{housingData.totalRent.toLocaleString("en-IN")} is eligible
                  for HRA tax exemption. Estimated HRA benefit: ₹
                  {Math.min(housingData.totalRent * 0.9, 200000).toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-green-200/60 text-xs mt-2">
                  * Actual HRA exemption depends on salary structure and city. Consult your CA for
                  accurate calculation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
