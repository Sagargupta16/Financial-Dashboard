/**
 * Date Parsing Utilities
 * Parse date strings into Date objects
 */

/**
 * Parses date and time strings into a Date object
 * @param dateString - Date string in DD/MM/YYYY format
 * @param timeString - Time string in HH:MM:SS format
 * @returns Parsed Date object or null if parsing fails
 * @example
 * parseDate("01/01/2024", "10:30:00") // Date object
 * parseDate("invalid", "10:30:00") // null
 */
export const parseDate = (
  dateString: string,
  timeString: string
): Date | null => {
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

  // DD/MM/YYYY format: day, month, year
  const day = parseInt(dateParts[1], 10);
  const month = parseInt(dateParts[2], 10) - 1; // JS months are 0-indexed
  const year = parseInt(dateParts[3], 10);

  const hour = parseInt(timeParts[1], 10);
  const minute = parseInt(timeParts[2], 10);
  const second = parseInt(timeParts[3], 10);

  const date = new Date(year, month, day, hour, minute, second);

  // Validate the date
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Parses a date string in various formats
 * @param dateString - Date string (ISO, DD/MM/YYYY, etc.)
 * @returns Parsed Date object or null
 * @example
 * parseDateString("2024-01-15") // Date object
 * parseDateString("15/01/2024") // Date object
 */
export const parseDateString = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }

  // Try ISO format first
  let date = new Date(dateString);
  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  // Try DD/MM/YYYY format
  const ddmmyyyyRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
  const parts = ddmmyyyyRegex.exec(dateString);

  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    date = new Date(year, month, day);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

/**
 * Parses a date that could be a string or Date object
 * @param value - Date value (string, Date, or transaction object)
 * @returns Date object or null
 * @example
 * parseDateValue("2024-01-15") // Date object
 * parseDateValue(new Date()) // Date object (same)
 */
export const parseDateValue = (value: any): Date | null => {
  if (!value) {
    return null;
  }

  // Already a Date object
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  // Extract date from transaction object
  if (typeof value === "object" && value.date) {
    return parseDateValue(value.date);
  }

  // Parse string
  if (typeof value === "string") {
    return parseDateString(value);
  }

  return null;
};

/**
 * Checks if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 * @example
 * isValidDateString("2024-01-15") // true
 * isValidDateString("invalid") // false
 */
export const isValidDateString = (dateString: string): boolean => {
  const parsed = parseDateString(dateString);
  return parsed !== null;
};
