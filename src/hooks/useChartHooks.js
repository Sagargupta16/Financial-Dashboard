import { useState, useMemo } from "react";
import {
  getAvailableYears,
  filterDataByTimeRange,
  groupDataByCategory,
  groupDataByMonth,
  monthNames,
} from "../utils/chartUtils";

// Custom hook for time navigation logic
export const useTimeNavigation = (data, initialViewMode = "month") => {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const availableYears = useMemo(() => getAvailableYears(data), [data]);

  const canGoPrevious = () => {
    if (viewMode === "month") {
      return currentMonth > 1 || currentYear > Math.min(...availableYears);
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "month") {
      return currentMonth < 12 || currentYear < Math.max(...availableYears);
    } else if (viewMode === "year") {
      return currentYear < Math.max(...availableYears);
    }
    return false;
  };

  const handlePrevious = () => {
    if (viewMode === "month") {
      if (currentMonth > 1) {
        setCurrentMonth(currentMonth - 1);
      } else if (currentYear > Math.min(...availableYears)) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(12);
      }
    } else if (viewMode === "year") {
      if (currentYear > Math.min(...availableYears)) {
        setCurrentYear(currentYear - 1);
      }
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      if (currentMonth < 12) {
        setCurrentMonth(currentMonth + 1);
      } else if (currentYear < Math.max(...availableYears)) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(1);
      }
    } else if (viewMode === "year") {
      if (currentYear < Math.max(...availableYears)) {
        setCurrentYear(currentYear + 1);
      }
    }
  };

  const getCurrentPeriodLabel = () => {
    if (viewMode === "all-time") return "All Time";
    if (viewMode === "year") return `Year ${currentYear}`;
    return `${monthNames[currentMonth - 1]} ${currentYear}`;
  };

  const getFilteredData = () => {
    return data.filter((item) => {
      if (!item.date) return false;
      const date = new Date(item.date);

      if (viewMode === "all-time") return true;
      if (viewMode === "year") return date.getFullYear() === currentYear;
      if (viewMode === "month") {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
      return true;
    });
  };

  return {
    viewMode,
    setViewMode,
    currentYear,
    currentMonth,
    availableYears,
    canGoPrevious,
    canGoNext,
    handlePrevious,
    handleNext,
    getCurrentPeriodLabel,
    getFilteredData,
  };
};

// Custom hook for chart data processing
export const useChartDataProcessor = (data, options = {}) => {
  const {
    excludeInPocket = true,
    groupBy = "category",
    sortBy = "amount",
    sortOrder = "desc",
    limit = null,
  } = options;

  return useMemo(() => {
    let processedData = data;

    // Filter out in-pocket if needed
    if (excludeInPocket) {
      processedData = processedData.filter(
        (item) => item.category !== "In-pocket"
      );
    }

    // Group data
    let groupedData;
    if (groupBy === "category") {
      groupedData = groupDataByCategory(processedData);
    } else if (groupBy === "month") {
      groupedData = groupDataByMonth(processedData);
    } else if (groupBy === "account") {
      groupedData = processedData.reduce((acc, item) => {
        if (!acc[item.account]) acc[item.account] = 0;
        acc[item.account] += item.amount;
        return acc;
      }, {});
    }

    // Convert to array and sort
    let sortedData = Object.entries(groupedData || {});

    if (sortBy === "amount") {
      sortedData.sort(([, a], [, b]) => (sortOrder === "desc" ? b - a : a - b));
    } else if (sortBy === "name") {
      sortedData.sort(([a], [b]) =>
        sortOrder === "desc" ? b.localeCompare(a) : a.localeCompare(b)
      );
    }

    // Apply limit if specified
    if (limit && sortedData.length > limit) {
      sortedData = sortedData.slice(0, limit);
    }

    return sortedData;
  }, [data, excludeInPocket, groupBy, sortBy, sortOrder, limit]);
};

// Custom hook for multiple filter management
export const useMultipleFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const applyFilters = (data) => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === "all" || value === "All") return true;

        // Handle different filter types
        switch (key) {
          case "type":
            return item.type === value;
          case "category":
            return item.category === value;
          case "account":
            return item.account === value;
          case "dateRange":
            return filterDataByTimeRange([item], value).length > 0;
          default:
            return item[key] === value;
        }
      });
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
  };
};

// Custom hook for trend analysis
export const useTrendAnalysis = (data, period = "month") => {
  return useMemo(() => {
    const groupedData = groupDataByMonth(data);
    const sortedMonths = Object.keys(groupedData).sort();

    if (sortedMonths.length < 2) {
      return { trend: "insufficient-data", change: 0, direction: "neutral" };
    }

    const latest = groupedData[sortedMonths[sortedMonths.length - 1]];
    const previous = groupedData[sortedMonths[sortedMonths.length - 2]];

    const change = ((latest.net - previous.net) / Math.abs(previous.net)) * 100;

    return {
      trend: change > 5 ? "improving" : change < -5 ? "declining" : "stable",
      change: Math.abs(change),
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
      latest: latest.net,
      previous: previous.net,
    };
  }, [data, period]);
};

// Custom hook for forecasting
export const useForecastData = (
  historicalData,
  forecastPeriods = 6,
  method = "linear"
) => {
  return useMemo(() => {
    const monthlyData = groupDataByMonth(historicalData);
    const sortedMonths = Object.keys(monthlyData).sort();

    if (sortedMonths.length < 3) {
      return { forecast: [], confidence: "low" };
    }

    const recentData = sortedMonths
      .slice(-6)
      .map((month) => monthlyData[month].net);
    let forecast = [];

    if (method === "linear") {
      // Simple moving average
      const average =
        recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
      forecast = Array(forecastPeriods).fill(average);
    } else if (method === "trend") {
      // Linear regression
      const n = recentData.length;
      const sumX = recentData.reduce((sum, _, index) => sum + index, 0);
      const sumY = recentData.reduce((sum, val) => sum + val, 0);
      const sumXY = recentData.reduce(
        (sum, val, index) => sum + index * val,
        0
      );
      const sumXX = recentData.reduce(
        (sum, _, index) => sum + index * index,
        0
      );

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      forecast = Array.from({ length: forecastPeriods }, (_, index) => {
        return slope * (n + index) + intercept;
      });
    }

    const confidence =
      recentData.length >= 6
        ? "high"
        : recentData.length >= 3
        ? "medium"
        : "low";

    return {
      forecast,
      confidence,
      historicalAverage:
        recentData.reduce((sum, val) => sum + val, 0) / recentData.length,
    };
  }, [historicalData, forecastPeriods, method]);
};
