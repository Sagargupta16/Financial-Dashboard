import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import { truncateLabel } from "../../utils/chartUtils";
import { commonChartOptions } from "./ChartConfig";
import {
  ChartContainer,
  ExportButton,
  TimeNavigationControls,
} from "../UI/ChartUIComponents";
import { useTimeNavigation } from "../../hooks/useChartHooks";

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

export const EnhancedTopExpenseCategoriesChart = ({
  filteredData,
  chartRef,
}) => {
  const {
    currentYear,
    currentMonth,
    viewMode,
    setViewMode,
    handlePrevious,
    handleNext,
    canGoPrevious,
    canGoNext,
    getFilteredData,
  } = useTimeNavigation(filteredData);

  const timeFilteredData = React.useMemo(() => {
    return getFilteredData().filter((item) => item.type === "Expense");
  }, [getFilteredData]);

  const chartData = React.useMemo(() => {
    const expenses = timeFilteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const sorted = Object.entries(expenses)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sorted.map(([category]) => truncateLabel(category, 10)),
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

  return (
    <ChartContainer title="Top Expense Categories">
      <TimeNavigationControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentPeriod={(() => {
          if (viewMode === "all-time") {
            return "All Time";
          }
          if (viewMode === "year") {
            return `Year ${currentYear}`;
          }
          return `${monthNames[currentMonth - 1]} ${currentYear}`;
        })()}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      <ExportButton
        chartRef={chartRef}
        filename={`top-expenses-${viewMode}-${currentYear}${
          viewMode === "month" ? `-${currentMonth}` : ""
        }.png`}
      />

      <div className="text-sm text-gray-400 mb-4">
        {timeFilteredData.length} expenses
      </div>

      <div className="flex-grow">
        <Bar ref={chartRef} data={chartData} options={commonChartOptions} />
      </div>
    </ChartContainer>
  );
};

EnhancedTopExpenseCategoriesChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};

// Enhanced Top Income Sources Chart with time navigation
export const EnhancedTopIncomeSourcesChart = ({ filteredData, chartRef }) => {
  const {
    currentYear,
    currentMonth,
    viewMode,
    setViewMode,
    handlePrevious,
    handleNext,
    canGoPrevious,
    canGoNext,
    getFilteredData,
  } = useTimeNavigation(filteredData, "year");

  const timeFilteredData = React.useMemo(() => {
    return getFilteredData().filter(
      (item) => item.type === "Income" && item.category !== "In-pocket",
    );
  }, [getFilteredData]);

  const chartData = React.useMemo(() => {
    const income = timeFilteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const sorted = Object.entries(income)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sorted.map(([category]) => truncateLabel(category, 10)),
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

  return (
    <ChartContainer title="Top Income Sources">
      <TimeNavigationControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentPeriod={(() => {
          if (viewMode === "all-time") {
            return "All Time";
          }
          if (viewMode === "year") {
            return `Year ${currentYear}`;
          }
          return `${monthNames[currentMonth - 1]} ${currentYear}`;
        })()}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      <ExportButton
        chartRef={chartRef}
        filename={`top-income-${viewMode}-${currentYear}${
          viewMode === "month" ? `-${currentMonth}` : ""
        }.png`}
      />

      <div className="text-sm text-gray-400 mb-4">
        {timeFilteredData.length} income entries
      </div>

      <div className="flex-grow">
        <Bar ref={chartRef} data={chartData} options={commonChartOptions} />
      </div>
    </ChartContainer>
  );
};

EnhancedTopIncomeSourcesChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};
