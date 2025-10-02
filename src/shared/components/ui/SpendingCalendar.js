/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Spending Calendar Heatmap
 * Shows daily spending patterns with color intensity
 */
export const SpendingCalendar = ({ filteredData }) => {
  const calendarData = useMemo(() => {
    const dailySpending = {};
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    // Initialize all days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dailySpending[dateStr] = { total: 0, transactions: [] };
    }

    // Calculate spending per day
    filteredData.forEach((transaction) => {
      const dateStr = transaction.Date;
      const amount = Math.abs(parseFloat(transaction.INR) || 0);
      const type = transaction["Income/Expense"];

      if (type === "Expense" && dailySpending[dateStr]) {
        dailySpending[dateStr].total += amount;
        dailySpending[dateStr].transactions.push(transaction);
      }
    });

    // Calculate stats
    const amounts = Object.values(dailySpending).map((d) => d.total);
    const maxSpending = Math.max(...amounts);
    const avgSpending =
      amounts.reduce((sum, val) => sum + val, 0) / amounts.length;

    return { dailySpending, maxSpending, avgSpending };
  }, [filteredData]);

  const { dailySpending, maxSpending, avgSpending } = calendarData;

  const getIntensityClass = (amount) => {
    if (amount === 0) {
      return "bg-gray-800 border-gray-700";
    }
    const intensity = amount / maxSpending;
    if (intensity > 0.75) {
      return "bg-red-600 border-red-500";
    }
    if (intensity > 0.5) {
      return "bg-orange-600 border-orange-500";
    }
    if (intensity > 0.25) {
      return "bg-yellow-600 border-yellow-500";
    }
    return "bg-green-600 border-green-500";
  };

  const getDayName = (dateStr) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(dateStr).getDay()];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const dates = Object.keys(dailySpending).sort();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            📅 Spending Calendar
          </h2>
          <p className="text-gray-400 mt-1">Last 30 days spending patterns</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Daily Average</p>
          <p className="text-xl font-bold text-white">
            ₹{avgSpending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-gray-400 text-sm">Less</span>
        <div className="flex gap-1">
          <div className="w-6 h-6 bg-gray-800 border border-gray-700 rounded" />
          <div className="w-6 h-6 bg-green-600 border border-green-500 rounded" />
          <div className="w-6 h-6 bg-yellow-600 border border-yellow-500 rounded" />
          <div className="w-6 h-6 bg-orange-600 border border-orange-500 rounded" />
          <div className="w-6 h-6 bg-red-600 border border-red-500 rounded" />
        </div>
        <span className="text-gray-400 text-sm">More</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {dates.map((dateStr) => {
          const data = dailySpending[dateStr];
          return (
            <div
              key={dateStr}
              className="group relative"
              title={`${formatDate(dateStr)}: ₹${data.total.toLocaleString()}`}
            >
              <div
                className={`aspect-square rounded border-2 transition-all hover:scale-110 hover:shadow-lg cursor-pointer ${getIntensityClass(
                  data.total
                )}`}
              >
                <div className="p-2 flex flex-col items-center justify-center h-full">
                  <p className="text-white text-xs font-medium">
                    {getDayName(dateStr)}
                  </p>
                  <p className="text-white text-xs mt-1">
                    {new Date(dateStr).getDate()}
                  </p>
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
                  <p className="text-white font-medium mb-1">
                    {formatDate(dateStr)}
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                    Total: ₹{data.total.toLocaleString()}
                  </p>
                  {data.transactions.length > 0 && (
                    <div className="border-t border-gray-700 pt-2">
                      <p className="text-gray-400 text-xs mb-1">
                        {data.transactions.length} transaction(s)
                      </p>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {data.transactions.slice(0, 3).map((t, i) => (
                          <p key={i} className="text-gray-300 text-xs truncate">
                            {t.Category}: ₹
                            {Math.abs(parseFloat(t.INR)).toFixed(0)}
                          </p>
                        ))}
                        {data.transactions.length > 3 && (
                          <p className="text-gray-500 text-xs">
                            +{data.transactions.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => {
          const daySpending = dates
            .filter((dateStr) => getDayName(dateStr) === day)
            .reduce((sum, dateStr) => sum + dailySpending[dateStr].total, 0);
          const avgDaySpending = daySpending / 4; // Approx 4 weeks

          return (
            <div
              key={day}
              className="bg-gray-700/50 rounded-lg p-3 text-center"
            >
              <p className="text-gray-400 text-xs mb-1">{day}</p>
              <p className="text-white font-medium text-sm">
                ₹{avgDaySpending.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

SpendingCalendar.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
