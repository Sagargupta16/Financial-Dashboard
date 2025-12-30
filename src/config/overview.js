/**
 * Overview Page Configuration
 * Constants and thresholds for the Overview dashboard section
 */

// ============================================================================
// METRIC THRESHOLDS
// ============================================================================

/**
 * Category concentration warning threshold (percentage)
 * Alert user when a single category exceeds this percentage of total spending
 */
export const CATEGORY_CONCENTRATION_THRESHOLD = 50;

/**
 * Savings rate thresholds
 */
export const SAVINGS_RATE_THRESHOLDS = {
  EXCELLENT: 20, // 20%+ is excellent
  GOOD: 10, // 10-20% is good
  // Below 10% needs improvement
};

/**
 * Spending velocity thresholds
 */
export const SPENDING_VELOCITY_THRESHOLDS = {
  NORMAL: 100, // 100% = spending at average rate
  HIGH: 120, // Above 120% is concerning
  LOW: 80, // Below 80% is good
};

// ============================================================================
// UI STYLING
// ============================================================================

/**
 * Gradient background patterns for different sections
 */
export const GRADIENT_PATTERNS = {
  FINANCIAL_HEALTH: "from-blue-900/20 to-purple-900/20",
  INSIGHTS: "from-purple-900/20 to-pink-900/20",
  KEY_INSIGHTS: "from-gray-800/80 via-gray-800/60 to-gray-900/80",
  TRANSFER_INFO: "from-purple-900/20 to-purple-800/20",
};

/**
 * Border styles for different sections
 */
export const BORDER_STYLES = {
  FINANCIAL_HEALTH: "border-blue-500/30",
  INSIGHTS: "border-purple-500/30",
  KEY_INSIGHTS: "border-gray-700/50",
  TRANSFER_INFO: "border-purple-500/30",
};

/**
 * Card background colors based on value/status
 */
export const CARD_COLORS = {
  POSITIVE: "bg-green-900/20 border-green-500/30",
  NEGATIVE: "bg-red-900/20 border-red-500/30",
  WARNING: "bg-orange-900/20 border-orange-500/30",
  NEUTRAL: "bg-blue-900/20 border-blue-500/30",
  INFO: "bg-purple-900/20 border-purple-500/30",
};

/**
 * Icon colors for metrics
 */
export const ICON_COLORS = {
  POSITIVE: "text-green-400",
  NEGATIVE: "text-red-400",
  WARNING: "text-orange-400",
  NEUTRAL: "text-blue-400",
  INFO: "text-purple-400",
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default values for KPI metrics to prevent undefined errors
 */
export const DEFAULT_KPI_VALUES = {
  savingsRate: 0,
  dailySpendingRate: 0,
  monthlyBurnRate: 0,
  netWorth: 0,
  netWorthPerMonth: 0,
  spendingVelocity: 0,
  categoryConcentration: {
    category: "N/A",
    percentage: 0,
  },
};

/**
 * Default values for additional KPI data
 */
export const DEFAULT_ADDITIONAL_KPI = {
  totalTransactions: 0,
  highestExpense: 0,
  averageExpense: 0,
  transferData: {
    transferIn: 0,
    transferOut: 0,
  },
  cashbackData: {
    totalCashbackEarned: 0,
    cashbackShared: 0,
    actualCashback: 0,
  },
  reimbursementData: {
    totalReimbursements: 0,
  },
};

/**
 * Default values for key insights
 */
export const DEFAULT_KEY_INSIGHTS = {
  busiestDay: "N/A",
  mostFrequentCategory: "N/A",
  avgTransactionValue: 0,
};

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * User-facing messages for different metric states
 */
export const MESSAGES = {
  NO_DATA: "Not enough data to generate insights for this time period.",
  TRY_DIFFERENT_RANGE: "Try selecting a different time range!",
  TRANSFER_DISCLAIMER:
    "Transfers represent internal money movement between your accounts and do not affect your total income or expenses.",
  CATEGORY_CONCENTRATION_WARNING: "⚠️ High concentration in single category",
};

// ============================================================================
// MONTH LABELS
// ============================================================================

/**
 * Month labels for dropdowns
 */
export const MONTH_OPTIONS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];
