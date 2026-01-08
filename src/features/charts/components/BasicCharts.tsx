import { type RefObject } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ChartCard } from "./ChartCard";
import { commonChartOptions, doughnutOptions } from "./ChartConfig";

interface ChartProps {
  data: unknown;
  chartRef?: RefObject<unknown>;
}

interface SubcategoryBreakdownChartProps {
  data: unknown;
  chartRef?: RefObject<unknown>;
}

export const IncomeVsExpenseChart = ({ data, chartRef }: ChartProps) => (
  <ChartCard
    title="Income vs Expense"
    chartRef={chartRef}
    fileName="income-vs-expense.png"
  >
    <Doughnut ref={chartRef} data={data} options={doughnutOptions} />
  </ChartCard>
);

export const TopExpenseCategoriesChart = ({ data, chartRef }: ChartProps) => (
  <ChartCard
    title="Top Expense Categories"
    chartRef={chartRef}
    fileName="top-expenses.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const TopIncomeSourcesChart = ({ data, chartRef }: ChartProps) => (
  <ChartCard
    title="Top Income Sources"
    chartRef={chartRef}
    fileName="top-income.png"
  >
    <Bar ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const SpendingByAccountChart = ({ data, chartRef }: ChartProps) => (
  <ChartCard
    title="Spending by Account"
    chartRef={chartRef}
    fileName="spending-by-account.png"
  >
    <Doughnut ref={chartRef} data={data} options={doughnutOptions} />
  </ChartCard>
);

export const MonthlyTrendsChart = ({ data, chartRef }: ChartProps) => (
  <ChartCard
    title="Monthly Trends"
    chartRef={chartRef}
    fileName="monthly-trends.png"
  >
    <Line ref={chartRef} data={data} options={commonChartOptions} />
  </ChartCard>
);

export const SpendingByDayChart = ({ data, chartRef }: ChartProps) => (
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
