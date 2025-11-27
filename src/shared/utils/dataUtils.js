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
  return Number.parseFloat(value.replace(/[₹,]/g, "")) || 0;
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
  const dateParts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const timeParts = timeString.match(/(\d{2}):(\d{2}):(\d{2})/);
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
  if (isNaN(date.getTime())) {
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
