/**
 * Number Formatting Utilities
 * General number formatting operations
 */

/**
 * Formats a number with thousands separators
 * @param value - Number to format
 * @returns Formatted string with commas
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-IN").format(value);
};

/**
 * Formats a percentage with optional decimal places
 * @param value - Value to format (0.25 = 25%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 * @example
 * formatPercentage(0.2567) // "25.7%"
 * formatPercentage(0.2567, 2) // "25.67%"
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  // Handle edge cases
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return "0.0%";
  }

  // Clamp decimals to valid range (0-100 for toFixed)
  const clampedDecimals = Math.max(0, Math.min(100, decimals));

  return `${(value * 100).toFixed(clampedDecimals)}%`;
};

/**
 * Rounds a number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 * @example
 * roundToDecimals(1.23456, 2) // 1.23
 */
export const roundToDecimals = (value: number, decimals: number): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Formats a number in compact notation (K, M, B)
 * @param value - Number to format
 * @returns Compact formatted string
 * @example
 * formatCompactNumber(1234) // "1.23K"
 * formatCompactNumber(1234567) // "1.23M"
 */
export const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(2)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(2)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(2)}K`;
  }

  return `${sign}${absValue.toFixed(2)}`;
};

/**
 * Clamps a number between min and max values
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 * @example
 * clamp(150, 0, 100) // 100
 * clamp(-10, 0, 100) // 0
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
