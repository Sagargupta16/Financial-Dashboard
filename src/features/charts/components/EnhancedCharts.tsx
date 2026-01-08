import React from "react";
import { Bar } from "react-chartjs-2";
import { truncateLabel } from "../../../lib/charts";
import { commonChartOptions } from "./ChartConfig";
import {
  ChartContainer,
  ExportButton,
  TimeNavigationControls,
} from "../../../components/data-display/ChartUIComponents";
import { useTimeNavigation } from "../hooks/useChartHooks";

interface EnhancedChartProps {
  filteredData: any[];
  chartRef?: any;
}

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
}: EnhancedChartProps) => {
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
    const rows = timeFilteredData as any[];
    const expenses = rows.reduce((acc: Record<string, number>, item: any) => {
      const key = String(item.category ?? "Uncategorized");
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {} as Record<string, number>);

    const sorted = (Object.entries(expenses) as Array<[string, number]>)
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
        canGoPrevious={canGoPrevious()}
        canGoNext={canGoNext()}
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

// Enhanced Top Income Sources Chart with time navigation
export const EnhancedTopIncomeSourcesChart = ({ filteredData, chartRef }: EnhancedChartProps) => {
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
      (item) => item.type === "Income" && item.category !== "In-pocket"
    );
  }, [getFilteredData]);

  const chartData = React.useMemo(() => {
    const rows = timeFilteredData as any[];
    const income = rows.reduce((acc: Record<string, number>, item: any) => {
      const key = String(item.category ?? "Uncategorized");
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {} as Record<string, number>);

    const sorted = (Object.entries(income) as Array<[string, number]>)
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
        canGoPrevious={canGoPrevious()}
        canGoNext={canGoNext()}
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
