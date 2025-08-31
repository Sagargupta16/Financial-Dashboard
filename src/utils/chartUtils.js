// Chart utility functions and constants

// Currency formatting utility
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Enhanced currency formatting with decimals
export const formatCurrencyDetailed = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Month names array
export const monthNames = [
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

// Short month names array
export const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Color palettes for charts
export const colorPalettes = {
  primary: [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
  ],
  expense: [
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#991b1b",
    "#7f1d1d",
    "#fca5a5",
    "#f87171",
    "#fee2e2",
  ],
  income: [
    "#10b981",
    "#059669",
    "#047857",
    "#065f46",
    "#064e3b",
    "#6ee7b7",
    "#34d399",
    "#d1fae5",
  ],
  neutral: [
    "#6b7280",
    "#4b5563",
    "#374151",
    "#1f2937",
    "#111827",
    "#9ca3af",
    "#d1d5db",
    "#f3f4f6",
  ],
};

// Common chart configuration
export const getCommonChartOptions = (customOptions = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#9ca3af",
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#ffffff",
      bodyColor: "#e5e7eb",
      callbacks: {
        label: (context) => {
          const value = context.parsed.y || context.parsed;
          return `${context.dataset.label}: ${formatCurrency(value)}`;
        },
        ...customOptions.tooltip?.callbacks,
      },
    },
    ...customOptions.plugins,
  },
  scales: {
    x: {
      ticks: { color: "#9ca3af" },
      grid: { color: "#374151" },
      ...customOptions.scales?.x,
    },
    y: {
      ticks: {
        color: "#9ca3af",
        callback: (v) => formatCurrency(v),
      },
      grid: { color: "#374151" },
      ...customOptions.scales?.y,
    },
    ...customOptions.scales,
  },
  ...customOptions,
});

// Export chart as image utility
export const exportChartAsPNG = (chartRef, filename) => {
  if (chartRef?.current) {
    const canvas = chartRef.current.canvas;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = url;
    link.click();
  }
};

// Data filtering utilities
export const filterDataByTimeRange = (data, timeRange) => {
  return data.filter((item) => {
    if (!item.date) return false;
    const date = new Date(item.date);
    const now = new Date();

    switch (timeRange) {
      case "last7days":
        return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "last30days":
        return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "last6months":
        return date >= new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      case "last12months":
        return date >= new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });
};

// Group data by category
export const groupDataByCategory = (data, filterOptions = {}) => {
  const { excludeInPocket = true, type = null } = filterOptions;

  return data.reduce((acc, item) => {
    if (excludeInPocket && item.category === "In-pocket") return acc;
    if (type && item.type !== type) return acc;

    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.amount;
    return acc;
  }, {});
};

// Group data by month
export const groupDataByMonth = (data) => {
  return data.reduce((acc, item) => {
    if (!item.date) return acc;

    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0, net: 0 };
    }

    if (item.type === "Income") {
      acc[monthKey].income += item.amount;
    } else if (item.type === "Expense") {
      acc[monthKey].expense += item.amount;
    }

    acc[monthKey].net = acc[monthKey].income - acc[monthKey].expense;
    return acc;
  }, {});
};

// Get available years from data
export const getAvailableYears = (data) => {
  const years = new Set();
  data.forEach((item) => {
    if (item.date) {
      years.add(new Date(item.date).getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => a - b);
};

// Format month key to readable label
export const formatMonthLabel = (monthKey) => {
  const [year, monthNum] = monthKey.split("-");
  return `${shortMonthNames[parseInt(monthNum) - 1]} ${year}`;
};

// Generate color with opacity
export const generateColorWithOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Calculate percentage change
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

// Debounce utility for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
