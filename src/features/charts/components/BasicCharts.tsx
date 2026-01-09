import React from "react";
import { type ChartData, type Point, type BubbleDataPoint } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ChartCard } from "./ChartCard";
import { commonChartOptions, doughnutOptions } from "./ChartConfig";

type ChartRef = React.RefObject<any>;
type DoughnutData = ChartData<"doughnut", number[], unknown>;
type BarData = ChartData<
  "bar",
  (number | [number, number] | BubbleDataPoint | null)[],
  unknown
>;
type LineData = ChartData<"line", (number | Point | null)[], unknown>;

interface ChartProps<TData> {
  data: TData;
  chartRef?: ChartRef;
}

interface SubcategoryBreakdownChartProps {
  data: BarData;
  chartRef?: ChartRef;
}

export const IncomeVsExpenseChart = ({
  data,
  chartRef,
}: ChartProps<DoughnutData>) => (
  <ChartCard
    title="Income vs Expense"
    chartRef={chartRef}
    fileName="income-vs-expense.png"
  >
    <Doughnut ref={chartRef} data={data} options={doughnutOptions} />
  </ChartCard>
);

export const TopExpenseCategoriesChart = ({
  data,
  chartRef,
}: ChartProps<BarData>) => (
  <ChartCard
    title="Top Expense Categories"
    chartRef={chartRef}
    fileName="top-expenses.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const TopIncomeSourcesChart = ({
  data,
  chartRef,
}: ChartProps<BarData>) => (
  <ChartCard
    title="Top Income Sources"
    chartRef={chartRef}
    fileName="top-income.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const SpendingByAccountChart = ({
  data,
  chartRef,
}: ChartProps<DoughnutData>) => (
  <ChartCard
    title="Spending by Account"
    chartRef={chartRef}
    fileName="spending-by-account.png"
  >
    <Doughnut ref={chartRef} data={data} options={doughnutOptions} />
  </ChartCard>
);

export const MonthlyTrendsChart = ({
  data,
  chartRef,
}: ChartProps<LineData>) => (
  <ChartCard
    title="Monthly Trends"
    chartRef={chartRef}
    fileName="monthly-trends.png"
  >
    <Line ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const SpendingByDayChart = ({ data, chartRef }: ChartProps<BarData>) => (
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
}: SubcategoryBreakdownChartProps) => (
  <ChartCard
    title="Subcategory Breakdown"
    chartRef={chartRef}
    fileName="subcategory-breakdown.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);
