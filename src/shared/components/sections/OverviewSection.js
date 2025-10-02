import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Hash,
  Target,
  Sigma,
  CalendarDays,
  LayoutGrid,
  Calculator,
  ArrowLeftRight,
  PiggyBank,
  Flame,
  Calendar,
  Lightbulb,
  Filter,
  AlertTriangle,
  Repeat,
} from "lucide-react";
import { KPICard, SmallKPICard } from "../ui/KPICards";
import { AccountBalancesCard } from "../ui/AccountBalancesCard";
import { formatCurrency } from "../../../shared/utils/dataUtils";
import { useEnhancedKPIData } from "../../hooks/useCalculations";
import { useAdvancedAnalytics } from "../../hooks/useAdvancedAnalytics";
import { generateSmartInsights } from "../../utils/insightsGenerator";

// Helper functions to reduce complexity
const getSavingsRateColor = (rate) => {
  if (rate >= 20) {
    return "bg-green-900/20 border-green-500/30";
  }
  if (rate >= 10) {
    return "bg-yellow-900/20 border-yellow-500/30";
  }
  return "bg-red-900/20 border-red-500/30";
};

const getSavingsRateIconColor = (rate) => {
  if (rate >= 20) {
    return "text-green-400";
  }
  if (rate >= 10) {
    return "text-yellow-400";
  }
  return "text-red-400";
};

const getSavingsRateMessage = (rate) => {
  if (rate >= 20) {
    return "Excellent! 🎉";
  }
  if (rate >= 10) {
    return "Good, aim for 20%+";
  }
  return "Target: 20%+";
};

const getSpendingVelocityColor = (velocity) => {
  if (velocity > 120) {
    return "bg-red-900/20 border-red-500/30";
  }
  if (velocity < 80) {
    return "bg-green-900/20 border-green-500/30";
  }
  return "bg-yellow-900/20 border-yellow-500/30";
};

const getSpendingVelocityIconColor = (velocity) => {
  if (velocity > 120) {
    return "text-red-400";
  }
  if (velocity < 80) {
    return "text-green-400";
  }
  return "text-yellow-400";
};

const getInsightPriorityColor = (priority) => {
  if (priority === "high") {
    return "bg-red-900/20 border-red-500/30";
  }
  if (priority === "positive") {
    return "bg-green-900/20 border-green-500/30";
  }
  if (priority === "medium") {
    return "bg-yellow-900/20 border-yellow-500/30";
  }
  return "bg-blue-900/20 border-blue-500/30";
};

// Helper functions for advanced analytics
const getMonthlyTrendDisplay = (monthlyComparison) => {
  if (!monthlyComparison?.trend || monthlyComparison.avgGrowth === undefined) {
    return "N/A";
  }
  if (monthlyComparison.trend === "increasing") {
    return `↗️ +${monthlyComparison.avgGrowth.toFixed(1)}%`;
  }
  if (monthlyComparison.trend === "decreasing") {
    return `↘️ ${monthlyComparison.avgGrowth.toFixed(1)}%`;
  }
  return "→ Stable";
};

const getAnomalyAlertDisplay = (anomaliesCount) => {
  if (anomaliesCount > 0) {
    const plural = anomaliesCount > 1 ? "s" : "";
    return `⚠️ ${anomaliesCount} unusual transaction${plural}`;
  }
  return "✓ All normal";
};

const getSubscriptionsDisplay = (recurringTransactions) => {
  if (!recurringTransactions || recurringTransactions.length === 0) {
    return "None detected";
  }
  const totalMonthly = recurringTransactions.reduce(
    (sum, t) => sum + Math.abs(t.averageAmount),
    0
  );
  return `${recurringTransactions.length} (${formatCurrency(totalMonthly)}/mo)`;
};

// Extract unique years from transactions
const getYearsAndMonths = (transactions) => {
  const yearSet = new Set();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    yearSet.add(date.getFullYear());
  });

  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
  const monthLabels = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  return {
    years: sortedYears,
    months: monthLabels,
  };
};

// Filter transactions by year and month
const filterTransactionsByTime = (transactions, year, month) => {
  if (year === "all") {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    const txYear = date.getFullYear();
    const txMonth = date.getMonth();

    if (txYear !== parseInt(year)) {
      return false;
    }

    if (month === "all") {
      return true;
    }

    return txMonth === parseInt(month);
  });
};

// Financial Health Metrics Component
const FinancialHealthMetrics = ({ enhancedKPI }) => (
  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 mb-8">
    <h3 className="text-2xl font-bold text-blue-300 mb-6 flex items-center">
      <TrendingUp className="mr-3" size={24} />
      Financial Health Metrics
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {/* Savings Rate */}
      <div
        className={`p-4 rounded-xl border transition-all duration-300 ${getSavingsRateColor(
          enhancedKPI.savingsRate
        )}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Savings Rate</span>
          <PiggyBank
            size={22}
            className={getSavingsRateIconColor(enhancedKPI.savingsRate)}
          />
        </div>
        <div className="text-3xl font-bold text-white">
          {enhancedKPI.savingsRate.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {getSavingsRateMessage(enhancedKPI.savingsRate)}
        </div>
      </div>

      {/* Daily Spending */}
      <SmallKPICard
        title="Daily Spending"
        value={enhancedKPI.dailySpendingRate}
        icon={<Flame size={22} />}
      />

      {/* Monthly Burn Rate */}
      <SmallKPICard
        title="Monthly Burn Rate"
        value={enhancedKPI.monthlyBurnRate}
        icon={<Calendar size={22} />}
      />

      {/* Net Worth Change */}
      <div
        className={`p-4 rounded-xl border ${
          enhancedKPI.netWorth >= 0
            ? "bg-green-900/20 border-green-500/30"
            : "bg-red-900/20 border-red-500/30"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Net Worth Change</span>
          <TrendingUp
            size={22}
            className={
              enhancedKPI.netWorth >= 0 ? "text-green-400" : "text-red-400"
            }
          />
        </div>
        <div className="text-2xl font-bold text-white">
          {formatCurrency(enhancedKPI.netWorth)}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {formatCurrency(Math.abs(enhancedKPI.netWorthPerMonth))}/month{" "}
          {enhancedKPI.netWorth >= 0 ? "↑" : "↓"}
        </div>
      </div>

      {/* Spending Velocity */}
      <div
        className={`p-4 rounded-xl border ${getSpendingVelocityColor(
          enhancedKPI.spendingVelocity
        )}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Spending Velocity (30d)</span>
          <Calculator
            size={22}
            className={getSpendingVelocityIconColor(
              enhancedKPI.spendingVelocity
            )}
          />
        </div>
        <div className="text-3xl font-bold text-white">
          {enhancedKPI.spendingVelocity.toFixed(0)}%
          {enhancedKPI.spendingVelocity > 100 ? " ↑" : " ↓"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {enhancedKPI.spendingVelocity > 100 ? "Above" : "Below"} average
        </div>
      </div>

      {/* Category Concentration */}
      {enhancedKPI.categoryConcentration && (
        <div
          className={`p-4 rounded-xl border ${
            enhancedKPI.categoryConcentration.percentage > 50
              ? "bg-orange-900/20 border-orange-500/30"
              : "bg-blue-900/20 border-blue-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Top Category</span>
            <LayoutGrid size={22} className="text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">
            {enhancedKPI.categoryConcentration.category}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {enhancedKPI.categoryConcentration.percentage.toFixed(0)}% of
            spending
            {enhancedKPI.categoryConcentration.percentage > 50 && " ⚠️"}
          </div>
        </div>
      )}
    </div>
  </div>
);

FinancialHealthMetrics.propTypes = {
  enhancedKPI: PropTypes.shape({
    savingsRate: PropTypes.number.isRequired,
    dailySpendingRate: PropTypes.number.isRequired,
    monthlyBurnRate: PropTypes.number.isRequired,
    netWorth: PropTypes.number.isRequired,
    netWorthPerMonth: PropTypes.number.isRequired,
    spendingVelocity: PropTypes.number.isRequired,
    categoryConcentration: PropTypes.shape({
      category: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
    }),
  }).isRequired,
};

// Transfer Information Component
const TransferInformationCard = ({ transferData }) => {
  if (!transferData?.transferIn && !transferData?.transferOut) {
    return null;
  }

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 mb-8">
      <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
        <div className="p-2 rounded-lg bg-purple-900/50 text-purple-400 mr-3">
          <ArrowLeftRight size={20} />
        </div>
        Account Transfers (Internal Money Movement)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-900/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-300">
              Money Transferred In
            </span>
            <span className="text-lg font-bold text-purple-400">
              ← {formatCurrency(transferData?.transferIn || 0)}
            </span>
          </div>
        </div>
        <div className="bg-purple-900/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-300">
              Money Transferred Out
            </span>
            <span className="text-lg font-bold text-purple-400">
              → {formatCurrency(transferData?.transferOut || 0)}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-purple-300/70 mt-3">
        * Transfers represent internal money movement between your accounts and
        do not affect your total income or expenses.
      </p>
    </div>
  );
};

TransferInformationCard.propTypes = {
  transferData: PropTypes.shape({
    transferIn: PropTypes.number,
    transferOut: PropTypes.number,
  }),
};

// Smart Insights Component with Time Filters
const SmartInsightsSection = ({
  insights,
  years,
  months,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}) => (
  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 mt-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <h3 className="text-2xl font-bold text-purple-300 flex items-center">
        <Lightbulb className="mr-3" size={24} />
        Smart Insights & Recommendations
      </h3>

      {/* Time Filter Controls */}
      <div className="flex items-center gap-3">
        <Filter size={18} className="text-purple-400" />
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="bg-gray-800/80 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
        >
          <option value="all">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="bg-gray-800/80 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
          disabled={selectedYear === "all"}
        >
          <option value="all">All Months</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="space-y-4">
      {insights.map((insight) => (
        <div
          key={`${insight.type}-${insight.title}`}
          className={`p-4 rounded-xl border transition-all hover:shadow-lg ${getInsightPriorityColor(
            insight.priority
          )}`}
        >
          <div className="flex items-start">
            <span className="text-3xl mr-4 flex-shrink-0">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-white mb-2">
                {insight.title}
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {insight.message}
              </p>
              {insight.category && (
                <span className="inline-block mt-2 px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  {insight.category}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {insights.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>Not enough data to generate insights for this time period.</p>
          <p className="text-sm mt-2">Try selecting a different time range!</p>
        </div>
      )}
    </div>
  </div>
);

SmartInsightsSection.propTypes = {
  insights: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      category: PropTypes.string,
    })
  ).isRequired,
  years: PropTypes.arrayOf(PropTypes.number).isRequired,
  months: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedYear: PropTypes.string.isRequired,
  selectedMonth: PropTypes.string.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onMonthChange: PropTypes.func.isRequired,
};

/**
 * Overview Section - Dashboard home with KPIs and key metrics
 */
export const OverviewSection = ({
  kpiData,
  additionalKpiData,
  accountBalances,
  keyInsights,
  filteredData,
}) => {
  // State for insights time filters
  const [insightsYear, setInsightsYear] = useState("all");
  const [insightsMonth, setInsightsMonth] = useState("all");

  // Generate enhanced KPI data
  const enhancedKPI = useEnhancedKPIData(filteredData, kpiData);

  // Generate advanced analytics
  const analytics = useAdvancedAnalytics(filteredData);

  // Extract unique years and months from filtered data
  const { years, months } = useMemo(
    () => getYearsAndMonths(filteredData),
    [filteredData]
  );

  // Filter transactions for insights based on selected year/month
  const insightsFilteredData = useMemo(
    () => filterTransactionsByTime(filteredData, insightsYear, insightsMonth),
    [filteredData, insightsYear, insightsMonth]
  );

  // Generate smart insights with filtered data
  const insights = useMemo(
    () => generateSmartInsights(insightsFilteredData),
    [insightsFilteredData]
  );

  // Handle year/month change and reset month when year changes to 'all'
  const handleYearChange = (year) => {
    setInsightsYear(year);
    if (year === "all") {
      setInsightsMonth("all");
    }
  };

  return (
    <div>
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KPICard
          title="Total Income"
          value={kpiData.income}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <KPICard
          title="Total Expense"
          value={kpiData.expense}
          icon={<TrendingDown size={24} />}
          color="red"
        />
        <KPICard
          title="Net Balance"
          value={kpiData.income - kpiData.expense}
          icon={<Wallet size={24} />}
          color="blue"
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <SmallKPICard
          title="Total Transactions"
          value={additionalKpiData.totalTransactions}
          icon={<Hash size={22} />}
          isCount={true}
        />
        <SmallKPICard
          title="Highest Expense"
          value={additionalKpiData.highestExpense}
          icon={<Target size={22} />}
        />
        <SmallKPICard
          title="Average Expense"
          value={additionalKpiData.averageExpense}
          icon={<Sigma size={22} />}
        />
      </div>

      {/* Advanced Analytics KPI Cards - NEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SmallKPICard
          title="Monthly Trend"
          value={getMonthlyTrendDisplay(analytics?.monthlyComparison)}
          icon={<TrendingUp size={22} />}
          isCount={false}
        />
        <SmallKPICard
          title="Active Subscriptions"
          value={getSubscriptionsDisplay(analytics?.recurringTransactions)}
          icon={<Repeat size={22} />}
          isCount={false}
        />
        <SmallKPICard
          title="Anomaly Alerts"
          value={getAnomalyAlertDisplay(analytics?.anomalies?.length || 0)}
          icon={<AlertTriangle size={22} />}
          isCount={false}
        />
      </div>

      {/* Financial Health Metrics - NEW */}
      <FinancialHealthMetrics enhancedKPI={enhancedKPI} />

      {/* Transfer Information Cards */}
      <TransferInformationCard transferData={additionalKpiData.transferData} />

      {/* Account Balances */}
      <AccountBalancesCard balances={accountBalances} />

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 mt-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mr-3 shadow-lg">
            <LayoutGrid size={24} className="text-white" />
          </div>
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SmallKPICard
            title="Busiest Spending Day"
            value={keyInsights.busiestDay}
            icon={<CalendarDays size={22} />}
          />
          <SmallKPICard
            title="Most Frequent Category"
            value={keyInsights.mostFrequentCategory}
            icon={<LayoutGrid size={22} />}
          />
          <SmallKPICard
            title="Avg. Transaction Value"
            value={keyInsights.avgTransactionValue}
            icon={<Calculator size={22} />}
          />
        </div>
      </div>

      {/* Smart Insights & Recommendations - NEW with Time Filters */}
      <SmartInsightsSection
        insights={insights}
        years={years}
        months={months}
        selectedYear={insightsYear}
        selectedMonth={insightsMonth}
        onYearChange={handleYearChange}
        onMonthChange={setInsightsMonth}
      />
    </div>
  );
};

OverviewSection.propTypes = {
  kpiData: PropTypes.shape({
    income: PropTypes.number.isRequired,
    expense: PropTypes.number.isRequired,
  }).isRequired,
  additionalKpiData: PropTypes.shape({
    totalTransactions: PropTypes.number.isRequired,
    highestExpense: PropTypes.number.isRequired,
    averageExpense: PropTypes.number.isRequired,
    transferData: PropTypes.shape({
      transferIn: PropTypes.number,
      transferOut: PropTypes.number,
    }),
  }).isRequired,
  accountBalances: PropTypes.array.isRequired,
  keyInsights: PropTypes.shape({
    busiestDay: PropTypes.string.isRequired,
    mostFrequentCategory: PropTypes.string.isRequired,
    avgTransactionValue: PropTypes.number.isRequired,
  }).isRequired,
  filteredData: PropTypes.array.isRequired,
};
