import React from "react";
import PropTypes from "prop-types";
import { FoodAnalyticsDashboard } from "../../../features/analytics/components/FoodAnalyticsDashboard";
import { CommuteOptimizer } from "../../../features/analytics/components/CommuteOptimizer";
import { AccountDashboard } from "../../../features/analytics/components/AccountDashboard";

/**
 * Category Insights Section
 * Specialized analytics for specific spending categories
 */
export const CategoryInsightsSection = ({ filteredData }) => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🧠 Category Insights
        </h1>
        <p className="text-gray-400">
          Deep dive into specific spending categories with AI-powered insights
        </p>
      </div>

      {/* Food Analytics */}
      <div>
        <div id="food-analytics">
          <FoodAnalyticsDashboard filteredData={filteredData} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Commute Optimizer */}
      <div>
        <div id="commute-optimizer">
          <CommuteOptimizer filteredData={filteredData} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Account Analytics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-3">🏦</span>
          Account Analytics
        </h2>
        <div id="account-dashboard">
          <AccountDashboard filteredData={filteredData} />
        </div>
      </div>
    </div>
  );
};

CategoryInsightsSection.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
