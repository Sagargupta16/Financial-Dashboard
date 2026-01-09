/**
 * Tab Configuration
 * Centralized tab definitions for the application
 */

import {
  CreditCard,
  FileText,
  LayoutDashboard,
  LineChart,
  Receipt,
  Repeat,
  Tags,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

export const TABS_CONFIG = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Quick snapshot of your financial health",
  },
  {
    id: "income-expense",
    label: "Income & Expenses",
    icon: TrendingUp,
    description: "Detailed income and spending analysis",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tags,
    description: "Deep dive into spending categories",
  },
  {
    id: "trends",
    label: "Trends & Forecasts",
    icon: LineChart,
    description: "Advanced analytics and predictions",
  },
  {
    id: "investments",
    label: "Investments",
    icon: TrendingDown,
    description: "Stock market performance and P&L tracking",
  },
  {
    id: "tax-planning",
    label: "Tax Planning",
    icon: FileText,
    description: "Income tax calculations and deductions",
  },
  {
    id: "family-housing",
    label: "Family & Housing",
    icon: Users,
    description: "Family expenses and housing costs",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: CreditCard,
    description: "Credit cards, food, and commute optimization",
  },
  {
    id: "budget-goals",
    label: "Budget & Planning",
    icon: Target,
    description: "Financial health, budgets, and planning tools",
  },
  {
    id: "patterns",
    label: "Subscriptions & Patterns",
    icon: Repeat,
    description: "Recurring payments and spending patterns",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: Receipt,
    description: "Detailed transaction list with filters",
  },
];
