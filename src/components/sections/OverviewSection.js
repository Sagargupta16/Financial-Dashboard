import React from "react";
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
} from "lucide-react";
import { KPICard, SmallKPICard } from "../UI/KPICards";
import { AccountBalancesCard } from "../UI/AccountBalancesCard";
import { formatCurrency } from "../../utils/dataUtils";

/**
 * Overview Section - Dashboard home with KPIs and key metrics
 */
export const OverviewSection = ({
  kpiData,
  additionalKpiData,
  accountBalances,
  keyInsights,
}) => {
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

      {/* Transfer Information Cards */}
      {(additionalKpiData.transferData?.transferIn > 0 ||
        additionalKpiData.transferData?.transferOut > 0) && (
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
                  ←{" "}
                  {formatCurrency(
                    additionalKpiData.transferData?.transferIn || 0
                  )}
                </span>
              </div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">
                  Money Transferred Out
                </span>
                <span className="text-lg font-bold text-purple-400">
                  →{" "}
                  {formatCurrency(
                    additionalKpiData.transferData?.transferOut || 0
                  )}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-purple-300/70 mt-3">
            * Transfers represent internal money movement between your accounts
            and do not affect your total income or expenses.
          </p>
        </div>
      )}

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
};
