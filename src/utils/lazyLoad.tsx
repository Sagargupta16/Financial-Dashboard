import { type ComponentType, type LazyExoticComponent, lazy } from "react";

/**
 * Helper function to simplify lazy loading with better error handling
 * @param importFn - Dynamic import function that returns a promise with a module
 * @param exportName - Named export (optional, defaults to 'default')
 * @returns LazyExoticComponent for React
 */
export const lazyLoad = <T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<Record<string, unknown>>,
  exportName = "default"
): LazyExoticComponent<T> => {
  return lazy(() =>
    importFn().then((module) => ({
      default: (module[exportName] || module.default) as T,
    }))
  );
};
