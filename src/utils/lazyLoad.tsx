import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Helper function to simplify lazy loading with better error handling
 * @param importFn - Dynamic import function that returns a promise with a module
 * @param exportName - Named export (optional, defaults to 'default')
 * @returns LazyExoticComponent for React
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFn: () => Promise<any>,
  exportName = "default"
): LazyExoticComponent<T> => {
  return lazy(() =>
    importFn().then((module) => ({
      default: ((module as any)[exportName] || (module as any).default) as T,
    }))
  );
};
