/**
 * KPI Feature - Barrel Export
 * Provides centralized exports for KPI components and calculations
 */

// Components
export { KPICard, SmallKPICard } from "./components/KPICards";
export { AdvancedAnalyticsKPISection, SecondaryKPISection } from "./components/KPISections";

// Hooks
export {
  useAccountBalances,
  useKeyInsights,
  useKPIData,
} from "./hooks/useCalculations";
