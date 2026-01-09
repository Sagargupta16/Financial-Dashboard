/**
 * Core Type Definitions for Financial Dashboard
 */

// Transaction Types
export type TransactionType =
  | "Income"
  | "Expense"
  | "Transfer-In"
  | "Transfer-Out"
  | "Reimbursement"
  | "Investment";

export interface Transaction {
  id: string;
  date: string | Date;
  time?: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory: string;
  account: string;
  note?: string;
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
  recommendations: Array<{
    priority?: string;
    message: string;
    action: string;
  }>;
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
  category?: string;
  subcategory?: string;
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

// Analytics & Insights Types
export type InsightType =
  | "pattern"
  | "anomaly"
  | "trend"
  | "seasonal"
  | "budget-alert"
  | "budget-warning";

export type InsightPriority = "high" | "medium" | "low";

export interface Insight {
  type: InsightType;
  priority: InsightPriority;
  title: string;
  message: string;
  action?: string;
  amount?: number;
  icon?: string;
}

export interface DayPatternData {
  day: string;
  total: number;
  count: number;
  average: number;
}

export interface DayPatterns {
  dayData: DayPatternData[];
  insights: Insight[];
  weekendAvg: number;
  weekdayAvg: number;
}

export interface SeasonalData {
  insights: Insight[];
  monthlyPatterns?: Record<string, number>;
}

export interface ComprehensiveInsights {
  all: Insight[];
  byType: {
    pattern: Insight[];
    anomaly: Insight[];
    trend: Insight[];
    seasonal: Insight[];
    budgetAlert: Insight[];
  };
  byPriority: {
    high: Insight[];
    medium: Insight[];
    low: Insight[];
  };
  dayPatterns: DayPatterns | null;
  seasonal: SeasonalData | null;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  income: number;
  expense: number;
  net?: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage?: number;
}

// Utility Types
export type SortOrder = "asc" | "desc";
export type ViewMode = "monthly" | "yearly" | "all-time";

export type TransactionSortKey =
  | "date"
  | "time"
  | "account"
  | "category"
  | "subcategory"
  | "note"
  | "amount"
  | "type"
  | "runningBalance";

export interface SortConfig<TKey extends string = string> {
  key: TKey;
  direction: SortOrder;
}

// Hook Return Types
export interface UniqueValues {
  types: string[];
  categories: string[];
  expenseCategories: string[];
  accounts: string[];
}

export interface DataFilters {
  searchTerm: string;
  type: string;
  category: string;
  account: string;
  startDate: string;
  endDate: string;
}

// ===== TAX PLANNING TYPES =====

export interface TaxDeductionItem {
  section: string;
  name: string;
  amount: number;
  limit?: number;
  note?: string;
}

export interface TaxRecommendation {
  type: "saving" | "deduction" | "planning" | "action";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  amount?: number;
  action?: string;
}

export interface TaxProjection {
  avgMonthlySalary: number;
  monthsRemaining: number;
  projectedAnnualSalary: number;
  projectedTaxableIncome: number;
  projectedTotalTax: number;
  additionalTaxLiability: number;
  currentTax: number;
}

export interface ComprehensiveTaxData extends TaxPlanningData {
  netIncome?: number;
  rsuIncomeReceived?: number;
  section80CInvestments?: number;
  section80CDeduction?: number;
  hraExemption?: number;
  professionalTax?: number;
  epfDeduction?: number;
  mealVoucherExemption?: number;
  calculatedTaxLiability?: number;
  note?: string;
  financialYear?: string;
}

export interface TaxChartData {
  incomeChartData: ChartData;
  deductionsChartData: ChartData;
}

// ===== INVESTMENT TYPES =====

export interface InvestmentMetrics {
  totalInvested: number;
  currentValue: number;
  totalGains: number;
  roi: number;
  xirr?: number;
  absoluteReturn: number;
}

export interface InvestmentHolding {
  name: string;
  invested: number;
  currentValue: number;
  gains: number;
  roi: number;
  allocation: number;
}

export interface InvestmentTrend {
  month: string;
  invested: number;
  value: number;
  gains: number;
}

export interface InvestmentAllocation {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface InvestmentAnalysis {
  metrics: InvestmentMetrics;
  holdings: InvestmentHolding[];
  trends: InvestmentTrend[];
  allocation: InvestmentAllocation[];
  recentTransactions: InvestmentTransaction[];
}

// ===== HOUSING & FAMILY TYPES =====

export interface FamilyExpense {
  name: string;
  amount: number;
  category: string;
  percentage: number;
}

export interface FamilyBreakdownItem {
  name: string;
  amount: number;
  percentage: number;
}

export interface FamilySpendingData {
  total: number;
  breakdown: FamilyBreakdownItem[];
  topExpenses: FamilyExpense[];
  monthlyAverage: number;
}

export interface RentPayment {
  month: string;
  amount: number;
  date: string;
}

export interface UtilityBill {
  type: string;
  amount: number;
  month: string;
  date: string;
}

export interface HousingTrend {
  month: string;
  rent: number;
  utilities: number;
  maintenance: number;
  total: number;
}

export interface HousingData {
  totalHousingCost: number;
  rentPayments: RentPayment[];
  utilities: UtilityBill[];
  trends: HousingTrend[];
  monthlyAverage: number;
}

export interface FamilyHousingMetrics {
  familyData: FamilySpendingData;
  housingData: HousingData;
}

// ===== FOOD SPENDING TYPES =====

export interface FoodCategoryData {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface FoodTrendData {
  month: string;
  total: number;
  dining: number;
  groceries: number;
  delivery: number;
}

export interface FoodSpendingMetrics {
  total: number;
  byCategory: FoodCategoryData[];
  trends: FoodTrendData[];
  monthlyAverage: number;
}

// ===== CREDIT CARD OPTIMIZER TYPES =====

export interface CreditCardRecommendation {
  category: string;
  currentCard: string;
  recommendedCard: string;
  currentReward: number;
  potentialReward: number;
  additionalBenefit: number;
  reasoning: string;
}

export interface CardSpendingPattern {
  card: string;
  categories: Record<string, number>;
  totalSpending: number;
  totalRewards: number;
  utilizationRate: number;
}

export interface CreditCardOptimization {
  totalSpending: number;
  currentRewards: number;
  potentialRewards: number;
  additionalBenefits: number;
  recommendations: CreditCardRecommendation[];
  cardPatterns: CardSpendingPattern[];
}

// ===== COMMUTE TYPES =====

export interface CommuteExpense {
  date: string;
  type: string;
  amount: number;
  mode: string;
}

export interface CommuteTrend {
  month: string;
  total: number;
  byMode: Record<string, number>;
}

export interface CommuteMetrics {
  totalExpense: number;
  byMode: Record<string, { amount: number; count: number; percentage: number }>;
  trends: CommuteTrend[];
  monthlyAverage: number;
  topRoutes?: string[];
}
