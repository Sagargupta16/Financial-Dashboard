import { parseCurrency, parseDate, formatCurrency } from "../dataUtils";

describe("dataUtils", () => {
  describe("parseCurrency", () => {
    it("should parse currency string correctly", () => {
      expect(parseCurrency("₹1,234.56")).toBe(1234.56);
      expect(parseCurrency("1234.56")).toBe(1234.56);
      expect(parseCurrency("₹1,000")).toBe(1000);
    });

    it("should return 0 for non-string input", () => {
      expect(parseCurrency(123)).toBe(0);
      expect(parseCurrency(null)).toBe(0);
      expect(parseCurrency(undefined)).toBe(0);
    });

    it("should return 0 for invalid strings", () => {
      expect(parseCurrency("invalid")).toBe(0);
      expect(parseCurrency("")).toBe(0);
    });
  });

  describe("parseDate", () => {
    it("should parse valid date and time strings", () => {
      const result = parseDate("01/01/2024", "10:30:00");
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getFullYear()).toBe(2024);
      expect(result.getHours()).toBe(10);
    });

    it("should return null for missing parameters", () => {
      expect(parseDate("", "10:30:00")).toBeNull();
      expect(parseDate("01/01/2024", "")).toBeNull();
      expect(parseDate(null, null)).toBeNull();
    });

    it("should return null for invalid formats", () => {
      expect(parseDate("2024-01-01", "10:30:00")).toBeNull();
      expect(parseDate("01/01/2024", "10:30")).toBeNull();
      expect(parseDate("invalid", "invalid")).toBeNull();
    });
  });

  describe("formatCurrency", () => {
    it("should format numbers as Indian Rupee currency", () => {
      expect(formatCurrency(1234.56)).toBe("₹1,234.56");
      expect(formatCurrency(1000)).toBe("₹1,000.00");
      expect(formatCurrency(0)).toBe("₹0.00");
    });

    it("should handle negative numbers", () => {
      expect(formatCurrency(-1234.56)).toBe("-₹1,234.56");
    });

    it("should handle large numbers", () => {
      const result = formatCurrency(1234567.89);
      expect(result).toContain("₹");
      expect(result).toContain("1,234,567.89");
    });
  });
});
