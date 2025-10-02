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
