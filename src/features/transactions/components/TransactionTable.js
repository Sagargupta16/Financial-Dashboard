import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  CreditCard,
  Settings,
} from "lucide-react";
import { formatCurrency } from "../../../shared/utils/dataUtils";

// Helper functions for styling
const getTypeStyles = (type) => {
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

const getAmountTextColor = (type) => {
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
const addRunningBalance = (transactions) => {
  // Sort by date ascending first
  const sorted = [...transactions].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateA - dateB;
  });

  let balance = 0;
  return sorted.map((transaction) => {
    if (transaction.type === "Income" || transaction.type === "Transfer-In") {
      balance += transaction.amount;
    } else if (
      transaction.type === "Expense" ||
      transaction.type === "Transfer-Out"
    ) {
      balance -= transaction.amount;
    }

    return {
      ...transaction,
      runningBalance: balance,
    };
  });
};

// eslint-disable-next-line max-lines-per-function, complexity
export const EnhancedTransactionTable = ({
  data,
  onSort,
  currentPage: initialPage = 1,
  transactionsPerPage = 25,
  initialFilters = {},
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
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

  // Get unique values for filter dropdowns
  const uniqueValues = useMemo(() => {
    return {
      accounts: [
        ...new Set(data.map((item) => item.account).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
      categories: [
        ...new Set(data.map((item) => item.category).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
      subcategories: [
        ...new Set(data.map((item) => item.subcategory).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
      types: [...new Set(data.map((item) => item.type).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    };
  }, [data]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search term across multiple fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
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
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((item) => {
        const itemDate =
          item.date instanceof Date ? item.date : new Date(item.date);
        return itemDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((item) => {
        const itemDate =
          item.date instanceof Date ? item.date : new Date(item.date);
        return itemDate <= toDate;
      });
    }

    if (filters.amountMin !== "") {
      const minAmount = parseFloat(filters.amountMin);
      if (!isNaN(minAmount)) {
        filtered = filtered.filter((item) => item.amount >= minAmount);
      }
    }

    if (filters.amountMax !== "") {
      const maxAmount = parseFloat(filters.amountMax);
      if (!isNaN(maxAmount)) {
        filtered = filtered.filter((item) => item.amount <= maxAmount);
      }
    }

    if (filters.account) {
      filtered = filtered.filter((item) => item.account === filters.account);
    }

    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    if (filters.subcategory) {
      filtered = filtered.filter(
        (item) => item.subcategory === filters.subcategory
      );
    }

    if (filters.type) {
      filtered = filtered.filter((item) => item.type === filters.type);
    }

    if (filters.note) {
      const noteLower = filters.note.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.note || "").toLowerCase().includes(noteLower)
      );
    }

    return filtered;
  }, [data, searchTerm, filters]);

  // Add running balance to filtered data
  const dataWithBalance = useMemo(() => {
    return addRunningBalance(filteredData);
  }, [filteredData]);

  // Pagination calculations
  const totalPages = Math.ceil(dataWithBalance.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedData = dataWithBalance.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter((value) => value !== "").length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key, value) => {
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

  const clearFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  return (
    <div className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-500 overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300"></div>
      {/* Header with Search and Filter Controls */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Transactions</h3>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* Global Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Filter size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear All Filters */}
            {(activeFiltersCount > 0 || searchTerm) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar size={14} />
                  Date From
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filters.dateFrom && (
                    <button
                      onClick={() => clearFilter("dateFrom")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar size={14} />
                  Date To
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filters.dateTo && (
                    <button
                      onClick={() => clearFilter("dateTo")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <DollarSign size={14} />
                  Min Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMin}
                    onChange={(e) =>
                      handleFilterChange("amountMin", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filters.amountMin && (
                    <button
                      onClick={() => clearFilter("amountMin")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <DollarSign size={14} />
                  Max Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMax}
                    onChange={(e) =>
                      handleFilterChange("amountMax", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filters.amountMax && (
                    <button
                      onClick={() => clearFilter("amountMax")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Account Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <CreditCard size={14} />
                  Account
                </label>
                <div className="relative">
                  <select
                    value={filters.account}
                    onChange={(e) =>
                      handleFilterChange("account", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Tag size={14} />
                  Category
                </label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategory Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Tag size={14} />
                  Subcategory
                </label>
                <div className="relative">
                  <select
                    value={filters.subcategory}
                    onChange={(e) =>
                      handleFilterChange("subcategory", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Settings size={14} />
                  Type
                </label>
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Note Filter */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1 xl:col-span-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText size={14} />
                  Note Contains
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search in notes..."
                    value={filters.note}
                    onChange={(e) => handleFilterChange("note", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filters.note && (
                    <button
                      onClick={() => clearFilter("note")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 text-sm text-gray-300">
                <span className="font-medium">Active filters:</span>{" "}
                {activeFiltersCount} |
                <span className="font-medium"> Showing:</span>{" "}
                {filteredData.length} of {data.length} transactions
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50">
            <tr>
              {[
                "date",
                "time",
                "account",
                "category",
                "subcategory",
                "note",
                "amount",
                "type",
                "runningBalance",
              ].map((key) => (
                <th
                  key={key}
                  className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort(key)}
                >
                  <div className="flex items-center">
                    {key === "type" && "Income/Expense"}
                    {key === "runningBalance" && "Running Balance"}
                    {key !== "type" && key !== "runningBalance" && key}
                    <ArrowUpDown size={14} className="ml-2 opacity-50" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                style={{
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                <td
                  className="p-4 whitespace-nowrap text-sm"
                  style={{ color: "#f3f4f6" }}
                >
                  {item.date?.toLocaleDateString()}
                </td>
                <td
                  className="p-4 whitespace-nowrap text-sm"
                  style={{ color: "#f3f4f6" }}
                >
                  {item.time}
                </td>
                <td
                  className="p-4 whitespace-nowrap text-sm"
                  style={{ color: "#f3f4f6" }}
                >
                  {item.account}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getTypeStyles(
                      item.type
                    )}`}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="p-4 text-sm" style={{ color: "#f3f4f6" }}>
                  {item.subcategory || "-"}
                </td>
                <td
                  className="p-4 text-sm max-w-xs truncate"
                  style={{ color: "#f3f4f6" }}
                  title={item.note}
                >
                  {item.note || "-"}
                </td>
                <td
                  className={`p-4 whitespace-nowrap font-medium text-sm ${getAmountTextColor(
                    item.type
                  )}`}
                >
                  {formatCurrency(item.amount)}
                </td>
                <td className="p-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getTypeStyles(
                      item.type
                    )}`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-medium ${
                      item.runningBalance >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(Math.abs(item.runningBalance))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.runningBalance >= 0 ? "Positive" : "Negative"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedData.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">
              {searchTerm || activeFiltersCount > 0
                ? "No transactions match your search criteria."
                : "No transactions found."}
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={clearAllFilters}
                className="mt-2 text-blue-400 hover:text-blue-300 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 bg-gray-800 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)}{" "}
            of {filteredData.length}
            {(searchTerm || activeFiltersCount > 0) && (
              <span className="text-gray-500">
                {" "}
                (filtered from {data.length})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

EnhancedTransactionTable.propTypes = {
  data: PropTypes.array.isRequired,
  onSort: PropTypes.func.isRequired,
  currentPage: PropTypes.number,
  transactionsPerPage: PropTypes.number,
  initialFilters: PropTypes.object,
};

export default EnhancedTransactionTable;
