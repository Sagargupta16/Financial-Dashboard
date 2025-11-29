import React from "react";
import PropTypes from "prop-types";
import {
  Hash,
  Target,
  Sigma,
  TrendingUp,
  Repeat,
  AlertTriangle,
} from "lucide-react";
import { SmallKPICard } from "../ui/KPICards";
import {
  getMonthlyTrendDisplay,
  getAnomalyAlertDisplay,
  getSubscriptionsDisplay,
} from "../../utils/metricHelpers";

/**
 * Secondary KPI Cards Section
 * Displays additional metrics: Total Transactions, Highest Expense, Average Expense
 */
export const SecondaryKPISection = ({
  totalTransactions = 0,
  highestExpense = 0,
  averageExpense = 0,
}) => {
  return (
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
  );
};

SecondaryKPISection.propTypes = {
  totalTransactions: PropTypes.number,
  highestExpense: PropTypes.number,
  averageExpense: PropTypes.number,
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
