import { useMemo } from "react";
import logger from "../../utils/logger";

type SpendingCalendarTransaction = {
  date?: string | Date;
  type?: string;
  amount?: number | string;
  category?: string;
} & Record<string, unknown>;

interface SpendingCalendarProps {
  filteredData: SpendingCalendarTransaction[];
}

/**
 * Spending Calendar Heatmap
 * Shows daily spending patterns with color intensity
 */
export const SpendingCalendar = ({ filteredData }: SpendingCalendarProps) => {
  const calendarData = useMemo(() => {
    const dailySpending: Record<
      string,
      { total: number; transactions: SpendingCalendarTransaction[] }
    > = {};
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
      if (!transaction?.date) {
        return;
      }

      // Normalize the date to YYYY-MM-DD format
      let dateStr;
      try {
        const transDate = new Date(transaction.date);
        if (Number.isNaN(transDate.getTime())) {
          return; // Skip invalid dates
        }
        dateStr = transDate.toISOString().split("T")[0];
      } catch (error) {
        logger.warning("Failed to parse transaction date:", error);
        return; // Skip if date parsing fails
      }

      const amount = Math.abs(Number.parseFloat(String(transaction.amount ?? "0")) || 0);
      const type = transaction.type;

      if (type === "Expense") {
        // Initialize the date if it doesn't exist (for dates outside 30-day window)
        if (!dailySpending[dateStr]) {
          dailySpending[dateStr] = { total: 0, transactions: [] };
        }
        dailySpending[dateStr].total += amount;
        dailySpending[dateStr].transactions.push(transaction);
      }
    });

    // Calculate stats - reuse existing today variable
    const thirtyDaysAgoDate = new Date(today);
    thirtyDaysAgoDate.setDate(today.getDate() - 29);

    // Filter to only last 30 days
    const last30DaysData = Object.entries(dailySpending).filter(([dateStr]) => {
      const date = new Date(dateStr);
      return date >= thirtyDaysAgoDate && date <= today;
    });

    const amounts = last30DaysData.map(([, d]) => d.total);
    const maxSpending = Math.max(...amounts, 0);
    const avgSpending =
      amounts.length > 0 ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length : 0;

    // Return only last 30 days
    const filteredDailySpending = Object.fromEntries(last30DaysData);

    return {
      dailySpending: filteredDailySpending,
      maxSpending,
      avgSpending,
    };
  }, [filteredData]);

  const { dailySpending, maxSpending, avgSpending } = calendarData;

  const getIntensityClass = (amount: number): string => {
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

  const getDayName = (dateStr: string): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(dateStr).getDay()];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const dates = Object.keys(dailySpending).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">📅 Spending Calendar</h2>
          <p className="text-gray-400 mt-1">Last 30 days spending patterns</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Daily Average</p>
          <p className="text-xl font-bold text-white">
            ₹{(avgSpending || 0).toFixed(0).toLocaleString()}
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
                  <p className="text-white text-xs font-medium">{getDayName(dateStr)}</p>
                  <p className="text-white text-xs mt-1">{new Date(dateStr).getDate()}</p>
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
                  <p className="text-white font-medium mb-1">{formatDate(dateStr)}</p>
                  <p className="text-gray-400 text-sm mb-2">
                    Total: ₹{data.total.toLocaleString()}
                  </p>
                  {data.transactions.length > 0 && (
                    <div className="border-t border-gray-700 pt-2">
                      <p className="text-gray-400 text-xs mb-1">
                        {data.transactions.length} transaction(s)
                      </p>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {data.transactions.slice(0, 3).map((t) => (
                          <p
                            key={`${t.date}-${t.category}-${t.amount}`}
                            className="text-gray-300 text-xs truncate"
                          >
                            {t.category}: ₹
                            {Math.abs(Number.parseFloat(String(t.amount ?? "0"))).toFixed(0)}
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
            .reduce((sum, dateStr) => sum + (dailySpending[dateStr]?.total || 0), 0);
          const avgDaySpending = daySpending / 4; // Approx 4 weeks

          return (
            <div key={day} className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">{day}</p>
              <p className="text-white font-medium text-sm">
                ₹{(avgDaySpending || 0).toFixed(0).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
