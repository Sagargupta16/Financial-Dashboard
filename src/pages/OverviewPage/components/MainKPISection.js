import React from "react";
import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { KPICard } from "../ui/KPICards";

/**
 * Main KPI Cards Section
 * Displays primary financial metrics: Income, Expense, Net Balance
 */
export const MainKPISection = ({ income = 0, expense = 0 }) => {
  const netBalance = income - expense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <KPICard
        title="Total Income"
        value={income}
        icon={<TrendingUp size={24} />}
        color="green"
      />
      <KPICard
        title="Total Expense"
        value={expense}
        icon={<TrendingDown size={24} />}
        color="red"
      />
      <KPICard
        title="Net Balance"
        value={netBalance}
        icon={<Wallet size={24} />}
        color="blue"
      />
    </div>
  );
};

MainKPISection.propTypes = {
  income: PropTypes.number,
  expense: PropTypes.number,
};
