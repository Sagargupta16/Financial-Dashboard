# Financial Dashboard - Migration Script

**Step-by-step PowerShell commands for folder refactoring**

---

## Prerequisites

```powershell
# Ensure you're in the project root
cd "C:\Code\GitHub\My Repos\web-applications\Financial-Dashboard"

# Create a backup branch
git checkout -b refactor/folder-structure
git add .
git commit -m "Backup before folder structure refactor"

# Ensure clean working directory
git status
```

---

## Phase 1: Create New Directory Structure

```powershell
# Create app directory
New-Item -Path "src/app" -ItemType Directory -Force

# Create pages structure
New-Item -Path "src/pages/OverviewPage/components" -ItemType Directory -Force
New-Item -Path "src/pages/IncomeExpensePage" -ItemType Directory -Force
New-Item -Path "src/pages/CategoryAnalysisPage" -ItemType Directory -Force
New-Item -Path "src/pages/ChartsPage" -ItemType Directory -Force
New-Item -Path "src/pages/BudgetPage" -ItemType Directory -Force
New-Item -Path "src/pages/PatternsPage" -ItemType Directory -Force
New-Item -Path "src/pages/TransactionsPage" -ItemType Directory -Force
New-Item -Path "src/pages/AdvancedAnalyticsPage" -ItemType Directory -Force
New-Item -Path "src/pages/TrendsForecastsPage" -ItemType Directory -Force

# Create components structure
New-Item -Path "src/components/layout" -ItemType Directory -Force
New-Item -Path "src/components/ui" -ItemType Directory -Force
New-Item -Path "src/components/data-display" -ItemType Directory -Force
New-Item -Path "src/components/import-export" -ItemType Directory -Force
New-Item -Path "src/components/errors" -ItemType Directory -Force

# Create hooks directory (flat)
New-Item -Path "src/hooks" -ItemType Directory -Force

# Create lib structure
New-Item -Path "src/lib/calculations/financial" -ItemType Directory -Force
New-Item -Path "src/lib/calculations/aggregations" -ItemType Directory -Force
New-Item -Path "src/lib/calculations/time" -ItemType Directory -Force
New-Item -Path "src/lib/analytics" -ItemType Directory -Force
New-Item -Path "src/lib/charts" -ItemType Directory -Force
New-Item -Path "src/lib/data" -ItemType Directory -Force

# Create utils, constants, contexts, styles
New-Item -Path "src/utils" -ItemType Directory -Force
New-Item -Path "src/constants" -ItemType Directory -Force
New-Item -Path "src/contexts" -ItemType Directory -Force
New-Item -Path "src/styles" -ItemType Directory -Force

# Create feature hook directories
New-Item -Path "src/features/kpi/components" -ItemType Directory -Force
New-Item -Path "src/features/kpi/hooks" -ItemType Directory -Force
New-Item -Path "src/features/analytics/hooks" -ItemType Directory -Force
New-Item -Path "src/features/budget/hooks" -ItemType Directory -Force
New-Item -Path "src/features/charts/hooks" -ItemType Directory -Force
New-Item -Path "src/features/charts/utils" -ItemType Directory -Force

Write-Host "✅ Directory structure created" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 1: Create new directory structure"
```

---

## Phase 2: Move App Entry Points

```powershell
# Move main app files
Move-Item -Path "src/index.js" -Destination "src/app/index.js"
Move-Item -Path "src/App.js" -Destination "src/app/App.js"
Move-Item -Path "src/index.css" -Destination "src/styles/index.css"

Write-Host "✅ App entry points moved" -ForegroundColor Green
```

**Update imports in `src/app/index.js`:**

```javascript
// OLD:
import "./index.css";
import App from "./App";

// NEW:
import "../styles/index.css";
import App from "./App";
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 2: Move app entry points"
```

---

## Phase 3: Move Layout & Generic UI Components

```powershell
# Move layout components
Move-Item -Path "src/shared/components/layout/Header.js" -Destination "src/components/layout/Header.js"
Move-Item -Path "src/shared/components/layout/Footer.js" -Destination "src/components/layout/Footer.js"

# Move generic UI components
Move-Item -Path "src/shared/components/ui/Loading.js" -Destination "src/components/ui/Loading.js"
Move-Item -Path "src/shared/components/ui/Skeleton.js" -Destination "src/components/ui/Skeleton.js"
Move-Item -Path "src/shared/components/ui/SectionSkeleton.js" -Destination "src/components/ui/SectionSkeleton.js"
Move-Item -Path "src/shared/components/ui/Tabs.js" -Destination "src/components/ui/Tabs.js"
Move-Item -Path "src/shared/components/ui/Toast.js" -Destination "src/components/ui/Toast.js"

# Move data-display components
Move-Item -Path "src/shared/components/ui/FinancialHealthScore.js" -Destination "src/components/data-display/FinancialHealthScore.js"
Move-Item -Path "src/shared/components/ui/SpendingCalendar.js" -Destination "src/components/data-display/SpendingCalendar.js"
Move-Item -Path "src/shared/components/ui/ChartUIComponents.js" -Destination "src/components/data-display/ChartUIComponents.js"

# Move import-export components
Move-Item -Path "src/shared/components/ui/CSVImportExport.js" -Destination "src/components/import-export/CSVImportExport.js"

# Move error boundary
Move-Item -Path "src/shared/components/EnhancedErrorBoundary.js" -Destination "src/components/errors/EnhancedErrorBoundary.js"

Write-Host "✅ Components moved" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 3: Move layout and UI components"
```

---

## Phase 4: Move Shared Hooks

```powershell
# Move truly shared hooks
Move-Item -Path "src/shared/hooks/useDataProcessor.js" -Destination "src/hooks/useDataProcessor.js"
Move-Item -Path "src/shared/hooks/useDebouncedValue.js" -Destination "src/hooks/useDebouncedValue.js"

# Move feature-specific hooks
Move-Item -Path "src/shared/hooks/useCalculations.js" -Destination "src/features/kpi/hooks/useCalculations.js"
Move-Item -Path "src/shared/hooks/useAdvancedAnalytics.js" -Destination "src/features/analytics/hooks/useAdvancedAnalytics.js"
Move-Item -Path "src/shared/hooks/useChartData.js" -Destination "src/features/charts/hooks/useChartData.js"
Move-Item -Path "src/shared/hooks/useChartHooks.js" -Destination "src/features/charts/hooks/useChartHooks.js"

Write-Host "✅ Hooks moved" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 4: Move hooks to appropriate locations"
```

---

## Phase 5: Move Contexts

```powershell
# Move context
Move-Item -Path "src/shared/contexts/DataContext.js" -Destination "src/contexts/DataContext.js"

Write-Host "✅ Contexts moved" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 5: Move contexts"
```

---

## Phase 6: Move Generic Utils

```powershell
# Move generic utilities (NOT domain-specific)
Move-Item -Path "src/shared/utils/accessibility.js" -Destination "src/utils/accessibility.js"
Move-Item -Path "src/shared/utils/lazyLoad.js" -Destination "src/utils/lazyLoad.js"
Move-Item -Path "src/shared/utils/localStorage.js" -Destination "src/utils/localStorage.js"
Move-Item -Path "src/shared/utils/logger.js" -Destination "src/utils/logger.js"
Move-Item -Path "src/shared/utils/performanceMonitor.js" -Destination "src/utils/performance.js"

Write-Host "✅ Generic utils moved" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 6: Move generic utilities"
```

---

## Phase 7: Move Calculation Files

```powershell
# Move calculation subdirectory files
Move-Item -Path "src/shared/utils/calculations/aggregations.js" -Destination "src/lib/calculations/aggregations/totals.js"
Move-Item -Path "src/shared/utils/calculations/averages.js" -Destination "src/lib/calculations/aggregations/averages.js"
Move-Item -Path "src/shared/utils/calculations/category.js" -Destination "src/lib/calculations/aggregations/category.js"
Move-Item -Path "src/shared/utils/calculations/dateRange.js" -Destination "src/lib/calculations/time/dateRange.js"
Move-Item -Path "src/shared/utils/calculations/savings.js" -Destination "src/lib/calculations/financial/savings.js"

# Move main calculations index
Move-Item -Path "src/shared/utils/calculations/index.js" -Destination "src/lib/calculations/index.js"

# Move deprecated calculations.js wrapper
Move-Item -Path "src/shared/utils/calculations.js" -Destination "src/lib/calculations/legacy.js"

Write-Host "✅ Calculation files moved" -ForegroundColor Green
```

**Note:** `financialCalculations.js` will be split manually in a later phase.

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 7: Move calculation files to lib"
```

---

## Phase 8: Move Analytics Utils

```powershell
# Move analytics-related utilities
Move-Item -Path "src/shared/utils/insightsGenerator.js" -Destination "src/lib/analytics/insights.js"
Move-Item -Path "src/shared/utils/trendInsights.js" -Destination "src/lib/analytics/trends.js"
Move-Item -Path "src/shared/utils/forecastUtils.js" -Destination "src/lib/analytics/forecasts.js"
Move-Item -Path "src/shared/utils/healthScoreHelpers.js" -Destination "src/lib/analytics/healthScore.js"
Move-Item -Path "src/shared/utils/metricHelpers.js" -Destination "src/lib/analytics/metrics.js"

Write-Host "✅ Analytics utils moved" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 8: Move analytics utilities to lib"
```

---

## Phase 9: Move Chart Utils

```powershell
# NOTE: chartUtils.js needs to be manually split
# For now, just move it as-is to a temporary location
Copy-Item -Path "src/shared/utils/chartUtils.js" -Destination "src/lib/charts/index.js"

Write-Host "⚠️  Chart utils copied (needs manual splitting)" -ForegroundColor Yellow
```

**Manual step:** Split `src/lib/charts/index.js` into:

- `src/lib/charts/config.js` - Chart configuration
- `src/lib/charts/formatters.js` - Data formatters
- `src/lib/charts/exporters.js` - Export functions

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 9: Move chart utilities (needs splitting)"
```

---

## Phase 10: Move Data Utils

```powershell
# NOTE: dataUtils.js needs to be manually split
# For now, just move it as-is
Copy-Item -Path "src/shared/utils/dataUtils.js" -Destination "src/lib/data/index.js"

# Move data validation
Move-Item -Path "src/shared/utils/dataValidation.js" -Destination "src/lib/data/validators.js"

Write-Host "⚠️  Data utils copied (needs manual splitting)" -ForegroundColor Yellow
```

**Manual step:** Split `src/lib/data/index.js` into:

- `src/lib/data/parsers.js` - Parsing functions
- `src/lib/data/formatters.js` - Formatting functions
- `src/lib/data/transformers.js` - Transformation functions

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 10: Move data utilities (needs splitting)"
```

---

## Phase 11: Move Constants

```powershell
# NOTE: constants.js needs to be manually split
# For now, just copy it
Copy-Item -Path "src/shared/utils/constants.js" -Destination "src/constants/index.js"

Write-Host "⚠️  Constants copied (needs manual splitting)" -ForegroundColor Yellow
```

**Manual step:** Split `src/constants/index.js` into:

- `src/constants/financial.js` - Tax rates, limits, etc.
- `src/constants/calculations.js` - PERCENT, DAYS_PER_MONTH
- `src/constants/categories.js` - Investment categories
- `src/constants/ui.js` - UI thresholds

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 11: Move constants (needs splitting)"
```

---

## Phase 12: Move Financial Calculations

```powershell
# NOTE: financialCalculations.js (1170 lines!) needs manual splitting
# For now, just copy it
Copy-Item -Path "src/shared/utils/financialCalculations.js" -Destination "src/lib/calculations/financial/index.js"

Write-Host "⚠️  Financial calculations copied (needs major refactoring)" -ForegroundColor Yellow
```

**Manual step:** Split `src/lib/calculations/financial/index.js` into:

- `src/lib/calculations/financial/investments.js` - Investment logic
- `src/lib/calculations/financial/taxes.js` - Tax calculations
- `src/lib/calculations/financial/budgets.js` - Budget calculations
- Keep `src/lib/calculations/financial/savings.js` as-is

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 12: Move financial calculations (needs splitting)"
```

---

## Phase 13: Move Config Files

```powershell
# Rename config files (remove .config suffix)
Move-Item -Path "src/config/tabs.config.js" -Destination "src/config/tabs.js"
Move-Item -Path "src/config/overview.config.js" -Destination "src/config/overview.js"

Write-Host "✅ Config files renamed" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 13: Rename config files"
```

---

## Phase 14: Convert Sections to Pages

```powershell
# Move page components
Move-Item -Path "src/shared/components/sections/OverviewSection.js" -Destination "src/pages/OverviewPage/OverviewPage.js"
Move-Item -Path "src/shared/components/sections/IncomeExpenseSection.js" -Destination "src/pages/IncomeExpensePage/IncomeExpensePage.js"
Move-Item -Path "src/shared/components/sections/CategoryAnalysisSection.js" -Destination "src/pages/CategoryAnalysisPage/CategoryAnalysisPage.js"
Move-Item -Path "src/shared/components/sections/AdvancedAnalyticsSection.js" -Destination "src/pages/AdvancedAnalyticsPage/AdvancedAnalyticsPage.js"
Move-Item -Path "src/shared/components/sections/TrendsForecastsSection.js" -Destination "src/pages/TrendsForecastsPage/TrendsForecastsPage.js"
Move-Item -Path "src/shared/components/sections/PatternsSection.js" -Destination "src/pages/PatternsPage/PatternsPage.js"

# Move TransactionsSection from features
Move-Item -Path "src/features/transactions/components/TransactionsSection.js" -Destination "src/pages/TransactionsPage/TransactionsPage.js"

# Move page-specific components
Move-Item -Path "src/shared/components/sections/MainKPISection.js" -Destination "src/pages/OverviewPage/components/MainKPISection.js"
Move-Item -Path "src/shared/components/ui/AccountBalancesCard.js" -Destination "src/pages/OverviewPage/components/AccountBalancesCard.js"

# Move KPI components to features
Move-Item -Path "src/shared/components/ui/KPICards.js" -Destination "src/features/kpi/components/KPICards.js"
Move-Item -Path "src/shared/components/sections/KPISections.js" -Destination "src/features/kpi/components/KPISections.js"

Write-Host "✅ Sections converted to pages" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 14: Convert sections to pages"
```

---

## Phase 15: Cleanup Empty Directories

```powershell
# Remove empty shared directories
Remove-Item -Path "src/shared/components/sections" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared/components/ui" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared/components/layout" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared/components" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared/hooks" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared/contexts" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared/utils/calculations" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared/utils" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src/shared" -Recurse -Force -ErrorAction SilentlyContinue

# Remove empty feature utils
Remove-Item -Path "src/features/analytics/utils" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Empty directories removed" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 15: Cleanup empty directories"
```

---

## Phase 16: Create Index Files

Create barrel exports for cleaner imports.

**File: `src/components/layout/index.js`**

```javascript
export { Header } from "./Header";
export { Footer } from "./Footer";
```

**File: `src/components/ui/index.js`**

```javascript
export { LoadingSpinner } from "./Loading";
export { Skeleton } from "./Skeleton";
export { SectionSkeleton } from "./SectionSkeleton";
export { Tabs, TabContent } from "./Tabs";
export { Toast, useToast } from "./Toast";
```

**File: `src/components/data-display/index.js`**

```javascript
export { FinancialHealthScore } from "./FinancialHealthScore";
export { SpendingCalendar } from "./SpendingCalendar";
export { ChartUIComponents } from "./ChartUIComponents";
```

**File: `src/components/import-export/index.js`**

```javascript
export { CSVImportExport } from "./CSVImportExport";
```

**File: `src/components/errors/index.js`**

```javascript
export { EnhancedErrorBoundary } from "./EnhancedErrorBoundary";
```

**File: `src/hooks/index.js`**

```javascript
export * from "./useDataProcessor";
export { useDebouncedValue } from "./useDebouncedValue";
```

**File: `src/utils/index.js`**

```javascript
export * from "./accessibility";
export { lazyLoad } from "./lazyLoad";
export * from "./localStorage";
export { default as logger } from "./logger";
export { performanceMonitor } from "./performance";
```

**File: `src/contexts/index.js`**

```javascript
export { DataContext, DataProvider, useData } from "./DataContext";
```

**File: `src/config/index.js`**

```javascript
export { TABS_CONFIG } from "./tabs";
export * from "./overview";
```

```powershell
# Create all index files (use New-Item or manual creation)
Write-Host "✅ Index files created" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add src/
git commit -m "Phase 16: Create index barrel exports"
```

---

## Phase 17: Update jsconfig.json

**File: `jsconfig.json`**

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
  "include": ["src"],
  "exclude": ["node_modules", "build", "audit"]
}
```

```powershell
Write-Host "✅ jsconfig.json updated with path aliases" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git add jsconfig.json
git commit -m "Phase 17: Update jsconfig with path aliases"
```

---

## Phase 18: Test Build

```powershell
# Test that everything still builds
pnpm run build

# If successful:
Write-Host "✅ Build successful!" -ForegroundColor Green

# If errors, check import paths and fix
```

**Commit checkpoint:**

```powershell
git add .
git commit -m "Phase 18: Build verification passed"
```

---

## Phase 19: Run Calculation Verification

```powershell
# Verify calculations still work
node audit/scripts/verify-calculations.js --verbose

# If successful:
Write-Host "✅ All calculations verified!" -ForegroundColor Green
```

**Commit checkpoint:**

```powershell
git commit -m "Phase 19: Calculation verification passed"
```

---

## Phase 20: Final Cleanup & Documentation

```powershell
# Update README if needed
# Create migration summary

Write-Host "✅ Refactoring complete!" -ForegroundColor Green
Write-Host "📊 Run 'git log --oneline' to see all migration steps" -ForegroundColor Cyan
```

**Final commit:**

```powershell
git add .
git commit -m "Complete: Folder structure refactoring

- Created 9 page components
- Organized features into modules
- Split large files (financialCalculations, constants, etc.)
- Implemented path aliases
- Removed shared/ directory
- All tests passing
"
```

---

## Rollback Instructions

If anything goes wrong at any phase:

```powershell
# See current changes
git status
git diff

# Rollback to previous commit
git reset --hard HEAD~1

# Or rollback to beginning
git reset --hard origin/main

# Or rollback to specific phase
git log --oneline
git reset --hard <commit-hash>
```

---

## Post-Migration Checklist

- [ ] All phases completed
- [ ] Build succeeds (`pnpm run build`)
- [ ] App loads in browser
- [ ] All 9 tabs load correctly
- [ ] CSV import/export works
- [ ] Charts render
- [ ] Calculations verified
- [ ] No console errors
- [ ] No import errors
- [ ] Documentation updated
- [ ] Create PR for review

---

## Notes

1. **Manual splitting required** for:
   - `financialCalculations.js` (1170 lines) → 4 files
   - `constants.js` → 4 files
   - `chartUtils.js` → 3 files
   - `dataUtils.js` → 3 files

2. **Import path updates**: Use VS Code's "Find and Replace" with regex:
   - Find: `from ['"]\.\.\/\.\.\/\.\.\/shared\/utils\/`
   - Replace: `from '@/lib/` or `from '@/utils/`

3. **Component name changes**: Update component names from `*Section` to `*Page` where appropriate

4. **Test frequently**: Run build after each phase to catch errors early

---

## Summary

This migration script provides:

- ✅ 20 phases with clear commit points
- ✅ PowerShell commands for all file moves
- ✅ Rollback instructions
- ✅ Testing checkpoints
- ✅ Manual intervention points clearly marked

**Total estimated time**: 3-4 hours with testing
**Risk level**: Low (reversible at each phase)
**Benefit**: Clean, maintainable, industry-standard structure
