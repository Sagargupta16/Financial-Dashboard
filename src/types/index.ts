/**
 * Core Type Definitions for Financial Dashboard
 */

// Transaction Types
export type TransactionType = "Income" | "Expense";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory: string;
  description?: string;
  notes?: string;
  tags?: string[];
}

// Category & Subcategory
export interface CategoryMapping {
  [category: string]: string[];
}

// Financial Year
export interface FinancialYearData {
  year: string;
  startDate: Date;
  endDate: Date;
}

// Budget Types
export interface BudgetItem {
  category: string;
  amount: number;
  spent?: number;
  remaining?: number;
}

export interface NWSBreakdown {
  needs: number;
  wants: number;
  savings: number;
  percentages: {
    needs: { percentage: number; amount: number };
    wants: { percentage: number; amount: number };
    savings: { percentage: number; amount: number };
  };
}

export interface MonthlyNWSData extends NWSBreakdown {
  monthKey: string;
  income: number;
  expenses: number;
}

export interface YearlyNWSData extends NWSBreakdown {
  year: string;
  income: number;
  expenses: number;
}

// Tax Planning Types
export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

export interface TaxDeduction {
  name: string;
  amount: number;
  section?: string;
}

export interface TaxPlanningData {
  totalIncome: number;
  actualTdsPaid: number;
  calculatedGrossIncome: number;
  salaryIncome: number;
  bonusIncome: number;
  rsuIncome: number;
  rsuGrossIncome: number;
  rsuTaxPaid: number;
  otherIncome: number;
  taxableIncome: number;
  estimatedTax: number;
  cess: number;
  totalTaxLiability: number;
  deductions: TaxDeduction[];
  recommendations: string[];
  standardDeduction: number;
  taxRegime: "new" | "old";
}

export interface TaxPlanningResult {
  overall: TaxPlanningData;
  byFinancialYear: Record<string, TaxPlanningData>;
  availableYears: string[];
}

// Investment Types
export interface InvestmentTransaction {
  date: string;
  type: "Buy" | "Sell" | "Dividend" | "Brokerage";
  amount: number;
  units?: number;
  price?: number;
}

export interface InvestmentPerformance {
  totalCapitalDeployed: number;
  totalWithdrawals: number;
  currentValue: number;
  realizedGains: number;
  unrealizedGains: number;
  totalGains: number;
  roi: number;
  totalBrokerage: number;
  netGains: number;
  transactions: InvestmentTransaction[];
}

// Credit Card & Cashback Types
export interface CardBreakdown {
  card: string;
  spending: number;
  cashback: number;
  cashbackRate: number;
}

export interface CashbackMetrics {
  totalSpending: number;
  totalCashback: number;
  totalCashbackEarned: number;
  cashbackShared: number;
  actualCashback: number;
  totalCreditCardSpending: number;
  cashbackRate: number;
  byCard: Record<string, { spending: number; cashback: number }>;
  cardBreakdown: CardBreakdown[];
}

// Chart Data Types
export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      position?: string;
      labels?: { color?: string; padding?: number };
    };
    tooltip?: {
      callbacks?: {
        label?: (context: any) => string;
      };
    };
  };
}

// Insight Types
export interface Insight {
  type: string;
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  icon?: string;
  amount?: number;
}

// Filter Types
export interface DateFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface CategoryFilter {
  categories?: string[];
  subcategories?: string[];
}

export interface TransactionFilter extends DateFilter, CategoryFilter {
  type?: TransactionType;
  searchText?: string;
}

// Utility Types
export type SortOrder = "asc" | "desc";
export type ViewMode = "monthly" | "yearly" | "all-time";

export interface SortConfig {
  key: string;
  direction: SortOrder;
}
