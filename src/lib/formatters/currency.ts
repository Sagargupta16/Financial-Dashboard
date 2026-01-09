/**
 * Currency Formatting Utilities
 * Single source of truth for all currency formatting operations
 * VERSION: 2.0 - With safety checks for NaN/Infinity and parameter clamping
 */

export interface CurrencyFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
  compact?: boolean;
}

/**
 * Formats a numeric value as Indian Rupee currency
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "₹1,234.56")
 * @example
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1234567, { compact: true }) // "₹12.35L"
 */
export const formatCurrency = (value: number, options: CurrencyFormatOptions = {}): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    compact = false,
  } = options;

  // Handle edge cases
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    value = 0;
  }

  if (compact) {
    return formatCompactCurrency(value, showSymbol);
  }

  // Ensure fraction digits are valid numbers, default to 2 if not
  const safeMin = Number.isFinite(minimumFractionDigits) ? minimumFractionDigits : 2;
  const safeMax = Number.isFinite(maximumFractionDigits) ? maximumFractionDigits : 2;

  // Clamp fraction digits to valid range (0-20 for Intl.NumberFormat)
  const clampedMin = Math.max(0, Math.min(20, safeMin));
  const clampedMax = Math.max(0, Math.min(20, safeMax));

  const formatted = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: clampedMin,
    maximumFractionDigits: clampedMax,
  }).format(value);

  return formatted;
};

/**
 * Formats large numbers in compact Indian notation (Lakhs/Crores)
 * @param value - The numeric value to format
 * @param showSymbol - Whether to include currency symbol
 * @returns Compact formatted string (e.g., "₹12.35L", "₹1.5Cr")
 * @example
 * formatCompactCurrency(125000) // "₹1.25L"
 * formatCompactCurrency(10000000) // "₹1.00Cr"
 */
export const formatCompactCurrency = (value: number, showSymbol: boolean = true): string => {
  const prefix = showSymbol ? "₹" : "";
  const absValue = Math.abs(value);

  if (absValue >= 10000000) {
    // Crores
    return `${prefix}${(value / 10000000).toFixed(2)}Cr`;
  } else if (absValue >= 100000) {
    // Lakhs
    return `${prefix}${(value / 100000).toFixed(2)}L`;
  } else if (absValue >= 1000) {
    // Thousands
    return `${prefix}${(value / 1000).toFixed(2)}K`;
  }

  return `${prefix}${value.toFixed(2)}`;
};

/**
 * Formats currency without symbol (decimal only)
 * @param value - The numeric value to format
 * @returns Formatted string without currency symbol
 * @example
 * formatCurrencyNoSymbol(1234.56) // "1,234.56"
 */
export const formatCurrencyNoSymbol = (value: number): string => {
  return formatCurrency(value, { showSymbol: false });
};

/**
 * Formats currency with custom precision
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places
 * @returns Formatted currency string
 * @example
 * formatCurrencyWithDecimals(1234.5678, 0) // "₹1,235"
 */
export const formatCurrencyWithDecimals = (value: number, decimals: number): string => {
  return formatCurrency(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
