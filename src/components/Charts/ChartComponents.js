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

export const TopIncomeSourcesChart = ({ data, chartRef }) => (
  <ChartCard
    title="Top Income Sources"
    chartRef={chartRef}
    fileName="income-sources.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const SpendingByAccountChart = ({ data, chartRef }) => (
  <ChartCard
    title="Spending by Account"
    chartRef={chartRef}
    fileName="spending-by-account.png"
  >
    <Doughnut ref={chartRef} data={data} options={doughnutOptions} />
  </ChartCard>
);

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
