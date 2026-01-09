// @ts-nocheck
// Helper Functions for Data Processing

/**
 * Parses a currency string and returns a numeric value
 * @param {string} value - The currency string to parse (e.g., "₹1,234.56")
 * @returns {number} The parsed numeric value or 0 if parsing fails
 * @example
 * parseCurrency("₹1,234.56") // returns 1234.56
 */
export const parseCurrency = (value) => {
  if (typeof value !== "string") {
    return 0;
  }
  return Number.parseFloat(value.replaceAll("₹", "").replaceAll(",", "")) || 0;
};

/**
 * Parses date and time strings into a Date object
 * @param {string} dateString - Date string in DD/MM/YYYY format
 * @param {string} timeString - Time string in HH:MM:SS format
 * @returns {Date|null} Parsed Date object or null if parsing fails
 * @example
 * parseDate("01/01/2024", "10:30:00") // returns Date object
 */
export const parseDate = (dateString, timeString) => {
  if (!dateString || !timeString) {
    return null;
  }
  const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
  const timeRegex = /(\d{2}):(\d{2}):(\d{2})/;
  const dateParts = dateRegex.exec(dateString);
  const timeParts = timeRegex.exec(timeString);
  if (!dateParts || !timeParts) {
    return null;
  }
  const date = new Date(
    dateParts[3],
    dateParts[2] - 1,
    dateParts[1],
    timeParts[1],
    timeParts[2],
    timeParts[3]
  );
  // Check if date is valid
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

/**
 * Format a numeric value as currency (re-exported from formatters)
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string (e.g., "₹1,234.56")
 * @example
 * formatCurrency(1234.56) // returns "₹1,234.56"
 */
export { formatCurrency } from "../formatters";

/**
 * Parses transaction amount to absolute number
 * @param {Object} transaction - Transaction object with amount property
 * @returns {number} Parsed absolute amount or 0 if parsing fails
 * @example
 * parseAmount({amount: "-1234.56"}) // returns 1234.56
 */
export const parseAmount = (transaction) => {
  return Math.abs(Number(transaction.amount) || 0);
};

/**
 * Gets month key from date (YYYY-MM format)
 * @param {string|Date|Object} dateOrTransaction - Date string, Date object, or transaction object with date property
 * @returns {string} Month key in YYYY-MM format
 * @example
 * getMonthKey("2024-01-15") // returns "2024-01"
 * getMonthKey(new Date()) // returns "2024-01"
 * getMonthKey({date: new Date()}) // returns "2024-01"
 */
export const getMonthKey = (dateOrTransaction) => {
  let dateValue = dateOrTransaction;

  // If it's an object (transaction), extract the date property
  if (
    dateOrTransaction &&
    typeof dateOrTransaction === "object" &&
    !(dateOrTransaction instanceof Date)
  ) {
    dateValue = dateOrTransaction.date;
  }

  // If already a Date object, use it directly
  if (dateValue instanceof Date) {
    if (Number.isNaN(dateValue.getTime())) {
      return new Date().toISOString().slice(0, 7); // Fallback to current month
    }
    return dateValue.toISOString().slice(0, 7);
  }

  // Try to parse as date string
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 7); // Fallback to current month
  }
  return parsed.toISOString().slice(0, 7);
};

/**
 * Sums amounts from array of transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total sum of transaction amounts
 * @example
 * sumAmounts([{amount: 100}, {amount: 200}]) // returns 300
 */
export const sumAmounts = (transactions) => {
  return transactions.reduce((sum, t) => sum + parseAmount(t), 0);
};

/**
 * Filters transactions by type
 * @param {Array} transactions - Array of transaction objects
 * @param {string} type - Transaction type ("Income", "Expense", "Transfer-In", "Transfer-Out")
 * @returns {Array} Filtered transactions
 * @example
 * filterByType(transactions, "Expense")
 */
export const filterByType = (transactions, type) => {
  const lowerType = type.toLowerCase();
  return transactions.filter((t) => t.type && t.type.toLowerCase() === lowerType);
};

/**
 * Downloads a chart as an image file
 * @param {React.RefObject} ref - Reference to the chart component
 * @param {string} fileName - Name for the downloaded file
 * @example
 * downloadChart(chartRef, "my-chart.png")
 */
export const downloadChart = (ref, fileName) => {
  if (ref.current) {
    Object.assign(document.createElement("a"), {
      href: ref.current.toBase64Image(),
      download: fileName,
    }).click();
  }
};

/**
 * Get financial year from a date
 * Indian FY runs from April 1st to March 31st
 * @param {Date|string} date - Date object or string
 * @returns {string} Financial year in format "FY 2024-25"
 * @example
 * getFinancialYear(new Date('2024-04-15')) // returns "FY 2024-25"
 * getFinancialYear(new Date('2024-03-15')) // returns "FY 2023-24"
 */
export const getFinancialYear = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return null;
  }

  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed

  // If month is 0-2 (Jan-Mar), FY is previous year to current year
  // If month is 3-11 (Apr-Dec), FY is current year to next year
  if (month >= 3) {
    // Apr-Dec: FY starts this year
    return `FY ${year}-${String(year + 1).slice(-2)}`;
  } else {
    // Jan-Mar: FY started last year
    return `FY ${year - 1}-${String(year).slice(-2)}`;
  }
};

/**
 * Get all unique financial years from a list of transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Sorted array of FY strings (newest first)
 * @example
 * getAllFinancialYears(transactions) // returns ["FY 2024-25", "FY 2023-24"]
 */
export const getAllFinancialYears = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const fys = new Set();
  transactions.forEach((t) => {
    const fy = getFinancialYear(t.date);
    if (fy) {
      fys.add(fy);
    }
  });

  // Sort in descending order (newest first)
  return Array.from(fys).sort((a, b) => b.localeCompare(a));
};
