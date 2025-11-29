import React, { useState, useEffect, Suspense, useRef } from "react";
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

// Components
import { Header } from "./shared/components/layout/Header";
import { Footer } from "./shared/components/layout/Footer";
import { Tabs, TabContent } from "./shared/components/ui/Tabs";
import { LoadingSpinner } from "./shared/components/ui/Loading";
import { SectionSkeleton } from "./shared/components/ui/SectionSkeleton";

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
import { lazyLoad } from "./shared/utils/lazyLoad";

// Config
import { TABS_CONFIG } from "./config/tabs.config";

// Lazy load section components for better performance
const OverviewSection = lazyLoad(
  () => import("./shared/components/sections/OverviewSection"),
  "OverviewSection"
);
const IncomeExpenseSection = lazyLoad(
  () => import("./shared/components/sections/IncomeExpenseSection"),
  "IncomeExpenseSection"
);
const CategoryAnalysisSection = lazyLoad(
  () => import("./shared/components/sections/CategoryAnalysisSection"),
  "CategoryAnalysisSection"
);
const TrendsForecastsSection = lazyLoad(
  () => import("./shared/components/sections/TrendsForecastsSection"),
  "TrendsForecastsSection"
);
const InvestmentPerformanceTracker = lazyLoad(
  () => import("./features/analytics/components/InvestmentPerformanceTracker"),
  "InvestmentPerformanceTracker"
);
const TaxPlanningDashboard = lazyLoad(
  () => import("./features/analytics/components/TaxPlanningDashboard"),
  "TaxPlanningDashboard"
);
const FamilyHousingManager = lazyLoad(
  () => import("./features/analytics/components/FamilyHousingManager"),
  "FamilyHousingManager"
);
const CreditCardFoodOptimizer = lazyLoad(
  () => import("./features/analytics/components/CreditCardFoodOptimizer"),
  "CreditCardFoodOptimizer"
);
const PatternsSection = lazyLoad(
  () => import("./shared/components/sections/PatternsSection"),
  "PatternsSection"
);
const TransactionsSection = lazyLoad(
  () => import("./features/transactions/components/TransactionsSection"),
  "TransactionsSection"
);
const BudgetGoalsSection = lazyLoad(
  () => import("./features/budget/components/BudgetGoalsSection"),
  "BudgetGoalsSection"
);

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
  const [activeTab, setActiveTab] = useState("overview");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [drilldownCategory, setDrilldownCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 25;

  // Chart refs for download functionality
  const chartRefs = {
    doughnut: useRef(null),
    bar: useRef(null),
    incomeSources: useRef(null),
    spendingByAccount: useRef(null),
    line: useRef(null),
    spendingByDay: useRef(null),
    subcategoryBreakdown: useRef(null),
    treemap: useRef(null),
    enhancedSubcategoryBreakdown: useRef(null),
    multiCategoryTimeAnalysis: useRef(null),
    netWorth: useRef(null),
    cumulativeCategoryTrend: useRef(null),
    seasonalSpendingHeatmap: useRef(null),
    yearOverYearComparison: useRef(null),
    spendingForecast: useRef(null),
    accountBalanceProgression: useRef(null),
    dayWeekSpendingPatterns: useRef(null),
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
        <LoadingSpinner size="xl" message="Loading your financial data..." />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-gray-300 font-sans p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <Header onFileUpload={handleFileUpload} />

        {/* Tab Navigation */}
        <Tabs
          tabs={TABS_CONFIG}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content */}
        <TabContent isActive={activeTab === "overview"}>
          <Suspense fallback={<SectionSkeleton />}>
            <OverviewSection
              kpiData={kpiData}
              additionalKpiData={additionalKpiData}
              accountBalances={accountBalances}
              keyInsights={keyInsights}
              filteredData={filteredData}
            />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "income-expense"}>
          <Suspense fallback={<SectionSkeleton />}>
            <IncomeExpenseSection
              chartData={chartData}
              chartRefs={chartRefs}
              filteredData={filteredData}
              uniqueValues={uniqueValues}
              drilldownCategory={drilldownCategory}
              setDrilldownCategory={setDrilldownCategory}
            />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "categories"}>
          <Suspense fallback={<SectionSkeleton />}>
            <CategoryAnalysisSection
              chartRefs={chartRefs}
              filteredData={filteredData}
              uniqueValues={uniqueValues}
              drilldownCategory={drilldownCategory}
              setDrilldownCategory={setDrilldownCategory}
            />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "trends"}>
          <Suspense fallback={<SectionSkeleton />}>
            <TrendsForecastsSection
              chartRefs={chartRefs}
              filteredData={filteredData}
            />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "investments"}>
          <Suspense fallback={<SectionSkeleton />}>
            <InvestmentPerformanceTracker filteredData={filteredData} />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "tax-planning"}>
          <Suspense fallback={<SectionSkeleton />}>
            <TaxPlanningDashboard filteredData={filteredData} />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "family-housing"}>
          <Suspense fallback={<SectionSkeleton />}>
            <FamilyHousingManager filteredData={filteredData} />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "lifestyle"}>
          <Suspense fallback={<SectionSkeleton />}>
            <CreditCardFoodOptimizer filteredData={filteredData} />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "budget-goals"}>
          <Suspense fallback={<SectionSkeleton />}>
            <BudgetGoalsSection
              filteredData={filteredData}
              kpiData={kpiData}
              accountBalances={accountBalances}
            />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "patterns"}>
          <Suspense fallback={<SectionSkeleton />}>
            <PatternsSection filteredData={filteredData} />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "transactions"}>
          <Suspense fallback={<SectionSkeleton />}>
            <TransactionsSection
              filteredData={filteredData}
              handleSort={handleSort}
              currentPage={currentPage}
              transactionsPerPage={transactionsPerPage}
            />
          </Suspense>
        </TabContent>

        <Footer />
      </div>
    </div>
  );
};

export default App;
