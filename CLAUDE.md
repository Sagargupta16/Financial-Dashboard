# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Dev server on port 3000 with HMR
pnpm build            # tsc + vite build to dist/
pnpm type-check       # TypeScript strict check (no emit)
pnpm lint             # Biome lint on src/
pnpm lint:fix         # Auto-fix lint issues
pnpm check:fix        # Auto-fix lint + format
pnpm format           # Biome format (100 char width, double quotes, 2-space indent)
pnpm build:analyze    # Build with bundle visualizer (ANALYZE=true)
```

Tests exist in `src/lib/analytics/*.test.ts` but the test runner script is a placeholder (`pnpm test:run` echoes a message). Test framework is Vitest with @testing-library/react.

## Architecture

React 19 + TypeScript + Vite + Zustand + TailwindCSS + Chart.js. Deployed to GitHub Pages at `/Financial-Dashboard/`.

### Data Flow

CSV/Excel upload -> `useDataProcessor` (parses file, handles dual CSV formats + Excel serial dates) -> Zustand store (`financialStore.ts`) -> `useFilteredData` (memoized sort/filter) -> feature hooks (`useKPIData`, `useChartData`, `useKeyInsights`) -> page components.

All computation happens in hooks/lib, not in components. Pages receive computed data as props from `App.tsx`.

### Code Organization

- **`src/app/App.tsx`** - Orchestrator: registers Chart.js, manages tab state, lazy-loads all 11 pages, wires data through hooks to pages via props
- **`src/features/`** - Feature modules (analytics, budget, charts, kpi, transactions), each with components/, hooks/, and utils/
- **`src/pages/`** - Lazy-loaded page components, one per tab
- **`src/lib/`** - Core logic: calculations/, analytics/, formatters/, parsers/, charts/, validators/
- **`src/store/financialStore.ts`** - Zustand store with localStorage persistence (only budgetPreferences persisted). Individual selector hooks exported (useTransactions, useLoading, etc.)
- **`src/components/ui/`** - Shadcn/ui primitives (new-york style) + custom components
- **`src/hooks/`** - Global hooks. `useDataProcessor.tsx` (355 lines) is the central data ingestion hook
- **`src/types/index.ts`** - All TypeScript types (540+ lines)
- **`src/constants/index.ts`** - Tax slabs, budget defaults, account categorization keywords

### Path Aliases

`@/*` -> `src/*`, plus `@components`, `@features`, `@pages`, `@hooks`, `@utils`, `@lib`, `@types`, `@config`, `@contexts`, `@constants`. Configured in both tsconfig.json and vite.config.ts.

### Navigation

Tab-based (not route-based). `App.tsx` manages `activeTab` state with `CustomTabs` component. 11 tabs defined in `src/config/tabs.tsx`. React Router exists but only for the base route and GitHub Pages redirect.

### Account Categorization Logic

Keywords in `src/constants/index.ts` classify accounts into Cash (bank, upi, gpay, phonepe, paytm), Investments (grow, stock, mutual, zerodha -- excludes "fam"/"friend"), Deposits (friend, family, loan, property), and Debt (credit card with negative balance). This drives the net balance breakdown on the Overview page.

## Code Style

- **Biome** handles both linting and formatting (no ESLint/Prettier)
- `useImportType: error` -- use `import type` for type-only imports
- Pre-commit hook runs `biome check --write` via husky + lint-staged
- Functional components only, hooks for all logic
- Heavy `useMemo`/`useCallback` in data computation hooks
- Some files use `// @ts-nocheck` (OverviewPage, MainKPISection) -- legacy, avoid adding more

## Build Configuration

Vite config uses async `defineConfig` to dynamically import the ESM-only `rollup-plugin-visualizer`. Manual chunk splitting: react-vendor, chart-vendor, d3-vendor, radix-vendor, icons, state-vendor, plus feature-based chunks (analytics, budget, charts). Console logs stripped in production via terser.

## CI/CD

- **CI** (.github/workflows/ci.yml): pnpm install --frozen-lockfile -> lint -> type-check -> test:run -> build
- **Deploy** (.github/workflows/deploy.yml): builds on push to main, deploys dist/ to GitHub Pages
- **Renovate**: monthly grouped dependency updates (1st of month)
