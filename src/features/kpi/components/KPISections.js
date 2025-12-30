import PropTypes from "prop-types";
import {
  Hash,
  Target,
  Sigma,
  TrendingUp,
  Repeat,
  AlertTriangle,
  Gift,
  Receipt,
} from "lucide-react";
import { SmallKPICard } from "./KPICards";
import {
  getMonthlyTrendDisplay,
  getAnomalyAlertDisplay,
  getSubscriptionsDisplay,
} from "../../../lib/analytics/metrics";

/**
 * Secondary KPI Cards Section
 * Displays additional metrics: Total Transactions, Highest Expense, Average Expense
 */
export const SecondaryKPISection = ({
  totalTransactions = 0,
  highestExpense = 0,
  averageExpense = 0,
  cashbackData = null,
  reimbursementData = null,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <SmallKPICard
          title="Total Transactions"
          value={totalTransactions}
          icon={<Hash size={22} />}
          isCount={true}
        />
        <SmallKPICard
          title="Highest Expense"
          value={highestExpense}
          icon={<Target size={22} />}
        />
        <SmallKPICard
          title="Average Expense"
          value={averageExpense}
          icon={<Sigma size={22} />}
        />
      </div>

      {/* Cashback & Reimbursement Section */}
      {(cashbackData || reimbursementData) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Cashback Earned */}
          {cashbackData && (
            <SmallKPICard
              title="Total Cashback Earned"
              value={cashbackData.totalCashbackEarned || 0}
              icon={<Gift size={22} />}
              color="green"
            />
          )}

          {/* Cashback Shared */}
          {cashbackData && cashbackData.cashbackShared > 0 && (
            <SmallKPICard
              title="Cashback Shared"
              value={cashbackData.cashbackShared || 0}
              icon={<Gift size={22} />}
              color="orange"
            />
          )}

          {/* Actual Cashback */}
          {cashbackData && (
            <SmallKPICard
              title="Actual Cashback"
              value={cashbackData.actualCashback || 0}
              icon={<Gift size={22} />}
              color="purple"
            />
          )}

          {/* Total Reimbursements */}
          {reimbursementData && reimbursementData.totalReimbursements > 0 && (
            <SmallKPICard
              title="Reimbursements"
              value={reimbursementData.totalReimbursements || 0}
              icon={<Receipt size={22} />}
              color="blue"
            />
          )}
        </div>
      )}
    </>
  );
};

SecondaryKPISection.propTypes = {
  totalTransactions: PropTypes.number,
  highestExpense: PropTypes.number,
  averageExpense: PropTypes.number,
  cashbackData: PropTypes.shape({
    totalCashbackEarned: PropTypes.number,
    cashbackShared: PropTypes.number,
    actualCashback: PropTypes.number,
  }),
  reimbursementData: PropTypes.shape({
    totalReimbursements: PropTypes.number,
  }),
};

/**
 * Advanced Analytics KPI Cards Section
 * Displays: Monthly Trend, Active Subscriptions, Anomaly Alerts
 */
export const AdvancedAnalyticsKPISection = ({ analytics, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SmallKPICard
        title="Monthly Trend"
        value={getMonthlyTrendDisplay(analytics?.monthlyComparison)}
        icon={<TrendingUp size={22} />}
        isCount={false}
      />
      <SmallKPICard
        title="Active Subscriptions"
        value={getSubscriptionsDisplay(
          analytics?.recurringTransactions,
          formatCurrency
        )}
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
  );
};

AdvancedAnalyticsKPISection.propTypes = {
  analytics: PropTypes.shape({
    monthlyComparison: PropTypes.object,
    recurringTransactions: PropTypes.array,
    anomalies: PropTypes.array,
  }),
  formatCurrency: PropTypes.func.isRequired,
};
