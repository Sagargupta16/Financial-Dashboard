/**
 * Text Formatting Utilities
 * String manipulation and label formatting
 */

/**
 * Truncates a string to a maximum length with ellipsis
 * @param text - String to truncate
 * @param maxLength - Maximum length (default: 12)
 * @returns Truncated string with "..." if needed
 * @example
 * truncateText("Very long category name", 10) // "Very long..."
 */
export const truncateText = (text: string, maxLength: number = 12): string => {
  if (typeof text !== "string") {
    return String(text);
  }
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Truncates a label for chart display
 * @param label - Label to truncate
 * @param maxLength - Maximum length
 * @returns Truncated label
 * @example
 * truncateLabel("Entertainment & Media", 12) // "Entertainment..."
 */
export const truncateLabel = (
  label: string | number,
  maxLength: number = 12
): string => {
  if (typeof label !== "string") {
    return String(label);
  }
  return truncateText(label, maxLength);
};

/**
 * Capitalizes the first letter of a string
 * @param text - String to capitalize
 * @returns Capitalized string
 * @example
 * capitalize("hello world") // "Hello world"
 */
export const capitalize = (text: string): string => {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Converts string to title case
 * @param text - String to convert
 * @returns Title case string
 * @example
 * toTitleCase("hello world") // "Hello World"
 */
export const toTitleCase = (text: string): string => {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

/**
 * Converts camelCase or PascalCase to readable text
 * @param text - camelCase or PascalCase string
 * @returns Readable text
 * @example
 * camelToReadable("myVariableName") // "My Variable Name"
 */
export const camelToReadable = (text: string): string => {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

/**
 * Pluralizes a word based on count
 * @param word - Singular word
 * @param count - Count to check
 * @param plural - Optional custom plural form
 * @returns Singular or plural word
 * @example
 * pluralize("item", 1) // "item"
 * pluralize("item", 5) // "items"
 * pluralize("person", 5, "people") // "people"
 */
export const pluralize = (
  word: string,
  count: number,
  plural?: string
): string => {
  if (count === 1) {
    return word;
  }
  return plural || `${word}s`;
};
