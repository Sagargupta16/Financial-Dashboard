# Changelog

## [1.2.0] - 2026-04-08

### UI Modernization
- Simplify Header: remove excessive animations (pulse, blur circles, shimmer), clean single-surface card
- Modernize tab navigation: remove shimmer on active tabs, fix misleading mobile "Swipe to explore" text
- Polish KPI cards: replace 5-layer hover effects with clean left accent bar design
- Standardize Overview page sections: consistent card surfaces, unified icon badges, typography hierarchy
- Remove emoji from headings and status messages across Overview page path

### Repository Cleanup
- Remove 22MB lint-output.json from tracked files
- Remove obsolete ESLint/Prettier configs (project uses Biome)
- Remove npm package-lock.json (project uses pnpm)
- Remove tracked .vscode/settings.json and build/ directory
- Update .gitignore: add .mcp.json, .vscode/, lint-output.json, package-lock.json, .python-version

### Bug Fixes
- Fix vite.config.ts build failure: dynamic import for ESM-only rollup-plugin-visualizer

## [1.1.0] - 2026-03-07

- Add pnpm lockfile and resolve security vulnerabilities
- Configure Renovate for monthly grouped updates

## [1.0.0] - 2026-01-09

- Complete TypeScript migration (Phase 3)
- Migrate state management to Zustand 5
- Implement tax planning logic (India FY)
- 9 analytics tabs: overview, income/expense, categories, trends, investments, tax, budget, cash flow, net worth
- Chart.js + D3 visualizations with Sankey diagrams
- Deploy to GitHub Pages via GitHub Actions

## [0.2.0] - 2025-09-01

- Add advanced analytics: seasonal heatmap, YoY comparison, spending forecast, account balance progression, day-of-week patterns
- Add Excel file upload support
- Add Account Balances Card component
- GitHub Pages deployment workflow

## [0.1.0] - 2025-08-31

- Initial React financial dashboard
- Basic chart components and data parsing
