import React from "react";
import { Line } from "react-chartjs-2";
import { commonChartOptions } from "./ChartConfig";

// Enhanced Monthly Trends Chart with time navigation
export const EnhancedMonthlyTrendsChart = ({ filteredData, chartRef }) => {
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );
  const [viewMode, setViewMode] = React.useState("year");
  const [dataMode, setDataMode] = React.useState("regular");

  const availableYears = React.useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        const date = new Date(item.date);
        if (!isNaN(date.getTime())) {
          years.add(date.getFullYear());
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  const timeFilteredData = React.useMemo(() => {
    const now = new Date();
    return filteredData.filter((item) => {
      if (!item.date || item.category === "In-pocket") return false;

      const date = new Date(item.date);
      if (isNaN(date.getTime())) return false;

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

  const chartData = React.useMemo(() => {
    const monthly = timeFilteredData.reduce((acc, item) => {
      if (!item.date) return acc;

      const date = new Date(item.date);
      if (isNaN(date.getTime())) return acc;

      const month = date.toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expense: 0 };

      if (item.type === "Income") {
        acc[month].income += item.amount || 0;
      } else if (item.type === "Expense") {
        acc[month].expense += item.amount || 0;
      }
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthly).sort();

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
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      } else {
        return monthNames[parseInt(month) - 1];
      }
    };

    if (dataMode === "cumulative") {
      let cumulativeIncome = 0;
      let cumulativeExpense = 0;

      return {
        labels: sortedMonths.map(formatMonthLabel),
        datasets: [
          {
            label: "Cumulative Income",
            data: sortedMonths.map((m) => {
              cumulativeIncome += monthly[m].income;
              return cumulativeIncome;
            }),
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            tension: 0.3,
            fill: "+1",
          },
          {
            label: "Cumulative Expense",
            data: sortedMonths.map((m) => {
              cumulativeExpense += monthly[m].expense;
              return cumulativeExpense;
            }),
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            tension: 0.3,
            fill: true,
          },
          {
            label: "Cumulative Net",
            data: sortedMonths.map((m, index) => {
              const totalIncome = sortedMonths
                .slice(0, index + 1)
                .reduce((sum, month) => sum + monthly[month].income, 0);
              const totalExpense = sortedMonths
                .slice(0, index + 1)
                .reduce((sum, month) => sum + monthly[month].expense, 0);
              return totalIncome - totalExpense;
            }),
            borderColor: "#9333ea",
            backgroundColor: "rgba(147, 51, 234, 0.1)",
            tension: 0.3,
            fill: false,
            borderWidth: 3,
          },
        ],
      };
    } else {
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
    }
  }, [timeFilteredData, viewMode, dataMode]);

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
        {chartData.labels && chartData.labels.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={commonChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>No data available</div>
              <div className="text-sm">for the selected time period</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
