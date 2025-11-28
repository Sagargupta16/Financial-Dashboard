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
  return Number.parseFloat(value.replaceAll(/[₹,]/g, "")) || 0;
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
 * Formats a numeric value as Indian Rupee currency
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string (e.g., "₹1,234.56")
 * @example
 * formatCurrency(1234.56) // returns "₹1,234.56"
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

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
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Month key in YYYY-MM format
 * @example
 * getMonthKey("2024-01-15") // returns "2024-01"
 */
export const getMonthKey = (date) => {
  return new Date(date).toISOString().slice(0, 7);
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
  return transactions.filter((t) => t.type === type);
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
