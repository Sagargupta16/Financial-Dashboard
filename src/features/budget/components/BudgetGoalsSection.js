/* eslint-disable max-lines-per-function */
import React from "react";
import PropTypes from "prop-types";
import { SpendingSimulator } from "./SpendingSimulator";
import { FinancialHealthScore } from "../../../shared/components/ui/FinancialHealthScore";
import { SpendingCalendar } from "../../../shared/components/ui/SpendingCalendar";

/**
 * Budget & Planning Section - Financial health and planning tools
 */
export const BudgetGoalsSection = ({
  filteredData,
  kpiData,
  accountBalances,
}) => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🎯 Budget & Planning
        </h1>
        <p className="text-gray-400">
          Track your financial health and plan your spending
        </p>
      </div>

      {/* Financial Health Score */}
      <div>
        <FinancialHealthScore
          filteredData={filteredData}
          kpiData={kpiData}
          accountBalances={accountBalances}
        />
      </div>

      {/* Planning Tools Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">🛠️</span>
          Planning Tools
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {/* What-If Spending Simulator */}
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <SpendingSimulator filteredData={filteredData} />
          </div>

          {/* Spending Calendar Heatmap */}
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <SpendingCalendar filteredData={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

BudgetGoalsSection.propTypes = {
  filteredData: PropTypes.array.isRequired,
  kpiData: PropTypes.object.isRequired,
  accountBalances: PropTypes.object.isRequired,
};
