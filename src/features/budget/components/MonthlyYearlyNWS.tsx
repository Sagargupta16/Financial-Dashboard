/* eslint-disable max-lines-per-function */
import { useMemo, useState } from "react";
import { NWS_COLORS, SHORT_MONTH_NAMES } from "../../../constants";
import type { Transaction } from "../../../types";
import {
  calculateMonthlyNWSBreakdown,
  calculateNWSPercentages,
  calculateYearlyNWSBreakdown,
  formatCurrency,
  formatPercentage,
  getMonthlyIncome,
  getYearlyIncome,
} from "../utils/needsWantsSavingsUtils";

type ViewMode = "monthly" | "yearly";
type NWSKey = "needs" | "wants" | "savings";

type NWSPercentages = {
  needs: { percentage: number; percentageOfIncome?: number | null };
  wants: { percentage: number; percentageOfIncome?: number | null };
  savings: { percentage: number; percentageOfIncome?: number | null };
};

type PeriodItem = {
  monthKey?: string;
  year?: number;
  needs: number;
  wants: number;
  savings: number;
  income: number;
  percentages: NWSPercentages;
  categoryDetails?: Record<NWSKey, Record<string, number>>;
};

interface CategoryBarProps {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface PeriodCardProps {
  item: PeriodItem;
  isSelected: boolean;
  onSelect: (_period: string | number | null) => void;
  viewMode: ViewMode;
}

interface MonthlyYearlyNWSProps {
  transactions: Transaction[];
}

/**
 * Category Bar Component - displays category spending with percentage
 */
const CategoryBar = ({ category, amount, percentage, color }: CategoryBarProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400 capitalize">{category}</span>
      <div className="text-right">
        <div className="text-white font-semibold">{formatCurrency(amount, false)}</div>
        <div className="text-xs text-gray-500">{formatPercentage(percentage / 100)}</div>
      </div>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${Math.min(percentage, 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  </div>
);

/**
 * Period Card Component - displays summary for a month or year
 */
const PeriodCard = ({ item, isSelected, onSelect, viewMode }: PeriodCardProps) => {
  const periodLabel =
    viewMode === "monthly" ? formatMonthKey(item.monthKey || "") : (item.year ?? "");
  const periodKey = viewMode === "monthly" ? (item.monthKey ?? "") : (item.year ?? 0);

  const total = item.needs + item.wants + item.savings;
  const savingsRate = item.income > 0 ? (item.savings / item.income) * 100 : 0;

  // Helper function to get color class based on savings rate
  const getSavingsRateColor = (rate: number) => {
    if (rate >= 20) {
      return "text-green-400";
    }
    if (rate >= 10) {
      return "text-yellow-400";
    }
    return "text-red-400";
  };

  return (
    <button
      onClick={() => onSelect(isSelected ? null : periodKey)}
      className={`w-full bg-gray-800/50 rounded-lg p-4 border transition-all text-left ${
        isSelected ? "border-blue-500 bg-gray-800" : "border-gray-700 hover:border-gray-600"
      }`}
    >
      {/* Period Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-semibold text-white">{periodLabel}</h4>
          <p className="text-sm text-gray-400">{formatCurrency(total)} spent</p>
        </div>
        {item.income > 0 && (
          <div className="text-right">
            <div className="text-sm text-green-400">{formatCurrency(item.income)}</div>
            <div className="text-xs text-gray-500">income</div>
          </div>
        )}
      </div>

      {/* Mini Breakdown */}
      <div className="space-y-2">
        {/* Stacked Bar */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
          <div
            className="transition-all duration-500"
            style={{
              width: `${item.percentages.needs.percentage}%`,
              backgroundColor: NWS_COLORS.needs,
            }}
            title="Needs"
          />
          <div
            className="transition-all duration-500"
            style={{
              width: `${item.percentages.wants.percentage}%`,
              backgroundColor: NWS_COLORS.wants,
            }}
            title="Wants"
          />
          <div
            className="transition-all duration-500"
            style={{
              width: `${item.percentages.savings.percentage}%`,
              backgroundColor: NWS_COLORS.savings,
            }}
            title="Savings"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Needs</div>
            <div className="text-white font-medium">
              {formatPercentage(item.percentages.needs.percentage / 100)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Wants</div>
            <div className="text-white font-medium">
              {formatPercentage(item.percentages.wants.percentage / 100)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Savings</div>
            <div className="text-white font-medium">
              {formatPercentage(item.percentages.savings.percentage / 100)}
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        {item.income > 0 && (
          <div className="pt-2 border-t border-gray-700">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Savings Rate</span>
              <span className={`font-medium ${getSavingsRateColor(savingsRate)}`}>
                {formatPercentage(savingsRate / 100)}
              </span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

/**
 * Helper function to format month key
 */
const formatMonthKey = (monthKey: string) => {
  if (!monthKey) {
    return "";
  }
  const [year, month] = monthKey.split("-");
  const monthIndex = Number.parseInt(month, 10) - 1;
  return `${SHORT_MONTH_NAMES[monthIndex]} ${year}`;
};

/**
 * Monthly and Yearly Needs/Wants/Savings Analysis Component
 */
export const MonthlyYearlyNWS = ({ transactions }: MonthlyYearlyNWSProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly"); // 'monthly' or 'yearly'
  const [selectedPeriod, setSelectedPeriod] = useState<string | number | null>(null);

  // Calculate monthly breakdown
  const monthlyData = useMemo<PeriodItem[]>(() => {
    const breakdown = calculateMonthlyNWSBreakdown(transactions);
    const income = getMonthlyIncome(transactions) as Record<string, number>;

    const data = Object.entries(breakdown)
      .map(([monthKey, values]) => {
        const { needs = 0, wants = 0, savings = 0, ...rest } = (values as any) || {};
        return {
          monthKey,
          needs,
          wants,
          savings,
          ...rest,
          income: income[monthKey] || 0,
          percentages: calculateNWSPercentages(values || {}, income[monthKey]),
        } as PeriodItem;
      })
      .sort((a, b) => (b.monthKey ?? "").localeCompare(a.monthKey ?? "")); // Most recent first

    return data;
  }, [transactions]);

  // Calculate yearly breakdown
  const yearlyData = useMemo<PeriodItem[]>(() => {
    const breakdown = calculateYearlyNWSBreakdown(transactions);
    const income = getYearlyIncome(transactions) as Record<string, number>;

    const data = Object.entries(breakdown)
      .map(([year, values]) => {
        const { needs = 0, wants = 0, savings = 0, ...rest } = (values as any) || {};
        return {
          year: Number.parseInt(year, 10),
          needs,
          wants,
          savings,
          ...rest,
          income: income[year] || 0,
          percentages: calculateNWSPercentages(values || {}, income[year]),
        } as PeriodItem;
      })
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0)); // Most recent first

    return data;
  }, [transactions]);

  // Format month key for display
  const formatMonthKeyLocal = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    return `${SHORT_MONTH_NAMES[Number.parseInt(month, 10) - 1]} ${year}`;
  };

  // Get data based on view mode
  const currentData: PeriodItem[] = viewMode === "monthly" ? monthlyData : yearlyData;

  // Get selected period details
  const selectedData: PeriodItem | null = selectedPeriod
    ? currentData.find((item) =>
        viewMode === "monthly" ? item.monthKey === selectedPeriod : item.year === selectedPeriod
      ) || null
    : null;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="text-center text-gray-400">
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">📊 Period Analysis</h3>
          <p className="text-gray-400 mt-1">Track your Needs/Wants/Savings over time</p>
        </div>
        <div className="flex gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => {
              setViewMode("monthly");
              setSelectedPeriod(null);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === "monthly" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => {
              setViewMode("yearly");
              setSelectedPeriod(null);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === "yearly" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Period List */}
        <div className="lg:col-span-1 space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <PeriodCard
                key={viewMode === "monthly" ? item.monthKey : item.year}
                item={item}
                isSelected={selectedPeriod === (viewMode === "monthly" ? item.monthKey : item.year)}
                onSelect={setSelectedPeriod}
                viewMode={viewMode}
              />
            ))
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center text-gray-400">
              No data available for {viewMode} view
            </div>
          )}
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-2">
          {selectedData ? (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-bold text-white">
                    {viewMode === "monthly"
                      ? formatMonthKeyLocal(selectedData.monthKey || "")
                      : selectedData.year}
                  </h4>
                  <p className="text-gray-400 mt-1">Detailed Breakdown</p>
                </div>
                <button
                  onClick={() => setSelectedPeriod(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Income & Total */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(selectedData.income)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Spending</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(selectedData.needs + selectedData.wants + selectedData.savings)}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                <h5 className="font-semibold text-white">Category Breakdown</h5>
                <CategoryBar
                  category="needs"
                  amount={selectedData.needs}
                  percentage={selectedData.percentages.needs.percentage}
                  color={NWS_COLORS.needs}
                />
                <CategoryBar
                  category="wants"
                  amount={selectedData.wants}
                  percentage={selectedData.percentages.wants.percentage}
                  color={NWS_COLORS.wants}
                />
                <CategoryBar
                  category="savings"
                  amount={selectedData.savings}
                  percentage={selectedData.percentages.savings.percentage}
                  color={NWS_COLORS.savings}
                />
              </div>

              {/* Income Percentages */}
              {selectedData.income > 0 && (
                <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
                  <h5 className="font-semibold text-white">As % of Income</h5>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Needs</div>
                      <div className="text-xl font-bold text-blue-400">
                        {formatPercentage(
                          (selectedData.percentages.needs.percentageOfIncome || 0) / 100
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Target: 50%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Wants</div>
                      <div className="text-xl font-bold text-amber-400">
                        {formatPercentage(
                          (selectedData.percentages.wants.percentageOfIncome || 0) / 100
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Target: 30%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Savings</div>
                      <div className="text-xl font-bold text-green-400">
                        {formatPercentage(
                          (selectedData.percentages.savings.percentageOfIncome || 0) / 100
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Target: 20%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Details */}
              <div className="space-y-4">
                <h5 className="font-semibold text-white">Top Categories</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["needs", "wants", "savings"] as NWSKey[]).map((type) => {
                    const categories = Object.entries(
                      selectedData.categoryDetails?.[type] ?? {}
                    ).sort(([, a], [, b]) => Number(b) - Number(a));

                    const icons: Record<NWSKey, string> = {
                      needs: "🏠",
                      wants: "🎉",
                      savings: "💰",
                    };

                    return (
                      <div key={type} className="p-4 bg-gray-800 rounded-lg">
                        <h6 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                          <span>{icons[type]}</span>
                          <span className="capitalize">{type}</span>
                        </h6>
                        <div className="space-y-2">
                          {categories.length > 0 ? (
                            categories.slice(0, 5).map(([cat, amount]) => (
                              <div key={cat} className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 truncate">{cat}</span>
                                <span className="text-white font-medium">
                                  {formatCurrency(Number(amount), false)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No transactions</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 border-dashed">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg">
                  Select a {viewMode === "monthly" ? "month" : "year"} to view details
                </p>
                <p className="text-sm mt-2">
                  Click on any period card to see the detailed breakdown
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
