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
  LayoutDashboard,
  TrendingUp,
  Tags,
  LineChart,
  Target,
  Repeat,
  Lightbulb,
  Receipt,
} from "lucide-react";

// Components
import { Header } from "./shared/components/layout/Header";
import { Footer } from "./shared/components/layout/Footer";
import { Tabs, TabContent } from "./shared/components/ui/Tabs";

// Section Components
import {
  OverviewSection,
  IncomeExpenseSection,
  CategoryAnalysisSection,
  TrendsForecastsSection,
  PatternsSection,
  CategoryInsightsSection,
} from "./shared/components/sections";
import { TransactionsSection } from "./features/transactions/components/TransactionsSection";
import { BudgetGoalsSection } from "./features/budget/components/BudgetGoalsSection";

// Hooks
import {
  useDataProcessor,
  useUniqueValues,
  useFilteredData,
} from "./shared/hooks/useDataProcessor";
import {
  useKPIData,
  useKeyInsights,
  useAccountBalances,
} from "./shared/hooks/useCalculations";
import { useChartData } from "./shared/hooks/useChartData";

// Utils
import { initialCsvData } from "./shared/utils/constants";

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

// eslint-disable-next-line max-lines-per-function
const App = () => {
  // State
  const [activeTab, setActiveTab] = useState("overview");
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
    netWorth: useRef(null),
    cumulativeCategoryTrend: useRef(null),
    seasonalSpendingHeatmap: useRef(null),
    yearOverYearComparison: useRef(null),
    spendingForecast: useRef(null),
    accountBalanceProgression: useRef(null),
    dayWeekSpendingPatterns: useRef(null),
    treemap: useRef(null),
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

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  // Tab configuration
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Quick snapshot of your financial health",
    },
    {
      id: "income-expense",
      label: "Income & Expenses",
      icon: TrendingUp,
      description: "Detailed income and spending analysis",
    },
    {
      id: "categories",
      label: "Categories",
      icon: Tags,
      description: "Deep dive into spending categories",
    },
    {
      id: "trends",
      label: "Trends & Forecasts",
      icon: LineChart,
      description: "Advanced analytics and predictions",
    },
    {
      id: "budget-goals",
      label: "Budget & Planning",
      icon: Target,
      description: "Financial health, budgets, and planning tools",
    },
    {
      id: "patterns",
      label: "Subscriptions & Patterns",
      icon: Repeat,
      description: "Recurring payments and spending patterns",
    },
    {
      id: "category-insights",
      label: "Category Insights",
      icon: Lightbulb,
      description: "Specialized analytics for specific categories",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      description: "Detailed transaction list with filters",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-gray-300 font-sans p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <Header onFileUpload={handleFileUpload} />

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <TabContent isActive={activeTab === "overview"}>
          <OverviewSection
            kpiData={kpiData}
            additionalKpiData={additionalKpiData}
            accountBalances={accountBalances}
            keyInsights={keyInsights}
            filteredData={filteredData}
          />
        </TabContent>

        <TabContent isActive={activeTab === "income-expense"}>
          <IncomeExpenseSection
            chartData={chartData}
            chartRefs={chartRefs}
            filteredData={filteredData}
            uniqueValues={uniqueValues}
            drilldownCategory={drilldownCategory}
            setDrilldownCategory={setDrilldownCategory}
          />
        </TabContent>

        <TabContent isActive={activeTab === "categories"}>
          <CategoryAnalysisSection
            chartRefs={chartRefs}
            filteredData={filteredData}
            uniqueValues={uniqueValues}
            drilldownCategory={drilldownCategory}
            setDrilldownCategory={setDrilldownCategory}
          />
        </TabContent>

        <TabContent isActive={activeTab === "trends"}>
          <TrendsForecastsSection
            chartRefs={chartRefs}
            filteredData={filteredData}
          />
        </TabContent>

        <TabContent isActive={activeTab === "budget-goals"}>
          <BudgetGoalsSection
            filteredData={filteredData}
            kpiData={kpiData}
            accountBalances={accountBalances}
          />
        </TabContent>

        <TabContent isActive={activeTab === "patterns"}>
          <PatternsSection filteredData={filteredData} />
        </TabContent>

        <TabContent isActive={activeTab === "category-insights"}>
          <CategoryInsightsSection filteredData={filteredData} />
        </TabContent>

        <TabContent isActive={activeTab === "transactions"}>
          <TransactionsSection
            filteredData={filteredData}
            handleSort={handleSort}
            currentPage={currentPage}
            transactionsPerPage={transactionsPerPage}
          />
        </TabContent>

        <Footer />
      </div>
    </div>
  );
};

export default App;
