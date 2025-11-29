/**
 * Local Storage utilities for persisting user preferences and data
 * WARNING: Data is stored in plain text in browser localStorage.
 * Do not store sensitive financial data here in production.
 * For sensitive data, use server-side storage with proper encryption.
 */

import logger from "./logger";

const STORAGE_KEYS = {
  FILTERS: "financial_dashboard_filters",
  TRANSACTIONS: "financial_dashboard_transactions",
  PREFERENCES: "financial_dashboard_preferences",
};

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} data - Data to save (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const saveToLocalStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    logger.error("Failed to save to localStorage:", error);
    return false;
  }
};

/**
 * Load data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null || serialized === undefined) {
      return defaultValue;
    }
    return JSON.parse(serialized);
  } catch (error) {
    logger.error("Failed to load from localStorage:", error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logger.error("Failed to remove from localStorage:", error);
  }
};

/**
 * Clear all dashboard data from localStorage
 */
export const clearAllLocalStorage = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromLocalStorage(key);
  });
};

/**
 * Save user filters to localStorage
 * @param {Object} filters - Filter state object
 */
export const saveFilters = (filters) => {
  return saveToLocalStorage(STORAGE_KEYS.FILTERS, filters);
};

/**
 * Load user filters from localStorage
 * @returns {Object|null} Saved filters or null
 */
export const loadFilters = () => {
  return loadFromLocalStorage(STORAGE_KEYS.FILTERS);
};

/**
 * Save transactions to localStorage
 * @param {Array} transactions - Array of transaction objects
 */
export const saveTransactions = (transactions) => {
  // Convert dates to ISO strings for storage
  const serializable = transactions.map((t) => ({
    ...t,
    date: t.date instanceof Date ? t.date.toISOString() : t.date,
  }));

  return saveToLocalStorage(STORAGE_KEYS.TRANSACTIONS, serializable);
};

/**
 * Load transactions from localStorage
 * @returns {Array} Array of transaction objects with parsed dates
 */
export const loadTransactions = () => {
  try {
    const transactions = loadFromLocalStorage(STORAGE_KEYS.TRANSACTIONS, []);
    // Convert ISO strings back to Date objects
    return transactions.map((t) => ({
      ...t,
      date: new Date(t.date),
    }));
  } catch (error) {
    logger.error("Failed to load transactions:", error);
    return [];
  }
};

/**
 * Save user preferences to localStorage
 * @param {Object} preferences - Preferences object
 */
export const savePreferences = (preferences) => {
  return saveToLocalStorage(STORAGE_KEYS.PREFERENCES, preferences);
};

/**
 * Load user preferences from localStorage
 * @returns {Object} Preferences object
 */
export const loadPreferences = () => {
  return loadFromLocalStorage(STORAGE_KEYS.PREFERENCES, {
    theme: "dark",
    currency: "USD",
    transactionsPerPage: 25,
  });
};

/**
 * Get total localStorage usage in bytes
 * @returns {number} Total size in bytes
 */
export const getLocalStorageSize = () => {
  let total = 0;
  for (const key in localStorage) {
    if (Object.hasOwn(localStorage, key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

/**
 * Check if localStorage has enough space
 * @param {number} requiredBytes - Required space in bytes
 * @returns {boolean} Whether space is available
 */
export const hasStorageSpace = (requiredBytes = 0) => {
  try {
    const testKey = "__storage_test__";
    const testData = new Array(requiredBytes).join("a");
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    logger.warn("Storage space check failed:", error.message);
    return false;
  }
};

/**
 * Get storage quota information (if available)
 * @returns {Promise<Object>} Storage quota info
 */
export const getStorageQuota = async () => {
  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2),
    };
  }
  return null;
};

export { STORAGE_KEYS };
