/* eslint-disable no-console */
// Centralized logging utility with environment-aware logging
const isDevelopment = import.meta.env.MODE === "development";
const isDebugMode = import.meta.env.VITE_DEBUG === "true";

type LoggerFunction = (...args: unknown[]) => void;

interface Logger {
  info: LoggerFunction;
  warning: LoggerFunction;
  error: LoggerFunction;
  debug: LoggerFunction;
}

const logger: Logger = {
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log("[INFO]", ...args);
    }
  },

  warning: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn("[WARNING]", ...args);
    }
  },

  error: (...args: unknown[]) => {
    console.error("[ERROR]", ...args);
  },

  debug: (...args: unknown[]) => {
    if (isDevelopment && isDebugMode) {
      console.log("[DEBUG]", ...args);
    }
  },
};

export default logger;
