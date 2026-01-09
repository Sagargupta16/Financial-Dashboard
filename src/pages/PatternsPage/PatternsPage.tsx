// @ts-nocheck
import { RecurringPayments } from "../../features/budget/components/RecurringPayments";
import { AdvancedAnalyticsDashboard } from "../AdvancedAnalyticsPage/AdvancedAnalyticsPage";

/**
 * Subscriptions & Patterns Section
 * Recurring payments, subscriptions, and advanced spending analytics
 */
export const PatternsPage = ({ filteredData }) => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🔁 Subscriptions & Patterns</h1>
        <p className="text-gray-400">
          Track recurring expenses and discover advanced spending patterns
        </p>
      </div>

      {/* Subscriptions & Recurring Payments */}
      <div>
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <RecurringPayments filteredData={filteredData} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Advanced Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-3">📊</span> Advanced Analytics
        </h2>
        <div id="advanced-analytics">
          <AdvancedAnalyticsDashboard filteredData={filteredData} />
        </div>
      </div>
    </div>
  );
};
