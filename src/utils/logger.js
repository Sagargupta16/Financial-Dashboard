/**
 * Logger utility for consistent logging across the application
 * In production, logs are suppressed unless explicitly enabled
 */

const isDevelopment = process.env.NODE_ENV === "development";
const isDebugEnabled = process.env.REACT_APP_DEBUG_MODE === "true";

/**
 * Logs info messages (only in development or when debug is enabled)
 * @param {string} message - The message to log
 * @param  {...any} args - Additional arguments to log
 */
export const logInfo = (message, ...args) => {
  if (isDevelopment || isDebugEnabled) {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, ...args);
  }
};

/**
 * Logs warning messages
 * @param {string} message - The warning message
 * @param  {...any} args - Additional arguments to log
 */
export const logWarning = (message, ...args) => {
  console.warn(`[WARN] ${message}`, ...args);
};

/**
 * Logs error messages
 * @param {string} message - The error message
 * @param  {...any} args - Additional arguments to log
 */
export const logError = (message, ...args) => {
  console.error(`[ERROR] ${message}`, ...args);
};

/**
 * Logs debug messages (only in development with debug enabled)
 * @param {string} message - The debug message
 * @param  {...any} args - Additional arguments to log
 */
export const logDebug = (message, ...args) => {
  if (isDevelopment && isDebugEnabled) {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

const logger = {
  info: logInfo,
  warn: logWarning,
  error: logError,
  debug: logDebug,
};

export default logger;
