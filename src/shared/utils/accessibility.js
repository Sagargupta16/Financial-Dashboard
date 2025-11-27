/**
 * Accessibility Utilities
 * Provides functions to improve accessibility throughout the application
 */

/**
 * Generate unique ID for accessibility labels
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateA11yId = (prefix = "a11y") => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Create skip link for keyboard navigation
 * @param {string} targetId - ID of the target element
 * @param {string} text - Link text
 * @returns {HTMLElement} Skip link element
 */
export const createSkipLink = (targetId, text = "Skip to main content") => {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.className =
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded";
  skipLink.textContent = text;

  skipLink.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });

  return skipLink;
};

/**
 * Trap focus within a modal or dialog
 * @param {HTMLElement} element - Container element
 * @returns {Function} Cleanup function
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key !== "Tab") {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    element.removeEventListener("keydown", handleKeyDown);
  };
};

/**
 * Check if element is visible to screen readers
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is accessible
 */
export const isAccessible = (element) => {
  if (!element) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.getAttribute("aria-hidden") !== "true"
  );
};

/**
 * Get accessible label for element
 * @param {HTMLElement} element - Element to get label for
 * @returns {string} Accessible label
 */
export const getAccessibleLabel = (element) => {
  // Check aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) {
    return ariaLabel;
  }

  // Check aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) {
      return labelElement.textContent;
    }
  }

  // Check for label element
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) {
      return label.textContent;
    }
  }

  // Fallback to element text content
  return element.textContent || element.value || "";
};

/**
 * Add keyboard navigation support to custom components
 * @param {HTMLElement} element - Element to add keyboard support to
 * @param {Object} handlers - Keyboard event handlers
 */
export const addKeyboardSupport = (element, handlers = {}) => {
  const defaultHandlers = {
    Enter: () => element.click(),
    Space: () => element.click(),
    ...handlers,
  };

  element.addEventListener("keydown", (e) => {
    const handler = defaultHandlers[e.key];
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  });

  // Ensure element is focusable
  if (!element.hasAttribute("tabindex")) {
    element.setAttribute("tabindex", "0");
  }
};

/**
 * Check color contrast ratio
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @returns {Object} Contrast ratio and WCAG compliance
 */
export const checkColorContrast = (foreground, background) => {
  const getRGB = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return [r, g, b];
  };

  const getLuminance = ([r, g, b]) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = getLuminance(getRGB(foreground));
  const bg = getLuminance(getRGB(background));
  const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);

  return {
    ratio: ratio.toFixed(2),
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
    AALarge: ratio >= 3,
    AAALarge: ratio >= 4.5,
  };
};

/**
 * Create accessible table description
 * @param {number} rows - Number of rows
 * @param {number} columns - Number of columns
 * @param {string} caption - Table caption
 * @returns {string} Accessible description
 */
export const createTableDescription = (rows, columns, caption = "data") => {
  return `Table with ${rows} rows and ${columns} columns showing ${caption}`;
};

/**
 * Format number for screen readers
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} Screen reader friendly number
 */
export const formatNumberForA11y = (value, options = {}) => {
  const { currency = false, percentage = false } = options;

  if (currency) {
    return `${value.toLocaleString()} rupees`;
  }

  if (percentage) {
    return `${value} percent`;
  }

  return value.toLocaleString();
};

/**
 * Add live region for dynamic content updates
 * @param {string} id - ID for the live region
 * @param {string} politeness - 'polite', 'assertive', or 'off'
 * @returns {HTMLElement} Live region element
 */
export const createLiveRegion = (id, politeness = "polite") => {
  let liveRegion = document.getElementById(id);

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = id;
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", politeness);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  }

  return liveRegion;
};

/**
 * Update live region content
 * @param {string} id - Live region ID
 * @param {string} message - Message to announce
 */
export const updateLiveRegion = (id, message) => {
  const liveRegion = document.getElementById(id);
  if (liveRegion) {
    liveRegion.textContent = message;
  }
};

/**
 * Add ARIA attributes to element
 * @param {HTMLElement} element - Element to add attributes to
 * @param {Object} attributes - ARIA attributes
 */
export const addAriaAttributes = (element, attributes) => {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(`aria-${key}`, value);
  });
};
