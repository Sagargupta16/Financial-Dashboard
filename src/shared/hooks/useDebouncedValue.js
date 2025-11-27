import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} Debounced value
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
