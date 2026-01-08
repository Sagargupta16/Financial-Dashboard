import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import { BUDGET_ALLOCATION_DEFAULTS } from "../constants";

const DataContext = createContext();

const STORAGE_KEY_PREFERENCES = "financial_dashboard_budget_preferences";

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Budget preferences state
  const [budgetPreferences, setBudgetPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFERENCES);
      return saved
        ? JSON.parse(saved)
        : {
            allocation: BUDGET_ALLOCATION_DEFAULTS,
            customCategories: {
              needs: [],
              wants: [],
              savings: [],
            },
          };
    } catch {
      return {
        allocation: BUDGET_ALLOCATION_DEFAULTS,
        customCategories: {
          needs: [],
          wants: [],
          savings: [],
        },
      };
    }
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PREFERENCES,
        JSON.stringify(budgetPreferences)
      );
    } catch (error) {
      console.error("Failed to save budget preferences:", error);
    }
  }, [budgetPreferences]);

  const updateTransactions = useCallback((newTransactions) => {
    setTransactions(newTransactions);
  }, []);

  const updateDateRange = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateBudgetAllocation = useCallback((allocation) => {
    setBudgetPreferences((prev) => ({
      ...prev,
      allocation,
    }));
  }, []);

  const updateCustomCategories = useCallback((type, categories) => {
    setBudgetPreferences((prev) => ({
      ...prev,
      customCategories: {
        ...prev.customCategories,
        [type]: categories,
      },
    }));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      transactions,
      updateTransactions,
      dateRange,
      updateDateRange,
      loading,
      setLoading,
      error,
      setError,
      clearError,
      budgetPreferences,
      updateBudgetAllocation,
      updateCustomCategories,
    }),
    [
      transactions,
      updateTransactions,
      dateRange,
      updateDateRange,
      loading,
      error,
      clearError,
      budgetPreferences,
      updateBudgetAllocation,
      updateCustomCategories,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
