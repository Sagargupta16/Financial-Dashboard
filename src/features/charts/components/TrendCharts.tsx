/* eslint-disable max-lines-per-function */

import type { Chart as ChartJS } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import type { Transaction } from "../../../types";
import { commonChartOptions } from "./ChartConfig";

interface EnhancedMonthlyTrendsChartProps {
  filteredData: Transaction[];
  chartRef?: React.RefObject<ChartJS<"line"> | undefined>;
}

// Enhanced Monthly Trends Chart with time navigation

export const EnhancedMonthlyTrendsChart = ({
  filteredData,
  chartRef,
}: EnhancedMonthlyTrendsChartProps) => {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [viewMode, setViewMode] = React.useState("year");
  const [dataMode, setDataMode] = React.useState("regular");

  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    filteredData.forEach((item) => {
      if (item.date) {
        const date = new Date(item.date);
        if (!Number.isNaN(date.getTime())) {
          years.add(date.getFullYear());
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  const timeFilteredData = React.useMemo(() => {
    const now = new Date();
    return filteredData.filter((item) => {
      if (!item.date || item.category === "In-pocket") {
        return false;
      }

      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) {
        return false;
      }

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "last-12-months") {
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        return date >= twelveMonthsAgo;
      }
      return false;
    });
  }, [filteredData, currentYear, viewMode]);

  const chartData = React.useMemo(() => {
    const monthly = timeFilteredData.reduce<Record<string, { income: number; expense: number }>>(
      (acc, item) => {
        if (!item.date) {
          return acc;
        }

        const date = new Date(item.date);
        if (Number.isNaN(date.getTime())) {
          return acc;
        }

        const month = date.toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { income: 0, expense: 0 };
        }

        if (item.type === "Income") {
          acc[month].income += item.amount || 0;
        } else if (item.type === "Expense") {
          acc[month].expense += item.amount || 0;
        }
        return acc;
      },
      {}
    );

    const sortedMonths = Object.keys(monthly).sort((a, b) => a.localeCompare(b));

    const formatMonthLabel = (monthString: string) => {
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
        return `${monthNames[Number.parseInt(month, 10) - 1]} ${year}`;
      } else {
        return monthNames[Number.parseInt(month, 10) - 1];
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
            data: sortedMonths.map((_, index) => {
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
    if (viewMode === "all-time" || viewMode === "last-12-months") {
      return false;
    }
    return currentYear > Math.min(...availableYears);
  };

  const canGoNext = () => {
    if (viewMode === "all-time" || viewMode === "last-12-months") {
      return false;
    }
    return currentYear < Math.max(...availableYears);
  };

  return (
    <div className="group lg:col-span-2 relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-500 h-[450px] flex flex-col overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      {/* Floating orbs */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      <div className="absolute -bottom-16 -left-16 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-pink-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300"></div>

      <div className="relative z-10 flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
            Monthly Trends
          </h3>
          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">
            Track your income and expense patterns over time
          </p>
        </div>
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

      {/* Time Navigation Controls */}
      <div className="relative z-10 flex justify-between items-center mb-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-gray-600/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="year" className="bg-gray-800 text-white">
              Yearly View
            </option>
            <option value="last-12-months" className="bg-gray-800 text-white">
              Last 12 Months
            </option>
            <option value="all-time" className="bg-gray-800 text-white">
              All Time
            </option>
          </select>
          <select
            value={dataMode}
            onChange={(e) => setDataMode(e.target.value)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="regular" className="bg-gray-800 text-white">
              Regular
            </option>
            <option value="cumulative" className="bg-gray-800 text-white">
              Cumulative
            </option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110 transform disabled:transform-none"
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

          <div className="text-white font-semibold min-w-[150px] text-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl border border-gray-600">
            {(() => {
              if (viewMode === "all-time") {
                return "All Time";
              }
              if (viewMode === "last-12-months") {
                return "Last 12 Months";
              }
              return `Year ${currentYear}`;
            })()}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110 transform disabled:transform-none"
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

        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 px-3 py-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg">
          {timeFilteredData.filter((i) => i.type === "Income" || i.type === "Expense").length}{" "}
          transactions
        </div>
      </div>

      <div className="relative z-10 flex-grow bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-4 border border-gray-700/50">
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

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"></div>
    </div>
  );
};
