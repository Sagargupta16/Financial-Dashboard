/**
 * Pages - Barrel Export
 * Centralized exports for all page components
 * Note: These are lazy-loaded in App.tsx, so direct imports from this file may not be used
 */

export { AdvancedAnalyticsDashboard as AdvancedAnalyticsPage } from "./AdvancedAnalyticsPage/AdvancedAnalyticsPage";
export { CategoryAnalysisPage } from "./CategoryAnalysisPage/CategoryAnalysisPage";
export { IncomeExpensePage } from "./IncomeExpensePage/IncomeExpensePage";
// Re-export page components
export { OverviewPage } from "./OverviewPage/OverviewPage";
export { PatternsPage } from "./PatternsPage/PatternsPage";
export { TransactionsPage } from "./TransactionsPage/TransactionsPage";
export { TrendsForecastsPage } from "./TrendsForecastsPage/TrendsForecastsPage";
