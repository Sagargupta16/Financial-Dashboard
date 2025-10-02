import React from "react";
import PropTypes from "prop-types";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  formatCurrency,
  getCommonChartOptions,
  colorPalettes,
  shortMonthNames,
} from "../../utils/chartUtils";
import {
  ChartContainer,
  DropdownSelect,
  ChartWrapper,
  FilterControls,
} from "../UI/ChartUIComponents";
import {
  useTimeNavigation,
  useMultipleFilters,
} from "../../hooks/useChartHooks";

const createEnhancedChart = (ChartComponent, defaultOptions = {}) => {
  const Component = ({
    filteredData,
    chartRef,
    title,
    dataType = "expense",
    chartType = "bar",
    limit = 10,
    colSpan = "",
    ...customOptions
  }) => {
    const { viewMode, setViewMode, getFilteredData } = useTimeNavigation(
      filteredData,
      "year"
    );

    const { filters, updateFilter } = useMultipleFilters({
      category: "all",
      account: "all",
    });

    const chartData = React.useMemo(() => {
      let data = getFilteredData();

      if (dataType === "expense") {
        data = data.filter(
          (item) => item.type === "Expense" && item.category !== "In-pocket"
        );
      } else if (dataType === "income") {
        data = data.filter((item) => item.type === "Income");
      }

      if (filters.category !== "all") {
        data = data.filter((item) => item.category === filters.category);
      }
      if (filters.account !== "all") {
        data = data.filter((item) => item.account === filters.account);
      }

      const grouped = data.reduce((acc, item) => {
        const key = item.category;
        acc[key] = (acc[key] || 0) + item.amount;
        return acc;
      }, {});

      const sorted = Object.entries(grouped)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit);

      const colors =
        chartType === "doughnut"
          ? colorPalettes.primary.slice(0, sorted.length)
          : Array(sorted.length).fill(colorPalettes.primary[0]);

      return {
        labels: sorted.map(([key]) => key),
        datasets: [
          {
            label: dataType === "expense" ? "Expenses" : "Income",
            data: sorted.map(([, amount]) => amount),
            backgroundColor: colors,
            borderColor: colors,
            borderRadius: chartType === "bar" ? 8 : 0,
            borderWidth: chartType === "line" ? 3 : 1,
            fill: chartType === "line" ? false : true,
            tension: chartType === "line" ? 0.4 : 0,
          },
        ],
      };
    }, [getFilteredData, dataType, filters, limit, chartType]);

    const categories = React.useMemo(
      () => [...new Set(filteredData.map((item) => item.category))].sort(),
      [filteredData]
    );
    const accounts = React.useMemo(
      () => [...new Set(filteredData.map((item) => item.account))].sort(),
      [filteredData]
    );

    const viewModeOptions = [
      { value: "month", label: "Monthly View" },
      { value: "year", label: "Yearly View" },
      { value: "all-time", label: "All Time" },
    ];

    const filterOptions = [
      {
        name: "viewMode",
        value: viewMode,
        options: viewModeOptions,
      },
      {
        name: "category",
        value: filters.category,
        options: [
          { value: "all", label: "All Categories" },
          ...categories.map((cat) => ({ value: cat, label: cat })),
        ],
      },
      {
        name: "account",
        value: filters.account,
        options: [
          { value: "all", label: "All Accounts" },
          ...accounts.map((acc) => ({ value: acc, label: acc })),
        ],
      },
    ];

    const handleFilterChange = (filterName, value) => {
      if (filterName === "viewMode") {
        setViewMode(value);
      } else {
        updateFilter(filterName, value);
      }
    };

    const chartOptions = getCommonChartOptions({
      ...defaultOptions,
      ...customOptions,
      plugins: {
        legend: {
          display: chartType === "doughnut",
          labels: { color: "#9ca3af", font: { size: 11 } },
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
          },
        },
        ...defaultOptions.plugins,
        ...customOptions.plugins,
      },
    });

    return (
      <ChartContainer
        title={title}
        chartRef={chartRef}
        filename={`${title.toLowerCase().replace(/\s+/g, "-")}-${viewMode}`}
        colSpan={colSpan}
        actions={
          <FilterControls
            filters={filterOptions}
            onFilterChange={handleFilterChange}
          />
        }
      >
        <ChartWrapper>
          <ChartComponent
            ref={chartRef}
            data={chartData}
            options={chartOptions}
          />
        </ChartWrapper>
      </ChartContainer>
    );
  };

  Component.propTypes = {
    filteredData: PropTypes.array.isRequired,
    chartRef: PropTypes.object,
    title: PropTypes.string.isRequired,
    dataType: PropTypes.oneOf(["expense", "income"]),
    chartType: PropTypes.oneOf(["bar", "line", "doughnut"]),
    limit: PropTypes.number,
    colSpan: PropTypes.string,
  };

  return Component;
};

export const EnhancedBarChart = createEnhancedChart(Bar, {
  scales: {
    x: {
      ticks: {
        font: { size: 10 },
        maxRotation: 45,
        maxTicksLimit: 15,
      },
    },
    y: {
      beginAtZero: true,
    },
  },
});

export const EnhancedLineChart = createEnhancedChart(Line, {
  scales: {
    x: {
      ticks: {
        font: { size: 10 },
        maxRotation: 45,
        maxTicksLimit: 15,
      },
    },
    y: {
      beginAtZero: true,
    },
  },
});

export const EnhancedDoughnutChart = createEnhancedChart(Doughnut, {
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "right",
    },
  },
});

export const RefactoredTopExpenseCategoriesChart = (props) => (
  <EnhancedBarChart
    {...props}
    title="Top Expense Categories"
    dataType="expense"
    chartType="bar"
    limit={10}
  />
);

RefactoredTopExpenseCategoriesChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};

export const RefactoredTopIncomeSourcesChart = (props) => (
  <EnhancedBarChart
    {...props}
    title="Top Income Sources"
    dataType="income"
    chartType="bar"
    limit={10}
  />
);

RefactoredTopIncomeSourcesChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};

export const RefactoredExpenseDistributionChart = (props) => (
  <EnhancedDoughnutChart
    {...props}
    title="Expense Distribution"
    dataType="expense"
    chartType="doughnut"
    limit={8}
  />
);

RefactoredExpenseDistributionChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};

export const RefactoredTrendChart = ({
  filteredData,
  chartRef,
  title = "Financial Trends",
  colSpan = "lg:col-span-2",
}) => {
  const [metricType, setMetricType] = React.useState("net");

  const chartData = React.useMemo(() => {
    const monthlyData = filteredData.reduce((acc, item) => {
      if (!item.date) {
        return acc;
      }

      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expense: 0 };
      }

      if (item.type === "Income") {
        acc[monthKey].income += item.amount;
      } else if (item.type === "Expense" && item.category !== "In-pocket") {
        acc[monthKey].expense += item.amount;
      }

      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      return `${shortMonthNames[parseInt(monthNum) - 1]} ${year}`;
    });

    let data, color;
    if (metricType === "income") {
      data = sortedMonths.map((month) => monthlyData[month].income);
      color = colorPalettes.income[0];
    } else if (metricType === "expense") {
      data = sortedMonths.map((month) => monthlyData[month].expense);
      color = colorPalettes.expense[0];
    } else {
      data = sortedMonths.map(
        (month) => monthlyData[month].income - monthlyData[month].expense
      );
      color = colorPalettes.primary[0];
    }

    return {
      labels,
      datasets: [
        {
          label:
            metricType === "net"
              ? "Net Income"
              : metricType.charAt(0).toUpperCase() + metricType.slice(1),
          data,
          borderColor: color,
          backgroundColor: color + "20",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [filteredData, metricType]);

  const metricOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expenses" },
    { value: "net", label: "Net Income" },
  ];

  return (
    <ChartContainer
      title={title}
      chartRef={chartRef}
      filename={`trends-${metricType}`}
      colSpan={colSpan}
      actions={
        <DropdownSelect
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          options={metricOptions}
        />
      }
    >
      <ChartWrapper>
        <Line
          ref={chartRef}
          data={chartData}
          options={getCommonChartOptions({
            scales: {
              x: {
                ticks: {
                  font: { size: 10 },
                  maxRotation: 45,
                  maxTicksLimit: 15,
                },
              },
              y: { beginAtZero: true },
            },
          })}
        />
      </ChartWrapper>
    </ChartContainer>
  );
};

RefactoredTrendChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
  title: PropTypes.string,
  colSpan: PropTypes.string,
};
