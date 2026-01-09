/**
 * Date Formatting Utilities
 * All date formatting operations centralized here
 */

/**
 * Short month names for quick formatting
 */
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
] as const;

/**
 * Full month names
 */
export const FULL_MONTH_NAMES = [
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
] as const;

/**
 * Formats a date as YYYY-MM-DD
 * @param date - Date to format
 * @returns Formatted date string
 * @example
 * formatDateISO(new Date(2024, 0, 15)) // "2024-01-15"
 */
export const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date as DD/MM/YYYY
 * @param date - Date to format
 * @returns Formatted date string
 * @example
 * formatDateDDMMYYYY(new Date(2024, 0, 15)) // "15/01/2024"
 */
export const formatDateDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date as "Month YYYY" (e.g., "January 2024")
 * @param date - Date to format
 * @returns Formatted string
 * @example
 * formatMonthYear(new Date(2024, 0, 15)) // "January 2024"
 */
export const formatMonthYear = (date: Date): string => {
  const month = FULL_MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year}`;
};

/**
 * Formats a date as "Mon YYYY" (e.g., "Jan 2024")
 * @param date - Date to format
 * @returns Formatted string
 * @example
 * formatShortMonthYear(new Date(2024, 0, 15)) // "Jan 2024"
 */
export const formatShortMonthYear = (date: Date): string => {
  const month = SHORT_MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year}`;
};

/**
 * Gets month key from date (YYYY-MM format) for grouping
 * @param dateOrTransaction - Date string, Date object, or transaction object with date property
 * @returns Month key in YYYY-MM format
 * @example
 * getMonthKey("2024-01-15") // "2024-01"
 * getMonthKey(new Date(2024, 0, 15)) // "2024-01"
 */
export const getMonthKey = (dateOrTransaction: any): string => {
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
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  // If string, try to parse it
  if (typeof dateValue === "string") {
    const date = new Date(dateValue);
    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    }
  }

  // Fallback to current month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/**
 * Formats relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - Date to format
 * @returns Relative time string
 * @example
 * formatRelativeDate(new Date(Date.now() - 86400000)) // "1 day ago"
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) {
    return diffYear === 1 ? "1 year ago" : `${diffYear} years ago`;
  }
  if (diffMonth > 0) {
    return diffMonth === 1 ? "1 month ago" : `${diffMonth} months ago`;
  }
  if (diffDay > 0) {
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  }
  if (diffHour > 0) {
    return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
  }
  if (diffMin > 0) {
    return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
  }
  return "just now";
};
