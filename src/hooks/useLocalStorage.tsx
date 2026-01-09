import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for syncing state with localStorage
 * @template T - The type of the stored value
 * @param {string} key - The localStorage key
 * @param {T} initialValue - The initial value if no stored value exists
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} - [storedValue, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'dark');
 * setTheme('light'); // Updates state and localStorage
 * removeTheme(); // Removes from localStorage and resets to initialValue
 */
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever storedValue changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  // Wrapped setValue function
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
      } catch (error) {
        console.error(`Error setting ${key} value:`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
