import { useCallback, useMemo, useState } from "react";
import type { Transaction } from "../types";

interface FilterOptions {
  searchTerm?: string;
  type?: string;
  category?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Custom hook for filtering transactions with multiple criteria
 * @param {Transaction[]} transactions - Array of transactions to filter
 * @returns {object} - Filter utilities
 *
 * @example
 * const { filteredData, filters, updateFilter, resetFilters, totalCount } = useTransactionFilters(transactions);
 *
 * updateFilter('type', 'Expense');
 * updateFilter('category', 'Food & Dining');
 * resetFilters();
 */
export const useTransactionFilters = (transactions: Transaction[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    type: "All",
    category: "All",
    account: "All",
    startDate: "",
    endDate: "",
  });

  const updateFilter = useCallback((key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      type: "All",
      category: "All",
      account: "All",
      startDate: "",
      endDate: "",
    });
  }, []);

  const filteredData = useMemo(() => {
    let result = [...transactions];

    // Search term filter
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.note?.toLowerCase().includes(search) ||
          t.category?.toLowerCase().includes(search) ||
          t.account?.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (filters.type && filters.type !== "All") {
      result = result.filter((t) => t.type === filters.type);
    }

    // Category filter
    if (filters.category && filters.category !== "All") {
      result = result.filter((t) => t.category === filters.category);
    }

    // Account filter
    if (filters.account && filters.account !== "All") {
      result = result.filter((t) => t.account === filters.account);
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      result = result.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate <= endDate;
      });
    }

    return result;
  }, [transactions, filters]);

  return {
    filteredData,
    filters,
    updateFilter,
    resetFilters,
    totalCount: transactions.length,
    filteredCount: filteredData.length,
  };
};
