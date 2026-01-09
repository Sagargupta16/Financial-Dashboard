import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Transaction } from "../types";
import { BUDGET_ALLOCATION_DEFAULTS } from "../constants";

/**
 * Budget allocation interface
 */
interface BudgetAllocation {
  needs: number;
  wants: number;
  savings: number;
}

/**
 * Custom categories for budget classification
 */
interface CustomCategories {
  needs: string[];
  wants: string[];
  savings: string[];
}

/**
 * Budget preferences containing allocation and custom categories
 */
interface BudgetPreferences {
  allocation: BudgetAllocation;
  customCategories: CustomCategories;
}

/**
 * Date range for filtering transactions
 */
interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Main financial store state interface
 */
interface FinancialStore {
  // State
  transactions: Transaction[];
  dateRange: DateRange;
  budgetPreferences: BudgetPreferences;
  loading: boolean;
  error: string | null;

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  updateDateRange: (start: Date | null, end: Date | null) => void;
  updateBudgetAllocation: (allocation: BudgetAllocation) => void;
  updateCustomCategories: (type: keyof CustomCategories, categories: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Initial state for the store
 */
const initialState = {
  transactions: [],
  dateRange: { start: null, end: null },
  budgetPreferences: {
    allocation: BUDGET_ALLOCATION_DEFAULTS,
    customCategories: {
      needs: [],
      wants: [],
      savings: [],
    },
  },
  loading: false,
  error: null,
};

/**
 * Financial Dashboard Store using Zustand
 *
 * Features:
 * - Persistent storage using localStorage
 * - Type-safe state management
 * - Minimal re-renders with selective subscriptions
 * - DevTools integration
 *
 * @example
 * // In a component
 * const transactions = useFinancialStore((state) => state.transactions);
 * const setTransactions = useFinancialStore((state) => state.setTransactions);
 *
 * // Update state
 * setTransactions(newTransactions);
 *
 * @example
 * // Multiple selectors
 * const { transactions, loading, setLoading } = useFinancialStore((state) => ({
 *   transactions: state.transactions,
 *   loading: state.loading,
 *   setLoading: state.setLoading,
 * }));
 */
export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Actions
      setTransactions: (transactions) => set({ transactions }),

      updateDateRange: (start, end) => set({ dateRange: { start, end } }),

      updateBudgetAllocation: (allocation) =>
        set((state) => ({
          budgetPreferences: {
            ...state.budgetPreferences,
            allocation,
          },
        })),

      updateCustomCategories: (type, categories) =>
        set((state) => ({
          budgetPreferences: {
            ...state.budgetPreferences,
            customCategories: {
              ...state.budgetPreferences.customCategories,
              [type]: categories,
            },
          },
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: "financial-dashboard-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        budgetPreferences: state.budgetPreferences,
        // Don't persist transactions as they're loaded from CSV
        // Don't persist loading/error states
      }),
    }
  )
);

/**
 * Selector hooks for common use cases
 * These provide optimized subscriptions to specific parts of state
 */

// Transactions
export const useTransactions = () => useFinancialStore((state) => state.transactions);
export const useSetTransactions = () => useFinancialStore((state) => state.setTransactions);

// Date Range
export const useDateRange = () => useFinancialStore((state) => state.dateRange);
export const useUpdateDateRange = () => useFinancialStore((state) => state.updateDateRange);

// Budget Preferences
export const useBudgetPreferences = () => useFinancialStore((state) => state.budgetPreferences);
export const useUpdateBudgetAllocation = () =>
  useFinancialStore((state) => state.updateBudgetAllocation);
export const useUpdateCustomCategories = () =>
  useFinancialStore((state) => state.updateCustomCategories);

// Loading & Error
export const useLoading = () => useFinancialStore((state) => state.loading);
export const useSetLoading = () => useFinancialStore((state) => state.setLoading);
export const useError = () => useFinancialStore((state) => state.error);
export const useSetError = () => useFinancialStore((state) => state.setError);
export const useClearError = () => useFinancialStore((state) => state.clearError);
