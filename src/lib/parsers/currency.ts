/**
 * Currency Parsing Utilities
 * Parse currency strings to numeric values
 */

/**
 * Parses a currency string and returns a numeric value
 * @param value - Currency string to parse (e.g., "₹1,234.56")
 * @returns Parsed numeric value or 0 if parsing fails
 * @example
 * parseCurrency("₹1,234.56") // 1234.56
 * parseCurrency("1,234") // 1234
 */
export const parseCurrency = (value: string | number): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replaceAll(/[₹$€£¥,\s]/g, "").trim();

  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Parses transaction amount to absolute number
 * @param transaction - Transaction object with amount property
 * @returns Parsed absolute amount or 0 if parsing fails
 * @example
 * parseAmount({amount: "-1234.56"}) // 1234.56
 * parseAmount({amount: "1234"}) // 1234
 */
export const parseAmount = (transaction: any): number => {
  if (!transaction?.amount) {
    return 0;
  }

  const amount =
    typeof transaction.amount === "string"
      ? parseCurrency(transaction.amount)
      : Number(transaction.amount);

  return Math.abs(amount || 0);
};

/**
 * Parses amount with sign (keeps negative values)
 * @param value - Amount string or number
 * @returns Parsed number with sign
 * @example
 * parseSignedAmount("-1234.56") // -1234.56
 * parseSignedAmount("1234") // 1234
 */
export const parseSignedAmount = (value: string | number): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const cleaned = value.replaceAll(/[₹$€£¥,\s]/g, "").trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};
