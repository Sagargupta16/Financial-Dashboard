/* eslint-disable max-lines-per-function */
import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { BudgetPlanner } from "./BudgetPlanner";
import { NeedsWantsSavings } from "./NeedsWantsSavings";
import { MonthlyYearlyNWS } from "./MonthlyYearlyNWS";
import { FinancialHealthScore } from "../../../components/data-display/FinancialHealthScore";
import { SpendingCalendar } from "../../../components/data-display/SpendingCalendar";
import { Tabs } from "../../../components/ui/Tabs";

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
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  // Extract investments and deposits from accountBalances (uploaded Excel data)
  const { investments, deposits, bankAccounts } = useMemo(() => {
    const investmentAccounts = {};
    const depositAccounts = {};
    const bankOnly = {};

    if (accountBalances && typeof accountBalances === "object") {
      // Handle array format: [{name, balance}]
      const entries = Array.isArray(accountBalances)
        ? accountBalances.map((acc) => [acc.name, acc.balance])
        : Object.entries(accountBalances);

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
        <h1 className="text-3xl font-bold text-white mb-2">
          🎯 Budget & Planning
        </h1>
        <p className="text-gray-400">
          Track your financial health and plan your spending with
          Needs/Wants/Savings breakdown
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Financial Health Score */}
          <div>
            <FinancialHealthScore
              filteredData={filteredData}
              kpiData={kpiData}
              accountBalances={bankAccounts}
              allAccountBalances={accountBalances}
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
          <SpendingCalendar filteredData={filteredData} />
        </div>
      )}
    </div>
  );
};

BudgetGoalsSection.propTypes = {
  filteredData: PropTypes.array.isRequired,
  kpiData: PropTypes.object.isRequired,
  accountBalances: PropTypes.object.isRequired,
};
