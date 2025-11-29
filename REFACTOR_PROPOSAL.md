# Financial Dashboard - Folder Structure Refactoring Proposal

**Date**: November 29, 2025  
**Type**: Structure-Only Refactor (No Logic Changes)  
**Goal**: Clean, modern, maintainable React + JavaScript architecture

---

## Table of Contents

1. [Current Issues](#current-issues)
2. [Proposed Structure](#proposed-structure)
3. [Detailed File Migration Plan](#detailed-file-migration-plan)
4. [Import Path Updates](#import-path-updates)
5. [Benefits](#benefits)
6. [Implementation Strategy](#implementation-strategy)

---

## Current Issues

### 1. **Inconsistent Component Organization**

- ❌ Sections mixed with UI components in `shared/components/`
- ❌ Page-level sections in `shared/` instead of feature-specific
- ❌ `OverviewSection`, `IncomeExpenseSection` are page sections, not shared components

### 2. **Mixed Utils Structure**

- ❌ Both `calculations.js` AND `calculations/` folder exist
- ❌ `financialCalculations.js` (1170 lines) should be modularized
- ❌ Generic utils mixed with domain-specific utils

### 3. **Features vs Shared Confusion**

- ❌ `TransactionsSection` in features, but other sections in shared
- ❌ Budget, Analytics, Charts features incomplete (missing pages)
- ❌ No clear distinction between feature components and shared components

### 4. **Deep Import Paths**

- ❌ Imports like `../../../shared/utils/dataUtils`
- ❌ Inconsistent relative path depths
- ❌ Hard to refactor or move files

### 5. **Missing Standard Directories**

- ❌ No `pages/` directory (App.js handles everything)
- ❌ No `lib/` for external integrations
- ❌ No `services/` for data fetching logic
- ❌ No `constants/` directory (mixed in utils)

---

## Proposed Structure

### ✅ **Ideal Final Structure**

```
src/
├── app/                          # Application root & routing
│   ├── App.js                    # Main app component (moved from src/)
│   └── index.js                  # Entry point (moved from src/)
│
├── pages/                        # Page-level components
│   ├── OverviewPage/
│   │   ├── index.js
│   │   ├── OverviewPage.js       # Main overview page
│   │   └── components/           # Page-specific components
│   │       ├── MainKPISection.js
│   │       ├── AccountBalancesCard.js
│   │       └── SmartInsightsPanel.js
│   │
│   ├── IncomeExpensePage/
│   │   ├── index.js
│   │   └── IncomeExpensePage.js
│   │
│   ├── CategoryAnalysisPage/
│   │   ├── index.js
│   │   └── CategoryAnalysisPage.js
│   │
│   ├── ChartsPage/
│   │   ├── index.js
│   │   └── ChartsPage.js
│   │
│   ├── BudgetPage/
│   │   ├── index.js
│   │   └── BudgetPage.js
│   │
│   ├── PatternsPage/
│   │   ├── index.js
│   │   └── PatternsPage.js
│   │
│   ├── TransactionsPage/
│   │   ├── index.js
│   │   └── TransactionsPage.js
│   │
│   ├── AdvancedAnalyticsPage/
│   │   ├── index.js
│   │   └── AdvancedAnalyticsPage.js
│   │
│   └── TrendsForecastsPage/
│       ├── index.js
│       └── TrendsForecastsPage.js
│
├── features/                     # Feature-based modules
│   ├── analytics/
│   │   ├── components/
│   │   │   ├── CreditCardFoodOptimizer.js
│   │   │   ├── FamilyHousingManager.js
│   │   │   ├── InvestmentPerformanceTracker.js
│   │   │   ├── TaxPlanningDashboard.js
│   │   │   └── index.js
│   │   └── hooks/
│   │       └── useAdvancedAnalytics.js
│   │
│   ├── budget/
│   │   ├── components/
│   │   │   ├── BudgetGoalsSection.js
│   │   │   ├── BudgetPlanner.js
│   │   │   ├── RecurringPayments.js
│   │   │   └── index.js
│   │   ├── hooks/
│   │   │   └── useBudgetCalculations.js
│   │   └── utils/
│   │       └── budgetUtils.js
│   │
│   ├── charts/
│   │   ├── components/
│   │   │   ├── BasicCharts.js
│   │   │   ├── ChartCard.js
│   │   │   ├── ChartComponents.js
│   │   │   ├── ChartConfig.js
│   │   │   ├── EnhancedCharts.js
│   │   │   ├── SmartInsightsPanel.js
│   │   │   ├── TrendCharts.js
│   │   │   ├── TreemapChart.js
│   │   │   └── index.js
│   │   ├── hooks/
│   │   │   ├── useChartData.js
│   │   │   └── useChartHooks.js
│   │   └── utils/
│   │       └── chartConfig.js
│   │
│   ├── transactions/
│   │   ├── components/
│   │   │   ├── TransactionTable.js
│   │   │   ├── TransactionsSection.js
│   │   │   └── index.js
│   │   └── utils/
│   │       └── csvUtils.js
│   │
│   └── kpi/                      # NEW: KPI feature module
│       ├── components/
│       │   ├── KPICard.js
│       │   ├── SmallKPICard.js
│       │   ├── KPISections.js
│       │   └── index.js
│       └── hooks/
│           ├── useCalculations.js
│           └── useKPIData.js
│
├── components/                   # Truly shared/reusable components
│   ├── layout/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── index.js
│   │
│   ├── ui/                       # Generic UI components
│   │   ├── Loading.js
│   │   ├── Skeleton.js
│   │   ├── SectionSkeleton.js
│   │   ├── Tabs.js
│   │   ├── Toast.js
│   │   └── index.js
│   │
│   ├── data-display/             # NEW: Data display components
│   │   ├── FinancialHealthScore.js
│   │   ├── SpendingCalendar.js
│   │   ├── ChartUIComponents.js
│   │   └── index.js
│   │
│   ├── import-export/            # NEW: I/O components
│   │   ├── CSVImportExport.js
│   │   └── index.js
│   │
│   └── errors/
│       ├── EnhancedErrorBoundary.js
│       └── index.js
│
├── hooks/                        # Shared hooks only
│   ├── useDataProcessor.js
│   ├── useDebouncedValue.js
│   └── index.js
│
├── lib/                          # NEW: External integrations & utilities
│   ├── calculations/             # Core calculation engine
│   │   ├── financial/
│   │   │   ├── investments.js
│   │   │   ├── taxes.js
│   │   │   ├── budgets.js
│   │   │   ├── savings.js
│   │   │   └── index.js
│   │   ├── aggregations/
│   │   │   ├── totals.js
│   │   │   ├── averages.js
│   │   │   ├── category.js
│   │   │   └── index.js
│   │   ├── time/
│   │   │   ├── dateRange.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── analytics/                # NEW: Analytics engine
│   │   ├── insights.js
│   │   ├── trends.js
│   │   ├── forecasts.js
│   │   ├── healthScore.js
│   │   └── index.js
│   │
│   ├── charts/                   # Chart utilities
│   │   ├── config.js
│   │   ├── formatters.js
│   │   ├── exporters.js
│   │   └── index.js
│   │
│   └── data/                     # Data utilities
│       ├── parsers.js
│       ├── validators.js
│       ├── transformers.js
│       └── index.js
│
├── utils/                        # General utilities
│   ├── accessibility.js
│   ├── lazyLoad.js
│   ├── localStorage.js
│   ├── logger.js
│   ├── performance.js
│   └── index.js
│
├── constants/                    # NEW: All constants
│   ├── financial.js              # Tax rates, limits, etc.
│   ├── ui.js                     # UI constants
│   ├── calculations.js           # PERCENT, DAYS_PER_MONTH
│   ├── categories.js             # Investment categories, etc.
│   └── index.js
│
├── config/                       # Application config
│   ├── tabs.js                   # Renamed from tabs.config.js
│   ├── overview.js               # Renamed from overview.config.js
│   └── index.js
│
├── contexts/                     # React contexts
│   ├── DataContext.js
│   └── index.js
│
├── styles/                       # NEW: Styles directory
│   └── index.css                 # Global styles
│
└── types/                        # NEW: JSDoc types or TypeScript (future)
    └── financial.js              # Type definitions
```

---

## Detailed File Migration Plan

### Phase 1: Create New Directory Structure

```powershell
# Create new directories
New-Item -Path "src/app" -ItemType Directory
New-Item -Path "src/pages" -ItemType Directory
New-Item -Path "src/pages/OverviewPage/components" -ItemType Directory
New-Item -Path "src/pages/IncomeExpensePage" -ItemType Directory
New-Item -Path "src/pages/CategoryAnalysisPage" -ItemType Directory
New-Item -Path "src/pages/ChartsPage" -ItemType Directory
New-Item -Path "src/pages/BudgetPage" -ItemType Directory
New-Item -Path "src/pages/PatternsPage" -ItemType Directory
New-Item -Path "src/pages/TransactionsPage" -ItemType Directory
New-Item -Path "src/pages/AdvancedAnalyticsPage" -ItemType Directory
New-Item -Path "src/pages/TrendsForecastsPage" -ItemType Directory
New-Item -Path "src/components/layout" -ItemType Directory
New-Item -Path "src/components/ui" -ItemType Directory
New-Item -Path "src/components/data-display" -ItemType Directory
New-Item -Path "src/components/import-export" -ItemType Directory
New-Item -Path "src/components/errors" -ItemType Directory
New-Item -Path "src/hooks" -ItemType Directory
New-Item -Path "src/lib/calculations/financial" -ItemType Directory
New-Item -Path "src/lib/calculations/aggregations" -ItemType Directory
New-Item -Path "src/lib/calculations/time" -ItemType Directory
New-Item -Path "src/lib/analytics" -ItemType Directory
New-Item -Path "src/lib/charts" -ItemType Directory
New-Item -Path "src/lib/data" -ItemType Directory
New-Item -Path "src/utils" -ItemType Directory
New-Item -Path "src/constants" -ItemType Directory
New-Item -Path "src/contexts" -ItemType Directory
New-Item -Path "src/styles" -ItemType Directory
New-Item -Path "src/features/kpi/components" -ItemType Directory
New-Item -Path "src/features/kpi/hooks" -ItemType Directory
New-Item -Path "src/features/analytics/hooks" -ItemType Directory
New-Item -Path "src/features/budget/hooks" -ItemType Directory
New-Item -Path "src/features/charts/hooks" -ItemType Directory
New-Item -Path "src/features/charts/utils" -ItemType Directory
```

### Phase 2: File Migrations

#### App Entry Points

| Current Path    | New Path               | Reason             |
| --------------- | ---------------------- | ------------------ |
| `src/index.js`  | `src/app/index.js`     | App entry point    |
| `src/App.js`    | `src/app/App.js`       | Main app component |
| `src/index.css` | `src/styles/index.css` | Global styles      |

#### Page Components (from shared/components/sections/)

| Current Path                                              | New Path                                               | Type |
| --------------------------------------------------------- | ------------------------------------------------------ | ---- |
| `shared/components/sections/OverviewSection.js`           | `pages/OverviewPage/OverviewPage.js`                   | Page |
| `shared/components/sections/IncomeExpenseSection.js`      | `pages/IncomeExpensePage/IncomeExpensePage.js`         | Page |
| `shared/components/sections/CategoryAnalysisSection.js`   | `pages/CategoryAnalysisPage/CategoryAnalysisPage.js`   | Page |
| `shared/components/sections/AdvancedAnalyticsSection.js`  | `pages/AdvancedAnalyticsPage/AdvancedAnalyticsPage.js` | Page |
| `shared/components/sections/TrendsForecastsSection.js`    | `pages/TrendsForecastsPage/TrendsForecastsPage.js`     | Page |
| `shared/components/sections/PatternsSection.js`           | `pages/PatternsPage/PatternsPage.js`                   | Page |
| `features/transactions/components/TransactionsSection.js` | `pages/TransactionsPage/TransactionsPage.js`           | Page |

#### Page-Specific Components

| Current Path                                   | New Path                                               | Reason                |
| ---------------------------------------------- | ------------------------------------------------------ | --------------------- |
| `shared/components/sections/MainKPISection.js` | `pages/OverviewPage/components/MainKPISection.js`      | Used only in Overview |
| `shared/components/ui/AccountBalancesCard.js`  | `pages/OverviewPage/components/AccountBalancesCard.js` | Used only in Overview |
| `shared/components/sections/KPISections.js`    | `features/kpi/components/KPISections.js`               | KPI feature           |
| `shared/components/sections/index.js`          | ❌ DELETE                                              | No longer needed      |

#### Shared Components Reorganization

| Current Path                                   | New Path                                          | Reason           |
| ---------------------------------------------- | ------------------------------------------------- | ---------------- |
| `shared/components/layout/Header.js`           | `components/layout/Header.js`                     | Layout component |
| `shared/components/layout/Footer.js`           | `components/layout/Footer.js`                     | Layout component |
| `shared/components/ui/Loading.js`              | `components/ui/Loading.js`                        | Generic UI       |
| `shared/components/ui/Skeleton.js`             | `components/ui/Skeleton.js`                       | Generic UI       |
| `shared/components/ui/SectionSkeleton.js`      | `components/ui/SectionSkeleton.js`                | Generic UI       |
| `shared/components/ui/Tabs.js`                 | `components/ui/Tabs.js`                           | Generic UI       |
| `shared/components/ui/Toast.js`                | `components/ui/Toast.js`                          | Generic UI       |
| `shared/components/ui/KPICards.js`             | `features/kpi/components/KPICards.js`             | KPI feature      |
| `shared/components/ui/FinancialHealthScore.js` | `components/data-display/FinancialHealthScore.js` | Data display     |
| `shared/components/ui/SpendingCalendar.js`     | `components/data-display/SpendingCalendar.js`     | Data display     |
| `shared/components/ui/ChartUIComponents.js`    | `components/data-display/ChartUIComponents.js`    | Data display     |
| `shared/components/ui/CSVImportExport.js`      | `components/import-export/CSVImportExport.js`     | I/O component    |
| `shared/components/EnhancedErrorBoundary.js`   | `components/errors/EnhancedErrorBoundary.js`      | Error handling   |

#### Hooks Reorganization

| Current Path                           | New Path                                           | Reason             |
| -------------------------------------- | -------------------------------------------------- | ------------------ |
| `shared/hooks/useDataProcessor.js`     | `hooks/useDataProcessor.js`                        | Shared hook        |
| `shared/hooks/useDebouncedValue.js`    | `hooks/useDebouncedValue.js`                       | Shared hook        |
| `shared/hooks/useCalculations.js`      | `features/kpi/hooks/useCalculations.js`            | KPI-specific       |
| `shared/hooks/useAdvancedAnalytics.js` | `features/analytics/hooks/useAdvancedAnalytics.js` | Analytics-specific |
| `shared/hooks/useChartData.js`         | `features/charts/hooks/useChartData.js`            | Charts-specific    |
| `shared/hooks/useChartHooks.js`        | `features/charts/hooks/useChartHooks.js`           | Charts-specific    |

#### Utils → Lib Migration (Break up large files)

| Current Path                                          | New Path                                    | Reason                          |
| ----------------------------------------------------- | ------------------------------------------- | ------------------------------- |
| `shared/utils/constants.js`                           | Split into multiple files ⬇️                | Too large                       |
| → Financial constants                                 | `constants/financial.js`                    | Tax rates, limits               |
| → Calculation constants                               | `constants/calculations.js`                 | PERCENT, DAYS_PER_MONTH         |
| → Category constants                                  | `constants/categories.js`                   | Investment categories           |
| → UI constants                                        | `constants/ui.js`                           | UI thresholds                   |
| `shared/utils/financialCalculations.js` (1170 lines!) | Split into modules ⬇️                       | Monolithic                      |
| → Investment calculations                             | `lib/calculations/financial/investments.js` | Investment logic                |
| → Tax calculations                                    | `lib/calculations/financial/taxes.js`       | Tax logic                       |
| → Budget calculations                                 | `lib/calculations/financial/budgets.js`     | Budget logic                    |
| → Savings calculations                                | `lib/calculations/financial/savings.js`     | Already exists in calculations/ |
| `shared/utils/calculations.js`                        | `lib/calculations/index.js`                 | Main export                     |
| `shared/utils/calculations/aggregations.js`           | `lib/calculations/aggregations/totals.js`   | Aggregation logic               |
| `shared/utils/calculations/averages.js`               | `lib/calculations/aggregations/averages.js` | Average calculations            |
| `shared/utils/calculations/category.js`               | `lib/calculations/aggregations/category.js` | Category calculations           |
| `shared/utils/calculations/dateRange.js`              | `lib/calculations/time/dateRange.js`        | Time calculations               |
| `shared/utils/calculations/savings.js`                | `lib/calculations/financial/savings.js`     | Financial calculations          |
| `shared/utils/calculations/index.js`                  | `lib/calculations/index.js`                 | Main export                     |
| `shared/utils/insightsGenerator.js`                   | `lib/analytics/insights.js`                 | Analytics                       |
| `shared/utils/trendInsights.js`                       | `lib/analytics/trends.js`                   | Analytics                       |
| `shared/utils/forecastUtils.js`                       | `lib/analytics/forecasts.js`                | Analytics                       |
| `shared/utils/healthScoreHelpers.js`                  | `lib/analytics/healthScore.js`              | Analytics                       |
| `shared/utils/metricHelpers.js`                       | `lib/analytics/metrics.js`                  | Analytics                       |
| `shared/utils/chartUtils.js`                          | Split into ⬇️                               | Chart utilities                 |
| → Chart config                                        | `lib/charts/config.js`                      | Configuration                   |
| → Chart formatters                                    | `lib/charts/formatters.js`                  | Data formatting                 |
| → Chart exporters                                     | `lib/charts/exporters.js`                   | Export functionality            |
| `shared/utils/dataUtils.js`                           | Split into ⬇️                               | Data utilities                  |
| → Parsers                                             | `lib/data/parsers.js`                       | Parsing logic                   |
| → Formatters                                          | `lib/data/formatters.js`                    | Formatting logic                |
| → Transformers                                        | `lib/data/transformers.js`                  | Transformation logic            |
| `shared/utils/dataValidation.js`                      | `lib/data/validators.js`                    | Data validation                 |
| `shared/utils/accessibility.js`                       | `utils/accessibility.js`                    | General utility                 |
| `shared/utils/lazyLoad.js`                            | `utils/lazyLoad.js`                         | General utility                 |
| `shared/utils/localStorage.js`                        | `utils/localStorage.js`                     | General utility                 |
| `shared/utils/logger.js`                              | `utils/logger.js`                           | General utility                 |
| `shared/utils/performanceMonitor.js`                  | `utils/performance.js`                      | General utility                 |

#### Context

| Current Path                     | New Path                  | Reason  |
| -------------------------------- | ------------------------- | ------- |
| `shared/contexts/DataContext.js` | `contexts/DataContext.js` | Context |

#### Config

| Current Path                | New Path             | Reason         |
| --------------------------- | -------------------- | -------------- |
| `config/tabs.config.js`     | `config/tabs.js`     | Cleaner naming |
| `config/overview.config.js` | `config/overview.js` | Cleaner naming |

#### Features (Already Well-Organized)

| Current Path                              | New Path      | Changes          |
| ----------------------------------------- | ------------- | ---------------- |
| `features/analytics/components/*`         | ✅ Keep as-is | Well organized   |
| `features/budget/components/*`            | ✅ Keep as-is | Well organized   |
| `features/charts/components/*`            | ✅ Keep as-is | Well organized   |
| `features/transactions/components/*`      | ✅ Keep as-is | Well organized   |
| `features/transactions/utils/csvUtils.js` | ✅ Keep as-is | Feature-specific |
| `features/budget/utils/budgetUtils.js`    | ✅ Keep as-is | Feature-specific |

---

## Import Path Updates

### Example: Before → After

#### Before (Deep Nested Paths)

```javascript
// In: src/features/charts/components/ChartCard.js
import { downloadChart } from "../../../shared/utils/dataUtils";
import { formatCurrency } from "../../../shared/utils/chartUtils";
import logger from "../../../shared/utils/logger";
```

#### After (Clean Absolute Imports)

```javascript
// In: src/features/charts/components/ChartCard.js
import { downloadChart } from "@/lib/data/transformers";
import { formatCurrency } from "@/lib/charts/formatters";
import logger from "@/utils/logger";
```

### Import Alias Configuration (jsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/app/*": ["app/*"],
      "@/pages/*": ["pages/*"],
      "@/features/*": ["features/*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/lib/*": ["lib/*"],
      "@/utils/*": ["utils/*"],
      "@/constants/*": ["constants/*"],
      "@/config/*": ["config/*"],
      "@/contexts/*": ["contexts/*"],
      "@/styles/*": ["styles/*"]
    }
  },
  "include": ["src"]
}
```

### Import Pattern Examples

| Old Import                               | New Import                             |
| ---------------------------------------- | -------------------------------------- |
| `../../../shared/utils/dataUtils`        | `@/lib/data/parsers`                   |
| `../../hooks/useCalculations`            | `@/features/kpi/hooks/useCalculations` |
| `../ui/KPICards`                         | `@/features/kpi/components/KPICards`   |
| `../../utils/constants`                  | `@/constants/financial`                |
| `./shared/components/layout/Header`      | `@/components/layout/Header`           |
| `../../../shared/hooks/useDataProcessor` | `@/hooks/useDataProcessor`             |

---

## Benefits

### 1. **Clear Separation of Concerns**

- ✅ Pages are distinct from components
- ✅ Features are self-contained modules
- ✅ Shared components are truly reusable
- ✅ Utils are organized by domain

### 2. **Improved Developer Experience**

- ✅ No more `../../../` hell
- ✅ Consistent import patterns
- ✅ Easy to locate files
- ✅ Clear file ownership

### 3. **Better Scalability**

- ✅ Easy to add new pages
- ✅ Features can be extracted as packages
- ✅ Lib can be shared across projects
- ✅ Clear boundaries for code splitting

### 4. **Maintainability**

- ✅ Smaller, focused files
- ✅ No more 1170-line files
- ✅ Clear dependencies
- ✅ Easier refactoring

### 5. **Industry Standard**

- ✅ Follows React best practices
- ✅ Similar to Next.js structure
- ✅ Familiar to new developers
- ✅ Easy onboarding

---

## Implementation Strategy

### Step 1: Preparation (No Breaking Changes)

1. ✅ Create all new directories
2. ✅ Update `jsconfig.json` with path aliases
3. ✅ Create index.js exports for all modules

### Step 2: Migration (Phase by Phase)

1. **Phase A**: Constants & Config (easiest)
   - Move constants to `constants/`
   - Rename config files
   - Update imports

2. **Phase B**: Lib/Utils (core logic)
   - Split `financialCalculations.js`
   - Split `constants.js`
   - Split `chartUtils.js`
   - Split `dataUtils.js`
   - Move other utils

3. **Phase C**: Components (UI structure)
   - Move layout components
   - Move generic UI components
   - Move data-display components
   - Move error components

4. **Phase D**: Hooks (business logic)
   - Move shared hooks
   - Move feature-specific hooks

5. **Phase E**: Pages (final step)
   - Convert sections to pages
   - Move page-specific components
   - Update App.js routing

6. **Phase F**: Features (polish)
   - Add feature hooks
   - Ensure feature isolation

### Step 3: Cleanup

1. ✅ Delete old `shared/` directory
2. ✅ Delete empty directories
3. ✅ Update all imports
4. ✅ Run build verification
5. ✅ Run audit verification script

### Step 4: Validation

```powershell
# Verify build
pnpm run build

# Verify calculations still work
node audit/scripts/verify-calculations.js --verbose

# Check for unused files
pnpm run analyze # (if available)
```

---

## Risk Mitigation

### Low Risk

- ✅ No logic changes
- ✅ Only file moves and import updates
- ✅ Can be done incrementally
- ✅ Easy to revert per phase

### Testing Strategy

1. Build after each phase
2. Verify app runs in browser
3. Run verification script
4. Check all tabs load
5. Test CSV import/export

### Rollback Plan

- Git commit after each phase
- Can revert individual phases
- Keep old structure until verified

---

## Next Steps

1. **Review this proposal** - Confirm structure meets requirements
2. **Approve phases** - Which phases to execute first
3. **Execute migration** - Follow implementation strategy
4. **Verify & test** - Build, run, validate
5. **Document** - Update README with new structure

---

## Summary

This refactoring transforms the Financial Dashboard from a mixed structure into a clean, modern, industry-standard React architecture:

- **9 new page components** (instead of sections)
- **5 clear top-level directories** (app, pages, features, components, lib)
- **No more 1000+ line files** (split into focused modules)
- **Clean import paths** (using aliases)
- **Better feature isolation** (self-contained modules)
- **Easier maintenance** (clear file ownership)

**Total files to move**: ~80 files  
**Estimated time**: 2-3 hours (with testing)  
**Risk level**: Low (structure-only changes)  
**Reversibility**: High (git revert per phase)
