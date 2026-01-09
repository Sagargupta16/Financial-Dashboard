// @ts-nocheck
import {
  CreditCard,
  TrendingUp as Investment,
  Landmark,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { KPICard, SmallKPICard } from "../../../features/kpi/components/KPICards";

/**
 * Main KPI Cards Section
 * Displays primary financial metrics: Income, Expense, Net Balance with breakdown
 */
export const MainKPISection = ({ income = 0, expense = 0, balanceBreakdown = null }) => {
  const netBalance = income - expense;

  return (
    <>
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
        <KPICard title="Net Balance" value={netBalance} icon={<Wallet size={24} />} color="blue" />
      </div>

      {/* Net Balance Breakdown */}
      {balanceBreakdown && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SmallKPICard
            title="Cash & Bank"
            value={balanceBreakdown.cash || 0}
            icon={<Landmark size={20} />}
            color="blue"
          />
          <SmallKPICard
            title="Investments"
            value={balanceBreakdown.investments || 0}
            icon={<Investment size={20} />}
            color="green"
          />
          <SmallKPICard
            title="Deposits/Friends"
            value={balanceBreakdown.deposits || 0}
            icon={<Users size={20} />}
            color="purple"
          />
          <SmallKPICard
            title="Credit Card Debt"
            value={Math.abs(balanceBreakdown.debt || 0)}
            icon={<CreditCard size={20} />}
            color={balanceBreakdown.debt < 0 ? "red" : "gray"}
          />
        </div>
      )}
    </>
  );
};
