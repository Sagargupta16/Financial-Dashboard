// @ts-nocheck
import { lazy } from "react";

/**
 * Helper function to simplify lazy loading with better error handling
 * @param {string} path - Import path
 * @param {string} exportName - Named export (optional, defaults to 'default')
 * @returns {LazyExoticComponent}
 */
export const lazyLoad = (importFn, exportName = "default") => {
  return lazy(() =>
    importFn().then((module) => ({
      default: exportName === "default" ? module.default : module[exportName],
    }))
  );
};
