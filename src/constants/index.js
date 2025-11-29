/**
 * Application Constants
 * Centralized configuration for the Financial Dashboard
 */

// Initial CSV data - empty by default, user will upload their own file
export const initialCsvData = `Date,Time,Accounts,Category,Subcategory,Note,INR,Income/Expense`;

// Chart color palettes
export const CHART_COLORS = {
  primary: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
  income: "#10b981",
  expense: "#ef4444",
  transferIn: "#3b82f6",
  transferOut: "#f59e0b",
  gradient: {
    blue: "from-blue-600 to-blue-700",
    purple: "from-purple-600 to-purple-700",
    green: "from-green-600 to-green-700",
    red: "from-red-600 to-red-700",
  },
};

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: "Income",
  EXPENSE: "Expense",
  TRANSFER_IN: "Transfer-In",
  TRANSFER_OUT: "Transfer-Out",
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  ISO: "YYYY-MM-DD",
  TIME: "HH:MM:SS",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Chart configuration
export const CHART_CONFIG = {
  DEFAULT_HEIGHT: 450,
  MAX_DATA_POINTS: 1000,
  ANIMATION_DURATION: 750,
};

// Month names
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Day names
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// File upload configuration
export const FILE_UPLOAD = {
  ACCEPTED_TYPES: [".csv", ".xlsx", ".xls"],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// Local storage keys
export const STORAGE_KEYS = {
  TRANSACTION_DATA: "financial_dashboard_data",
  USER_PREFERENCES: "financial_dashboard_preferences",
  LAST_UPLOAD: "financial_dashboard_last_upload",
};

// Error messages
export const ERROR_MESSAGES = {
  FILE_PARSE_ERROR:
    "Could not parse the financial data. Please check the file format.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit of 10MB.",
  INVALID_FILE_TYPE: "Please upload a valid CSV or Excel file.",
  NO_DATA: "No data found in the file. Please check the file format.",
  GENERIC_ERROR: "An error occurred. Please try again.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: "File uploaded successfully!",
  DATA_EXPORTED: "Data exported successfully!",
  CHART_DOWNLOADED: "Chart downloaded successfully!",
};

// ============================================================================
// FINANCIAL CALCULATION CONSTANTS
// ============================================================================

// Time Constants
// ============================================================================

/**
 * Average number of days in a month (365.25 / 12)
 * Used for monthly projections and averages
 */
export const DAYS_PER_MONTH = 30.44;

/**
 * Days in a week
 */
export const DAYS_PER_WEEK = 7;

/**
 * Months in a year
 */
export const MONTHS_PER_YEAR = 12;

/**
 * Milliseconds in one day
 */
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Days in a year (accounting for leap years)
 */
export const DAYS_PER_YEAR = 365.25;

// Percentage & Math Constants
// ============================================================================

/**
 * Percentage multiplier
 */
export const PERCENT = 100;

/**
 * Small epsilon for floating-point comparisons
 */
export const EPSILON = 1e-9;

// Tax Regime Constants (India - FY 2024-25 onwards)
// ============================================================================

/**
 * New Tax Regime Slabs (FY 2024-25 onwards)
 * Each slab: { min, max, rate }
 * Amounts in INR
 */
export const TAX_SLABS_NEW_REGIME = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.1 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.2 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.3 },
];

/**
 * Health and Education Cess rate (4% of tax)
 */
export const CESS_RATE = 0.04;

/**
 * Standard deduction for salaried employees (New Regime)
 */
export const STANDARD_DEDUCTION_NEW_REGIME = 75000;

/**
 * Standard deduction (alias for consistency)
 */
export const STANDARD_DEDUCTION = STANDARD_DEDUCTION_NEW_REGIME;

/**
 * Section 80C maximum deduction limit
 */
export const SECTION_80C_LIMIT = 150000;

/**
 * Default professional tax (annual)
 */
export const DEFAULT_PROFESSIONAL_TAX = 2400;

/**
 * Meal voucher daily limit (tax-free)
 */
export const MEAL_VOUCHER_DAILY_LIMIT = 50;

/**
 * Days in a year (for annual calculations)
 */
export const DAYS_IN_YEAR = 365;

/**
 * HRA exemption metro city percentage (50% of salary)
 */
export const HRA_METRO_PERCENT = 0.5;

/**
 * HRA exemption non-metro city percentage (40% of salary)
 */
export const HRA_NON_METRO_PERCENT = 0.4;

/**
 * Rent deduction from salary for HRA calculation (10%)
 */
export const HRA_RENT_DEDUCTION_PERCENT = 0.1;

// Investment Categories
// ============================================================================

/**
 * Categories considered as investment-related
 */
export const INVESTMENT_CATEGORIES = new Set([
  "Investment Charges & Loss",
  "Investment Income",
  "Invest",
  "Grow Stocks",
]);

/**
 * Accounts considered as investment accounts
 */
export const INVESTMENT_ACCOUNTS = new Set([
  "Grow Stocks",
  "Zerodha",
  "Upstox",
]);

// Financial Health Score Constants
// ============================================================================

/**
 * Maximum score for savings rate component (out of 100 total)
 */
export const HEALTH_SCORE_SAVINGS_RATE_MAX = 30;

/**
 * Maximum score for emergency fund component (out of 100 total)
 */
export const HEALTH_SCORE_EMERGENCY_FUND_MAX = 25;

/**
 * Maximum score for debt management component (out of 100 total)
 */
export const HEALTH_SCORE_DEBT_MANAGEMENT_MAX = 20;

/**
 * Maximum score for income/expense ratio component (out of 100 total)
 */
export const HEALTH_SCORE_INCOME_EXPENSE_MAX = 15;

/**
 * Maximum score for spending consistency component (out of 100 total)
 */
export const HEALTH_SCORE_CONSISTENCY_MAX = 10;

/**
 * Target savings rate for excellent health (20%)
 */
export const TARGET_SAVINGS_RATE = 20;

/**
 * Target emergency fund coverage (6 months)
 */
export const TARGET_EMERGENCY_FUND_MONTHS = 6;

/**
 * Minimum emergency fund coverage (3 months)
 */
export const MINIMUM_EMERGENCY_FUND_MONTHS = 3;

/**
 * Maximum acceptable debt-to-income ratio (36%)
 */
export const MAX_DEBT_TO_INCOME_RATIO = 36;

// Recurring Transaction Detection Constants
// ============================================================================

/**
 * Minimum occurrences to consider a transaction recurring
 */
export const RECURRING_MIN_OCCURRENCES = 2;

/**
 * Maximum variance in days for recurring pattern detection (20% of average)
 */
export const RECURRING_VARIANCE_THRESHOLD = 0.2;

/**
 * Minimum amount threshold for recurring detection (₹10)
 */
export const RECURRING_MIN_AMOUNT = 10;

/**
 * Frequency classification ranges (in days)
 */
export const FREQUENCY_RANGES = {
  weekly: { min: 6, max: 8 },
  biWeekly: { min: 13, max: 16 },
  monthly: { min: 27, max: 33 },
  biMonthly: { min: 60, max: 70 },
  quarterly: { min: 85, max: 95 },
  semiAnnually: { min: 175, max: 185 },
  annually: { min: 360, max: 370 },
};

// Anomaly Detection Constants
// ============================================================================

/**
 * Default standard deviation multiplier for anomaly detection
 */
export const ANOMALY_SENSITIVITY_DEFAULT = 2;

/**
 * High severity threshold (3 standard deviations)
 */
export const ANOMALY_SEVERITY_HIGH = 3;

/**
 * Medium severity threshold (2 standard deviations)
 */
export const ANOMALY_SEVERITY_MEDIUM = 2;

// Budget Constants
// ============================================================================

/**
 * Budget warning threshold (75% of budget used)
 */
export const BUDGET_WARNING_THRESHOLD = 0.75;

/**
 * Budget critical threshold (90% of budget used)
 */
export const BUDGET_CRITICAL_THRESHOLD = 0.9;

/**
 * Budget exceeded threshold (100% of budget used)
 */
export const BUDGET_EXCEEDED_THRESHOLD = 1;

/**
 * Default budget buffer percentage (10% above average spending)
 */
export const BUDGET_SUGGESTION_BUFFER = 0.1;

// Rounding & Precision Constants
// ============================================================================

/**
 * Default decimal places for currency display
 */
export const CURRENCY_DECIMAL_PLACES = 2;

/**
 * Default decimal places for percentage display
 */
export const PERCENTAGE_DECIMAL_PLACES = 1;

/**
 * Rounding base for recurring amount grouping (₹100)
 */
export const RECURRING_AMOUNT_ROUNDING_BASE = 100;
