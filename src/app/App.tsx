import {
  useState,
  useEffect,
  Suspense,
  useRef,
  type MutableRefObject,
} from "react";
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
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Tabs, TabContent } from "../components/ui/Tabs";
import { LoadingSpinner } from "../components/ui/Loading";
import { SectionSkeleton } from "../components/ui/SectionSkeleton";

// Hooks
import {
  useDataProcessor,
  useUniqueValues,
  useFilteredData,
} from "../hooks/useDataProcessor";
import {
  useKPIData,
  useKeyInsights,
  useAccountBalances,
} from "../features/kpi/hooks/useCalculations";
import { useChartData } from "../features/charts/hooks/useChartData";

// Utils
import { initialCsvData } from "../constants/index";
import { lazyLoad } from "../utils/lazyLoad";

// Config
import { TABS_CONFIG } from "../config/tabs";
import type { SortConfig, TransactionSortKey } from "../types";

// Lazy load page components for better performance
const OverviewPage = lazyLoad(
  () => import("../pages/OverviewPage/OverviewPage"),
  "OverviewPage"
);
const IncomeExpensePage = lazyLoad(
  () => import("../pages/IncomeExpensePage/IncomeExpensePage"),
  "IncomeExpensePage"
);
const CategoryAnalysisPage = lazyLoad(
  () => import("../pages/CategoryAnalysisPage/CategoryAnalysisPage"),
  "CategoryAnalysisPage"
);
const TrendsForecastsPage = lazyLoad(
  () => import("../pages/TrendsForecastsPage/TrendsForecastsPage"),
  "TrendsForecastsPage"
);
const InvestmentPerformanceTracker = lazyLoad(
  () => import("../features/analytics/components/InvestmentPerformanceTracker"),
  "InvestmentPerformanceTracker"
);
const TaxPlanningDashboard = lazyLoad(
  () => import("../features/analytics/components/TaxPlanningDashboard"),
  "TaxPlanningDashboard"
);
const FamilyHousingManager = lazyLoad(
  () => import("../features/analytics/components/FamilyHousingManager"),
  "FamilyHousingManager"
);
const CreditCardFoodOptimizer = lazyLoad(
  () => import("../features/analytics/components/CreditCardFoodOptimizer"),
  "CreditCardFoodOptimizer"
);
const PatternsPage = lazyLoad(
  () => import("../pages/PatternsPage/PatternsPage"),
  "PatternsPage"
);
const TransactionsPage = lazyLoad(
  () => import("../pages/TransactionsPage/TransactionsPage"),
  "TransactionsPage"
);
const BudgetGoalsSection = lazyLoad(
  () => import("../features/budget/components/BudgetGoalsSection"),
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

type ChartRefKey =
  | "doughnut"
  | "bar"
  | "incomeSources"
  | "spendingByAccount"
  | "line"
  | "spendingByDay"
  | "subcategoryBreakdown"
  | "treemap"
  | "enhancedSubcategoryBreakdown"
  | "multiCategoryTimeAnalysis"
  | "netWorth"
  | "cumulativeCategoryTrend"
  | "seasonalSpendingHeatmap"
  | "yearOverYearComparison"
  | "spendingForecast"
  | "accountBalanceProgression"
  | "dayWeekSpendingPatterns";

type ChartRefMap = Record<ChartRefKey, MutableRefObject<ChartJS | null>>;

const App = () => {
  // State
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [sortConfig, setSortConfig] = useState<SortConfig<TransactionSortKey>>({
    key: "date",
    direction: "desc",
  });
  const [drilldownCategory, setDrilldownCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const transactionsPerPage = 25;

  // Chart refs for download functionality
  const chartRefs: ChartRefMap = {
    doughnut: useRef<ChartJS | null>(null),
    bar: useRef<ChartJS | null>(null),
    incomeSources: useRef<ChartJS | null>(null),
    spendingByAccount: useRef<ChartJS | null>(null),
    line: useRef<ChartJS | null>(null),
    spendingByDay: useRef<ChartJS | null>(null),
    subcategoryBreakdown: useRef<ChartJS | null>(null),
    treemap: useRef<ChartJS | null>(null),
    enhancedSubcategoryBreakdown: useRef<ChartJS | null>(null),
    multiCategoryTimeAnalysis: useRef<ChartJS | null>(null),
    netWorth: useRef<ChartJS | null>(null),
    cumulativeCategoryTrend: useRef<ChartJS | null>(null),
    seasonalSpendingHeatmap: useRef<ChartJS | null>(null),
    yearOverYearComparison: useRef<ChartJS | null>(null),
    spendingForecast: useRef<ChartJS | null>(null),
    accountBalanceProgression: useRef<ChartJS | null>(null),
    dayWeekSpendingPatterns: useRef<ChartJS | null>(null),
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
  const handleSort = (key: TransactionSortKey) => {
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
            <OverviewPage
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
            <IncomeExpensePage
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
            <CategoryAnalysisPage
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
            <TrendsForecastsPage
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
            <PatternsPage filteredData={filteredData} />
          </Suspense>
        </TabContent>

        <TabContent isActive={activeTab === "transactions"}>
          <Suspense fallback={<SectionSkeleton />}>
            <TransactionsPage
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
