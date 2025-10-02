/* eslint-disable max-lines-per-function */
import React from "react";
import PropTypes from "prop-types";
import { SpendingSimulator } from "./SpendingSimulator";
import { RecurringPayments } from "./RecurringPayments";
import { FinancialHealthScore } from "../../../shared/components/ui/FinancialHealthScore";
import { SpendingCalendar } from "../../../shared/components/ui/SpendingCalendar";

/**
 * Budget & Goals Section - Comprehensive financial planning tools
 */
export const BudgetGoalsSection = ({
  filteredData,
  kpiData,
  accountBalances,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Financial Health Score */}
      <FinancialHealthScore
        filteredData={filteredData}
        kpiData={kpiData}
        accountBalances={accountBalances}
      />

      {/* What-If Spending Simulator */}
      <div className="bg-gray-800/50 rounded-2xl p-6">
        <SpendingSimulator filteredData={filteredData} />
      </div>

      {/* Spending Calendar Heatmap */}
      <div className="bg-gray-800/50 rounded-2xl p-6">
        <SpendingCalendar filteredData={filteredData} />
      </div>

      {/* Recurring Payments Detector */}
      <div className="bg-gray-800/50 rounded-2xl p-6">
        <RecurringPayments filteredData={filteredData} />
      </div>
    </div>
  );
};

BudgetGoalsSection.propTypes = {
  filteredData: PropTypes.array.isRequired,
  kpiData: PropTypes.object.isRequired,
  accountBalances: PropTypes.object.isRequired,
};
