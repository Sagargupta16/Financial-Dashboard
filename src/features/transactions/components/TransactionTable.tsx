import {
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Search,
  Settings,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { formatCurrency } from "../../../lib/formatters";
import type { SortConfig, Transaction, TransactionSortKey } from "../../../types";

// Helper functions for styling
const getTypeStyles = (type: string) => {
  switch (type) {
    case "Income":
      return "bg-green-900/50 text-green-300";
    case "Expense":
      return "bg-red-900/50 text-red-300";
    case "Transfer-In":
      return "bg-blue-900/50 text-blue-300";
    case "Transfer-Out":
      return "bg-orange-900/50 text-orange-300";
    default:
      return "bg-gray-700 text-gray-300";
  }
};

const getAmountTextColor = (type: string) => {
  if (type === "Income") {
    return "text-green-400";
  }
  if (type === "Transfer-In") {
    return "text-blue-400";
  }
  if (type === "Transfer-Out") {
    return "text-orange-400";
  }
  return "text-red-400";
};

// Add running balance to transactions
const addRunningBalance = (
  transactions: Transaction[]
): Array<Transaction & { runningBalance: number }> => {
  // Sort by date ascending first
  const sorted = [...transactions].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  let balance = 0;
  return sorted.map((transaction) => {
    if (transaction.type === "Income" || transaction.type === "Transfer-In") {
      balance += transaction.amount;
    } else if (transaction.type === "Expense" || transaction.type === "Transfer-Out") {
      balance -= transaction.amount;
    }

    return {
      ...transaction,
      runningBalance: balance,
    };
  });
};

// eslint-disable-next-line max-lines-per-function
export const EnhancedTransactionTable = ({
  data,
  onSort,
  currentPage: initialPage = 1,
  transactionsPerPage = 25,
  initialFilters = {},
}: {
  data: Transaction[];
  onSort?: (key: TransactionSortKey) => void;
  currentPage?: number;
  transactionsPerPage?: number;
  initialFilters?: Record<string, any>;
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortConfig, setSortConfig] = useState<SortConfig<TransactionSortKey>>({
    key: "date",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    account: "",
    category: "",
    subcategory: "",
    type: "",
    note: "",
    ...initialFilters,
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const columns: Array<{ key: TransactionSortKey; label: string }> = [
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "account", label: "Account" },
    { key: "category", label: "Category" },
    { key: "subcategory", label: "Subcategory" },
    { key: "note", label: "Note" },
    { key: "amount", label: "Amount" },
    { key: "type", label: "Type" },
    { key: "runningBalance", label: "Balance" },
  ];

  // Debounce search and filter values to reduce re-renders
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const debouncedFilters = useDebouncedValue(filters, 300);

  // Get unique values for filter dropdowns
  const uniqueValues = useMemo(() => {
    return {
      accounts: [...new Set(data.map((item) => item.account).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
      categories: [...new Set(data.map((item) => item.category).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
      subcategories: [...new Set(data.map((item) => item.subcategory).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
      types: [...new Set(data.map((item) => item.type).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    };
  }, [data]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search term across multiple fields
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.account || "").toLowerCase().includes(searchLower) ||
          (item.category || "").toLowerCase().includes(searchLower) ||
          (item.subcategory || "").toLowerCase().includes(searchLower) ||
          (item.note || "").toLowerCase().includes(searchLower) ||
          (item.type || "").toLowerCase().includes(searchLower) ||
          formatCurrency(item.amount).toLowerCase().includes(searchLower)
      );
    }

    // Apply individual filters
    if (debouncedFilters.dateFrom) {
      const fromDate = new Date(debouncedFilters.dateFrom);
      filtered = filtered.filter((item) => {
        const itemDate = item.date instanceof Date ? item.date : new Date(item.date);
        return itemDate >= fromDate;
      });
    }

    if (debouncedFilters.dateTo) {
      const toDate = new Date(debouncedFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((item) => {
        const itemDate = item.date instanceof Date ? item.date : new Date(item.date);
        return itemDate <= toDate;
      });
    }

    if (debouncedFilters.amountMin !== "") {
      const minAmount = Number.parseFloat(debouncedFilters.amountMin);
      if (!Number.isNaN(minAmount)) {
        filtered = filtered.filter((item) => item.amount >= minAmount);
      }
    }

    if (debouncedFilters.amountMax !== "") {
      const maxAmount = Number.parseFloat(debouncedFilters.amountMax);
      if (!Number.isNaN(maxAmount)) {
        filtered = filtered.filter((item) => item.amount <= maxAmount);
      }
    }

    if (debouncedFilters.account) {
      filtered = filtered.filter((item) => item.account === debouncedFilters.account);
    }

    if (debouncedFilters.category) {
      filtered = filtered.filter((item) => item.category === debouncedFilters.category);
    }

    if (debouncedFilters.subcategory) {
      filtered = filtered.filter((item) => item.subcategory === debouncedFilters.subcategory);
    }

    if (debouncedFilters.type) {
      filtered = filtered.filter((item) => item.type === debouncedFilters.type);
    }

    if (debouncedFilters.note) {
      const noteLower = debouncedFilters.note.toLowerCase();
      filtered = filtered.filter((item) => (item.note || "").toLowerCase().includes(noteLower));
    }

    return filtered;
  }, [
    data,
    debouncedSearchTerm,
    debouncedFilters.dateFrom,
    debouncedFilters.dateTo,
    debouncedFilters.amountMin,
    debouncedFilters.amountMax,
    debouncedFilters.account,
    debouncedFilters.category,
    debouncedFilters.subcategory,
    debouncedFilters.type,
    debouncedFilters.note,
  ]);

  // Add running balance to filtered data
  const dataWithBalance = useMemo(() => {
    return addRunningBalance(filteredData);
  }, [filteredData]);

  // Apply sorting to data with balance
  const sortedData = useMemo(() => {
    const sorted = [...dataWithBalance] as Array<Transaction & { runningBalance: number }>;
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = (a as any)[sortConfig.key];
        let bVal = (b as any)[sortConfig.key];

        // Handle date sorting
        if (sortConfig.key === "date") {
          aVal = a.date instanceof Date ? a.date : new Date(a.date);
          bVal = b.date instanceof Date ? b.date : new Date(b.date);
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        // Handle numeric sorting (amount, runningBalance)
        if (sortConfig.key === "amount" || sortConfig.key === "runningBalance") {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        // Handle string sorting (default) with localeCompare
        const strA = String(aVal || "").toLowerCase();
        const strB = String(bVal || "").toLowerCase();

        const compareResult = strA.localeCompare(strB, undefined, {
          sensitivity: "base",
        });
        return sortConfig.direction === "asc" ? compareResult : -compareResult;
      });
    }
    return sorted;
  }, [dataWithBalance, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, debouncedFilters]);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter((value) => value !== "").length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      account: "",
      category: "",
      subcategory: "",
      type: "",
      note: "",
    });
    setSearchTerm("");
  };

  const clearFilter = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const handleSort = (key: TransactionSortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    // Also call parent's onSort if provided
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <div className="glass border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
      {/* Header with Search and Filter Controls */}
      <div className="p-7 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl">
              <FileText className="text-blue-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">All Transactions</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Global Search */}
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search w-full sm:w-80 shadow-xl"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                showFilters
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/50 scale-105"
                  : "glass text-gray-300 hover:text-white hover:scale-105"
              }`}
            >
              <Filter size={18} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[1.5rem] h-6 flex items-center justify-center font-extrabold shadow-lg pulse-glow">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear All Filters */}
            {(activeFiltersCount > 0 || searchTerm) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-105"
                aria-label="Clear all filters"
              >
                <X size={18} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-6 glass rounded-2xl border border-gray-700/30 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {/* Date Range */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-date-from"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <Calendar size={14} />
                  Date From
                </label>
                <div className="relative">
                  <input
                    id="filter-date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  {filters.dateFrom && (
                    <button
                      onClick={() => clearFilter("dateFrom")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="filter-date-to"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <Calendar size={14} />
                  Date To
                </label>
                <div className="relative">
                  <input
                    id="filter-date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  {filters.dateTo && (
                    <button
                      onClick={() => clearFilter("dateTo")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-amount-min"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <DollarSign size={14} />
                  Min Amount
                </label>
                <div className="relative">
                  <input
                    id="filter-amount-min"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange("amountMin", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  {filters.amountMin && (
                    <button
                      onClick={() => clearFilter("amountMin")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="filter-amount-max"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <DollarSign size={14} />
                  Max Amount
                </label>
                <div className="relative">
                  <input
                    id="filter-amount-max"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange("amountMax", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  {filters.amountMax && (
                    <button
                      onClick={() => clearFilter("amountMax")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Account Filter */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-account"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <CreditCard size={14} />
                  Account
                </label>
                <div className="relative">
                  <select
                    id="filter-account"
                    value={filters.account}
                    onChange={(e) => handleFilterChange("account", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">All Accounts</option>
                    {uniqueValues.accounts.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                  {filters.account && (
                    <button
                      onClick={() => clearFilter("account")}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-category"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <Tag size={14} />
                  Category
                </label>
                <div className="relative">
                  <select
                    id="filter-category"
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {uniqueValues.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {filters.category && (
                    <button
                      onClick={() => clearFilter("category")}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategory Filter */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-subcategory"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <Tag size={14} />
                  Subcategory
                </label>
                <div className="relative">
                  <select
                    id="filter-subcategory"
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange("subcategory", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">All Subcategories</option>
                    {uniqueValues.subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                  {filters.subcategory && (
                    <button
                      onClick={() => clearFilter("subcategory")}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label
                  htmlFor="filter-type"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <Settings size={14} />
                  Type
                </label>
                <div className="relative">
                  <select
                    id="filter-type"
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    {uniqueValues.types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {filters.type && (
                    <button
                      onClick={() => clearFilter("type")}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Note Filter */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1 xl:col-span-2">
                <label
                  htmlFor="filter-note"
                  className="text-sm font-medium text-gray-300 flex items-center gap-2"
                >
                  <FileText size={14} />
                  Note Contains
                </label>
                <div className="relative">
                  <input
                    id="filter-note"
                    type="text"
                    placeholder="Search in notes..."
                    value={filters.note}
                    onChange={(e) => handleFilterChange("note", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  {filters.note && (
                    <button
                      onClick={() => clearFilter("note")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {activeFiltersCount > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl animate-fade-in">
                <p className="text-sm font-semibold text-gray-200">
                  <span className="text-blue-400 font-bold">
                    {activeFiltersCount} active filter
                    {activeFiltersCount > 1 ? "s" : ""}
                  </span>
                  {" • "}
                  <span className="text-white">
                    Showing {filteredData.length} of {data.length} transactions
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed">
          <colgroup>
            <col className="w-28" />
            <col className="w-20" />
            <col className="w-36" />
            <col className="w-32" />
            <col className="w-32" />
            <col className="w-48" />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-36" />
          </colgroup>
          <thead className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-b-2 border-blue-500/30">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="p-4 text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-all duration-300 group"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className="group-hover:text-white transition-colors duration-300 truncate">
                      {column.label}
                    </span>
                    {sortConfig.key === column.key && (
                      <span className="text-blue-400 font-extrabold text-base animate-pulse">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                    {sortConfig.key !== column.key && (
                      <ArrowUpDown
                        size={14}
                        className="opacity-30 group-hover:opacity-60 transition-opacity duration-300"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 bg-gray-900/40">
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className="transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/60 hover:shadow-lg group animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="p-3 text-sm font-medium text-gray-100 group-hover:text-white transition-colors duration-300 truncate">
                  {item.date ? new Date(item.date).toLocaleDateString() : ""}
                </td>
                <td className="p-3 text-sm text-gray-300 group-hover:text-gray-100 transition-colors duration-300 truncate">
                  {item.time}
                </td>
                <td
                  className="p-3 text-sm font-semibold text-gray-100 group-hover:text-white transition-colors duration-300 truncate"
                  title={item.account}
                >
                  {item.account}
                </td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 text-xs font-bold rounded-full border border-transparent group-hover:border-current transition-all duration-300 truncate block"
                    style={{
                      backgroundColor: (() => {
                        if (item.type === "Income") {
                          return "rgba(16, 185, 129, 0.5)";
                        }
                        if (item.type === "Expense") {
                          return "rgba(239, 68, 68, 0.5)";
                        }
                        if (item.type === "Transfer-In") {
                          return "rgba(59, 130, 246, 0.5)";
                        }
                        return "rgba(245, 158, 11, 0.5)";
                      })(),
                      color: (() => {
                        if (item.type === "Income") {
                          return "rgb(167, 243, 208)";
                        }
                        if (item.type === "Expense") {
                          return "rgb(252, 165, 165)";
                        }
                        if (item.type === "Transfer-In") {
                          return "rgb(147, 197, 253)";
                        }
                        return "rgb(253, 186, 116)";
                      })(),
                    }}
                    title={item.category}
                  >
                    {item.category}
                  </span>
                </td>
                <td
                  className="p-3 text-sm text-gray-300 group-hover:text-gray-100 transition-colors duration-300 truncate"
                  title={item.subcategory}
                >
                  {item.subcategory || "-"}
                </td>
                <td
                  className="p-3 text-sm text-gray-400 truncate group-hover:text-gray-200 transition-colors duration-300"
                  title={item.note}
                >
                  {item.note || "-"}
                </td>
                <td
                  className={`p-3 font-bold text-sm ${getAmountTextColor(
                    item.type
                  )} transition-transform duration-300 group-hover:scale-105 text-right`}
                >
                  {formatCurrency(item.amount)}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full border border-transparent group-hover:border-current transition-all duration-300 ${getTypeStyles(
                      item.type
                    )}`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="p-3">
                  <div
                    className={`text-sm font-bold transition-transform duration-300 group-hover:scale-105 text-right ${
                      item.runningBalance >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrency(Math.abs(item.runningBalance))}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5 text-right">
                    {item.runningBalance >= 0 ? "+" : "-"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedData.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 mb-5">
              <Search className="text-gray-400" size={36} />
            </div>
            <p className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm || activeFiltersCount > 0
                ? "No transactions match your search criteria"
                : "No transactions found"}
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border-t border-gray-700/50">
          <p className="text-sm font-medium text-gray-300">
            Showing{" "}
            <span className="font-bold text-white">
              {startIndex + 1}-{Math.min(endIndex, sortedData.length)}
            </span>{" "}
            of <span className="font-bold text-white">{sortedData.length}</span>
            {(searchTerm || activeFiltersCount > 0) && (
              <span className="text-gray-400 ml-1">(filtered from {data.length})</span>
            )}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>
            <span className="text-base font-bold text-white px-4">
              Page <span className="text-blue-400">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTransactionTable;
