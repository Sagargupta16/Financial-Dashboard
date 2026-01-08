/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  formatCurrency,
  getCommonChartOptions,
  truncateLabel,
} from "../../../lib/charts";
import logger from "../../../utils/logger";
import { useTimeNavigation } from "../hooks/useChartHooks";
import {
  comprehensiveForecast,
  detectSeasonality,
} from "../../../lib/analytics/forecasts";

export const commonChartOptions = getCommonChartOptions();

export const doughnutOptions = {
  ...commonChartOptions,
  scales: {},
};

// Helper function to aggregate data by month
const aggregateByMonth = (data) => {
  const monthlyData = {};
  data.forEach((item) => {
    const monthKey = item.date.substring(0, 7);
    if (
      !monthlyData[monthKey] ||
      new Date(item.date) > new Date(monthlyData[monthKey].date)
    ) {
      monthlyData[monthKey] = item;
    }
  });
  return Object.values(monthlyData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

// Helper function to build cumulative data points
const buildCumulativeDataPoints = (labels, getData, item, cumulativeData) => {
  return labels.map((_, labelIndex) => {
    cumulativeData[item] += getData(labelIndex, item);
    return cumulativeData[item];
  });
};

// Helper function to build regular data points
const buildRegularDataPoints = (labels, getData, item) => {
  return labels.map((_, labelIndex) => getData(labelIndex, item));
};

// Helper function to create dataset objects for charts
const createDatasets = (
  items,
  getData,
  labels,
  colors,
  dataMode,
  labelTruncate = null
) => {
  if (dataMode === "cumulative") {
    const cumulativeData = {};
    items.forEach((item) => {
      cumulativeData[item] = 0;
    });

    return items.map((item, index) => ({
      label: labelTruncate ? truncateLabel(item, labelTruncate) : item,
      data: buildCumulativeDataPoints(labels, getData, item, cumulativeData),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + "20",
      tension: 0.4,
      fill: false,
    }));
  }

  return items.map((item, index) => ({
    label: labelTruncate ? truncateLabel(item, labelTruncate) : item,
    data: buildRegularDataPoints(labels, getData, item),
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length] + "20",
    tension: 0.4,
    fill: false,
  }));
};

// eslint-disable-next-line max-lines-per-function
export const EnhancedSpendingByAccountChart = ({ filteredData, chartRef }) => {
  const {
    currentYear,
    currentMonth,
    viewMode,
    setViewMode,
    handlePrevious,
    handleNext,
    canGoPrevious,
    canGoNext,
  } = useTimeNavigation(filteredData, "all-time");

  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date || item.type !== "Expense") {
        return false;
      }
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

  const chartData = React.useMemo(() => {
    const spending = timeFilteredData.reduce((acc, item) => {
      acc[item.account] = (acc[item.account] || 0) + item.amount;
      return acc;
    }, {});

    const sorted = Object.entries(spending).sort(([, a], [, b]) => b - a);

    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f97316",
      "#eab308",
      "#10b981",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
      "#f59e0b",
      "#8b5a2b",
      "#6b7280",
    ];

    const hoverColors = [
      "#60a5fa",
      "#a78bfa",
      "#f472b6",
      "#fb923c",
      "#fbbf24",
      "#34d399",
      "#f87171",
      "#22d3ee",
      "#a3e635",
      "#fbbf24",
      "#a3a3a3",
      "#9ca3af",
    ];

    return {
      labels: sorted.map(([account]) => truncateLabel(account, 12)),
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

  const enhancedDoughnutOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#d1d5db",
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
              if (!data.labels.length || !data.datasets.length) {
                return [];
              }

              const dataset = data.datasets[0];
              const total = dataset.data.reduce((sum, val) => sum + val, 0);

              return data.labels.map((label, i) => {
                const value = dataset.data[i];
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
            },
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
              return `Account: ${tooltipItems[0].label}`;
            },
            label: (context) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce(
                (sum, val) => sum + val,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
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

  return (
    <div className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-500 h-[450px] flex flex-col overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      {/* Floating orbs */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300"></div>

      <div className="relative z-10 flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white group-hover:text-gray-100 transition-colors duration-300">
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
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110 transform"
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

      {/* View Mode Selector */}
      <div className="relative z-10 flex space-x-2 mb-4">
        {["month", "year", "all-time"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              viewMode === mode
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                : "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700 border border-gray-600"
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
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110 transform disabled:transform-none"
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
          <span className="text-gray-300 font-medium px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl border border-gray-600">
            {viewMode === "month" &&
              `${formatMonthLabel(currentMonth)} ${currentYear}`}
            {viewMode === "year" && currentYear}
          </span>
          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110 transform disabled:transform-none"
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
      <div className="relative z-10 text-center mb-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          Total Spending
        </div>
        <div className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
          {formatCurrency(totalSpending)}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative z-10 flex-1 relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        {chartData.labels.length > 0 ? (
          <Doughnut
            ref={chartRef}
            data={chartData}
            options={enhancedDoughnutOptions}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">ðŸ“Š</div>
              <div>No spending data available</div>
              <div className="text-sm">for the selected period</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
    </div>
  );
};

EnhancedSpendingByAccountChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};
// eslint-disable-next-line max-lines-per-function

// eslint-disable-next-line max-lines-per-function
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
  const [viewMode, setViewMode] = React.useState("month");
  const [dataMode, setDataMode] = React.useState("regular"); // Add this line

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

  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date) {
        return false;
      }
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
    // eslint-disable-next-line max-lines-per-function
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // eslint-disable-next-line max-lines-per-function
  const chartData = React.useMemo(() => {
    if (!selectedCategory) {
      return { labels: [], datasets: [] };
    }

    const colors = ["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    if (viewMode === "decade") {
      const decade = Math.floor(currentYear / 10) * 10;
      const yearlyData = {};

      for (let year = decade; year < decade + 10; year++) {
        yearlyData[year] = {};
      }

      filteredData
        .filter((i) => i.type === "Expense" && i.category === selectedCategory)
        .forEach((item) => {
          if (!item.date) {
            return;
          }
          const date = new Date(item.date);
          const year = date.getFullYear();
          if (year >= decade && year < decade + 10) {
            const sub = item.subcategory || "Uncategorized";
            if (!yearlyData[year][sub]) {
              yearlyData[year][sub] = 0;
            }
            yearlyData[year][sub] += item.amount;
          }
        });

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

      return {
        labels: Array.from({ length: 10 }, (_, i) => `${decade + i}`),
        datasets: createDatasets(
          topSubcategories,
          (yearIndex, sub) => yearlyData[decade + yearIndex][sub] || 0,
          Array.from({ length: 10 }, (_, i) => `${decade + i}`),
          colors,
          dataMode,
          15
        ),
      };
    } else if (viewMode === "year") {
      const monthlyData = {};

      for (let month = 1; month <= 12; month++) {
        monthlyData[month] = {};
      }

      filteredData
        .filter((i) => i.type === "Expense" && i.category === selectedCategory)
        .forEach((item) => {
          if (!item.date) {
            return;
          }
          const date = new Date(item.date);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth() + 1;
            const sub = item.subcategory || "Uncategorized";
            if (!monthlyData[month][sub]) {
              monthlyData[month][sub] = 0;
            }
            monthlyData[month][sub] += item.amount;
          }
        });

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

      return {
        labels: shortMonthNames,
        datasets: createDatasets(
          topSubcategories,
          (monthIndex, sub) => monthlyData[monthIndex + 1][sub] || 0,
          shortMonthNames,
          colors,
          dataMode,
          15
        ),
      };
    } else {
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const dailyData = {};

      for (let day = 1; day <= daysInMonth; day++) {
        dailyData[day] = {};
      }

      filteredData
        .filter((i) => i.type === "Expense" && i.category === selectedCategory)
        .forEach((item) => {
          if (!item.date) {
            return;
          }
          const date = new Date(item.date);
          if (
            date.getFullYear() === currentYear &&
            date.getMonth() + 1 === currentMonth
          ) {
            const day = date.getDate();
            const sub = item.subcategory || "Uncategorized";
            if (!dailyData[day][sub]) {
              dailyData[day][sub] = 0;
            }
            dailyData[day][sub] += item.amount;
          }
        });

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

      return {
        labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
        datasets: createDatasets(
          topSubcategories,
          (dayIndex, sub) => dailyData[dayIndex + 1][sub] || 0,
          Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
          colors,
          dataMode,
          15
        ),
      };
    }
  }, [
    filteredData,
    selectedCategory,
    currentYear,
    currentMonth,
    viewMode,
    dataMode,
    monthNames,
    shortMonthNames,
  ]);

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
          <select
            value={dataMode}
            onChange={(e) => setDataMode(e.target.value)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="regular">Regular</option>
            <option value="cumulative">Cumulative</option>
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
            {(() => {
              if (viewMode === "decade") {
                return `${Math.floor(currentYear / 10) * 10}s`;
              }
              if (viewMode === "year") {
                return `Year ${currentYear}`;
              }
              return `${monthNames[currentMonth - 1]} ${currentYear}`;
            })()}
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

EnhancedSubcategoryBreakdownChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
  categories: PropTypes.array,
  selectedCategory: PropTypes.string,
  // eslint-disable-next-line max-lines-per-function
  onCategoryChange: PropTypes.func,
};

// eslint-disable-next-line max-lines-per-function
export const MultiCategoryTimeAnalysisChart = ({
  filteredData,
  chartRef,
  categories: _categories,
}) => {
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [viewMode, setViewMode] = React.useState("month");
  const [dataMode, setDataMode] = React.useState("regular");

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

  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date) {
        return false;
      }
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
      // eslint-disable-next-line max-lines-per-function
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // eslint-disable-next-line max-lines-per-function
  const chartData = React.useMemo(() => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#22c55e",
      "#3b82f6",
      "#8b5cf6",
    ];

    if (viewMode === "decade") {
      const decade = Math.floor(currentYear / 10) * 10;
      const yearlyData = {};

      for (let year = decade; year < decade + 10; year++) {
        yearlyData[year] = {};
      }

      filteredData
        .filter((i) => i.type === "Expense")
        .forEach((item) => {
          if (!item.date) {
            return;
          }
          const date = new Date(item.date);
          const year = date.getFullYear();
          if (year >= decade && year < decade + 10) {
            const category = item.category;
            if (!yearlyData[year][category]) {
              yearlyData[year][category] = 0;
            }
            yearlyData[year][category] += item.amount;
          }
        });

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

      return {
        labels: Array.from({ length: 10 }, (_, i) => `${decade + i}`),
        datasets: createDatasets(
          topCategories,
          (yearIndex, category) =>
            yearlyData[decade + yearIndex][category] || 0,
          Array.from({ length: 10 }, (_, i) => `${decade + i}`),
          colors,
          dataMode,
          null
        ),
      };
    } else if (viewMode === "year") {
      const monthlyData = {};

      for (let month = 1; month <= 12; month++) {
        monthlyData[month] = {};
      }

      filteredData
        .filter((i) => i.type === "Expense")
        .forEach((item) => {
          if (!item.date) {
            return;
          }
          const date = new Date(item.date);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth() + 1;
            const category = item.category;
            if (!monthlyData[month][category]) {
              monthlyData[month][category] = 0;
            }
            monthlyData[month][category] += item.amount;
          }
        });

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

      return {
        labels: shortMonthNames,
        datasets: createDatasets(
          topCategories,
          (monthIndex, category) => monthlyData[monthIndex + 1][category] || 0,
          shortMonthNames,
          colors,
          dataMode,
          null
        ),
      };
    } else {
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const dailyData = {};

      for (let day = 1; day <= daysInMonth; day++) {
        dailyData[day] = {};
      }

      filteredData
        .filter((i) => i.type === "Expense")
        .forEach((item) => {
          if (!item.date) {
            return;
          }
          const date = new Date(item.date);
          if (
            date.getFullYear() === currentYear &&
            date.getMonth() + 1 === currentMonth
          ) {
            const day = date.getDate();
            const category = item.category;
            if (!dailyData[day][category]) {
              dailyData[day][category] = 0;
            }
            dailyData[day][category] += item.amount;
          }
        });

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

      return {
        labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
        datasets: createDatasets(
          topCategories,
          (dayIndex, category) => dailyData[dayIndex + 1][category] || 0,
          Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
          colors,
          dataMode,
          null
        ),
      };
    }
  }, [
    filteredData,
    currentYear,
    currentMonth,
    viewMode,
    dataMode,
    monthNames,
    shortMonthNames,
  ]);

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
          <select
            value={dataMode}
            onChange={(e) => setDataMode(e.target.value)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="regular">Regular</option>
            <option value="cumulative">Cumulative</option>
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
            {(() => {
              if (viewMode === "decade") {
                return `${Math.floor(currentYear / 10) * 10}s`;
              }
              if (viewMode === "year") {
                return `Year ${currentYear}`;
              }
              return `${monthNames[currentMonth - 1]} ${currentYear}`;
            })()}
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

MultiCategoryTimeAnalysisChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
  // eslint-disable-next-line max-lines-per-function
  categories: PropTypes.array,
};

// eslint-disable-next-line max-lines-per-function
export const NetWorthTrendChart = ({ filteredData, chartRef }) => {
  const [viewMode, setViewMode] = React.useState("all-time");
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );

  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [filteredData]);

  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date || item.category === "In-pocket") {
        return false;
      }
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

  const chartData = React.useMemo(() => {
    const dailyData = timeFilteredData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((acc, transaction) => {
        const dateKey = transaction.date.toISOString().split("T")[0];

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

    const sortedDates = Object.keys(dailyData).sort((a, b) =>
      a.localeCompare(b)
    );

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

    const formatLabel = (dateString, index, total) => {
      const date = new Date(dateString);

      if (viewMode === "month") {
        return date.getDate().toString();
      } else if (viewMode === "year") {
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
      }
      if (total > 50) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }
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
    };

    let aggregatedData = netWorthData;

    // Aggregate data by month for better readability when there's too much data
    if (
      (viewMode === "year" && netWorthData.length > 12) ||
      (viewMode === "all-time" && netWorthData.length > 50)
    ) {
      aggregatedData = aggregateByMonth(netWorthData);
    }

    return {
      labels: aggregatedData.map((item, index) =>
        formatLabel(item.date, index, aggregatedData.length)
      ),
      datasets: [
        {
          label: "Net Worth",
          data: aggregatedData.map((item) => item.netWorth),
          borderColor: "#10b981",
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
          display: false,
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
              return `Net Worth: ${formatCurrency(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#9ca3af",
            font: { size: 10 },
            maxRotation: 45,
            maxTicksLimit: (() => {
              if (viewMode === "month") {
                return 31;
              }
              if (viewMode === "year") {
                return 12;
              }
              return 10;
            })(),
            callback: (value, _index, _ticks) => {
              return truncateLabel(String(value), 12);
            },
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
                  return `â‚¹${(val / 1000000).toFixed(1)}M`;
                } else if (Math.abs(val) >= 1000) {
                  return `â‚¹${(val / 1000).toFixed(0)}K`;
                }
                return `â‚¹${val.toFixed(0)}`;
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
    if (viewMode === "all-time") {
      return false;
    }
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") {
      return false;
    }
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

  const currentNetWorth = React.useMemo(() => {
    if (chartData.datasets[0].data.length === 0) {
      return 0;
    }
    return chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
  }, [chartData]);

  const netWorthChange = React.useMemo(() => {
    const data = chartData.datasets[0].data;
    if (data.length < 2) {
      return 0;
    }
    return data[data.length - 1] - data[0];
  }, [chartData]);

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
            strokeLinejoin="round"
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
              <div className="text-4xl mb-2">ðŸ“ˆ</div>
              <div>No financial data available</div>
              <div className="text-sm">for the selected period</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

NetWorthTrendChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  // eslint-disable-next-line max-lines-per-function
  chartRef: PropTypes.object,
};

// eslint-disable-next-line max-lines-per-function
export const CumulativeCategoryTrendChart = ({ filteredData, chartRef }) => {
  const [viewMode, setViewMode] = React.useState("yearly");
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [selectedCategories, setSelectedCategories] = React.useState(new Set());

  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [filteredData]);

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
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [filteredData]);

  React.useEffect(() => {
    if (availableCategories.length > 0 && selectedCategories.size === 0) {
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

  const timeFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => {
      if (
        !item.date ||
        item.type !== "Expense" ||
        item.category === "In-pocket"
      ) {
        return false;
      }
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

  const chartData = React.useMemo(() => {
    if (selectedCategories.size === 0) {
      return { labels: [], datasets: [] };
    }

    const dailyData = {};

    timeFilteredData
      .filter((item) => selectedCategories.has(item.category))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((transaction) => {
        const dateKey = transaction.date.toISOString().split("T")[0];

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {};
          selectedCategories.forEach((category) => {
            dailyData[dateKey][category] = 0;
          });
        }

        dailyData[dateKey][transaction.category] += transaction.amount;
      });

    const sortedDates = Object.keys(dailyData).sort((a, b) =>
      a.localeCompare(b)
    );

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

    const formatLabel = (dateString, index, total) => {
      const date = new Date(dateString);

      if (viewMode === "monthly") {
        return date.getDate().toString();
      } else if (viewMode === "yearly") {
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
      }
      if (total > 50) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }
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
    };

    let aggregatedData = processedData;

    // Aggregate data by month for better readability when there's too much data
    if (
      (viewMode === "yearly" && processedData.length > 12) ||
      (viewMode === "all-time" && processedData.length > 50)
    ) {
      aggregatedData = aggregateByMonth(processedData);
    }

    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f97316",
      "#eab308",
      "#10b981",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
      "#f59e0b",
      "#8b5a2b",
      "#6b7280",
    ];

    const datasets = Array.from(selectedCategories).map((category, index) => ({
      label: category,
      data: aggregatedData.map((item) => item[category] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: `${colors[index % colors.length]}20`,
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
              return `${context.dataset.label}: ${formatCurrency(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#9ca3af",
            font: { size: 10 },
            maxRotation: 45,
            maxTicksLimit: (() => {
              if (viewMode === "monthly") {
                return 31;
              }
              if (viewMode === "yearly") {
                return 12;
              }
              return 10;
            })(),
            callback: (value, _index, _ticks) => {
              return truncateLabel(String(value), 12);
            },
          },
          grid: {
            color: "#374151",
            drawOnChartArea: true,
          },
        },
        y: {
          ticks: {
            color: "#9ca3af",
            callback: (value) => formatCurrency(value),
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
    if (viewMode === "all-time") {
      return false;
    }
    if (viewMode === "monthly") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "yearly") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") {
      return false;
    }
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
            strokeLinejoin="round"
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
              <div className="text-4xl mb-2">ðŸ“Š</div>
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

CumulativeCategoryTrendChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  // eslint-disable-next-line max-lines-per-function
  chartRef: PropTypes.object,
};

// eslint-disable-next-line max-lines-per-function
export const SeasonalSpendingHeatmap = ({ filteredData, chartRef }) => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

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
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [filteredData]);

  const { heatmapData, seasonalAnalysis } = React.useMemo(() => {
    const data = filteredData.filter(
      (item) =>
        item.type === "Expense" &&
        item.category !== "In-pocket" &&
        (selectedCategory === "All" || item.category === selectedCategory)
    );

    const monthlyData = {};
    const monthlyDataForSeasonality = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;

      if (!monthlyData[year]) {
        monthlyData[year] = {};
      }
      if (!monthlyData[year][month]) {
        monthlyData[year][month] = 0;
      }

      monthlyData[year][month] += item.amount;
      monthlyDataForSeasonality[monthKey] =
        (monthlyDataForSeasonality[monthKey] || 0) + item.amount;
    });

    // Calculate seasonal indices
    const seasonality = detectSeasonality(monthlyDataForSeasonality);

    const years = Object.keys(monthlyData).sort((a, b) => a.localeCompare(b));
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const getMaxValue = (monthlyData) => {
      return Math.max(
        ...Object.values(monthlyData).flatMap((y) => Object.values(y))
      );
    };

    const datasets = years.map((year) => ({
      label: year,
      data: months.map((month) => monthlyData[year]?.[month] || 0),
      backgroundColor: months.map((month) => {
        const value = monthlyData[year]?.[month] || 0;
        const maxValue = getMaxValue(monthlyData);
        const intensity = value / (maxValue || 1);
        return `rgba(59, 130, 246, ${Math.max(0.1, intensity)})`;
      }),
      borderColor: "#1f2937",
      borderWidth: 1,
    }));

    return {
      heatmapData: {
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
      },
      seasonalAnalysis: seasonality,
    };
  }, [filteredData, selectedCategory]);

  // Get peak and low months
  const seasonalInfo = React.useMemo(() => {
    if (!seasonalAnalysis?.hasSeasonality) {
      return null;
    }

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

    const entries = Object.entries(seasonalAnalysis.indices || {});
    const peak = entries.reduce(
      (max, [month, index]) =>
        index > (max?.index || 0)
          ? { month: monthNames[Number.parseInt(month, 10) - 1], index }
          : max,
      null
    );

    const low = entries.reduce(
      (min, [month, index]) =>
        index < (min?.index || Infinity)
          ? { month: monthNames[Number.parseInt(month, 10) - 1], index }
          : min,
      null
    );

    return { peak, low };
  }, [seasonalAnalysis]);

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Seasonal Spending Heatmap
          </h3>
          {seasonalInfo && (
            <div className="text-xs text-gray-400 mt-1">
              Peak: {seasonalInfo.peak?.month} (
              {((seasonalInfo.peak?.index - 1) * 100).toFixed(0)}% above avg) |
              Low: {seasonalInfo.low?.month} (
              {((1 - seasonalInfo.low?.index) * 100).toFixed(0)}% below avg) |
              Seasonality: {seasonalAnalysis.hasSeasonality ? "Strong" : "Weak"}
            </div>
          )}
        </div>
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

SeasonalSpendingHeatmap.propTypes = {
  filteredData: PropTypes.array.isRequired,
  // eslint-disable-next-line max-lines-per-function
  chartRef: PropTypes.object,
};

// eslint-disable-next-line max-lines-per-function
export const YearOverYearComparisonChart = ({ filteredData, chartRef }) => {
  const [comparisonType, setComparisonType] = React.useState("monthly");
  const [selectedYears, setSelectedYears] = React.useState(new Set());

  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  React.useEffect(() => {
    if (availableYears.length > 0 && selectedYears.size === 0) {
      const recentYears = availableYears.slice(0, 3);
      setSelectedYears(new Set(recentYears));
    }
  }, [availableYears, selectedYears.size]);

  const chartData = React.useMemo(() => {
    if (selectedYears.size === 0) {
      return { labels: [], datasets: [] };
    }

    const groupedData = {};

    filteredData.forEach((item) => {
      if (item.category === "In-pocket") {
        return;
      }

      const date = new Date(item.date);
      const year = date.getFullYear();

      if (!selectedYears.has(year)) {
        return;
      }

      let periodKey;
      if (comparisonType === "monthly") {
        periodKey = date.getMonth() + 1;
      } else {
        periodKey = Math.floor(date.getMonth() / 3) + 1;
      }

      if (!groupedData[year]) {
        groupedData[year] = {};
      }
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
      .sort((a, b) => a - b)
      .forEach((year, yearIndex) => {
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
              x: {
                ticks: {
                  color: "#9ca3af",
                  font: { size: 10 },
                  maxRotation: 45,
                  maxTicksLimit: 12,
                },
                grid: { color: "#374151" },
              },
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

YearOverYearComparisonChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  // eslint-disable-next-line max-lines-per-function
  chartRef: PropTypes.object,
};

// eslint-disable-next-line max-lines-per-function
export const SpendingForecastChart = ({ filteredData, chartRef }) => {
  // eslint-disable-next-line max-lines-per-function
  const [forecastMonths, setForecastMonths] = React.useState(6);
  const [forecastType, setForecastType] = React.useState("best");
  const [showConfidence, setShowConfidence] = React.useState(true);

  // eslint-disable-next-line max-lines-per-function
  const { chartData, forecastInfo } = React.useMemo(() => {
    const monthlyData = {};
    filteredData.forEach((item) => {
      if (item.category === "In-pocket") {
        return;
      }

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

    const historicalMonths = Object.keys(monthlyData).sort((a, b) =>
      a.localeCompare(b)
    );
    const lastMonth = historicalMonths.at(-1);

    // Prepare data for advanced forecasting
    const historicalNet = historicalMonths.map((m) => monthlyData[m].net);
    // Note: historicalExpense and historicalIncome can be used for category-specific forecasts

    // Use comprehensive forecasting
    const netForecast = comprehensiveForecast(historicalNet, forecastMonths);

    // Select forecast based on type
    let selectedNetForecast = netForecast?.best.forecast || [];
    let selectedNetConfidence = netForecast?.best.confidence || null;
    const forecastMethod = netForecast?.best.method || "simple";

    if (forecastType === "simple") {
      selectedNetForecast = netForecast?.simple.forecast || [];
      selectedNetConfidence = null;
    } else if (forecastType === "exponential") {
      selectedNetForecast = netForecast?.exponential.forecast || [];
      selectedNetConfidence = null;
    } else if (forecastType === "regression") {
      selectedNetForecast = netForecast?.regression.forecast || [];
      selectedNetConfidence = null;
    }

    const futureMonths = [];
    if (lastMonth) {
      const currentDate = new Date(lastMonth + "-01");
      for (let i = 0; i < forecastMonths; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        const monthKey = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}`;
        futureMonths.push(monthKey);
      }
    }

    const allMonths = [...historicalMonths.slice(-12), ...futureMonths];
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
      return `${monthNames[Number.parseInt(monthNum, 10) - 1]} ${year}`;
    });

    const historicalNetDisplay = historicalMonths
      .slice(-12)
      .map((month) => monthlyData[month]?.net || 0);

    const datasets = [
      {
        label: "Historical Net Cash Flow",
        data: [
          ...historicalNetDisplay,
          ...new Array(forecastMonths).fill(null),
        ],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.3,
      },
      {
        label: `Forecast (${forecastMethod})`,
        data: [
          ...new Array(historicalNetDisplay.length).fill(null),
          ...selectedNetForecast,
        ],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 3,
        borderDash: [5, 5],
        fill: false,
        tension: 0.3,
      },
    ];

    // Add confidence intervals if available and enabled
    if (showConfidence && selectedNetConfidence && forecastType === "best") {
      datasets.push(
        {
          label: "Upper Bound (95%)",
          data: [
            ...new Array(historicalNetDisplay.length).fill(null),
            ...selectedNetConfidence.upper,
          ],
          borderColor: "rgba(245, 158, 11, 0.3)",
          backgroundColor: "rgba(245, 158, 11, 0.05)",
          borderWidth: 1,
          borderDash: [2, 2],
          fill: "+1",
          tension: 0.3,
          pointRadius: 0,
        },
        {
          label: "Lower Bound (95%)",
          data: [
            ...new Array(historicalNetDisplay.length).fill(null),
            ...selectedNetConfidence.lower,
          ],
          borderColor: "rgba(245, 158, 11, 0.3)",
          backgroundColor: "rgba(245, 158, 11, 0.05)",
          borderWidth: 1,
          borderDash: [2, 2],
          fill: false,
          tension: 0.3,
          pointRadius: 0,
        }
      );
    }

    return {
      chartData: { labels, datasets },
      forecastInfo: {
        method: forecastMethod,
        volatility: netForecast?.volatility,
        dataQuality: netForecast?.dataQuality,
        outliers: netForecast?.outliers || 0,
      },
    };
  }, [filteredData, forecastMonths, forecastType, showConfidence]);

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[500px] flex flex-col lg:col-span-2">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Advanced Spending Forecast
          </h3>
          {forecastInfo && (
            <div className="text-xs text-gray-400 mt-1">
              Method: {forecastInfo.method} | Volatility:{" "}
              {forecastInfo.volatility?.level || "N/A"} | R²:{" "}
              {(forecastInfo.dataQuality?.r2 || 0).toFixed(2)} | Outliers:{" "}
              {forecastInfo.outliers}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={forecastMonths}
            onChange={(e) =>
              setForecastMonths(Number.parseInt(e.target.value, 10))
            }
            className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
          <select
            value={forecastType}
            onChange={(e) => setForecastType(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs"
          >
            <option value="best">Best Fit</option>
            <option value="simple">Simple Avg</option>
            <option value="exponential">Exponential</option>
            <option value="regression">Regression</option>
          </select>
          <label className="flex items-center text-xs text-gray-300">
            <input
              type="checkbox"
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
              className="mr-1"
            />{" "}
            CI
          </label>
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
              legend: {
                labels: { color: "#9ca3af", font: { size: 10 } },
                position: "bottom",
              },
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
                ticks: {
                  color: "#9ca3af",
                  font: { size: 10 },
                  maxRotation: 45,
                  maxTicksLimit: 12,
                },
                grid: { color: "#374151" },
              },
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

SpendingForecastChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  // eslint-disable-next-line max-lines-per-function
  chartRef: PropTypes.object,
};

// eslint-disable-next-line max-lines-per-function
export const AccountBalanceProgressionChart = ({ filteredData, chartRef }) => {
  const [selectedAccount, setSelectedAccount] = React.useState("all");
  // eslint-disable-next-line max-lines-per-function
  const [viewMode, setViewMode] = React.useState("cumulative");
  const [showAverage, setShowAverage] = React.useState(true);

  // eslint-disable-next-line max-lines-per-function
  const chartData = React.useMemo(() => {
    const accounts = [
      ...new Set(filteredData.map((item) => item.account)),
    ].sort((a, b) => a.localeCompare(b));

    const accountData = {};
    accounts.forEach((account) => {
      accountData[account] = {};
    });

    filteredData.forEach((item) => {
      if (item.category === "In-pocket") {
        return;
      }

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

      if (item.type === "Income" || item.type === "Transfer-In") {
        accountData[item.account][monthKey].income += item.amount;
      } else if (item.type === "Expense" || item.type === "Transfer-Out") {
        accountData[item.account][monthKey].expense += item.amount;
      }
    });

    const allMonths = [
      ...new Set(Object.values(accountData).flatMap((acc) => Object.keys(acc))),
    ].sort((a, b) => a.localeCompare(b));

    accounts.forEach((account) => {
      let runningBalance = 0;
      allMonths.forEach((month) => {
        if (accountData[account][month]) {
          runningBalance +=
            accountData[account][month].income -
            accountData[account][month].expense;
          accountData[account][month].balance = runningBalance;
        } else {
          accountData[account][month] = {
            income: 0,
            expense: 0,
            balance: runningBalance,
          };
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
      return `${monthNames[Number.parseInt(monthNum, 10) - 1]} ${year}`;
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

      // Calculate total portfolio value (sum of all accounts)
      const totalPortfolioData = allMonths.map((month) => {
        const accountValues = accounts
          .map((account) => {
            const data = accountData[account][month];
            return viewMode === "cumulative"
              ? data.balance
              : data.income - data.expense;
          })
          .filter(
            (value) =>
              value !== undefined && value !== null && !Number.isNaN(value)
          );

        return accountValues.reduce((sum, value) => sum + value, 0);
      });

      // Calculate average of all accounts
      const averageData = allMonths.map((month) => {
        const accountValues = accounts
          .map((account) => {
            const data = accountData[account][month];
            return viewMode === "cumulative"
              ? data.balance
              : data.income - data.expense;
          })
          .filter(
            (value) =>
              value !== undefined && value !== null && !Number.isNaN(value)
          );

        if (accountValues.length === 0) {
          return 0;
        }
        return (
          accountValues.reduce((sum, value) => sum + value, 0) /
          accountValues.length
        );
      });

      // Add total portfolio line dataset
      if (showAverage) {
        datasets.push(
          {
            label: "Total Portfolio Value",
            data: totalPortfolioData,
            borderColor: "#fbbf24",
            backgroundColor: "rgba(251, 191, 36, 0.1)",
            borderWidth: 3,
            borderDash: [8, 4],
            fill: false,
            tension: 0.3,
            pointBackgroundColor: "#fbbf24",
            pointBorderColor: "#fbbf24",
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "Average Account Balance",
            data: averageData,
            borderColor: "#ffffff",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 3,
            borderDash: [12, 6],
            fill: false,
            tension: 0.3,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#ffffff",
            pointRadius: 3,
            pointHoverRadius: 5,
          }
        );
      }

      return { labels, datasets };
    } else {
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
  }, [filteredData, selectedAccount, viewMode, showAverage]);

  const accounts = [...new Set(filteredData.map((item) => item.account))].sort(
    (a, b) => a.localeCompare(b)
  );

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[500px] flex flex-col lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">
          Account Balance Progression
        </h3>
        <div className="flex items-center space-x-3">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cumulative">Cumulative</option>
            <option value="monthly">Monthly</option>
          </select>
          {selectedAccount === "all" && (
            <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showAverage}
                onChange={(e) => setShowAverage(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span>Show Average</span>
            </label>
          )}
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
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <svg
              width="20"
              height="20"
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
              x: {
                ticks: {
                  color: "#9ca3af",
                  font: { size: 10 },
                  maxRotation: 45,
                  maxTicksLimit: 12,
                },
                grid: { color: "#374151" },
              },
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

AccountBalanceProgressionChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  // eslint-disable-next-line max-lines-per-function
  chartRef: PropTypes.object,
};

// eslint-disable-next-line max-lines-per-function
export const DayWeekSpendingPatternsChart = ({ filteredData, chartRef }) => {
  // eslint-disable-next-line max-lines-per-function
  const [patternType, setPatternType] = React.useState("dayOfWeek");
  const [metricType, setMetricType] = React.useState("expense");

  // eslint-disable-next-line max-lines-per-function
  const chartData = React.useMemo(() => {
    const expenseData = filteredData.filter(
      (item) => item.type === "Expense" && item.category !== "In-pocket"
    );
    const incomeData = filteredData.filter((item) => item.type === "Income");

    if (patternType === "dayOfWeek") {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const weekData = new Array(7)
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
            label: (() => {
              if (metricType === "expense") {
                return "Total Expenses";
              }
              if (metricType === "income") {
                return "Total Income";
              }
              return "Transaction Count";
            })(),
            data,
            backgroundColor: backgroundColors,
            borderColor: (() => {
              if (metricType === "expense") {
                return "#ef4444";
              }
              if (metricType === "income") {
                return "#10b981";
              }
              return "#3b82f6";
            })(),
            borderWidth: 2,
          },
        ],
      };
    } else {
      const monthData = new Array(31)
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
        backgroundColors = new Array(31).fill(0).map((_, index) => {
          const maxValue = Math.max(...data.filter((v) => v > 0));
          const intensity =
            data[index] > 0
              ? Math.max(0.3, Math.min(1, data[index] / maxValue))
              : 0.1;
          return `rgba(239, 68, 68, ${intensity})`;
        });
      } else if (metricType === "income") {
        data = monthData.map((d) => d.income);
        backgroundColors = new Array(31).fill(0).map((_, index) => {
          const maxValue = Math.max(...data.filter((v) => v > 0));
          const intensity =
            data[index] > 0
              ? Math.max(0.3, Math.min(1, data[index] / maxValue))
              : 0.1;
          return `rgba(16, 185, 129, ${intensity})`;
        });
      } else {
        data = monthData.map((d) => d.count);
        backgroundColors = new Array(31).fill(0).map((_, index) => {
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
            label: (() => {
              if (metricType === "expense") {
                return "Total Expenses";
              }
              if (metricType === "income") {
                return "Total Income";
              }
              return "Transaction Count";
            })(),
            data,
            backgroundColor: backgroundColors,
            borderColor: (() => {
              if (metricType === "expense") {
                return "#ef4444";
              }
              if (metricType === "income") {
                return "#10b981";
              }
              return "#3b82f6";
            })(),
            borderWidth: 1,
          },
        ],
      };
    }
  }, [filteredData, patternType, metricType]);

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
                  font: { size: patternType === "dayOfMonth" ? 9 : 10 },
                  maxTicksLimit: patternType === "dayOfMonth" ? 31 : 15,
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

DayWeekSpendingPatternsChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  // eslint-disable-next-line max-lines-per-function
  chartRef: PropTypes.object,
};

// eslint-disable-next-line max-lines-per-function
export const SankeyFlowChart = ({ filteredData, chartRef }) => {
  const [timeRange, setTimeRange] = React.useState("all");
  const [minFlowAmount, setMinFlowAmount] = React.useState(100);

  const sankeyData = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { nodes: [], links: [] };
    }

    logger.debug("Sankey Data Sample:", filteredData.slice(0, 3));

    let timeFilteredData = filteredData;
    if (timeRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeRange) {
        case "1month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case "1year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      timeFilteredData = filteredData.filter((transaction) => {
        const transactionDate = new Date(transaction.Date);
        return transactionDate >= cutoffDate;
      });
    }

    const incomeData = timeFilteredData.filter((t) => {
      const incomeExpenseType = t["Income/Expense"] || t.Type || "";
      const amount = Number.parseFloat(
        (t.INR || t.Amount || "0").replaceAll(/[₹,$]/g, "")
      );

      return (
        incomeExpenseType.toLowerCase() === "income" ||
        incomeExpenseType.toLowerCase().includes("income") ||
        amount > 0
      );
    });

    const expenseData = timeFilteredData.filter((t) => {
      const incomeExpenseType = t["Income/Expense"] || t.Type || "";
      const amount = Number.parseFloat(
        (t.INR || t.Amount || "0").replaceAll(/[₹,$]/g, "")
      );

      return (
        incomeExpenseType.toLowerCase() === "expense" ||
        incomeExpenseType.toLowerCase().includes("expense") ||
        amount < 0
      );
    });

    logger.debug(
      "Income Data:",
      incomeData.length,
      "Expense Data:",
      expenseData.length
    );

    const incomeByAccount = incomeData.reduce((acc, transaction) => {
      const account =
        transaction.Accounts || transaction.Account || "Other Income";
      const amount = Math.abs(
        Number.parseFloat(
          (transaction.INR || transaction.Amount || "0").replaceAll(
            /[₹,$]/g,
            ""
          )
        )
      );
      if (amount > 0) {
        acc[account] = (acc[account] || 0) + amount;
      }
      return acc;
    }, {});

    const expensesByCategory = expenseData.reduce((acc, transaction) => {
      const category = transaction.Category || "Other Expenses";
      const amount = Math.abs(
        Number.parseFloat(
          (transaction.INR || transaction.Amount || "0").replaceAll(
            /[₹,$]/g,
            ""
          )
        )
      );
      if (amount > 0) {
        acc[category] = (acc[category] || 0) + amount;
      }
      return acc;
    }, {});

    logger.debug("Income by Account:", incomeByAccount);
    logger.debug("Expenses by Category:", expensesByCategory);

    const nodes = [];
    const links = [];
    let nodeIndex = 0;

    const incomeNodes = Object.entries(incomeByAccount)
      .filter(([_, amount]) => amount >= minFlowAmount)
      .map(([account, amount]) => ({
        id: nodeIndex++,
        name: account,
        value: amount,
        type: "income",
        color: "#10b981",
      }));

    const expenseNodes = Object.entries(expensesByCategory)
      .filter(([_, amount]) => amount >= minFlowAmount)
      .map(([category, amount]) => ({
        id: nodeIndex++,
        name: category,
        value: amount,
        type: "expense",
        color: "#ef4444",
      }));

    nodes.push(...incomeNodes, ...expenseNodes);

    const totalIncome = incomeNodes.reduce((sum, node) => sum + node.value, 0);
    const totalExpenses = expenseNodes.reduce(
      (sum, node) => sum + node.value,
      0
    );

    incomeNodes.forEach((incomeNode) => {
      expenseNodes.forEach((expenseNode) => {
        const flowRatio =
          (incomeNode.value / totalIncome) *
          (expenseNode.value / totalExpenses);
        const flowValue =
          Math.min(incomeNode.value, expenseNode.value) * flowRatio;

        if (flowValue >= minFlowAmount / 10) {
          links.push({
            source: incomeNode.id,
            target: expenseNode.id,
            value: flowValue,
          });
        }
      });
    });

    return { nodes, links };
  }, [filteredData, timeRange, minFlowAmount]);

  const calculateLayout = () => {
    const { nodes } = sankeyData;
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const incomeNodes = nodes.filter((n) => n.type === "income");
    const expenseNodes = nodes.filter((n) => n.type === "expense");

    const incomeHeight = Math.max(incomeNodes.length * 60, height * 0.8);
    incomeNodes.forEach((node, i) => {
      node.x = margin.left;
      node.y = margin.top + i * (incomeHeight / incomeNodes.length) + 30;
      node.width = 140;
      node.height = Math.max(
        40,
        (node.value / Math.max(...incomeNodes.map((n) => n.value))) * 80
      );
    });

    const expenseHeight = Math.max(expenseNodes.length * 60, height * 0.8);
    expenseNodes.forEach((node, i) => {
      node.x = width - margin.right - 140;
      node.y = margin.top + i * (expenseHeight / expenseNodes.length) + 30;
      node.width = 140;
      node.height = Math.max(
        40,
        (node.value / Math.max(...expenseNodes.map((n) => n.value))) * 80
      );
    });

    return { width, height, margin };
  };

  const { width, height } = calculateLayout();

  const generatePath = (link) => {
    const { nodes } = sankeyData;
    const sourceNode = nodes.find((n) => n.id === link.source);
    const targetNode = nodes.find((n) => n.id === link.target);

    if (!sourceNode || !targetNode) {
      return "";
    }

    const x1 = sourceNode.x + sourceNode.width;
    const y1 = sourceNode.y + sourceNode.height / 2;
    const x2 = targetNode.x;
    const y2 = targetNode.y + targetNode.height / 2;

    const cx1 = x1 + (x2 - x1) * 0.5;
    const cx2 = x2 - (x2 - x1) * 0.5;

    return `M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`;
  };

  const exportToCSV = (data, filename) => {
    const csvContent = data
      .map((row) => Object.values(row).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    // eslint-disable-next-line no-undef
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 h-[600px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            â‚¹ Money Flow Analysis
          </h3>
          <p className="text-gray-400 text-sm">
            Visualize how money flows from income sources to expense categories
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>

          <select
            value={minFlowAmount}
            onChange={(e) => setMinFlowAmount(Number(e.target.value))}
            className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={50}>Min: â‚¹50</option>
            <option value={100}>Min: â‚¹100</option>
            <option value={500}>Min: â‚¹500</option>
            <option value={1000}>Min: â‚¹1000</option>
          </select>

          <button
            onClick={() => exportToCSV(filteredData, "money_flow_analysis.csv")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
          >
            ðŸ“Š Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {sankeyData.nodes.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              ref={chartRef}
              width={Math.min(width, window.innerWidth * 0.9)}
              height={height}
              className="border border-gray-600 rounded-lg bg-gray-750"
            >
              {/* Background */}
              <rect width="100%" height="100%" fill="#1f2937" />

              {/* Title sections */}
              <text
                x={120}
                y={35}
                fill="#10b981"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                â‚¹ Income Sources
              </text>
              <text
                x={width - 120}
                y={35}
                fill="#ef4444"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                â‚¹ Expense Categories
              </text>

              {/* Links (flows) */}
              {sankeyData.links.map((link) => (
                <path
                  key={`sankey-link-${link.source}-${link.target}-${link.value}`}
                  d={generatePath(link)}
                  stroke="#60a5fa"
                  strokeWidth={Math.max(
                    2,
                    (link.value /
                      Math.max(...sankeyData.links.map((l) => l.value))) *
                      20
                  )}
                  fill="none"
                  opacity={0.6}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}

              {/* Nodes */}
              {sankeyData.nodes.map((node) => (
                <g key={node.id}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    fill={node.color}
                    rx={8}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 - 8}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {node.name.length > 15
                      ? `${node.name.substring(0, 12)}...`
                      : node.name}
                  </text>
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 8}
                    fill="white"
                    fontSize="11"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {formatCurrency(node.value)}
                  </text>
                </g>
              ))}

              {/* Legend */}
              <g transform={`translate(20, ${height - 60})`}>
                <rect
                  x={0}
                  y={0}
                  width={15}
                  height={15}
                  fill="#10b981"
                  rx={3}
                />
                <text x={20} y={12} fill="#9ca3af" fontSize="12">
                  Income Sources
                </text>

                <rect
                  x={130}
                  y={0}
                  width={15}
                  height={15}
                  fill="#ef4444"
                  rx={3}
                />
                <text x={150} y={12} fill="#9ca3af" fontSize="12">
                  Expense Categories
                </text>

                <rect
                  x={280}
                  y={0}
                  width={15}
                  height={3}
                  fill="#60a5fa"
                  rx={1}
                />
                <text x={300} y={12} fill="#9ca3af" fontSize="12">
                  Money Flow
                </text>
              </g>
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">ðŸ”„</div>
              <div className="text-lg mb-2">No flow data available</div>
              <div className="text-sm">
                {filteredData.length === 0
                  ? "Upload transaction data to see money flow analysis"
                  : `Found ${filteredData.length} transactions, but no qualifying flows with current filters`}
              </div>
              {filteredData.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  Try reducing the minimum amount filter or changing the time
                  range
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {sankeyData.nodes.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400">Income Sources</div>
            <div className="text-green-400 font-bold">
              {sankeyData.nodes.filter((n) => n.type === "income").length}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400">Expense Categories</div>
            <div className="text-red-400 font-bold">
              {sankeyData.nodes.filter((n) => n.type === "expense").length}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400">Total Income</div>
            <div className="text-green-400 font-bold">
              {formatCurrency(
                sankeyData.nodes
                  .filter((n) => n.type === "income")
                  .reduce((sum, n) => sum + n.value, 0)
              )}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400">Total Expenses</div>
            <div className="text-red-400 font-bold">
              {formatCurrency(
                sankeyData.nodes
                  .filter((n) => n.type === "expense")
                  .reduce((sum, n) => sum + n.value, 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SankeyFlowChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};

export { TreemapChart } from "./TreemapChart";
