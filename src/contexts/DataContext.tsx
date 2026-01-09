import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { BUDGET_ALLOCATION_DEFAULTS } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Transaction } from "../types";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface BudgetAllocation {
  needs: number;
  wants: number;
  savings: number;
}

interface CustomCategories {
  needs: string[];
  wants: string[];
  savings: string[];
}

interface BudgetPreferences {
  allocation: BudgetAllocation;
  customCategories: CustomCategories;
}

interface DataContextType {
  transactions: Transaction[];
  updateTransactions: (newTransactions: Transaction[]) => void;
  dateRange: DateRange;
  updateDateRange: (start: Date | null, end: Date | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  budgetPreferences: BudgetPreferences;
  updateBudgetAllocation: (allocation: BudgetAllocation) => void;
  updateCustomCategories: (type: keyof CustomCategories, categories: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_PREFERENCES = "financial_dashboard_budget_preferences";

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Budget preferences state with localStorage persistence
  const [budgetPreferences, setBudgetPreferences] = useLocalStorage<BudgetPreferences>(
    STORAGE_KEY_PREFERENCES,
    {
      allocation: BUDGET_ALLOCATION_DEFAULTS,
      customCategories: {
        needs: [],
        wants: [],
        savings: [],
      },
    }
  );

  const updateTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
  }, []);

  const updateDateRange = useCallback((start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateBudgetAllocation = useCallback((allocation: BudgetAllocation) => {
    setBudgetPreferences((prev) => ({
      ...prev,
      allocation,
    }));
  }, []);

  const updateCustomCategories = useCallback(
    (type: keyof CustomCategories, categories: string[]) => {
      setBudgetPreferences((prev) => ({
        ...prev,
        customCategories: {
          ...prev.customCategories,
          [type]: categories,
        },
      }));
    },
    []
  );

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
