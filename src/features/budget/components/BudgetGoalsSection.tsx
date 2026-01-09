import { useMemo, useState } from "react";
import { FinancialHealthScore } from "../../../components/data-display/FinancialHealthScore";
import { SpendingCalendar } from "../../../components/data-display/SpendingCalendar";
import { CustomTabs } from "../../../components/ui/CustomTabs";
import type { Transaction } from "../../../types";
import { BudgetPlanner } from "./BudgetPlanner";
import { MonthlyYearlyNWS } from "./MonthlyYearlyNWS";
import { NeedsWantsSavings } from "./NeedsWantsSavings";

type AccountBalanceEntry = {
  name: string;
  balance: number;
};

type AccountBalances = Record<string, number> | AccountBalanceEntry[];

interface BudgetGoalsSectionProps {
  filteredData: Transaction[];
  kpiData: Record<string, unknown>;
  accountBalances?: AccountBalances | null;
}

/**
 * Budget & Planning Section - Redesigned for Perfect Calculations
 * - BudgetPlanner: Simplified budget tracking with 3-month trends
 * - NeedsWantsSavings: 50/30/20 budget breakdown
 * - MonthlyYearlyNWS: Period-based analysis
 * - FinancialHealthScore: Comprehensive health metrics
 * - SpendingCalendar: Visual spending patterns
 */
export const BudgetGoalsSection = ({
  filteredData,
  kpiData,
  accountBalances,
}: BudgetGoalsSectionProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  // Extract investments and deposits from accountBalances (uploaded Excel data)
  const { investments, deposits, bankAccounts } = useMemo(() => {
    const investmentAccounts: Record<string, number> = {};
    const depositAccounts: Record<string, number> = {};
    const bankOnly: Record<string, number> = {};

    if (accountBalances && typeof accountBalances === "object") {
      // Handle array format: [{name, balance}]
      const entries: Array<[string, number]> = Array.isArray(accountBalances)
        ? accountBalances.map((acc) => [acc.name, acc.balance])
        : Object.entries(accountBalances).map(([name, balance]) => [name, Number(balance)]);

      entries.forEach(([name, balance]) => {
        const nameLower = name.toLowerCase();

        // Classify as investments (mutual funds, stocks)
        if (
          (nameLower.includes("mutual") ||
            nameLower.includes("stock") ||
            nameLower.includes("equity") ||
            nameLower.includes("fund")) &&
          !nameLower.includes("fam") &&
          !nameLower.includes("friend")
        ) {
          investmentAccounts[name] = balance;
        }
        // Classify as deposits (FD, RD, landed property, loans - fam/friend/flat)
        else if (
          nameLower.includes("fd") ||
          nameLower.includes("deposit") ||
          nameLower.includes("land") ||
          nameLower.includes("property") ||
          nameLower.includes("rd") ||
          nameLower.includes("loan") ||
          nameLower.includes("fam") ||
          nameLower.includes("family") ||
          nameLower.includes("friend") ||
          nameLower.includes("flat")
        ) {
          depositAccounts[name] = balance;
        }
        // Everything else is liquid bank account (unless it's credit card debt)
        else if (!nameLower.includes("credit card")) {
          bankOnly[name] = balance;
        }
      });
    }

    return {
      investments: investmentAccounts,
      deposits: depositAccounts,
      bankAccounts: bankOnly,
    };
  }, [accountBalances]);

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "budgets", label: "Category Budgets", icon: "💰" },
    { id: "nws", label: "Needs/Wants/Savings", icon: "🎯" },
    { id: "timeline", label: "Monthly & Yearly", icon: "📈" },
    { id: "calendar", label: "Spending Calendar", icon: "📅" },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Budget & Planning</h1>
        <p className="text-gray-400">
          Track your financial health and plan your spending with Needs/Wants/Savings breakdown
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <CustomTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Financial Health Score */}
          <div>
            <FinancialHealthScore
              filteredData={filteredData as unknown as Record<string, unknown>[]}
              kpiData={kpiData}
              accountBalances={bankAccounts}
              investments={investments}
              deposits={deposits}
            />
          </div>

          {/* Needs/Wants/Savings Summary */}
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <NeedsWantsSavings transactions={filteredData} />
          </div>
        </div>
      )}

      {activeTab === "budgets" && (
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <BudgetPlanner filteredData={filteredData} />
        </div>
      )}

      {activeTab === "nws" && (
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <NeedsWantsSavings transactions={filteredData} />
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <MonthlyYearlyNWS transactions={filteredData} />
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <SpendingCalendar
            filteredData={
              filteredData as unknown as Array<
                {
                  date?: string | Date;
                  type?: string;
                  amount?: number | string;
                  category?: string;
                } & Record<string, unknown>
              >
            }
          />
        </div>
      )}
    </div>
  );
};
