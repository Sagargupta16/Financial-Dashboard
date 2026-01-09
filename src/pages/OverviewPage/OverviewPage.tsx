// @ts-nocheck

import {
  ArrowLeftRight,
  Calculator,
  Calendar,
  CalendarDays,
  Filter,
  Flame,
  LayoutGrid,
  Lightbulb,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  CATEGORY_CONCENTRATION_THRESHOLD,
  DEFAULT_ADDITIONAL_KPI,
  DEFAULT_KEY_INSIGHTS,
  DEFAULT_KPI_VALUES,
  MESSAGES,
} from "../../config/overview";
import { useAdvancedAnalytics } from "../../features/analytics/hooks/useAdvancedAnalytics";
import { SmallKPICard } from "../../features/kpi/components/KPICards";
import {
  AdvancedAnalyticsKPISection,
  SecondaryKPISection,
} from "../../features/kpi/components/KPISections";
import { useEnhancedKPIData } from "../../features/kpi/hooks/useCalculations";
import { generateSmartInsights } from "../../lib/analytics/insights";
import {
  getCategoryConcentrationColor,
  getInsightPriorityColor,
  getNetWorthColor,
  getNetWorthIconColor,
  getSavingsRateColor,
  getSavingsRateIconColor,
  getSavingsRateMessage,
  getSectionStyles,
  getSpendingVelocityColor,
  getSpendingVelocityIconColor,
  getYearsAndMonths,
  validateKPIData,
} from "../../lib/analytics/metrics";
import { calculateNetBalanceBreakdownFromAccounts } from "../../lib/calculations/financial";
import { formatCurrency } from "../../lib/formatters";
import { AccountBalancesCard } from "./components/AccountBalancesCard";
import { MainKPISection } from "./components/MainKPISection";

// Filter transactions by year and month
const filterTransactionsByTime = (transactions, year, month) => {
  if (year === "all") {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    const txYear = date.getFullYear();
    const txMonth = date.getMonth();

    if (txYear !== Number.parseInt(year, 10)) {
      return false;
    }

    if (month === "all") {
      return true;
    }

    return txMonth === Number.parseInt(month, 10);
  });
};

// Financial Health Metrics Component
const FinancialHealthMetrics = ({ enhancedKPI }) => {
  // Validate and provide defaults for enhanced KPI data
  const kpiData = validateKPIData(enhancedKPI, DEFAULT_KPI_VALUES);
  const sectionStyles = getSectionStyles("financial-health");

  return (
    <div
      className={`bg-gradient-to-br ${sectionStyles.gradient} border ${sectionStyles.border} rounded-2xl p-6 mb-8`}
    >
      <h3 className="text-2xl font-bold text-blue-300 mb-6 flex items-center">
        <TrendingUp className="mr-3" size={24} />
        Financial Health Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* Savings Rate */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${getSavingsRateColor(
            kpiData.savingsRate
          )}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Savings Rate</span>
            <PiggyBank size={22} className={getSavingsRateIconColor(kpiData.savingsRate)} />
          </div>
          <div className="text-3xl font-bold text-white">
            {(kpiData.savingsRate ?? 0).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {getSavingsRateMessage(kpiData.savingsRate)}
          </div>
        </div>

        {/* Daily Spending */}
        <SmallKPICard
          title="Daily Spending"
          value={kpiData.dailySpendingRate}
          icon={<Flame size={22} />}
        />

        {/* Monthly Burn Rate */}
        <SmallKPICard
          title="Monthly Burn Rate"
          value={kpiData.monthlyBurnRate}
          icon={<Calendar size={22} />}
        />

        {/* Net Worth Change */}
        <div className={`p-4 rounded-xl border ${getNetWorthColor(kpiData.netWorth)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Net Worth Change</span>
            <TrendingUp size={22} className={getNetWorthIconColor(kpiData.netWorth)} />
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(kpiData.netWorth)}</div>
          <div className="text-xs text-gray-400 mt-1">
            {formatCurrency(Math.abs(kpiData.netWorthPerMonth))}/month{" "}
            {kpiData.netWorth >= 0 ? "↑" : "↓"}
          </div>
        </div>

        {/* Spending Velocity */}
        <div
          className={`p-4 rounded-xl border ${getSpendingVelocityColor(kpiData.spendingVelocity)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Spending Velocity (30d)</span>
            <Calculator
              size={22}
              className={getSpendingVelocityIconColor(kpiData.spendingVelocity)}
            />
          </div>
          <div className="text-3xl font-bold text-white">
            {(kpiData.spendingVelocity ?? 0).toFixed(0)}%
            {(kpiData.spendingVelocity ?? 0) > 100 ? " ↑" : " ↓"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {kpiData.spendingVelocity > 100 ? "Above" : "Below"} average
          </div>
        </div>

        {/* Category Concentration */}
        {kpiData.categoryConcentration && (
          <div
            className={`p-4 rounded-xl border ${getCategoryConcentrationColor(
              kpiData.categoryConcentration.percentage,
              CATEGORY_CONCENTRATION_THRESHOLD
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Top Category</span>
              <LayoutGrid size={22} className="text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white truncate">
              {kpiData.categoryConcentration.category}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {(kpiData.categoryConcentration?.percentage ?? 0).toFixed(0)}% of spending
              {(kpiData.categoryConcentration?.percentage ?? 0) >
                CATEGORY_CONCENTRATION_THRESHOLD && " ⚠️"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Transfer Information Component
const TransferInformationCard = ({ transferData }) => {
  const sectionStyles = getSectionStyles("transfer-info");

  if (!transferData?.transferIn && !transferData?.transferOut) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-br ${sectionStyles.gradient} border ${sectionStyles.border} rounded-2xl p-6 mb-8`}
    >
      <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
        <div className="p-2 rounded-lg bg-purple-900/50 text-purple-400 mr-3">
          <ArrowLeftRight size={20} />
        </div>
        Account Transfers (Internal Money Movement)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-900/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-300">Money Transferred In</span>
            <span className="text-lg font-bold text-purple-400">
              ← {formatCurrency(transferData?.transferIn || 0)}
            </span>
          </div>
        </div>
        <div className="bg-purple-900/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-300">Money Transferred Out</span>
            <span className="text-lg font-bold text-purple-400">
              → {formatCurrency(transferData?.transferOut || 0)}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-purple-300/70 mt-3">* {MESSAGES.TRANSFER_DISCLAIMER}</p>
    </div>
  );
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
}) => {
  const sectionStyles = getSectionStyles("insights");

  return (
    <div
      className={`bg-gradient-to-br ${sectionStyles.gradient} border ${sectionStyles.border} rounded-2xl p-6 mt-6`}
    >
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
            aria-label="Select year for insights"
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
            aria-label="Select month for insights"
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
        {insights.map((insight, index) => (
          <div
            key={`${insight.type}-${insight.title}-${index}`}
            className={`p-4 rounded-xl border transition-all hover:shadow-lg ${getInsightPriorityColor(
              insight.priority
            )}`}
          >
            <div className="flex items-start">
              <span className="text-3xl mr-4 flex-shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-white mb-2">{insight.title}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{insight.message}</p>
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
            <p>{MESSAGES.NO_DATA}</p>
            <p className="text-sm mt-2">{MESSAGES.TRY_DIFFERENT_RANGE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Overview Section - Dashboard home with KPIs and key metrics
 */
export const OverviewPage = ({
  kpiData,
  additionalKpiData,
  accountBalances,
  keyInsights,
  filteredData,
}) => {
  // State for insights time filters
  const [insightsYear, setInsightsYear] = useState("all");
  const [insightsMonth, setInsightsMonth] = useState("all");

  // Validate input data with defaults
  const validatedAdditionalKPI = validateKPIData(additionalKpiData, DEFAULT_ADDITIONAL_KPI);
  const validatedKeyInsights = validateKPIData(keyInsights, DEFAULT_KEY_INSIGHTS);

  // Generate enhanced KPI data
  const enhancedKPI = useEnhancedKPIData(filteredData, kpiData);

  // Generate advanced analytics
  const analytics = useAdvancedAnalytics(filteredData);

  // Extract unique years and months from filtered data
  const { sortedYears: years, monthLabels: months } = useMemo(
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

  // Calculate net balance breakdown from actual account balances
  const balanceBreakdown = useMemo(
    () => calculateNetBalanceBreakdownFromAccounts(accountBalances),
    [accountBalances]
  );

  // Handle year/month change and reset month when year changes to 'all'
  const handleYearChange = useCallback((year) => {
    setInsightsYear(year);
    if (year === "all") {
      setInsightsMonth("all");
    }
  }, []);

  const handleMonthChange = useCallback((month) => {
    setInsightsMonth(month);
  }, []);

  const sectionStyles = getSectionStyles("key-insights");

  return (
    <div>
      {/* Main KPI Cards */}
      <MainKPISection
        income={kpiData.income}
        expense={kpiData.expense}
        balanceBreakdown={balanceBreakdown}
      />

      {/* Secondary KPI Cards */}
      <SecondaryKPISection
        totalTransactions={validatedAdditionalKPI.totalTransactions}
        highestExpense={validatedAdditionalKPI.highestExpense}
        averageExpense={validatedAdditionalKPI.averageExpense}
        cashbackData={validatedAdditionalKPI.cashbackData}
        reimbursementData={validatedAdditionalKPI.reimbursementData}
      />

      {/* Advanced Analytics KPI Cards */}
      <AdvancedAnalyticsKPISection analytics={analytics} formatCurrency={formatCurrency} />

      {/* Financial Health Metrics */}
      <FinancialHealthMetrics enhancedKPI={enhancedKPI} />

      {/* Transfer Information Cards */}
      <TransferInformationCard transferData={validatedAdditionalKPI.transferData} />

      {/* Account Balances */}
      <AccountBalancesCard balances={accountBalances} />

      {/* Key Insights */}
      <div
        className={`bg-gradient-to-br ${sectionStyles.gradient} backdrop-blur-sm rounded-2xl p-6 mt-6 border ${sectionStyles.border}`}
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mr-3 shadow-lg">
            <LayoutGrid size={24} className="text-white" />
          </div>
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SmallKPICard
            title="Busiest Spending Day"
            value={validatedKeyInsights.busiestDay}
            icon={<CalendarDays size={22} />}
          />
          <SmallKPICard
            title="Most Frequent Category"
            value={validatedKeyInsights.mostFrequentCategory}
            icon={<LayoutGrid size={22} />}
          />
          <SmallKPICard
            title="Avg. Transaction Value"
            value={validatedKeyInsights.avgTransactionValue}
            icon={<Calculator size={22} />}
          />
        </div>
      </div>

      {/* Smart Insights & Recommendations */}
      <SmartInsightsSection
        insights={insights}
        years={years}
        months={months}
        selectedYear={insightsYear}
        selectedMonth={insightsMonth}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
};
