/**
 * Local Storage utilities for persisting user preferences and data
 * Includes encryption for sensitive financial data
 */

const STORAGE_KEYS = {
  FILTERS: "financial_dashboard_filters",
  TRANSACTIONS: "financial_dashboard_transactions",
  PREFERENCES: "financial_dashboard_preferences",
  ENCRYPTION_KEY: "financial_dashboard_enc_key",
};

/**
 * Simple encryption/decryption using base64 encoding
 * For production, consider using Web Crypto API or a library like crypto-js
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
const encrypt = (data) => {
  try {
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error("Encryption failed:", error);
    return data;
  }
};

/**
 * Decrypt base64 encoded data
 * @param {string} encryptedData - Encrypted data
 * @returns {string} Decrypted data
 */
const decrypt = (encryptedData) => {
  try {
    return decodeURIComponent(atob(encryptedData));
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedData;
  }
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
    console.error("Failed to save to localStorage:", error);
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
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
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
    console.error("Failed to remove from localStorage:", error);
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
 * Save transactions to localStorage with encryption
 * @param {Array} transactions - Array of transaction objects
 * @param {boolean} useEncryption - Whether to encrypt data (default: true)
 */
export const saveTransactions = (transactions, useEncryption = true) => {
  // Convert dates to ISO strings for storage
  const serializable = transactions.map((t) => ({
    ...t,
    date: t.date instanceof Date ? t.date.toISOString() : t.date,
  }));

  if (useEncryption) {
    const encrypted = encrypt(JSON.stringify(serializable));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, encrypted);
    return true;
  }

  return saveToLocalStorage(STORAGE_KEYS.TRANSACTIONS, serializable);
};

/**
 * Load transactions from localStorage with decryption
 * @returns {Array} Array of transaction objects with parsed dates
 */
export const loadTransactions = () => {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!encryptedData) {
      return [];
    }

    // Try to decrypt first (new format)
    try {
      const decrypted = decrypt(encryptedData);
      const transactions = JSON.parse(decrypted);
      // Convert ISO strings back to Date objects
      return transactions.map((t) => ({
        ...t,
        date: new Date(t.date),
      }));
    } catch (decryptError) {
      // Fallback to unencrypted format (old data)
      const transactions = loadFromLocalStorage(STORAGE_KEYS.TRANSACTIONS, []);
      return transactions.map((t) => ({
        ...t,
        date: new Date(t.date),
      }));
    }
  } catch (error) {
    console.error("Failed to load transactions:", error);
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
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
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
  } catch (e) {
    return false;
  }
};

/**
 * Get storage quota information (if available)
 * @returns {Promise<Object>} Storage quota info
 */
export const getStorageQuota = async () => {
  if (navigator.storage && navigator.storage.estimate) {
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
