import { useMemo, useState } from "react";
import {
  filterDataByTimeRange,
  getAvailableYears,
  groupDataByCategory,
  groupDataByMonth,
} from "../../../lib/charts";

type GenericDataItem = {
  date?: string | Date;
  type?: string;
  category?: string;
  account?: string;
  amount?: number;
  [key: string]: any;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Custom hook for time navigation logic
export const useTimeNavigation = (data: GenericDataItem[], initialViewMode: string = "month") => {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const availableYears = useMemo(() => getAvailableYears(data) as number[], [data]);

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
    if (viewMode === "all-time") {
      return "All Time";
    }
    if (viewMode === "year") {
      return `Year ${currentYear}`;
    }
    return `${monthNames[currentMonth - 1]} ${currentYear}`;
  };

  const getFilteredData = () => {
    return data.filter((item) => {
      if (!item.date) {
        return false;
      }
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      }
      if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      }
      if (viewMode === "month") {
        return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
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
export const useChartDataProcessor = (
  data: GenericDataItem[],
  options: {
    excludeInPocket?: boolean;
    groupBy?: "category" | "month" | "account";
    sortBy?: "amount" | "name";
    sortOrder?: "asc" | "desc";
    limit?: number | null;
  } = {}
) => {
  const {
    excludeInPocket = true,
    groupBy = "category",
    sortBy = "amount",
    sortOrder = "desc",
    limit = null,
  } = options;

  return useMemo(() => {
    let processedData: GenericDataItem[] = data;

    // Filter out in-pocket if needed
    if (excludeInPocket) {
      processedData = processedData.filter((item) => item.category !== "In-pocket");
    }

    // Group data
    let groupedData: Record<string, number> | undefined;
    if (groupBy === "category") {
      groupedData = groupDataByCategory(processedData) as Record<string, number>;
    } else if (groupBy === "month") {
      groupedData = groupDataByMonth(processedData) as Record<string, number>;
    } else if (groupBy === "account") {
      groupedData = processedData.reduce(
        (acc: Record<string, number>, item) => {
          const key = String(item.account ?? "Unknown");
          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key] += Number(item.amount) || 0;
          return acc;
        },
        {} as Record<string, number>
      );
    }

    // Convert to array and sort
    const grouped: Record<string, number> = groupedData ?? {};
    let sortedData = Object.entries(grouped);

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

  const updateFilter = (filterName: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const applyFilters = (data: GenericDataItem[]) => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === "all" || value === "All") {
          return true;
        }

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
export const useTrendAnalysis = (data: GenericDataItem[]) => {
  return useMemo(() => {
    const groupedData = groupDataByMonth(data) as Record<string, { net: number }>;
    const sortedMonths = Object.keys(groupedData).sort((a, b) => a.localeCompare(b));

    if (sortedMonths.length < 2) {
      return { trend: "insufficient-data", change: 0, direction: "neutral" };
    }

    const latestKey = sortedMonths[sortedMonths.length - 1];
    const previousKey = sortedMonths[sortedMonths.length - 2];
    const latest = groupedData[latestKey];
    const previous = groupedData[previousKey];

    const change = ((latest.net - previous.net) / Math.abs(previous.net)) * 100;

    // Determine trend based on change percentage
    let trendStatus;
    if (change > 5) {
      trendStatus = "improving";
    } else if (change < -5) {
      trendStatus = "declining";
    } else {
      trendStatus = "stable";
    }

    // Determine direction based on change
    let direction;
    if (change > 0) {
      direction = "up";
    } else if (change < 0) {
      direction = "down";
    } else {
      direction = "stable";
    }

    return {
      trend: trendStatus,
      change: Math.abs(change),
      direction,
      latest: latest.net,
      previous: previous.net,
    };
  }, [data]);
};

// Custom hook for forecasting
export const useForecastData = (
  historicalData: GenericDataItem[],
  forecastPeriods = 6,
  method = "linear"
) => {
  return useMemo(() => {
    const monthlyData = groupDataByMonth(historicalData) as Record<string, { net: number }>;
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => a.localeCompare(b));

    if (sortedMonths.length < 3) {
      return { forecast: [], confidence: "low" };
    }

    const recentData = sortedMonths.slice(-6).map((month) => monthlyData[month].net);
    let forecast: number[] = [];

    if (method === "linear") {
      // Simple moving average
      const average = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
      forecast = new Array(forecastPeriods).fill(average);
    } else if (method === "trend") {
      // Linear regression
      const n = recentData.length;
      const sumX = recentData.reduce((sum, _, index) => sum + index, 0);
      const sumY = recentData.reduce((sum, val) => sum + val, 0);
      const sumXY = recentData.reduce((sum, val, index) => sum + index * val, 0);
      const sumXX = recentData.reduce((sum, _, index) => sum + index * index, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      forecast = Array.from({ length: forecastPeriods }, (_, index) => {
        return slope * (n + index) + intercept;
      });
    }

    // Determine confidence level based on data points
    let confidence;
    if (recentData.length >= 6) {
      confidence = "high";
    } else if (recentData.length >= 3) {
      confidence = "medium";
    } else {
      confidence = "low";
    }

    return {
      forecast,
      confidence,
      historicalAverage: recentData.reduce((sum, val) => sum + val, 0) / recentData.length,
    };
  }, [historicalData, forecastPeriods, method]);
};
