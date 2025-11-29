/* eslint-disable no-console */
// Centralized logging utility with environment-aware logging
const isDevelopment = process.env.NODE_ENV === "development";
const isDebugMode = process.env.REACT_APP_DEBUG === "true";

const logger = {
  info: (...args) => {
    if (isDevelopment) {
      console.log("[INFO]", ...args);
    }
  },

  warning: (...args) => {
    if (isDevelopment) {
      console.warn("[WARNING]", ...args);
    }
  },

  error: (...args) => {
    console.error("[ERROR]", ...args);
  },

  debug: (...args) => {
    if (isDevelopment && isDebugMode) {
      console.log("[DEBUG]", ...args);
    }
  },
};

export default logger;
