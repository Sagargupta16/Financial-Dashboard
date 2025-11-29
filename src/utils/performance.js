/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

/**
 * Measure component render time
 * @param {string} componentName - Name of the component
 * @param {Function} callback - Callback function to measure
 * @returns {*} Result of callback
 */
export const measureRenderTime = (componentName, callback) => {
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (process.env.NODE_ENV === "development" && duration > 16) {
    // Warn if render takes longer than one frame (16ms)
    console.warn(
      `[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`
    );
  }

  return result;
};

/**
 * Create performance marker
 * @param {string} name - Marker name
 */
export const mark = (name) => {
  if (performance.mark) {
    performance.mark(name);
  }
};

/**
 * Measure between two markers
 * @param {string} name - Measure name
 * @param {string} startMark - Start marker name
 * @param {string} endMark - End marker name
 * @returns {number} Duration in milliseconds
 */
export const measure = (name, startMark, endMark) => {
  if (performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      if (measures.length > 0) {
        return measures[0].duration;
      }
    } catch (error) {
      console.error("Performance measurement failed:", error);
    }
  }
  return 0;
};

/**
 * Get performance metrics using modern Navigation Timing API
 * @returns {Object} Performance metrics
 */
export const getPerformanceMetrics = () => {
  if (!globalThis.performance) {
    return null;
  }

  // Use modern PerformanceNavigationTiming API
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length === 0) {
    return null;
  }

  const timing = navEntries[0];

  return {
    // Navigation timing
    fetchStart: timing.fetchStart,
    domainLookupStart: timing.domainLookupStart,
    domainLookupEnd: timing.domainLookupEnd,
    connectStart: timing.connectStart,
    connectEnd: timing.connectEnd,
    requestStart: timing.requestStart,
    responseStart: timing.responseStart,
    responseEnd: timing.responseEnd,
    domInteractive: timing.domInteractive,
    domContentLoadedEventStart: timing.domContentLoadedEventStart,
    domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
    domComplete: timing.domComplete,
    loadEventStart: timing.loadEventStart,
    loadEventEnd: timing.loadEventEnd,

    // Navigation type
    navigationType: timing.type,
    redirectCount: timing.redirectCount,

    // Calculated metrics
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnection: timing.connectEnd - timing.connectStart,
    requestTime: timing.responseEnd - timing.requestStart,
    responseTime: timing.responseEnd - timing.responseStart,
    domProcessing: timing.domComplete - timing.domInteractive,
    timeToInteractive: timing.domInteractive - timing.fetchStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.fetchStart,
    pageLoad: timing.loadEventEnd - timing.fetchStart,
  };
};

/**
 * Monitor bundle size
 * @returns {Object} Resource sizes
 */
export const getResourceSizes = () => {
  if (!globalThis.performance?.getEntriesByType) {
    return null;
  }

  const resources = globalThis.performance.getEntriesByType("resource");
  const summary = {
    totalSize: 0,
    scriptSize: 0,
    styleSize: 0,
    imageSize: 0,
    fontSize: 0,
    otherSize: 0,
    resources: [],
  };

  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    summary.totalSize += size;

    const type = resource.initiatorType;
    if (type === "script") {
      summary.scriptSize += size;
    } else if (type === "css" || type === "link") {
      summary.styleSize += size;
    } else if (type === "img") {
      summary.imageSize += size;
    } else if (type === "font") {
      summary.fontSize += size;
    } else {
      summary.otherSize += size;
    }

    summary.resources.push({
      name: resource.name,
      type: type,
      size: size,
      duration: resource.duration,
    });
  });

  return summary;
};

/**
 * Monitor memory usage (Chrome only)
 * @returns {Object} Memory info
 */
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      percentUsed: (
        (performance.memory.usedJSHeapSize /
          performance.memory.jsHeapSizeLimit) *
        100
      ).toFixed(2),
    };
  }
  return null;
};

/**
 * Track long tasks (>50ms)
 * @param {Function} callback - Callback when long task detected
 */
export const observeLongTasks = (callback) => {
  if ("PerformanceObserver" in globalThis) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            callback({
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });

      observer.observe({ entryTypes: ["longtask"] });
      return observer;
    } catch (error) {
      console.error("Long task observation not supported:", error);
    }
  }
  return null;
};

/**
 * Log performance report
 */
/* eslint-disable no-console */
export const logPerformanceReport = () => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.group("📊 Performance Report");

  const metrics = getPerformanceMetrics();
  if (metrics) {
    console.log("⏱️ Timing Metrics:");
    console.log(`  DNS Lookup: ${metrics.dnsLookup}ms`);
    console.log(`  TCP Connection: ${metrics.tcpConnection}ms`);
    console.log(`  Request Time: ${metrics.requestTime}ms`);
    console.log(`  Response Time: ${metrics.responseTime}ms`);
    console.log(`  DOM Processing: ${metrics.domProcessing}ms`);
    console.log(`  Time to Interactive: ${metrics.timeToInteractive}ms`);
    console.log(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  Page Load: ${metrics.pageLoad}ms`);
  }

  const resources = getResourceSizes();
  if (resources) {
    console.log("\n📦 Resource Sizes:");
    console.log(`  Total: ${(resources.totalSize / 1024).toFixed(2)} KB`);
    console.log(`  Scripts: ${(resources.scriptSize / 1024).toFixed(2)} KB`);
    console.log(`  Styles: ${(resources.styleSize / 1024).toFixed(2)} KB`);
    console.log(`  Images: ${(resources.imageSize / 1024).toFixed(2)} KB`);
  }

  const memory = getMemoryUsage();
  if (memory) {
    console.log("\n🧠 Memory Usage:");
    console.log(
      `  Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
      `  Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
      `  Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(`  Usage: ${memory.percentUsed}%`);
  }

  console.groupEnd();
};
/* eslint-enable no-console */

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  // Log performance on page load
  if (document.readyState === "complete") {
    logPerformanceReport();
  } else {
    window.addEventListener("load", () => {
      setTimeout(logPerformanceReport, 0);
    });
  }

  // Monitor long tasks in development
  if (process.env.NODE_ENV === "development") {
    observeLongTasks((task) => {
      console.warn(`⚠️ Long task detected: ${task.duration.toFixed(2)}ms`);
    });
  }
};
