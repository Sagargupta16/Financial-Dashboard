/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ChartCard } from "./ChartCard";

// Chart Options Configuration
export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#9ca3af" } },
    tooltip: {
      callbacks: {
        label: (c) => {
          const formatCurrency = (value) => {
            return new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value);
          };
          return `${c.dataset.label || ""}: ${formatCurrency(
            c.parsed.y || c.parsed
          )}`;
        },
      },
    },
  },
  scales: {
    x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
    y: {
      ticks: {
        color: "#9ca3af",
        callback: (v) => {
          const formatCurrency = (value) => {
            return new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value);
          };
          return formatCurrency(v);
        },
      },
      grid: { color: "#374151" },
    },
  },
};

export const doughnutOptions = {
  ...commonChartOptions,
  scales: {},
};

// Individual Chart Components
export const IncomeVsExpenseChart = ({ data, chartRef }) => (
  <ChartCard
    title="Income vs Expense"
    chartRef={chartRef}
    fileName="income-vs-expense.png"
  >
    <Doughnut ref={chartRef} data={data} options={doughnutOptions} />
  </ChartCard>
);

export const TopExpenseCategoriesChart = ({ data, chartRef }) => (
  <ChartCard
    title="Top Expense Categories"
    chartRef={chartRef}
    fileName="top-expenses.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const EnhancedTopExpenseCategoriesChart = ({
  filteredData,
  chartRef,
}) => {
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [viewMode, setViewMode] = React.useState("year"); // 'month', 'year', 'all-time'

  const monthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date || item.type !== "Expense") return false;
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "month") {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
      return false;
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Generate chart data
  const chartData = React.useMemo(() => {
    const expenses = timeFilteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const sorted = Object.entries(expenses)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sorted.map(([category]) => category),
      datasets: [
        {
          label: "Expenses",
          data: sorted.map(([, amount]) => amount),
          backgroundColor: "#3b82f6",
          borderRadius: 8,
        },
      ],
    };
  }, [timeFilteredData]);

  // Navigation handlers
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

  const canGoPrevious = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear < Math.max(...availableYears) || currentMonth < 12;
    } else if (viewMode === "year") {
      return currentYear < Math.max(...availableYears);
    }
    return false;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Top Expense Categories
        </h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              const fileName = `top-expenses-${viewMode}-${currentYear}${
                viewMode === "month" ? `-${currentMonth}` : ""
              }.png`;
              link.download = fileName;
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Time Navigation Controls */}
      <div className="flex justify-between items-center mb-4 bg-gray-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Monthly View</option>
            <option value="year">Yearly View</option>
            <option value="all-time">All Time</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          <div className="text-white font-semibold min-w-[150px] text-center">
            {viewMode === "all-time"
              ? "All Time"
              : viewMode === "year"
              ? `Year ${currentYear}`
              : `${monthNames[currentMonth - 1]} ${currentYear}`}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="text-sm text-gray-400">
          {timeFilteredData.length} expenses
        </div>
      </div>

      <div className="flex-grow">
        <Bar ref={chartRef} data={chartData} options={commonChartOptions} />
      </div>
    </div>
  );
};

export const TopIncomeSourcesChart = ({ data, chartRef }) => (
  <ChartCard
    title="Top Income Sources"
    chartRef={chartRef}
    fileName="income-sources.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const EnhancedTopIncomeSourcesChart = ({ filteredData, chartRef }) => {
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [viewMode, setViewMode] = React.useState("year"); // 'month', 'year', 'all-time'

  const monthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date || item.type !== "Income" || item.category === "In-pocket")
        return false;
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "month") {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
      return false;
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Generate chart data
  const chartData = React.useMemo(() => {
    const incomes = timeFilteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const sorted = Object.entries(incomes).sort(([, a], [, b]) => b - a);

    return {
      labels: sorted.map(([category]) => category),
      datasets: [
        {
          label: "Income",
          data: sorted.map(([, amount]) => amount),
          backgroundColor: "#10b981",
          borderRadius: 8,
        },
      ],
    };
  }, [timeFilteredData]);

  // Navigation handlers
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

  const canGoPrevious = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear < Math.max(...availableYears) || currentMonth < 12;
    } else if (viewMode === "year") {
      return currentYear < Math.max(...availableYears);
    }
    return false;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Top Income Sources</h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              const fileName = `top-income-${viewMode}-${currentYear}${
                viewMode === "month" ? `-${currentMonth}` : ""
              }.png`;
              link.download = fileName;
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Time Navigation Controls */}
      <div className="flex justify-between items-center mb-4 bg-gray-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="month">Monthly View</option>
            <option value="year">Yearly View</option>
            <option value="all-time">All Time</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          <div className="text-white font-semibold min-w-[150px] text-center">
            {viewMode === "all-time"
              ? "All Time"
              : viewMode === "year"
              ? `Year ${currentYear}`
              : `${monthNames[currentMonth - 1]} ${currentYear}`}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="text-sm text-gray-400">
          {timeFilteredData.length} income sources
        </div>
      </div>

      <div className="flex-grow">
        <Bar ref={chartRef} data={chartData} options={commonChartOptions} />
      </div>
    </div>
  );
};

export const SpendingByAccountChart = ({ data, chartRef }) => (
  <ChartCard
    title="Spending by Account"
    chartRef={chartRef}
    fileName="spending-by-account.png"
  >
    <Doughnut ref={chartRef} data={data} options={doughnutOptions} />
  </ChartCard>
);

export const EnhancedSpendingByAccountChart = ({ filteredData, chartRef }) => {
  const [viewMode, setViewMode] = React.useState("all-time"); // 'month', 'year', 'all-time'
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date || item.type !== "Expense") return false;
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "month") {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
      return false;
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Generate chart data with beautiful colors
  const chartData = React.useMemo(() => {
    const spending = timeFilteredData.reduce((acc, item) => {
      acc[item.account] = (acc[item.account] || 0) + item.amount;
      return acc;
    }, {});

    const sorted = Object.entries(spending).sort(([, a], [, b]) => b - a);

    // Beautiful color palette that matches the theme
    const colors = [
      "#3b82f6", // Blue
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#f97316", // Orange
      "#eab308", // Yellow
      "#10b981", // Emerald
      "#ef4444", // Red
      "#06b6d4", // Cyan
      "#84cc16", // Lime
      "#f59e0b", // Amber
      "#8b5a2b", // Brown
      "#6b7280", // Gray
    ];

    // Generate hover colors (lighter versions)
    const hoverColors = [
      "#60a5fa", // Lighter Blue
      "#a78bfa", // Lighter Purple
      "#f472b6", // Lighter Pink
      "#fb923c", // Lighter Orange
      "#fbbf24", // Lighter Yellow
      "#34d399", // Lighter Emerald
      "#f87171", // Lighter Red
      "#22d3ee", // Lighter Cyan
      "#a3e635", // Lighter Lime
      "#fbbf24", // Lighter Amber
      "#a3a3a3", // Lighter Brown
      "#9ca3af", // Lighter Gray
    ];

    return {
      labels: sorted.map(([account]) => account),
      datasets: [
        {
          data: sorted.map(([, amount]) => amount),
          backgroundColor: colors.slice(0, sorted.length),
          hoverBackgroundColor: hoverColors.slice(0, sorted.length),
          borderColor: "#1f2937",
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverBorderColor: "#ffffff",
        },
      ],
    };
  }, [timeFilteredData]);

  // Enhanced doughnut options with better styling
  const enhancedDoughnutOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#d1d5db", // Light gray text color for dark theme
            font: {
              size: 12,
              weight: "500",
              family: "Inter, system-ui, sans-serif",
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 12,
            boxHeight: 12,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                return data.labels.map((label, i) => {
                  const value = dataset.data[i];
                  const total = dataset.data.reduce((sum, val) => sum + val, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor,
                    pointStyle: "circle",
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          backgroundColor: "#111827", // Darker background
          titleColor: "#ffffff", // White title
          bodyColor: "#e5e7eb", // Light gray body text
          borderColor: "#374151",
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          padding: 12,
          titleFont: {
            size: 14,
            weight: "600",
          },
          bodyFont: {
            size: 13,
            weight: "500",
          },
          callbacks: {
            title: (tooltipItems) => {
              return `Account: ${tooltipItems[0].label}`;
            },
            label: (context) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce(
                (sum, val) => sum + val,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              const formatCurrency = (val) => {
                return new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(val);
              };
              return [
                `Amount: ${formatCurrency(value)}`,
                `Percentage: ${percentage}%`,
              ];
            },
          },
        },
      },
      cutout: "60%",
      radius: "90%",
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
      },
    }),
    []
  );

  // Navigation functions
  const handlePrevious = () => {
    if (viewMode === "month") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === "year") {
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === "year") {
      setCurrentYear(currentYear + 1);
    }
  };

  const canGoPrevious = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear < Math.max(...availableYears) || currentMonth < 12;
    } else if (viewMode === "year") {
      return currentYear < Math.max(...availableYears);
    }
    return false;
  };

  const formatMonthLabel = (monthString) => {
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
    return monthNames[monthString - 1];
  };

  const getDisplayTitle = () => {
    if (viewMode === "all-time") {
      return "Spending by Account (All Time)";
    } else if (viewMode === "year") {
      return `Spending by Account (${currentYear})`;
    } else if (viewMode === "month") {
      return `Spending by Account (${formatMonthLabel(
        currentMonth
      )} ${currentYear})`;
    }
    return "Spending by Account";
  };

  const totalSpending = React.useMemo(() => {
    return timeFilteredData.reduce((sum, item) => sum + item.amount, 0);
  }, [timeFilteredData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          {getDisplayTitle()}
        </h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              const fileName = `spending-by-account-${viewMode}-${currentYear}${
                viewMode === "month" ? `-${currentMonth}` : ""
              }.png`;
              link.download = fileName;
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLineJoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="flex space-x-2 mb-4">
        {["month", "year", "all-time"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {mode === "all-time"
              ? "All Time"
              : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      {viewMode !== "all-time" && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <span className="text-gray-300 font-medium">
            {viewMode === "month" &&
              `${formatMonthLabel(currentMonth)} ${currentYear}`}
            {viewMode === "year" && currentYear}
          </span>
          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Total Spending Display */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-400">Total Spending</div>
        <div className="text-2xl font-bold text-white">
          {formatCurrency(totalSpending)}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        {chartData.labels.length > 0 ? (
          <Doughnut
            ref={chartRef}
            data={chartData}
            options={enhancedDoughnutOptions}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>No spending data available</div>
              <div className="text-sm">for the selected period</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MonthlyTrendsChart = ({ data, chartRef }) => (
  <ChartCard
    title="Monthly Trends"
    chartRef={chartRef}
    fileName="monthly-trends.png"
    className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col"
  >
    <Line ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const EnhancedMonthlyTrendsChart = ({ filteredData, chartRef }) => {
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [viewMode, setViewMode] = React.useState("year"); // 'year', 'all-time', 'last-12-months'

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    const now = new Date();
    return filteredData.filter((item) => {
      if (!item.date || item.category === "In-pocket") return false;
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "last-12-months") {
        const twelveMonthsAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 12,
          1
        );
        return date >= twelveMonthsAgo;
      }
      return false;
    });
  }, [filteredData, currentYear, viewMode]);

  // Generate chart data
  const chartData = React.useMemo(() => {
    const monthly = timeFilteredData.reduce((acc, item) => {
      const month = item.date.toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expense: 0 };
      if (item.type === "Income") acc[month].income += item.amount;
      else if (item.type === "Expense") acc[month].expense += item.amount;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthly).sort();

    // Convert YYYY-MM format to readable month labels
    const formatMonthLabel = (monthString) => {
      const [year, month] = monthString.split("-");
      const monthNames = [
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

      if (viewMode === "all-time") {
        // For all-time view, show month and year (e.g., "Jan 2024")
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      } else {
        // For yearly or last-12-months view, show just month (e.g., "Jan")
        return monthNames[parseInt(month) - 1];
      }
    };

    return {
      labels: sortedMonths.map(formatMonthLabel),
      datasets: [
        {
          label: "Income",
          data: sortedMonths.map((m) => monthly[m].income),
          borderColor: "#22c55e",
          backgroundColor: "#22c55e",
          tension: 0.3,
          fill: false,
        },
        {
          label: "Expense",
          data: sortedMonths.map((m) => monthly[m].expense),
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          tension: 0.3,
          fill: false,
        },
      ],
    };
  }, [timeFilteredData, viewMode]);

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === "year") {
      if (currentYear > Math.min(...availableYears)) {
        setCurrentYear(currentYear - 1);
      }
    }
  };

  const handleNext = () => {
    if (viewMode === "year") {
      if (currentYear < Math.max(...availableYears)) {
        setCurrentYear(currentYear + 1);
      }
    }
  };

  const canGoPrevious = () => {
    if (viewMode === "all-time" || viewMode === "last-12-months") return false;
    return currentYear > Math.min(...availableYears);
  };

  const canGoNext = () => {
    if (viewMode === "all-time" || viewMode === "last-12-months") return false;
    return currentYear < Math.max(...availableYears);
  };

  return (
    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Monthly Trends</h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              const fileName = `monthly-trends-${viewMode}${
                viewMode === "year" ? `-${currentYear}` : ""
              }.png`;
              link.download = fileName;
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Time Navigation Controls */}
      <div className="flex justify-between items-center mb-4 bg-gray-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="year">Yearly View</option>
            <option value="last-12-months">Last 12 Months</option>
            <option value="all-time">All Time</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          <div className="text-white font-semibold min-w-[150px] text-center">
            {viewMode === "all-time"
              ? "All Time"
              : viewMode === "last-12-months"
              ? "Last 12 Months"
              : `Year ${currentYear}`}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="text-sm text-gray-400">
          {
            timeFilteredData.filter(
              (i) => i.type === "Income" || i.type === "Expense"
            ).length
          }{" "}
          transactions
        </div>
      </div>

      <div className="flex-grow">
        <Line ref={chartRef} data={chartData} options={commonChartOptions} />
      </div>
    </div>
  );
};

export const SpendingByDayChart = ({ data, chartRef }) => (
  <ChartCard
    title="Spending by Day of Week"
    chartRef={chartRef}
    fileName="spending-by-day.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const SubcategoryBreakdownChart = ({
  data,
  chartRef,
  categories,
  selectedCategory,
  onCategoryChange,
}) => (
  <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-white">
        Subcategory Breakdown
      </h3>
      <div className="flex items-center gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              link.download = "subcategory-breakdown.png";
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
    <div className="flex-grow">
      <Bar ref={chartRef} data={data} options={commonChartOptions} />
    </div>
  </div>
);

export const EnhancedSubcategoryBreakdownChart = ({
  filteredData,
  chartRef,
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [viewMode, setViewMode] = React.useState("month"); // 'month', 'week', 'year', or 'decade'

  const monthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  const shortMonthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date) return false;
      const date = new Date(item.date);

      if (viewMode === "decade") {
        const decade = Math.floor(currentYear / 10) * 10;
        return date.getFullYear() >= decade && date.getFullYear() < decade + 10;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Generate chart data for trend analysis
  const chartData = React.useMemo(() => {
    if (!selectedCategory) return { labels: [], datasets: [] };

    if (viewMode === "decade") {
      // Decade view: show yearly trends for the selected decade
      const decade = Math.floor(currentYear / 10) * 10;
      const yearlyData = {};

      // Initialize all years in decade with empty objects
      for (let year = decade; year < decade + 10; year++) {
        yearlyData[year] = {};
      }

      // Aggregate data by year and subcategory
      filteredData
        .filter((i) => i.type === "Expense" && i.category === selectedCategory)
        .forEach((item) => {
          if (!item.date) return;
          const date = new Date(item.date);
          const year = date.getFullYear();
          if (year >= decade && year < decade + 10) {
            const sub = item.subcategory || "Uncategorized";
            if (!yearlyData[year][sub]) yearlyData[year][sub] = 0;
            yearlyData[year][sub] += item.amount;
          }
        });

      // Get top subcategories for the decade
      const decadeTotals = {};
      Object.values(yearlyData).forEach((yearData) => {
        Object.entries(yearData).forEach(([sub, amount]) => {
          decadeTotals[sub] = (decadeTotals[sub] || 0) + amount;
        });
      });

      const topSubcategories = Object.entries(decadeTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([sub]) => sub);

      const colors = ["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

      return {
        labels: Array.from({ length: 10 }, (_, i) => `${decade + i}`),
        datasets: topSubcategories.map((sub, index) => ({
          label: sub,
          data: Array.from(
            { length: 10 },
            (_, yearIndex) => yearlyData[decade + yearIndex][sub] || 0
          ),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.4,
          fill: false,
        })),
      };
    } else if (viewMode === "year") {
      // Yearly view: show monthly trends for the selected year
      const monthlyData = {};

      // Initialize all months with 0
      for (let month = 1; month <= 12; month++) {
        monthlyData[month] = {};
      }

      // Aggregate data by month and subcategory
      filteredData
        .filter((i) => i.type === "Expense" && i.category === selectedCategory)
        .forEach((item) => {
          if (!item.date) return;
          const date = new Date(item.date);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth() + 1;
            const sub = item.subcategory || "Uncategorized";
            if (!monthlyData[month][sub]) monthlyData[month][sub] = 0;
            monthlyData[month][sub] += item.amount;
          }
        });

      // Get top subcategories for the year
      const yearlyTotals = {};
      Object.values(monthlyData).forEach((monthData) => {
        Object.entries(monthData).forEach(([sub, amount]) => {
          yearlyTotals[sub] = (yearlyTotals[sub] || 0) + amount;
        });
      });

      const topSubcategories = Object.entries(yearlyTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([sub]) => sub);

      const colors = ["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

      return {
        labels: shortMonthNames,
        datasets: topSubcategories.map((sub, index) => ({
          label: sub,
          data: shortMonthNames.map(
            (_, monthIndex) => monthlyData[monthIndex + 1][sub] || 0
          ),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.4,
          fill: false,
        })),
      };
    } else {
      // Monthly view: show daily trends for the selected month
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const dailyData = {};

      // Initialize all days with empty objects
      for (let day = 1; day <= daysInMonth; day++) {
        dailyData[day] = {};
      }

      // Aggregate data by day and subcategory
      filteredData
        .filter((i) => i.type === "Expense" && i.category === selectedCategory)
        .forEach((item) => {
          if (!item.date) return;
          const date = new Date(item.date);
          if (
            date.getFullYear() === currentYear &&
            date.getMonth() + 1 === currentMonth
          ) {
            const day = date.getDate();
            const sub = item.subcategory || "Uncategorized";
            if (!dailyData[day][sub]) dailyData[day][sub] = 0;
            dailyData[day][sub] += item.amount;
          }
        });

      // Get top subcategories for the month
      const monthlyTotals = {};
      Object.values(dailyData).forEach((dayData) => {
        Object.entries(dayData).forEach(([sub, amount]) => {
          monthlyTotals[sub] = (monthlyTotals[sub] || 0) + amount;
        });
      });

      const topSubcategories = Object.entries(monthlyTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([sub]) => sub);

      const colors = ["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

      return {
        labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
        datasets: topSubcategories.map((sub, index) => ({
          label: sub,
          data: Array.from(
            { length: daysInMonth },
            (_, dayIndex) => dailyData[dayIndex + 1][sub] || 0
          ),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.4,
          fill: false,
        })),
      };
    }
  }, [
    filteredData,
    selectedCategory,
    currentYear,
    currentMonth,
    viewMode,
    monthNames,
    shortMonthNames,
  ]);

  // Navigation handlers
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
    } else if (viewMode === "decade") {
      const decade = Math.floor(currentYear / 10) * 10;
      if (decade > Math.floor(Math.min(...availableYears) / 10) * 10) {
        setCurrentYear(decade - 10);
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
    } else if (viewMode === "decade") {
      const decade = Math.floor(currentYear / 10) * 10;
      if (decade < Math.floor(Math.max(...availableYears) / 10) * 10) {
        setCurrentYear(decade + 10);
      }
    }
  };

  const canGoPrevious = () => {
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    } else if (viewMode === "decade") {
      const decade = Math.floor(currentYear / 10) * 10;
      return decade > Math.floor(Math.min(...availableYears) / 10) * 10;
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "month") {
      return currentYear < Math.max(...availableYears) || currentMonth < 12;
    } else if (viewMode === "year") {
      return currentYear < Math.max(...availableYears);
    } else if (viewMode === "decade") {
      const decade = Math.floor(currentYear / 10) * 10;
      return decade < Math.floor(Math.max(...availableYears) / 10) * 10;
    }
    return false;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Enhanced Subcategory Analysis
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (chartRef?.current) {
                const canvas = chartRef.current.canvas;
                const url = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                const fileName = `enhanced-subcategory-${viewMode}-${currentYear}${
                  viewMode === "month" ? `-${currentMonth}` : ""
                }.png`;
                link.download = fileName;
                link.href = url;
                link.click();
              }
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Time Navigation Controls */}
      <div className="flex justify-between items-center mb-4 bg-gray-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Monthly View</option>
            <option value="year">Yearly View</option>
            <option value="decade">Decade View</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          <div className="text-white font-semibold min-w-[150px] text-center">
            {viewMode === "decade"
              ? `${Math.floor(currentYear / 10) * 10}s`
              : viewMode === "year"
              ? `Year ${currentYear}`
              : `${monthNames[currentMonth - 1]} ${currentYear}`}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="text-sm text-gray-400">
          {
            timeFilteredData.filter(
              (i) => i.type === "Expense" && i.category === selectedCategory
            ).length
          }{" "}
          transactions
        </div>
      </div>

      <div className="flex-grow">
        <Line ref={chartRef} data={chartData} options={commonChartOptions} />
      </div>
    </div>
  );
};

export const MultiCategoryTimeAnalysisChart = ({
  filteredData,
  chartRef,
  categories,
}) => {
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [viewMode, setViewMode] = React.useState("month"); // 'month', 'week', 'year', or 'decade'

  const monthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  const shortMonthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date) return false;
      const date = new Date(item.date);

      if (viewMode === "decade") {
        const decade = Math.floor(currentYear / 10) * 10;
        return date.getFullYear() >= decade && date.getFullYear() < decade + 10;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Generate chart data for all categories trend analysis
  const chartData = React.useMemo(() => {
    if (viewMode === "decade") {
      // Decade view: show yearly trends for top categories
      const decade = Math.floor(currentYear / 10) * 10;
      const yearlyData = {};

      // Initialize all years in decade with empty objects
      for (let year = decade; year < decade + 10; year++) {
        yearlyData[year] = {};
      }

      // Aggregate data by year and category
      filteredData
        .filter((i) => i.type === "Expense")
        .forEach((item) => {
          if (!item.date) return;
          const date = new Date(item.date);
          const year = date.getFullYear();
          if (year >= decade && year < decade + 10) {
            const category = item.category;
            if (!yearlyData[year][category]) yearlyData[year][category] = 0;
            yearlyData[year][category] += item.amount;
          }
        });

      // Get top categories for the decade
      const decadeTotals = {};
      Object.values(yearlyData).forEach((yearData) => {
        Object.entries(yearData).forEach(([category, amount]) => {
          decadeTotals[category] = (decadeTotals[category] || 0) + amount;
        });
      });

      const topCategories = Object.entries(decadeTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([category]) => category);

      const colors = [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#22c55e",
        "#3b82f6",
        "#8b5cf6",
      ];

      return {
        labels: Array.from({ length: 10 }, (_, i) => `${decade + i}`),
        datasets: topCategories.map((category, index) => ({
          label: category,
          data: Array.from(
            { length: 10 },
            (_, yearIndex) => yearlyData[decade + yearIndex][category] || 0
          ),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.4,
          fill: false,
        })),
      };
    } else if (viewMode === "year") {
      // Yearly view: show monthly trends for top categories
      const monthlyData = {};

      // Initialize all months with empty objects
      for (let month = 1; month <= 12; month++) {
        monthlyData[month] = {};
      }

      // Aggregate data by month and category
      filteredData
        .filter((i) => i.type === "Expense")
        .forEach((item) => {
          if (!item.date) return;
          const date = new Date(item.date);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth() + 1;
            const category = item.category;
            if (!monthlyData[month][category]) monthlyData[month][category] = 0;
            monthlyData[month][category] += item.amount;
          }
        });

      // Get top categories for the year
      const yearlyTotals = {};
      Object.values(monthlyData).forEach((monthData) => {
        Object.entries(monthData).forEach(([category, amount]) => {
          yearlyTotals[category] = (yearlyTotals[category] || 0) + amount;
        });
      });

      const topCategories = Object.entries(yearlyTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([category]) => category);

      const colors = [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#22c55e",
        "#3b82f6",
        "#8b5cf6",
      ];

      return {
        labels: shortMonthNames,
        datasets: topCategories.map((category, index) => ({
          label: category,
          data: shortMonthNames.map(
            (_, monthIndex) => monthlyData[monthIndex + 1][category] || 0
          ),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.4,
          fill: false,
        })),
      };
    } else {
      // Monthly view: show daily trends for top categories
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const dailyData = {};

      // Initialize all days with empty objects
      for (let day = 1; day <= daysInMonth; day++) {
        dailyData[day] = {};
      }

      // Aggregate data by day and category
      filteredData
        .filter((i) => i.type === "Expense")
        .forEach((item) => {
          if (!item.date) return;
          const date = new Date(item.date);
          if (
            date.getFullYear() === currentYear &&
            date.getMonth() + 1 === currentMonth
          ) {
            const day = date.getDate();
            const category = item.category;
            if (!dailyData[day][category]) dailyData[day][category] = 0;
            dailyData[day][category] += item.amount;
          }
        });

      // Get top categories for the month
      const monthlyTotals = {};
      Object.values(dailyData).forEach((dayData) => {
        Object.entries(dayData).forEach(([category, amount]) => {
          monthlyTotals[category] = (monthlyTotals[category] || 0) + amount;
        });
      });

      const topCategories = Object.entries(monthlyTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([category]) => category);

      const colors = [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#22c55e",
        "#3b82f6",
        "#8b5cf6",
      ];

      return {
        labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
        datasets: topCategories.map((category, index) => ({
          label: category,
          data: Array.from(
            { length: daysInMonth },
            (_, dayIndex) => dailyData[dayIndex + 1][category] || 0
          ),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.4,
          fill: false,
        })),
      };
    }
  }, [
    filteredData,
    currentYear,
    currentMonth,
    viewMode,
    monthNames,
    shortMonthNames,
  ]);

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === "month") {
      if (currentMonth > 1) {
        setCurrentMonth(currentMonth - 1);
      } else if (currentYear > Math.min(...availableYears)) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(12);
      }
    } else if (currentYear > Math.min(...availableYears)) {
      setCurrentYear(currentYear - 1);
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
    } else if (currentYear < Math.max(...availableYears)) {
      setCurrentYear(currentYear + 1);
    }
  };

  const canGoPrevious = () => {
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    }
    return currentYear > Math.min(...availableYears);
  };

  const canGoNext = () => {
    if (viewMode === "month") {
      return currentYear < Math.max(...availableYears) || currentMonth < 12;
    }
    return currentYear < Math.max(...availableYears);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Multi-Category Time Analysis
        </h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              const fileName = `multi-category-${viewMode}-${currentYear}${
                viewMode === "month" ? `-${currentMonth}` : ""
              }.png`;
              link.download = fileName;
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Time Navigation Controls */}
      <div className="flex justify-between items-center mb-4 bg-gray-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="month">Monthly View</option>
            <option value="year">Yearly View</option>
            <option value="decade">Decade View</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          <div className="text-white font-semibold min-w-[150px] text-center">
            {viewMode === "decade"
              ? `${Math.floor(currentYear / 10) * 10}s`
              : viewMode === "year"
              ? `Year ${currentYear}`
              : `${monthNames[currentMonth - 1]} ${currentYear}`}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="text-sm text-gray-400">
          {timeFilteredData.filter((i) => i.type === "Expense").length} expense
          transactions
        </div>
      </div>

      <div className="flex-grow">
        <Line ref={chartRef} data={chartData} options={commonChartOptions} />
      </div>
    </div>
  );
};

export const NetWorthTrendChart = ({ filteredData, chartRef }) => {
  const [viewMode, setViewMode] = React.useState("all-time"); // 'month', 'year', 'all-time'
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date || item.category === "In-pocket") return false;
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "month") {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
      return false;
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Calculate cumulative net worth over time
  const chartData = React.useMemo(() => {
    // Group transactions by date and calculate running totals
    const dailyData = timeFilteredData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((acc, transaction) => {
        const dateKey = transaction.date.toISOString().split("T")[0]; // YYYY-MM-DD format

        if (!acc[dateKey]) {
          acc[dateKey] = { income: 0, expense: 0, date: transaction.date };
        }

        if (transaction.type === "Income") {
          acc[dateKey].income += transaction.amount;
        } else if (transaction.type === "Expense") {
          acc[dateKey].expense += transaction.amount;
        }

        return acc;
      }, {});

    // Convert to array and sort by date
    const sortedDates = Object.keys(dailyData).sort();

    // Calculate cumulative net worth
    let cumulativeNetWorth = 0;
    const netWorthData = sortedDates.map((dateKey) => {
      const dayData = dailyData[dateKey];
      const dailyNetChange = dayData.income - dayData.expense;
      cumulativeNetWorth += dailyNetChange;

      return {
        date: dateKey,
        netWorth: cumulativeNetWorth,
        dailyIncome: dayData.income,
        dailyExpense: dayData.expense,
        dailyNet: dailyNetChange,
      };
    });

    // Format labels based on view mode and data density
    const formatLabel = (dateString, index, total) => {
      const date = new Date(dateString);

      if (viewMode === "month") {
        return date.getDate().toString(); // Just day number
      } else if (viewMode === "year") {
        // Show month names for yearly view
        const monthNames = [
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
        return monthNames[date.getMonth()];
      } else {
        // For all-time, show year-month or just year depending on data span
        if (total > 50) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        } else {
          const monthNames = [
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
          return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        }
      }
    };

    // Aggregate data based on view mode for better visualization
    let aggregatedData = netWorthData;

    if (viewMode === "year" && netWorthData.length > 12) {
      // Group by month for yearly view
      const monthlyData = {};
      netWorthData.forEach((item) => {
        const monthKey = item.date.substring(0, 7); // YYYY-MM
        if (
          !monthlyData[monthKey] ||
          new Date(item.date) > new Date(monthlyData[monthKey].date)
        ) {
          monthlyData[monthKey] = item; // Keep latest entry for each month
        }
      });
      aggregatedData = Object.values(monthlyData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    } else if (viewMode === "all-time" && netWorthData.length > 50) {
      // Group by month for all-time view if too many data points
      const monthlyData = {};
      netWorthData.forEach((item) => {
        const monthKey = item.date.substring(0, 7); // YYYY-MM
        if (
          !monthlyData[monthKey] ||
          new Date(item.date) > new Date(monthlyData[monthKey].date)
        ) {
          monthlyData[monthKey] = item; // Keep latest entry for each month
        }
      });
      aggregatedData = Object.values(monthlyData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    }

    return {
      labels: aggregatedData.map((item, index) =>
        formatLabel(item.date, index, aggregatedData.length)
      ),
      datasets: [
        {
          label: "Net Worth",
          data: aggregatedData.map((item) => item.netWorth),
          borderColor: "#10b981", // Emerald green for positive growth
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: "#34d399",
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 3,
        },
      ],
    };
  }, [timeFilteredData, viewMode]);

  // Enhanced line options for net worth chart
  const netWorthChartOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false, // Hide legend since we only have one line
        },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#ffffff",
          bodyColor: "#e5e7eb",
          borderColor: "#374151",
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          padding: 12,
          titleFont: {
            size: 14,
            weight: "600",
          },
          bodyFont: {
            size: 13,
            weight: "500",
          },
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              const dataPoint = timeFilteredData[index];
              if (dataPoint) {
                return `Date: ${dataPoint.date.toLocaleDateString("en-IN")}`;
              }
              return tooltipItems[0].label;
            },
            label: (context) => {
              const value = context.parsed.y;
              const formatCurrency = (val) => {
                return new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(val);
              };
              return `Net Worth: ${formatCurrency(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#9ca3af",
            maxTicksLimit:
              viewMode === "month" ? 31 : viewMode === "year" ? 12 : 10,
          },
          grid: {
            color: "#374151",
            drawOnChartArea: true,
          },
        },
        y: {
          ticks: {
            color: "#9ca3af",
            callback: (value) => {
              const formatCurrency = (val) => {
                if (Math.abs(val) >= 1000000) {
                  return `₹${(val / 1000000).toFixed(1)}M`;
                } else if (Math.abs(val) >= 1000) {
                  return `₹${(val / 1000).toFixed(0)}K`;
                }
                return `₹${val.toFixed(0)}`;
              };
              return formatCurrency(value);
            },
          },
          grid: {
            color: "#374151",
          },
          beginAtZero: false,
        },
      },
    }),
    [viewMode, timeFilteredData]
  );

  // Navigation functions
  const monthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  const handlePrevious = () => {
    if (viewMode === "month") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === "year") {
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === "year") {
      setCurrentYear(currentYear + 1);
    }
  };

  const canGoPrevious = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "month") {
      return currentYear < Math.max(...availableYears) || currentMonth < 12;
    } else if (viewMode === "year") {
      return currentYear < Math.max(...availableYears);
    }
    return false;
  };

  const getDisplayTitle = () => {
    if (viewMode === "all-time") {
      return "Net Worth Progression (All Time)";
    } else if (viewMode === "year") {
      return `Net Worth Progression (${currentYear})`;
    } else if (viewMode === "month") {
      return `Net Worth Progression (${
        monthNames[currentMonth - 1]
      } ${currentYear})`;
    }
    return "Net Worth Progression";
  };

  // Calculate key metrics
  const currentNetWorth = React.useMemo(() => {
    if (chartData.datasets[0].data.length === 0) return 0;
    return chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
  }, [chartData]);

  const netWorthChange = React.useMemo(() => {
    const data = chartData.datasets[0].data;
    if (data.length < 2) return 0;
    return data[data.length - 1] - data[0];
  }, [chartData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          {getDisplayTitle()}
        </h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              const fileName = `net-worth-trend-${viewMode}-${currentYear}${
                viewMode === "month" ? `-${currentMonth}` : ""
              }.png`;
              link.download = fileName;
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLineJoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="flex space-x-2 mb-4">
        {["month", "year", "all-time"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode
                ? "bg-emerald-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {mode === "all-time"
              ? "All Time"
              : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      {viewMode !== "all-time" && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <span className="text-gray-300 font-medium">
            {viewMode === "month" &&
              `${monthNames[currentMonth - 1]} ${currentYear}`}
            {viewMode === "year" && currentYear}
          </span>
          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400">Current Net Worth</div>
          <div
            className={`text-lg font-bold ${
              currentNetWorth >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatCurrency(currentNetWorth)}
          </div>
        </div>
        <div className="bg-gray-700/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400">
            {viewMode === "all-time" ? "Total Change" : "Period Change"}
          </div>
          <div
            className={`text-lg font-bold flex items-center ${
              netWorthChange >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {netWorthChange >= 0 ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1"
              >
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                <polyline points="17,6 23,6 23,12"></polyline>
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1"
              >
                <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"></polyline>
                <polyline points="17,18 23,18 23,12"></polyline>
              </svg>
            )}
            {formatCurrency(Math.abs(netWorthChange))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        {chartData.labels.length > 0 ? (
          <Line
            ref={chartRef}
            data={chartData}
            options={netWorthChartOptions}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <div>No financial data available</div>
              <div className="text-sm">for the selected period</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CumulativeCategoryTrendChart = ({ filteredData, chartRef }) => {
  const [viewMode, setViewMode] = React.useState("yearly"); // 'monthly', 'yearly', 'all-time'
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [selectedCategories, setSelectedCategories] = React.useState(new Set());

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [filteredData]);

  // Get available categories for selection
  const availableCategories = React.useMemo(() => {
    const categories = new Set();
    filteredData.forEach((item) => {
      if (
        item.type === "Expense" &&
        item.category &&
        item.category !== "In-pocket"
      ) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  }, [filteredData]);

  // Initialize selected categories with top 5 expense categories
  React.useEffect(() => {
    if (availableCategories.length > 0 && selectedCategories.size === 0) {
      // Get top 5 categories by total spending
      const categoryTotals = availableCategories.map((category) => {
        const total = filteredData
          .filter(
            (item) => item.type === "Expense" && item.category === category
          )
          .reduce((sum, item) => sum + item.amount, 0);
        return { category, total };
      });

      const top5Categories = categoryTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map((item) => item.category);

      setSelectedCategories(new Set(top5Categories));
    }
  }, [availableCategories, filteredData, selectedCategories.size]);

  // Filter data based on selected time period
  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (
        !item.date ||
        item.type !== "Expense" ||
        item.category === "In-pocket"
      )
        return false;
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "yearly") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "monthly") {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
      return false;
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Calculate cumulative spending data for selected categories
  const chartData = React.useMemo(() => {
    if (selectedCategories.size === 0) {
      return { labels: [], datasets: [] };
    }

    // Group transactions by date and category
    const dailyData = {};

    timeFilteredData
      .filter((item) => selectedCategories.has(item.category))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((transaction) => {
        const dateKey = transaction.date.toISOString().split("T")[0]; // YYYY-MM-DD format

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {};
          selectedCategories.forEach((category) => {
            dailyData[dateKey][category] = 0;
          });
        }

        dailyData[dateKey][transaction.category] += transaction.amount;
      });

    // Convert to array and sort by date
    const sortedDates = Object.keys(dailyData).sort();

    // Calculate cumulative totals for each category
    const cumulativeData = {};
    selectedCategories.forEach((category) => {
      cumulativeData[category] = 0;
    });

    const processedData = sortedDates.map((dateKey) => {
      const dayData = dailyData[dateKey];
      const result = { date: dateKey };

      selectedCategories.forEach((category) => {
        cumulativeData[category] += dayData[category] || 0;
        result[category] = cumulativeData[category];
      });

      return result;
    });

    // Format labels based on view mode
    const formatLabel = (dateString, index, total) => {
      const date = new Date(dateString);

      if (viewMode === "monthly") {
        return date.getDate().toString(); // Just day number
      } else if (viewMode === "yearly") {
        // Show month names for yearly view
        const monthNames = [
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
        return monthNames[date.getMonth()];
      } else {
        // For all-time, show year-month
        if (total > 50) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        } else {
          const monthNames = [
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
          return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        }
      }
    };

    // Aggregate data based on view mode for better visualization
    let aggregatedData = processedData;

    if (viewMode === "yearly" && processedData.length > 12) {
      // Group by month for yearly view
      const monthlyData = {};
      processedData.forEach((item) => {
        const monthKey = item.date.substring(0, 7); // YYYY-MM
        if (
          !monthlyData[monthKey] ||
          new Date(item.date) > new Date(monthlyData[monthKey].date)
        ) {
          monthlyData[monthKey] = item; // Keep latest entry for each month
        }
      });
      aggregatedData = Object.values(monthlyData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    } else if (viewMode === "all-time" && processedData.length > 50) {
      // Group by month for all-time view if too many data points
      const monthlyData = {};
      processedData.forEach((item) => {
        const monthKey = item.date.substring(0, 7); // YYYY-MM
        if (
          !monthlyData[monthKey] ||
          new Date(item.date) > new Date(monthlyData[monthKey].date)
        ) {
          monthlyData[monthKey] = item; // Keep latest entry for each month
        }
      });
      aggregatedData = Object.values(monthlyData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    }

    // Color palette for categories
    const colors = [
      "#3b82f6", // Blue
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#f97316", // Orange
      "#eab308", // Yellow
      "#10b981", // Emerald
      "#ef4444", // Red
      "#06b6d4", // Cyan
      "#84cc16", // Lime
      "#f59e0b", // Amber
      "#8b5a2b", // Brown
      "#6b7280", // Gray
    ];

    const datasets = Array.from(selectedCategories).map((category, index) => ({
      label: category,
      data: aggregatedData.map((item) => item[category] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: `${colors[index % colors.length]}20`, // 20% opacity
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: "#ffffff",
      pointBorderWidth: 1,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: colors[index % colors.length],
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 2,
    }));

    return {
      labels: aggregatedData.map((item, index) =>
        formatLabel(item.date, index, aggregatedData.length)
      ),
      datasets,
    };
  }, [timeFilteredData, viewMode, selectedCategories]);

  // Enhanced line options for cumulative category chart
  const cumulativeChartOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#d1d5db",
            font: {
              size: 11,
              weight: "500",
            },
            padding: 12,
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 10,
            boxHeight: 10,
          },
        },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#ffffff",
          bodyColor: "#e5e7eb",
          borderColor: "#374151",
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          padding: 12,
          titleFont: {
            size: 14,
            weight: "600",
          },
          bodyFont: {
            size: 13,
            weight: "500",
          },
          callbacks: {
            title: (tooltipItems) => {
              return `Period: ${tooltipItems[0].label}`;
            },
            label: (context) => {
              const value = context.parsed.y;
              const formatCurrency = (val) => {
                return new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(val);
              };
              return `${context.dataset.label}: ${formatCurrency(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#9ca3af",
            maxTicksLimit:
              viewMode === "monthly" ? 31 : viewMode === "yearly" ? 12 : 10,
          },
          grid: {
            color: "#374151",
            drawOnChartArea: true,
          },
        },
        y: {
          ticks: {
            color: "#9ca3af",
            callback: (value) => {
              const formatCurrency = (val) => {
                if (Math.abs(val) >= 1000000) {
                  return `₹${(val / 1000000).toFixed(1)}M`;
                } else if (Math.abs(val) >= 1000) {
                  return `₹${(val / 1000).toFixed(0)}K`;
                }
                return `₹${val.toFixed(0)}`;
              };
              return formatCurrency(value);
            },
          },
          grid: {
            color: "#374151",
          },
          beginAtZero: true,
        },
      },
    }),
    [viewMode]
  );

  // Navigation functions
  const monthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  const handlePrevious = () => {
    if (viewMode === "monthly") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === "yearly") {
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === "monthly") {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === "yearly") {
      setCurrentYear(currentYear + 1);
    }
  };

  const canGoPrevious = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "monthly") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "yearly") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") return false;
    if (viewMode === "monthly") {
      return currentYear < Math.max(...availableYears) || currentMonth < 12;
    } else if (viewMode === "yearly") {
      return currentYear < Math.max(...availableYears);
    }
    return false;
  };

  const getDisplayTitle = () => {
    if (viewMode === "all-time") {
      return "Cumulative Category Spending Trends (All Time)";
    } else if (viewMode === "yearly") {
      return `Cumulative Category Spending Trends (${currentYear})`;
    } else if (viewMode === "monthly") {
      return `Cumulative Category Spending Trends (${
        monthNames[currentMonth - 1]
      } ${currentYear})`;
    }
    return "Cumulative Category Spending Trends";
  };

  const toggleCategory = (category) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[500px] flex flex-col lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          {getDisplayTitle()}
        </h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const canvas = chartRef.current.canvas;
              const url = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              const fileName = `cumulative-category-trends-${viewMode}-${currentYear}${
                viewMode === "monthly" ? `-${currentMonth}` : ""
              }.png`;
              link.download = fileName;
              link.href = url;
              link.click();
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLineJoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="flex space-x-2 mb-4">
        {["monthly", "yearly", "all-time"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {mode === "all-time"
              ? "All Time"
              : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      {viewMode !== "all-time" && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <span className="text-gray-300 font-medium">
            {viewMode === "monthly" &&
              `${monthNames[currentMonth - 1]} ${currentYear}`}
            {viewMode === "yearly" && currentYear}
          </span>
          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Category Selection */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">
          Select Categories to Display:
        </div>
        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedCategories.has(category)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        {chartData.labels.length > 0 && selectedCategories.size > 0 ? (
          <Line
            ref={chartRef}
            data={chartData}
            options={cumulativeChartOptions}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>
                {selectedCategories.size === 0
                  ? "Select categories to display"
                  : "No spending data available"}
              </div>
              <div className="text-sm">
                {selectedCategories.size === 0
                  ? "Choose from the categories above"
                  : "for the selected period"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 1. Seasonal Spending Heatmap
export const SeasonalSpendingHeatmap = ({ filteredData, chartRef }) => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  // Get available categories
  const availableCategories = React.useMemo(() => {
    const categories = new Set(["All"]);
    filteredData.forEach((item) => {
      if (
        item.type === "Expense" &&
        item.category &&
        item.category !== "In-pocket"
      ) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  }, [filteredData]);

  // Calculate spending intensity by month and year
  const heatmapData = React.useMemo(() => {
    const data = filteredData.filter(
      (item) =>
        item.type === "Expense" &&
        item.category !== "In-pocket" &&
        (selectedCategory === "All" || item.category === selectedCategory)
    );

    const monthlyData = {};
    data.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (!monthlyData[year]) monthlyData[year] = {};
      if (!monthlyData[year][month]) monthlyData[year][month] = 0;

      monthlyData[year][month] += item.amount;
    });

    // Convert to chart format
    const years = Object.keys(monthlyData).sort();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const datasets = years.map((year) => ({
      label: year,
      data: months.map((month) => monthlyData[year]?.[month] || 0),
      backgroundColor: months.map((month) => {
        const value = monthlyData[year]?.[month] || 0;
        const maxValue = Math.max(
          ...Object.values(monthlyData).flatMap((y) => Object.values(y))
        );
        const intensity = value / (maxValue || 1);
        return `rgba(59, 130, 246, ${Math.max(0.1, intensity)})`;
      }),
      borderColor: "#1f2937",
      borderWidth: 1,
    }));

    return {
      labels: [
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
      ],
      datasets,
    };
  }, [filteredData, selectedCategory]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Seasonal Spending Heatmap
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (chartRef?.current) {
                const canvas = chartRef.current.canvas;
                const url = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = `seasonal-heatmap-${selectedCategory}.png`;
                link.href = url;
                link.click();
              }
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <Bar
          ref={chartRef}
          data={heatmapData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#9ca3af" } },
              tooltip: {
                backgroundColor: "#111827",
                titleColor: "#ffffff",
                bodyColor: "#e5e7eb",
                callbacks: {
                  label: (context) =>
                    `${context.dataset.label}: ${formatCurrency(
                      context.parsed.y
                    )}`,
                },
              },
            },
            scales: {
              x: {
                ticks: { color: "#9ca3af" },
                grid: { color: "#374151" },
                stacked: false,
              },
              y: {
                ticks: {
                  color: "#9ca3af",
                  callback: (v) => formatCurrency(v),
                },
                grid: { color: "#374151" },
                stacked: false,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// 2. Year-over-Year Comparison Chart
export const YearOverYearComparisonChart = ({ filteredData, chartRef }) => {
  const [comparisonType, setComparisonType] = React.useState("monthly"); // 'monthly', 'quarterly'
  const [selectedYears, setSelectedYears] = React.useState(new Set());

  // Get available years
  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Initialize with last 3 years
  React.useEffect(() => {
    if (availableYears.length > 0 && selectedYears.size === 0) {
      const recentYears = availableYears.slice(0, 3);
      setSelectedYears(new Set(recentYears));
    }
  }, [availableYears, selectedYears.size]);

  const chartData = React.useMemo(() => {
    if (selectedYears.size === 0) return { labels: [], datasets: [] };

    const groupedData = {};

    filteredData.forEach((item) => {
      if (item.category === "In-pocket") return;

      const date = new Date(item.date);
      const year = date.getFullYear();

      if (!selectedYears.has(year)) return;

      let periodKey;
      if (comparisonType === "monthly") {
        periodKey = date.getMonth() + 1; // 1-12
      } else {
        periodKey = Math.floor(date.getMonth() / 3) + 1; // 1-4 for quarters
      }

      if (!groupedData[year]) groupedData[year] = {};
      if (!groupedData[year][periodKey]) {
        groupedData[year][periodKey] = { income: 0, expense: 0 };
      }

      if (item.type === "Income") {
        groupedData[year][periodKey].income += item.amount;
      } else if (item.type === "Expense") {
        groupedData[year][periodKey].expense += item.amount;
      }
    });

    const labels =
      comparisonType === "monthly"
        ? [
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
          ]
        : ["Q1", "Q2", "Q3", "Q4"];

    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f97316",
      "#eab308",
      "#10b981",
    ];

    const datasets = [];
    Array.from(selectedYears)
      .sort()
      .forEach((year, yearIndex) => {
        // Net income datasets
        datasets.push({
          label: `${year} Net`,
          data: labels.map((_, index) => {
            const periodData = groupedData[year]?.[index + 1];
            return periodData ? periodData.income - periodData.expense : 0;
          }),
          borderColor: colors[yearIndex % colors.length],
          backgroundColor: `${colors[yearIndex % colors.length]}20`,
          borderWidth: 3,
          fill: false,
          tension: 0.3,
        });
      });

    return { labels, datasets };
  }, [filteredData, selectedYears, comparisonType]);

  const toggleYear = (year) => {
    const newSelected = new Set(selectedYears);
    if (newSelected.has(year)) {
      newSelected.delete(year);
    } else {
      newSelected.add(year);
    }
    setSelectedYears(newSelected);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Year-over-Year Comparison
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={comparisonType}
            onChange={(e) => setComparisonType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button
            onClick={() => {
              if (chartRef?.current) {
                const canvas = chartRef.current.canvas;
                const url = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = `year-over-year-${comparisonType}.png`;
                link.href = url;
                link.click();
              }
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Year Selection */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">
          Select Years to Compare:
        </div>
        <div className="flex flex-wrap gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedYears.has(year)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <Line
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#9ca3af" } },
              tooltip: {
                backgroundColor: "#111827",
                titleColor: "#ffffff",
                bodyColor: "#e5e7eb",
                callbacks: {
                  label: (context) =>
                    `${context.dataset.label}: ${formatCurrency(
                      context.parsed.y
                    )}`,
                },
              },
            },
            scales: {
              x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
              y: {
                ticks: {
                  color: "#9ca3af",
                  callback: (v) => formatCurrency(v),
                },
                grid: { color: "#374151" },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// 3. Spending Forecast Chart
export const SpendingForecastChart = ({ filteredData, chartRef }) => {
  const [forecastMonths, setForecastMonths] = React.useState(6);
  const [forecastType, setForecastType] = React.useState("linear"); // 'linear', 'trend'

  const chartData = React.useMemo(() => {
    // Group historical data by month
    const monthlyData = {};
    filteredData.forEach((item) => {
      if (item.category === "In-pocket") return;

      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, net: 0 };
      }

      if (item.type === "Income") {
        monthlyData[monthKey].income += item.amount;
      } else if (item.type === "Expense") {
        monthlyData[monthKey].expense += item.amount;
      }

      monthlyData[monthKey].net =
        monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });

    // Get sorted historical months
    const historicalMonths = Object.keys(monthlyData).sort();
    const lastMonth = historicalMonths[historicalMonths.length - 1];

    // Calculate forecast based on selected method
    let forecastData = [];
    if (forecastType === "linear") {
      // Simple average of last 6 months
      const recentMonths = historicalMonths.slice(-6);
      const avgIncome =
        recentMonths.reduce(
          (sum, month) => sum + monthlyData[month].income,
          0
        ) / recentMonths.length;
      const avgExpense =
        recentMonths.reduce(
          (sum, month) => sum + monthlyData[month].expense,
          0
        ) / recentMonths.length;
      const avgNet = avgIncome - avgExpense;

      forecastData = Array.from({ length: forecastMonths }, () => ({
        income: avgIncome,
        expense: avgExpense,
        net: avgNet,
      }));
    } else {
      // Trend-based forecast (simple linear regression)
      const recentMonths = historicalMonths.slice(-12); // Use last 12 months for trend
      const trendData = recentMonths.map((month, index) => ({
        x: index,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense,
        net: monthlyData[month].net,
      }));

      // Calculate linear trend for each metric
      const calculateTrend = (data, key) => {
        const n = data.length;
        const sumX = data.reduce((sum, item) => sum + item.x, 0);
        const sumY = data.reduce((sum, item) => sum + item[key], 0);
        const sumXY = data.reduce((sum, item) => sum + item.x * item[key], 0);
        const sumXX = data.reduce((sum, item) => sum + item.x * item.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
      };

      const incomeTrend = calculateTrend(trendData, "income");
      const expenseTrend = calculateTrend(trendData, "expense");

      forecastData = Array.from({ length: forecastMonths }, (_, index) => {
        const futureX = trendData.length + index;
        const income = Math.max(
          0,
          incomeTrend.slope * futureX + incomeTrend.intercept
        );
        const expense = Math.max(
          0,
          expenseTrend.slope * futureX + expenseTrend.intercept
        );
        return {
          income,
          expense,
          net: income - expense,
        };
      });
    }

    // Generate future month labels
    const futureMonths = [];
    let currentDate = new Date(lastMonth + "-01");
    for (let i = 0; i < forecastMonths; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      futureMonths.push(monthKey);
    }

    // Combine historical and forecast data
    const allMonths = [...historicalMonths.slice(-12), ...futureMonths]; // Show last 12 months + forecast
    const labels = allMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      const monthNames = [
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
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    });

    const historicalIncome = historicalMonths
      .slice(-12)
      .map((month) => monthlyData[month]?.income || 0);
    const historicalNet = historicalMonths
      .slice(-12)
      .map((month) => monthlyData[month]?.net || 0);

    return {
      labels,
      datasets: [
        {
          label: "Historical Net",
          data: [...historicalNet, ...Array(forecastMonths).fill(null)],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.3,
        },
        {
          label: "Forecast Net",
          data: [
            ...Array(historicalNet.length).fill(null),
            ...forecastData.map((d) => d.net),
          ],
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          borderWidth: 3,
          borderDash: [5, 5],
          fill: false,
          tension: 0.3,
        },
        {
          label: "Historical Income",
          data: [...historicalIncome, ...Array(forecastMonths).fill(null)],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        },
        {
          label: "Forecast Income",
          data: [
            ...Array(historicalIncome.length).fill(null),
            ...forecastData.map((d) => d.income),
          ],
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96, 165, 250, 0.05)",
          borderWidth: 2,
          borderDash: [3, 3],
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }, [filteredData, forecastMonths, forecastType]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Spending Forecast</h3>
        <div className="flex items-center space-x-4">
          <select
            value={forecastMonths}
            onChange={(e) => setForecastMonths(parseInt(e.target.value))}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
          <select
            value={forecastType}
            onChange={(e) => setForecastType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            <option value="linear">Average</option>
            <option value="trend">Trend</option>
          </select>
          <button
            onClick={() => {
              if (chartRef?.current) {
                const canvas = chartRef.current.canvas;
                const url = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = `spending-forecast-${forecastMonths}m.png`;
                link.href = url;
                link.click();
              }
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Line
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#9ca3af", font: { size: 11 } } },
              tooltip: {
                backgroundColor: "#111827",
                titleColor: "#ffffff",
                bodyColor: "#e5e7eb",
                callbacks: {
                  label: (context) =>
                    `${context.dataset.label}: ${formatCurrency(
                      context.parsed.y
                    )}`,
                },
              },
            },
            scales: {
              x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
              y: {
                ticks: {
                  color: "#9ca3af",
                  callback: (v) => formatCurrency(v),
                },
                grid: { color: "#374151" },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// 4. Account Balance Progression Chart
export const AccountBalanceProgressionChart = ({ filteredData, chartRef }) => {
  const [selectedAccount, setSelectedAccount] = React.useState("all");
  const [viewMode, setViewMode] = React.useState("cumulative"); // 'cumulative', 'monthly'

  const chartData = React.useMemo(() => {
    // Get unique accounts
    const accounts = [
      ...new Set(filteredData.map((item) => item.account)),
    ].sort();

    // Group data by account and date
    const accountData = {};
    accounts.forEach((account) => {
      accountData[account] = {};
    });

    filteredData.forEach((item) => {
      if (item.category === "In-pocket") return;

      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!accountData[item.account][monthKey]) {
        accountData[item.account][monthKey] = {
          income: 0,
          expense: 0,
          balance: 0,
        };
      }

      if (item.type === "Income") {
        accountData[item.account][monthKey].income += item.amount;
      } else if (item.type === "Expense") {
        accountData[item.account][monthKey].expense += item.amount;
      }
    });

    // Calculate balances
    const allMonths = [
      ...new Set(Object.values(accountData).flatMap((acc) => Object.keys(acc))),
    ].sort();

    // Calculate running balances for each account
    accounts.forEach((account) => {
      let runningBalance = 0;
      allMonths.forEach((month) => {
        if (!accountData[account][month]) {
          accountData[account][month] = {
            income: 0,
            expense: 0,
            balance: runningBalance,
          };
        } else {
          runningBalance +=
            accountData[account][month].income -
            accountData[account][month].expense;
          accountData[account][month].balance = runningBalance;
        }
      });
    });

    const labels = allMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      const monthNames = [
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
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    });

    const colors = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
      "#84cc16",
    ];

    if (selectedAccount === "all") {
      // Show all accounts
      const datasets = accounts.map((account, index) => ({
        label: account,
        data: allMonths.map((month) => {
          const data = accountData[account][month];
          return viewMode === "cumulative"
            ? data.balance
            : data.income - data.expense;
        }),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + "20",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
      }));

      return { labels, datasets };
    } else {
      // Show single account with income/expense breakdown
      const account = selectedAccount;
      return {
        labels,
        datasets: [
          {
            label: viewMode === "cumulative" ? "Balance" : "Net Income",
            data: allMonths.map((month) => {
              const data = accountData[account][month];
              return viewMode === "cumulative"
                ? data.balance
                : data.income - data.expense;
            }),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.3,
          },
          ...(viewMode === "monthly"
            ? [
                {
                  label: "Income",
                  data: allMonths.map(
                    (month) => accountData[account][month].income
                  ),
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                },
                {
                  label: "Expense",
                  data: allMonths.map(
                    (month) => -accountData[account][month].expense
                  ),
                  borderColor: "#ef4444",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderWidth: 2,
                  fill: false,
                  tension: 0.3,
                },
              ]
            : []),
        ],
      };
    }
  }, [filteredData, selectedAccount, viewMode]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const accounts = [
    ...new Set(filteredData.map((item) => item.account)),
  ].sort();

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Account Balance Progression
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            <option value="all">All Accounts</option>
            {accounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            <option value="cumulative">Cumulative</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={() => {
              if (chartRef?.current) {
                const canvas = chartRef.current.canvas;
                const url = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = `account-balance-progression-${selectedAccount}.png`;
                link.href = url;
                link.click();
              }
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Line
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#9ca3af", font: { size: 11 } } },
              tooltip: {
                backgroundColor: "#111827",
                titleColor: "#ffffff",
                bodyColor: "#e5e7eb",
                callbacks: {
                  label: (context) =>
                    `${context.dataset.label}: ${formatCurrency(
                      context.parsed.y
                    )}`,
                },
              },
            },
            scales: {
              x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
              y: {
                ticks: {
                  color: "#9ca3af",
                  callback: (v) => formatCurrency(v),
                },
                grid: { color: "#374151" },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// 5. Day of Week/Month Spending Patterns Chart
export const DayWeekSpendingPatternsChart = ({ filteredData, chartRef }) => {
  const [patternType, setPatternType] = React.useState("dayOfWeek"); // 'dayOfWeek', 'dayOfMonth'
  const [metricType, setMetricType] = React.useState("expense"); // 'expense', 'income', 'count'

  const chartData = React.useMemo(() => {
    const expenseData = filteredData.filter(
      (item) => item.type === "Expense" && item.category !== "In-pocket"
    );
    const incomeData = filteredData.filter((item) => item.type === "Income");

    if (patternType === "dayOfWeek") {
      // Day of week analysis
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const weekData = Array(7)
        .fill(0)
        .map(() => ({ expense: 0, income: 0, count: 0 }));

      expenseData.forEach((item) => {
        const dayOfWeek = new Date(item.date).getDay();
        weekData[dayOfWeek].expense += item.amount;
        weekData[dayOfWeek].count += 1;
      });

      incomeData.forEach((item) => {
        const dayOfWeek = new Date(item.date).getDay();
        weekData[dayOfWeek].income += item.amount;
      });

      const labels = dayNames;
      let data, backgroundColors;

      if (metricType === "expense") {
        data = weekData.map((d) => d.expense);
        backgroundColors = dayNames.map((_, index) => {
          const intensity = Math.max(
            0.3,
            Math.min(1, data[index] / Math.max(...data))
          );
          return `rgba(239, 68, 68, ${intensity})`;
        });
      } else if (metricType === "income") {
        data = weekData.map((d) => d.income);
        backgroundColors = dayNames.map((_, index) => {
          const intensity = Math.max(
            0.3,
            Math.min(1, data[index] / Math.max(...data))
          );
          return `rgba(16, 185, 129, ${intensity})`;
        });
      } else {
        data = weekData.map((d) => d.count);
        backgroundColors = dayNames.map((_, index) => {
          const intensity = Math.max(
            0.3,
            Math.min(1, data[index] / Math.max(...data))
          );
          return `rgba(59, 130, 246, ${intensity})`;
        });
      }

      return {
        labels,
        datasets: [
          {
            label:
              metricType === "expense"
                ? "Total Expenses"
                : metricType === "income"
                ? "Total Income"
                : "Transaction Count",
            data,
            backgroundColor: backgroundColors,
            borderColor:
              metricType === "expense"
                ? "#ef4444"
                : metricType === "income"
                ? "#10b981"
                : "#3b82f6",
            borderWidth: 2,
          },
        ],
      };
    } else {
      // Day of month analysis
      const monthData = Array(31)
        .fill(0)
        .map(() => ({ expense: 0, income: 0, count: 0 }));

      expenseData.forEach((item) => {
        const dayOfMonth = new Date(item.date).getDate() - 1;
        if (dayOfMonth >= 0 && dayOfMonth < 31) {
          monthData[dayOfMonth].expense += item.amount;
          monthData[dayOfMonth].count += 1;
        }
      });

      incomeData.forEach((item) => {
        const dayOfMonth = new Date(item.date).getDate() - 1;
        if (dayOfMonth >= 0 && dayOfMonth < 31) {
          monthData[dayOfMonth].income += item.amount;
        }
      });

      const labels = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
      let data, backgroundColors;

      if (metricType === "expense") {
        data = monthData.map((d) => d.expense);
        backgroundColors = Array(31)
          .fill(0)
          .map((_, index) => {
            const maxValue = Math.max(...data.filter((v) => v > 0));
            const intensity =
              data[index] > 0
                ? Math.max(0.3, Math.min(1, data[index] / maxValue))
                : 0.1;
            return `rgba(239, 68, 68, ${intensity})`;
          });
      } else if (metricType === "income") {
        data = monthData.map((d) => d.income);
        backgroundColors = Array(31)
          .fill(0)
          .map((_, index) => {
            const maxValue = Math.max(...data.filter((v) => v > 0));
            const intensity =
              data[index] > 0
                ? Math.max(0.3, Math.min(1, data[index] / maxValue))
                : 0.1;
            return `rgba(16, 185, 129, ${intensity})`;
          });
      } else {
        data = monthData.map((d) => d.count);
        backgroundColors = Array(31)
          .fill(0)
          .map((_, index) => {
            const maxValue = Math.max(...data.filter((v) => v > 0));
            const intensity =
              data[index] > 0
                ? Math.max(0.3, Math.min(1, data[index] / maxValue))
                : 0.1;
            return `rgba(59, 130, 246, ${intensity})`;
          });
      }

      return {
        labels,
        datasets: [
          {
            label:
              metricType === "expense"
                ? "Total Expenses"
                : metricType === "income"
                ? "Total Income"
                : "Transaction Count",
            data,
            backgroundColor: backgroundColors,
            borderColor:
              metricType === "expense"
                ? "#ef4444"
                : metricType === "income"
                ? "#10b981"
                : "#3b82f6",
            borderWidth: 1,
          },
        ],
      };
    }
  }, [filteredData, patternType, metricType]);

  const formatCurrency = (value) => {
    if (metricType === "count") {
      return value.toString();
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Spending Patterns</h3>
        <div className="flex items-center space-x-4">
          <select
            value={patternType}
            onChange={(e) => setPatternType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            <option value="dayOfWeek">Day of Week</option>
            <option value="dayOfMonth">Day of Month</option>
          </select>
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="count">Transaction Count</option>
          </select>
          <button
            onClick={() => {
              if (chartRef?.current) {
                const canvas = chartRef.current.canvas;
                const url = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = `spending-patterns-${patternType}-${metricType}.png`;
                link.href = url;
                link.click();
              }
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Bar
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "#111827",
                titleColor: "#ffffff",
                bodyColor: "#e5e7eb",
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y;
                    return `${context.dataset.label}: ${formatCurrency(value)}`;
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: "#9ca3af",
                  maxRotation: patternType === "dayOfMonth" ? 45 : 0,
                  font: { size: patternType === "dayOfMonth" ? 10 : 12 },
                },
                grid: { color: "#374151" },
              },
              y: {
                ticks: {
                  color: "#9ca3af",
                  callback: (v) =>
                    metricType === "count" ? v : formatCurrency(v),
                },
                grid: { color: "#374151" },
              },
            },
          }}
        />
      </div>
    </div>
  );
};
