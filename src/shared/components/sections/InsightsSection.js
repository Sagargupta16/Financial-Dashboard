import React from "react";
import PropTypes from "prop-types";
import { FoodAnalyticsDashboard } from "../../../features/analytics/components/FoodAnalyticsDashboard";
import { CommuteOptimizer } from "../../../features/analytics/components/CommuteOptimizer";
import { AccountDashboard } from "../../../features/analytics/components/AccountDashboard";

/**
 * Insights Section
 * Combines all data-driven analytics in one place
 */
export const InsightsSection = ({ filteredData }) => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🔍 Smart Insights
        </h1>
        <p className="text-gray-400">
          Personalized analytics based on your actual spending patterns
        </p>
      </div>

      {/* Food Analytics */}
      <div id="food-analytics">
        <FoodAnalyticsDashboard filteredData={filteredData} />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Commute Optimizer */}
      <div id="commute-optimizer">
        <CommuteOptimizer filteredData={filteredData} />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Account Dashboard */}
      <div id="account-dashboard">
        <AccountDashboard filteredData={filteredData} />
      </div>
    </div>
  );
};

InsightsSection.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
