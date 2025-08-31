import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
} from "chart.js";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Hash,
  Target,
  Sigma,
  CalendarDays,
  LayoutGrid,
  Calculator,
  ArrowLeftRight,
} from "lucide-react";

// Components
import { Header } from "./components/UI/Header";
import { KPICard, SmallKPICard } from "./components/UI/KPICards";
import { AccountBalancesCard } from "./components/UI/AccountBalancesCard";
import { TransactionTable } from "./components/UI/TransactionTable";
import { Footer } from "./components/UI/Footer";
import {
  IncomeVsExpenseChart,
  TopExpenseCategoriesChart,
  TopIncomeSourcesChart,
  SpendingByAccountChart,
  MonthlyTrendsChart,
  SpendingByDayChart,
  SubcategoryBreakdownChart,
  EnhancedSubcategoryBreakdownChart,
  MultiCategoryTimeAnalysisChart,
} from "./components/Charts/ChartComponents";

// Hooks
import {
  useDataProcessor,
  useUniqueValues,
  useFilteredData,
} from "./hooks/useDataProcessor";
import {
  useKPIData,
  useKeyInsights,
  useAccountBalances,
} from "./hooks/useCalculations";
import { useChartData } from "./hooks/useChartData";

// Utils
import { initialCsvData } from "./utils/constants";
import { formatCurrency } from "./utils/dataUtils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
);

const App = () => {
  // State
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [drilldownCategory, setDrilldownCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 25;

  // Chart refs
  const chartRefs = {
    doughnut: useRef(null),
    bar: useRef(null),
    line: useRef(null),
    incomeSources: useRef(null),
    spendingByAccount: useRef(null),
    spendingByDay: useRef(null),
    subcategoryBreakdown: useRef(null),
    enhancedSubcategoryBreakdown: useRef(null),
    multiCategoryTimeAnalysis: useRef(null),
  };

  // Custom hooks
  const { data, loading, error, handleFileUpload } =
    useDataProcessor(initialCsvData);
  const uniqueValues = useUniqueValues(data);
  // Default filters for data processing
  const defaultFilters = {
    searchTerm: "",
    type: "All",
    category: "All",
    account: "All",
    startDate: "",
    endDate: "",
  };
  const filteredData = useFilteredData(data, defaultFilters, sortConfig);
  const { kpiData, additionalKpiData } = useKPIData(filteredData);
  const keyInsights = useKeyInsights(filteredData, kpiData, additionalKpiData);
  const accountBalances = useAccountBalances(data);
  const chartData = useChartData(filteredData, kpiData, drilldownCategory);

  // Effects
  useEffect(() => {
    if (uniqueValues.expenseCategories.length > 0 && !drilldownCategory) {
      setDrilldownCategory(uniqueValues.expenseCategories[0]);
    }
  }, [uniqueValues.expenseCategories, drilldownCategory]);

  // Handlers
  const handleSort = (key) => {
    setSortConfig((p) => ({
      key,
      direction: p.key === key && p.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Loading and error states
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header onFileUpload={handleFileUpload} />

        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KPICard
            title="Total Income"
            value={kpiData.income}
            icon={<TrendingUp size={24} />}
            color="green"
          />
          <KPICard
            title="Total Expense"
            value={kpiData.expense}
            icon={<TrendingDown size={24} />}
            color="red"
          />
          <KPICard
            title="Net Balance"
            value={kpiData.income - kpiData.expense}
            icon={<Wallet size={24} />}
            color="blue"
          />
        </div>

        {/* Secondary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <SmallKPICard
            title="Total Transactions"
            value={additionalKpiData.totalTransactions}
            icon={<Hash size={22} />}
          />
          <SmallKPICard
            title="Highest Expense"
            value={additionalKpiData.highestExpense}
            icon={<Target size={22} />}
          />
          <SmallKPICard
            title="Average Expense"
            value={additionalKpiData.averageExpense}
            icon={<Sigma size={22} />}
          />
        </div>

        {/* Transfer Information Cards */}
        {(additionalKpiData.transferData?.transferIn > 0 ||
          additionalKpiData.transferData?.transferOut > 0) && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
              <div className="p-2 rounded-lg bg-purple-900/50 text-purple-400 mr-3">
                <ArrowLeftRight size={20} />
              </div>
              Account Transfers (Internal Money Movement)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-300">
                    Money Transferred In
                  </span>
                  <span className="text-lg font-bold text-purple-400">
                    ←{" "}
                    {formatCurrency(
                      additionalKpiData.transferData?.transferIn || 0
                    )}
                  </span>
                </div>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-300">
                    Money Transferred Out
                  </span>
                  <span className="text-lg font-bold text-purple-400">
                    →{" "}
                    {formatCurrency(
                      additionalKpiData.transferData?.transferOut || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-purple-300/70 mt-3">
              * Transfers represent internal money movement between your
              accounts and do not affect your total income or expenses.
            </p>
          </div>
        )}

        {/* Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <IncomeVsExpenseChart
            data={chartData.doughnutChartData}
            chartRef={chartRefs.doughnut}
          />
          <AccountBalancesCard balances={accountBalances} />
          <TopExpenseCategoriesChart
            data={chartData.barChartData}
            chartRef={chartRefs.bar}
          />
          <TopIncomeSourcesChart
            data={chartData.incomeSourcesChartData}
            chartRef={chartRefs.incomeSources}
          />
          <SpendingByAccountChart
            data={chartData.spendingByAccountChartData}
            chartRef={chartRefs.spendingByAccount}
          />
          <MonthlyTrendsChart
            data={chartData.lineChartData}
            chartRef={chartRefs.line}
          />
        </div>

        {/* Deeper Analysis Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Deeper Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SmallKPICard
              title="Busiest Spending Day"
              value={keyInsights.busiestDay}
              icon={<CalendarDays size={22} />}
            />
            <SmallKPICard
              title="Most Frequent Category"
              value={keyInsights.mostFrequentCategory}
              icon={<LayoutGrid size={22} />}
            />
            <SmallKPICard
              title="Avg. Transaction Value"
              value={keyInsights.avgTransactionValue}
              icon={<Calculator size={22} />}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingByDayChart
              data={chartData.spendingByDayData}
              chartRef={chartRefs.spendingByDay}
            />
            <SubcategoryBreakdownChart
              data={chartData.subcategoryBreakdownData}
              chartRef={chartRefs.subcategoryBreakdown}
              categories={uniqueValues.expenseCategories}
              selectedCategory={drilldownCategory}
              onCategoryChange={setDrilldownCategory}
            />
          </div>
        </div>

        {/* Enhanced Time-based Analysis */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Time-based Category Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedSubcategoryBreakdownChart
              filteredData={filteredData}
              chartRef={chartRefs.enhancedSubcategoryBreakdown}
              categories={uniqueValues.expenseCategories}
              selectedCategory={drilldownCategory}
              onCategoryChange={setDrilldownCategory}
            />
            <MultiCategoryTimeAnalysisChart
              filteredData={filteredData}
              chartRef={chartRefs.multiCategoryTimeAnalysis}
              categories={uniqueValues.expenseCategories}
            />
          </div>
        </div>

        {/* Data Table */}
        <TransactionTable
          data={paginatedData}
          onSort={handleSort}
          currentPage={currentPage}
          totalPages={totalPages}
          transactionsPerPage={transactionsPerPage}
          totalTransactions={filteredData.length}
          onPageChange={handlePageChange}
        />

        <Footer />
      </div>
    </div>
  );
};

export default App;
