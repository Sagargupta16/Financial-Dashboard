import React from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ChartCard } from "./ChartCard";
import { commonChartOptions, doughnutOptions } from "./ChartConfig";

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
    fileName="top-income.png"
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
  categories,
  selectedCategory,
  onCategoryChange,
  chartRef,
}) => (
  <ChartCard
    title="Subcategory Breakdown"
    chartRef={chartRef}
    fileName="subcategory-breakdown.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);
