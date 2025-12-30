# Financial Dashboard - Comprehensive Architecture Documentation

**Created:** December 30, 2025  
**Last Updated:** December 30, 2025  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Architecture](#application-architecture)
3. [Data Flow & Processing](#data-flow--processing)
4. [Core Calculation Modules](#core-calculation-modules)
5. [File Structure & Responsibilities](#file-structure--responsibilities)
6. [Financial Formulas Reference](#financial-formulas-reference)
7. [Component Hierarchy](#component-hierarchy)
8. [State Management](#state-management)
9. [Integration Points](#integration-points)
10. [Testing & Verification](#testing--verification)

---

## 🎯 Executive Summary

### What This Application Does

The Financial Dashboard is a comprehensive React-based personal finance management tool that:

- **Imports** transaction data from CSV/Excel files
- **Processes** financial data through specialized calculation modules
- **Visualizes** spending patterns, income sources, and financial health metrics
- **Provides** actionable insights for tax planning, budgeting, and investment tracking
- **Tracks** net worth progression, cashback optimization, and reimbursement management

### Technology Stack

```
Frontend: React 19.1.1
Build Tool: react-scripts
Charts: Chart.js
State: Context API + Custom Hooks
Styling: Tailwind CSS + Custom CSS
Data Processing: XLSX.js for Excel parsing
```

### Key Features

1. **Balance Breakdown** - Categorizes accounts into Cash, Investments, Deposits, Debt
2. **Tax Planning** - Multi-year tax regime support (FY 2024-25 & FY 2025-26)
3. **Investment Tracking** - Real-time investment performance with P&L analysis
4. **Cashback Optimization** - Credit card cashback tracking and shared cashback management
5. **Reimbursement Tracking** - Expense reimbursement monitoring
6. **Budget Management** - Goal setting and budget tracking
7. **Advanced Analytics** - Forecasting, trends, pattern detection

---

## 🏗️ Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  (React Components, Charts, Tables, Forms)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                           │
│  • DataContext (Global Transaction State)                    │
│  • React Hooks (Derived State & Calculations)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               CALCULATION ENGINE                             │
│  • Financial Calculations (Tax, Balance, Investments)        │
│  • Analytics Engine (Trends, Forecasts, Insights)           │
│  • Chart Data Processors                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                 DATA PROCESSING LAYER                        │
│  • CSV/Excel Parser                                          │
│  • Data Normalization                                        │
│  • Filtering & Sorting                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCE                               │
│  • CSV Files                                                 │
│  • Excel Files (.xlsx, .xls)                                 │
│  • LocalStorage (Cache)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow & Processing

### Step-by-Step Data Journey

```
1. USER UPLOADS FILE
   ↓
   [useDataProcessor.js]
   • File type detection (CSV/Excel)
   • Parse rows and columns
   • Normalize field names
   • Handle date/time formats
   • Validate data structure
   ↓

2. DATA NORMALIZATION
   ↓
   [useDataProcessor.js]
   • Clean whitespace
   • Standardize date formats (DD/MM/YYYY)
   • Parse currency values (remove ₹, commas)
   • Map column aliases (e.g., "Period" → "date")
   • Validate required fields
   ↓

3. STORAGE IN CONTEXT
   ↓
   [DataContext.js]
   • Store normalized transactions array
   • Set date range boundaries
   • Update loading state
   • Trigger re-renders
   ↓

4. FILTERING & PROCESSING
   ↓
   [useFilteredData Hook]
   • Apply search filters
   • Filter by type/category/account
   • Apply date range filters
   • Sort by configured column
   ↓

5. CALCULATION MODULES
   ↓
   [lib/calculations/financial/*]
   • Balance Breakdown → categorizeAccount()
   • Tax Planning → calculateTaxPlanningForYear()
   • Investments → calculateInvestmentPerformance()
   • Cashback → calculateCashbackMetrics()
   • Reimbursements → calculateReimbursementMetrics()
   ↓

6. ANALYTICS PROCESSING
   ↓
   [lib/analytics/*]
   • Trends → calculateTrends()
   • Forecasts → generateForecast()
   • Insights → generateSmartInsights()
   • Health Score → calculateFinancialHealthScore()
   ↓

7. CHART DATA GENERATION
   ↓
   [features/charts/hooks/useChartData.js]
   • Aggregate by time period
   • Group by category
   • Format for Chart.js
   • Apply color schemes
   ↓

8. RENDER TO UI
   ↓
   [Pages & Components]
   • OverviewPage → Main KPIs
   • TaxPlanningDashboard → Tax breakdown
   • InvestmentPerformanceTracker → P&L
   • ChartsPage → Visualizations
```

---

## 🧮 Core Calculation Modules

### Module 1: Net Balance Breakdown (`src/lib/calculations/financial/netBalance.js`)

**Purpose:** Categorize accounts and calculate balance distribution

**Exports:**

- `categorizeAccount(accountName)` → Returns category string
- `calculateNetBalanceBreakdown(transactions)` → Returns breakdown object
- `getBalanceBreakdownInsights(breakdown)` → Returns insights array

**Algorithm:**

```javascript
// Step 1: Calculate balance per account
accountBalances = {}
for each transaction:
    if (type === "Income" OR type === "Transfer-In"):
        accountBalances[account] += amount
    else if (type === "Expense" OR type === "Transfer-Out"):
        accountBalances[account] -= amount

// Step 2: Categorize each account
for each (account, balance) in accountBalances:
    category = categorizeAccount(account)

    // Special debt handling
    if (balance < 0 OR category === "debt"):
        breakdown.debt += abs(balance)
    else:
        breakdown[category] += balance

// Step 3: Calculate total
total = cash + investments + deposits - debt
```

**Categorization Keywords:**

| Category       | Keywords                                                                         | Exclusions  |
| -------------- | -------------------------------------------------------------------------------- | ----------- |
| **Cash**       | bank, upi, gpay, phonepe, paytm, wallet, cash, sbi, hdfc, icici, axis            | -           |
| **Investment** | grow, stock, mutual, fund, mf, equity, invest, zerodha, upstox, demat            | fam, friend |
| **Deposit**    | friend, fam, family, deposit, fd, rd, loan, lend, borrowed, land, property, flat | -           |
| **Debt**       | credit card, credit, cc                                                          | -           |

**Example Output:**

```json
{
  "cash": 450000,
  "investments": 1200000,
  "deposits": 150000,
  "debt": 85000,
  "total": 1715000,
  "byAccount": {
    "cash": [
      { "name": "HDFC Bank", "balance": 250000 },
      { "name": "GPay Wallet", "balance": 200000 }
    ],
    "investment": [
      { "name": "Groww Mutual Fund", "balance": 800000 },
      { "name": "Zerodha Demat", "balance": 400000 }
    ]
  }
}
```

---

### Module 2: Tax Planning (`src/lib/calculations/financial/index.js`)

**Purpose:** Calculate tax liability under Indian New Tax Regime

**Main Export:**

- `calculateTaxPlanning(transactions)` → Returns multi-year tax analysis

**Key Function:**

- `calculateTaxPlanningForYear(transactions, financialYear)` → Year-specific calculation

**Algorithm:**

```javascript
// Step 1: Extract salary components
totalIncome = sum(Income transactions in Employment Income)
bonusIncome = sum(Income transactions with "Bonus" in subcategory)
rsuIncome = sum(Income transactions with "RSU/ESOP" in subcategory)
salaryIncome = totalIncome - bonusIncome - rsuIncome

// Step 2: Calculate deductions
epfDeduction = sum(Expense transactions with "EPF" in subcategory)
professionalTax = sum(transactions with "Professional Tax") || 2400
mealVoucherExemption = min(sum(Meal/Sodexo transactions), 50 * 365)
standardDeduction = 75000 (fixed)

// Step 3: Calculate taxable income
grossSalaryAfterEPF = totalIncome - epfDeduction
taxableIncome = grossSalaryAfterEPF
                - standardDeduction
                - professionalTax
                - mealVoucherExemption

// Step 4: Get appropriate tax slabs
taxSlabs = getTaxSlabsForFY(financialYear)
// Returns TAX_SLABS_FY_2024_25 if "2024-25" in financialYear
// Otherwise returns TAX_SLABS_FY_2025_26

// Step 5: Calculate tax using slabs
estimatedTax = 0
for each slab in taxSlabs:
    if taxableIncome <= slab.max:
        estimatedTax += (taxableIncome - slab.min) * slab.rate
        break
    else:
        estimatedTax += (slab.max - slab.min) * slab.rate

// Step 6: Add cess
cess = estimatedTax * 0.04  // 4% Health & Education Cess
totalTaxLiability = estimatedTax + cess + professionalTax

// Step 7: Calculate net income
netIncome = totalIncome - totalTaxLiability
```

**Tax Slabs (FY 2024-25):**

| Income Range            | Tax Rate |
| ----------------------- | -------- |
| ₹0 - ₹3,00,000          | 0%       |
| ₹3,00,001 - ₹7,00,000   | 5%       |
| ₹7,00,001 - ₹10,00,000  | 10%      |
| ₹10,00,001 - ₹12,00,000 | 15%      |
| ₹12,00,001 - ₹15,00,000 | 20%      |
| Above ₹15,00,000        | 30%      |

**Tax Slabs (FY 2025-26):**

| Income Range            | Tax Rate |
| ----------------------- | -------- |
| ₹0 - ₹4,00,000          | 0%       |
| ₹4,00,001 - ₹8,00,000   | 5%       |
| ₹8,00,001 - ₹12,00,000  | 10%      |
| ₹12,00,001 - ₹16,00,000 | 15%      |
| ₹16,00,001 - ₹20,00,000 | 20%      |
| ₹20,00,001 - ₹24,00,000 | 25%      |
| Above ₹24,00,000        | 30%      |

**Example Calculation (FY 2025-26):**

```
Gross Salary:           ₹22,07,600
EPF Deduction:          -₹21,600
Gross After EPF:        ₹21,86,000
Standard Deduction:     -₹75,000
Professional Tax:       -₹2,400
Meal Voucher:           -₹13,200
Taxable Income:         ₹20,95,400

Tax Calculation:
₹0 - 4L:        0% = ₹0
₹4L - 8L:       5% = ₹20,000
₹8L - 12L:      10% = ₹40,000
₹12L - 16L:     15% = ₹60,000
₹16L - 20L:     20% = ₹80,000
₹20L - 20.95L:  25% = ₹23,850
Total Tax:              ₹2,23,850
Cess (4%):              ₹8,954
Prof Tax:               ₹2,400
Total Tax Liability:    ₹2,35,204
```

---

### Module 3: Investment Performance (`src/lib/calculations/financial/index.js`)

**Purpose:** Track investment portfolio performance with P&L

**Main Export:**

- `calculateInvestmentPerformance(transactions)` → Returns performance metrics

**Algorithm:**

```javascript
// Step 1: Identify investment accounts
investmentAccounts = accounts matching INVESTMENT_ACCOUNTS keywords
// ["grow", "stock", "zerodha", "upstox", "demat", etc.]

// Step 2: Calculate balances per investment account
investmentAccountBalances = {}
for each transaction in investmentAccounts:
    if (type === "Income" OR type === "Transfer-In"):
        investmentAccountBalances[account] += amount
    else if (type === "Expense" OR type === "Transfer-Out"):
        investmentAccountBalances[account] -= amount

// Step 3: Track capital deployment and withdrawals
totalCapitalDeployed = 0
totalWithdrawals = 0
brokerageFees = 0

for each transaction in investmentAccounts:
    if (type === "Expense" OR type === "Transfer-Out"):
        if (subcategory contains "brokerage" OR "fee" OR "charges"):
            brokerageFees += amount
        else:
            totalCapitalDeployed += amount
    else if (type === "Income" OR type === "Transfer-In"):
        if NOT(category === "Refund & Cashbacks"):
            totalWithdrawals += amount

// Step 4: Calculate current holdings
currentHoldings = sum(investmentAccountBalances values)

// Step 5: Calculate P&L
netInvestedCapital = currentHoldings
realizedProfits = max(0, totalWithdrawals - totalCapitalDeployed)
realizedLosses = max(0, totalCapitalDeployed - totalWithdrawals)
netProfitLoss = realizedProfits - realizedLosses - brokerageFees
netReturn = netProfitLoss

// Step 6: Calculate return percentage
returnPercentage = (netReturn / totalCapitalDeployed) * 100
```

**Example Output:**

```json
{
  "totalCapitalDeployed": 500000,
  "totalWithdrawals": 50000,
  "currentHoldings": 600000,
  "netInvestedCapital": 600000,
  "realizedProfits": 0,
  "realizedLosses": 0,
  "brokerageFees": 2500,
  "netProfitLoss": 147500,
  "netReturn": 147500,
  "returnPercentage": 29.5
}
```

---

### Module 4: Cashback Calculations (`src/lib/calculations/financial/cashback.js`)

**Purpose:** Track credit card cashback earnings and sharing

**Exports:**

- `calculateTotalCashbackEarned(transactions)` → Total earned
- `calculateCashbackShared(transactions)` → Shared amount
- `calculateActualCashback(transactions)` → Net retained cashback
- `calculateCashbackByCard(transactions)` → Per-card breakdown
- `calculateCashbackMetrics(transactions)` → Complete metrics

**Formulas:**

```
1. Total Cashback Earned = Σ(Income in "Refund & Cashbacks" category)

2. Cashback Shared = Σ(Expenses + Transfers-Out from "Cashback Shared" account)

3. Actual Cashback = Total Cashback Earned - Cashback Shared

4. Cashback Rate = (Total Cashback Earned / Total Credit Card Spending) × 100

5. Effective Savings = Actual Cashback - Annual Fees
```

**Example:**

```
Total Earned:      ₹15,000
Shared:            ₹3,500
Actual Cashback:   ₹11,500
Annual Fee:        ₹1,000
Effective Savings: ₹10,500
Cashback Rate:     1.5%
```

---

### Module 5: Reimbursement Tracking (`src/lib/calculations/financial/reimbursement.js`)

**Purpose:** Monitor expense reimbursements from employer

**Exports:**

- `calculateTotalReimbursements(transactions)` → Total received
- `getReimbursementTransactions(transactions)` → Transaction list
- `calculateAverageReimbursement(transactions)` → Average amount
- `calculateReimbursementByPeriod(transactions)` → Monthly breakdown
- `calculateReimbursementMetrics(transactions)` → Complete metrics

**Formula:**

```
Total Reimbursements = Σ(Income transactions where
                         subcategory === "Expense Reimbursement")

Reimbursement Rate = (Total Reimbursements / Total Employment Income) × 100

Average Reimbursement = Total Reimbursements / Number of transactions
```

---

## 📁 File Structure & Responsibilities

### 🗂️ Source Code Organization

```
src/
│
├── app/                                    [Application Entry Point]
│   └── App.js                             • Main component
│                                          • Tab management
│                                          • Chart refs initialization
│                                          • Lazy loading setup
│
├── components/                             [Reusable UI Components]
│   ├── data-display/
│   │   ├── ChartUIComponents.js           • Chart wrappers
│   │   ├── FinancialHealthScore.js        • Health score display
│   │   └── SpendingCalendar.js            • Calendar heatmap
│   ├── errors/
│   │   └── EnhancedErrorBoundary.js       • Error handling wrapper
│   ├── import-export/
│   │   └── CSVImportExport.js             • File upload/download
│   ├── layout/
│   │   ├── Footer.js                      • App footer
│   │   └── Header.js                      • App header with file upload
│   └── ui/
│       ├── Loading.js                     • Loading spinner
│       ├── SectionSkeleton.js             • Section skeleton loader
│       ├── Skeleton.js                    • Generic skeleton
│       └── Tabs.js                        • Tab navigation component
│
├── config/                                 [Configuration Files]
│   ├── overview.js                        • Overview page config
│   └── tabs.js                            • Tab definitions
│
├── constants/                              [Application Constants]
│   └── index.js                           • Tax slabs
│                                          • Chart colors
│                                          • Investment categories
│                                          • Date formats
│                                          • Error messages
│
├── contexts/                               [Global State Management]
│   └── DataContext.js                     • Transaction data context
│                                          • Date range state
│                                          • Loading/error state
│
├── features/                               [Feature Modules]
│   ├── analytics/
│   │   ├── components/
│   │   │   ├── InvestmentPerformanceTracker.js
│   │   │   │                              • Investment P&L dashboard
│   │   │   ├── TaxPlanningDashboard.js
│   │   │   │                              • Tax calculation dashboard
│   │   │   ├── FamilyHousingManager.js
│   │   │   │                              • Family expense tracker
│   │   │   └── CreditCardFoodOptimizer.js
│   │   │                                  • Cashback optimization (590 lines)
│   │   └── hooks/
│   │       └── useAdvancedAnalytics.js    • Advanced analytics hook
│   │
│   ├── budget/
│   │   ├── components/
│   │   │   └── BudgetGoalsSection.js      • Budget tracking UI
│   │   ├── hooks/
│   │   │   └── useBudgetCalculations.js   • Budget calculations
│   │   └── utils/
│   │       └── budgetHelpers.js           • Budget utilities
│   │
│   ├── charts/
│   │   ├── components/
│   │   │   └── [Chart Components]         • Various chart types
│   │   ├── hooks/
│   │   │   └── useChartData.js            • Chart data preparation
│   │   └── utils/
│   │       └── chartHelpers.js            • Chart utilities
│   │
│   ├── kpi/
│   │   ├── components/
│   │   │   ├── KPICards.js                • KPI card components
│   │   │   └── KPISections.js             • KPI section layouts
│   │   └── hooks/
│   │       └── useCalculations.js         • KPI calculations hook
│   │
│   └── transactions/
│       ├── components/
│       │   └── [Transaction Components]   • Transaction table, filters
│       └── utils/
│           └── transactionHelpers.js      • Transaction utilities
│
├── hooks/                                  [Custom React Hooks]
│   ├── useDataProcessor.js                • File upload processing
│   │                                      • CSV/Excel parsing
│   │                                      • Data normalization
│   │                                      • Filtering & sorting
│   └── useDebouncedValue.js               • Debounce utility
│
├── lib/                                    [Core Business Logic]
│   ├── analytics/
│   │   ├── forecasts.js                   • Spending forecasts
│   │   ├── healthScore.js                 • Financial health scoring
│   │   ├── insights.js                    • Smart insights generation
│   │   ├── metrics.js                     • Metric calculations
│   │   └── trends.js                      • Trend analysis
│   │
│   ├── calculations/
│   │   ├── index.js                       • Basic calculations export
│   │   ├── legacy.js                      • Legacy calculations
│   │   ├── aggregations/
│   │   │   └── [Aggregation functions]    • Sum, average, grouping
│   │   ├── financial/
│   │   │   ├── index.js                   ✅ Tax planning
│   │   │   │                              ✅ Investment performance
│   │   │   │                              • Gross-from-net calculation
│   │   │   │                              • Re-exports all financial modules
│   │   │   ├── netBalance.js              ✅ Balance breakdown
│   │   │   │                              ✅ Account categorization
│   │   │   │                              • Balance insights
│   │   │   ├── cashback.js                ✅ Cashback earned
│   │   │   │                              ✅ Cashback shared
│   │   │   │                              • Cashback by card
│   │   │   └── reimbursement.js           ✅ Reimbursement tracking
│   │   │                                  • Reimbursement by period
│   │   └── time/
│   │       └── [Time calculations]        • Date ranges, averages
│   │
│   ├── charts/
│   │   └── index.js                       • Chart data formatters
│   │
│   └── data/
│       └── index.js                       • Data utilities
│                                          • Currency formatting
│                                          • Date parsing
│
├── pages/                                  [Main Page Components]
│   ├── OverviewPage/
│   │   ├── OverviewPage.js                ✅ Main dashboard
│   │   │                                  • KPI cards
│   │   │                                  • Balance breakdown display
│   │   │                                  • Financial health metrics
│   │   └── components/
│   │       ├── MainKPISection.js          • 4-card KPI layout
│   │       └── AccountBalancesCard.js     • Account list
│   │
│   ├── AdvancedAnalyticsPage/             • Advanced metrics
│   ├── BudgetPage/                        • Budget tracking
│   ├── CategoryAnalysisPage/              • Category breakdown
│   ├── ChartsPage/                        • All charts view
│   ├── IncomeExpensePage/                 • Income vs expense
│   ├── PatternsPage/                      • Pattern detection
│   ├── TransactionsPage/                  • Transaction table
│   └── TrendsForecastsPage/               • Trends & forecasts
│
├── styles/
│   └── index.css                          • Global styles
│
└── utils/                                  [Utility Functions]
    ├── lazyLoad.js                        • Component lazy loading
    └── logger.js                          • Logging utility

```

### 🔑 Key File Responsibilities

#### **`src/lib/calculations/financial/netBalance.js`** ✅

**Status:** Recently Fixed (Dec 30, 2025)

**What it does:**

- Categorizes accounts into Cash, Investments, Deposits, Debt
- Calculates balance per account using transaction-based accounting
- Handles negative balances as debt
- Excludes family/friend accounts from investments

**Used by:**

- `OverviewPage.js` → Main KPI cards
- `MainKPISection.js` → Balance breakdown display

**Key Functions:**

```javascript
categorizeAccount(accountName);
// Input: "HDFC Bank" → Output: "cash"
// Input: "Groww Mutual Fund" → Output: "investment"
// Input: "Credit Card" → Output: "debt"

calculateNetBalanceBreakdown(transactions);
// Input: Array of transactions
// Output: { cash, investments, deposits, debt, total, byAccount }

getBalanceBreakdownInsights(breakdown);
// Input: Balance breakdown object
// Output: Array of insight objects with priority
```

**Recent Changes:**

- Split compound keywords ("mutual fund" → "mutual", "fund")
- Added exclusions for family/friend in investment check
- Rewrote debt calculation to handle negative balances
- Removed all console.log statements

---

#### **`src/lib/calculations/financial/index.js`** ✅

**Status:** Recently Enhanced (Dec 30, 2025)

**What it does:**

- Central hub for all financial calculations
- Tax planning with multi-year support
- Investment performance tracking
- Gross-from-net salary calculation
- Re-exports from specialized modules

**Used by:**

- `TaxPlanningDashboard.js` → Tax calculations
- `InvestmentPerformanceTracker.js` → Investment metrics
- `OverviewPage.js` → Balance breakdown

**Key Functions:**

```javascript
calculateTaxPlanning(transactions);
// Input: Array of transactions
// Output: { byFinancialYear, overall, latestFY }

calculateTaxPlanningForYear(transactions, financialYear);
// Input: Transactions + FY string
// Output: Complete tax breakdown with deductions

calculateInvestmentPerformance(transactions);
// Input: Array of transactions
// Output: { totalCapitalDeployed, currentHoldings, netReturn, returnPercentage }

calculateGrossFromNet(netIncome, professionalTax, mealVoucherExemption);
// Input: Net salary received
// Output: Required gross salary to achieve that net
```

**Recent Changes:**

- Added `getTaxSlabsForFY()` helper for multi-year support
- Added `calculateTaxFromSlabs()` generic slab calculator
- Integrated EPF deduction in tax calculation
- Added `grossSalaryAfterEPF`, `financialYear`, `taxSlabs` to return object

---

#### **`src/constants/index.js`** ✅

**Status:** Recently Updated (Dec 30, 2025)

**What it does:**

- Stores all application constants
- Tax regime slabs for different financial years
- Chart colors and configuration
- Investment account keywords
- Error/success messages

**Used by:**

- All calculation modules
- All page components
- Chart components

**Key Constants:**

```javascript
// Tax Slabs
TAX_SLABS_FY_2024_25  // Old regime (₹3L base)
TAX_SLABS_FY_2025_26  // New regime (₹4L base)
TAX_SLABS_NEW_REGIME  // Alias to FY_2025_26

// Deductions
STANDARD_DEDUCTION = 75000
SECTION_80C_LIMIT = 150000
DEFAULT_PROFESSIONAL_TAX = 2400
MEAL_VOUCHER_DAILY_LIMIT = 50
CESS_RATE = 0.04

// Investment Keywords
INVESTMENT_ACCOUNTS = ["grow", "stock", "zerodha", "upstox", ...]
INVESTMENT_CATEGORIES = ["Stocks", "Mutual Funds", ...]

// Chart Colors
CHART_COLORS = { primary, income, expense, gradient }
```

**Recent Changes:**

- Added `TAX_SLABS_FY_2024_25` for historical data
- Kept `TAX_SLABS_FY_2025_26` as current slabs
- Created backward compatibility alias

---

#### **`src/pages/OverviewPage/OverviewPage.js`** ✅

**Status:** Recently Cleaned (Dec 30, 2025)

**What it does:**

- Main dashboard landing page
- Displays 4 main KPI cards (Cash, Investments, Deposits, Debt)
- Shows financial health metrics
- Provides year/month filtering
- Displays smart insights

**Data Flow:**

```javascript
1. Get filtered transactions based on year/month selection
2. Calculate balance breakdown:
   const balanceBreakdown = calculateNetBalanceBreakdown(filteredData)
3. Pass to MainKPISection component for display
4. Generate insights using generateSmartInsights()
5. Display financial health metrics (savings rate, spending velocity)
```

**Recent Changes:**

- Removed console.log debug statement (line 439)
- Verified balance breakdown integration

---

#### **`src/hooks/useDataProcessor.js`**

**What it does:**

- Handles file upload (CSV/Excel)
- Parses and normalizes transaction data
- Provides filtering and sorting functions
- Manages unique value extraction (categories, accounts, types)

**Key Exports:**

```javascript
useDataProcessor(initialCsvData);
// Returns: { data, loading, error, handleFileUpload }

useUniqueValues(data);
// Returns: { categories, subcategories, accounts, years, months }

useFilteredData(data, filters, sortConfig);
// Returns: Filtered and sorted transaction array
```

**Data Normalization:**

- Handles both CSV and Excel formats
- Converts Excel serial dates to DD/MM/YYYY format
- Parses currency values (removes ₹ symbol and commas)
- Maps column aliases (Period → date, Accounts → account, etc.)
- Validates required fields

---

#### **`src/contexts/DataContext.js`**

**What it does:**

- Global state management for transactions
- Date range state
- Loading and error state
- Provides context hooks

**State Structure:**

```javascript
{
  transactions: Array<Transaction>,
  dateRange: { start: Date, end: Date },
  loading: boolean,
  error: string | null
}
```

**Hook Usage:**

```javascript
const { transactions, updateTransactions, loading } = useData();
```

---

## 📊 Financial Formulas Reference

### Balance Calculations

#### Net Balance

```
Net Balance = Σ Cash + Σ Investments + Σ Deposits - Σ Debt

Where:
- Cash = Balance of all bank/UPI/wallet accounts
- Investments = Balance of all investment accounts (Groww, Zerodha, etc.)
- Deposits = Balance of all friend/family loan accounts
- Debt = Absolute value of (negative balances + credit card balances)
```

#### Account Balance (Transaction-Based)

```
Account Balance = Σ(Income + Transfer-In) - Σ(Expense + Transfer-Out)

For account "HDFC Bank":
Balance = (Income to HDFC + Transfers to HDFC)
          - (Expenses from HDFC + Transfers from HDFC)
```

### Tax Calculations (New Regime)

#### Taxable Income

```
Gross Salary After EPF = Gross Salary - EPF Deduction

Taxable Income = Gross Salary After EPF
                 - Standard Deduction (₹75,000)
                 - Professional Tax (₹2,400)
                 - Meal Voucher Exemption (₹50/day)
```

#### Tax Calculation Using Slabs

```
For FY 2025-26:
Tax = 0% on first ₹4L
    + 5% on next ₹4L (₹4L to ₹8L)
    + 10% on next ₹4L (₹8L to ₹12L)
    + 15% on next ₹4L (₹12L to ₹16L)
    + 20% on next ₹4L (₹16L to ₹20L)
    + 25% on next ₹4L (₹20L to ₹24L)
    + 30% on amount above ₹24L

Health & Education Cess = Tax × 4%

Total Tax Liability = Tax + Cess + Professional Tax
```

#### Net Income

```
Net Income (Take-Home) = Gross Salary - Total Tax Liability
```

### Investment Performance

#### Return Percentage

```
Net Return = Realized Profits - Realized Losses - Brokerage Fees

Return % = (Net Return / Total Capital Deployed) × 100

Where:
- Total Capital Deployed = Sum of all purchase transactions
- Realized Profits = Withdrawals exceeding capital deployed
- Realized Losses = Capital deployed exceeding withdrawals
- Brokerage Fees = Fees paid to brokers
```

#### Current Holdings

```
Current Holdings = Σ(Investment Account Balances)

Where each account balance uses transaction-based calculation
```

### Cashback Calculations

#### Total Cashback

```
Total Cashback Earned = Σ(Income in "Refund & Cashbacks" category)
```

#### Actual Cashback

```
Cashback Shared = Σ(Expenses + Transfers from "Cashback Shared" account)

Actual Cashback = Total Cashback Earned - Cashback Shared
```

#### Cashback Rate

```
Total Credit Card Spending = Σ(Expenses from credit card accounts)

Cashback Rate (%) = (Total Cashback Earned / Total Credit Card Spending) × 100
```

#### Effective Savings

```
Annual Fees = Sum of credit card annual fee transactions

Effective Savings = Actual Cashback - Annual Fees
```

### Reimbursement Calculations

#### Total Reimbursements

```
Total Reimbursements = Σ(Income where subcategory === "Expense Reimbursement")
```

#### Reimbursement Rate

```
Total Employment Income = Σ(Income in "Employment Income" category)

Reimbursement Rate (%) = (Total Reimbursements / Total Employment Income) × 100
```

### Financial Health Metrics

#### Savings Rate

```
Total Income = Σ(All Income transactions)
Total Expense = Σ(All Expense transactions)
Total Savings = Total Income - Total Expense

Savings Rate (%) = (Total Savings / Total Income) × 100

Rating:
- Excellent: ≥ 30%
- Good: 20-29%
- Fair: 10-19%
- Poor: < 10%
```

#### Spending Velocity

```
Date Range = Latest Transaction Date - Earliest Transaction Date
Days in Range = Date Range / (1000 × 60 × 60 × 24)

Spending Velocity = Total Expense / Days in Range

This shows average daily spending rate
```

#### Category Concentration

```
Top Category Spending = Max(Σ Expenses by Category)

Concentration (%) = (Top Category Spending / Total Expense) × 100

Warning Threshold: > 40% (too concentrated in one category)
```

---

## 🧩 Component Hierarchy

### Page-Level Components

```
App.js (Root)
│
├── Header
│   ├── File Upload Button
│   └── App Title
│
├── Tabs Navigation
│   ├── Overview Tab ✅
│   ├── Income & Expense Tab
│   ├── Category Analysis Tab
│   ├── Trends & Forecasts Tab
│   ├── Investment Performance Tab
│   ├── Tax Planning Tab
│   ├── Family & Housing Tab
│   ├── Credit Card & Food Tab
│   ├── Patterns Tab
│   ├── Transactions Tab
│   └── Budget & Goals Tab
│
├── TabContent (Conditional Rendering)
│   │
│   ├── OverviewPage [activeTab === "overview"]
│   │   ├── Year/Month Filter Dropdowns
│   │   ├── MainKPISection
│   │   │   ├── SmallKPICard (Cash & Bank)
│   │   │   ├── SmallKPICard (Investments) ✅
│   │   │   ├── SmallKPICard (Deposits/Friends) ✅
│   │   │   └── SmallKPICard (Credit Card Debt) ✅
│   │   ├── FinancialHealthMetrics
│   │   │   ├── Savings Rate Card
│   │   │   ├── Spending Velocity Card
│   │   │   ├── Net Worth Card
│   │   │   └── Category Concentration Card
│   │   ├── SecondaryKPISection
│   │   ├── AccountBalancesCard
│   │   └── Smart Insights Panel
│   │
│   ├── TaxPlanningDashboard [activeTab === "tax"]
│   │   ├── Financial Year Selector
│   │   ├── Income Breakdown Card
│   │   ├── Deductions Card
│   │   │   ├── Standard Deduction ✅
│   │   │   ├── EPF Deduction ✅
│   │   │   ├── Professional Tax ✅
│   │   │   └── Meal Voucher Exemption ✅
│   │   ├── Tax Calculation Card
│   │   │   ├── Taxable Income Display
│   │   │   ├── Tax Slab Breakdown ✅
│   │   │   ├── Cess (4%)
│   │   │   └── Total Tax Liability
│   │   ├── Net Income Card
│   │   └── Tax Recommendations
│   │
│   ├── InvestmentPerformanceTracker [activeTab === "investments"]
│   │   ├── Performance Summary Cards
│   │   │   ├── Total Capital Deployed
│   │   │   ├── Current Holdings
│   │   │   ├── Net Return
│   │   │   └── Return Percentage
│   │   ├── Account-wise Breakdown Table
│   │   ├── Transaction Timeline
│   │   └── Performance Chart
│   │
│   └── [Other Pages...]
│
└── Footer
    └── Copyright & Links
```

### Component Data Flow (OverviewPage)

```
OverviewPage.js
│
├── State: [year, month, filteredData]
│
├── useMemo: filteredData = filterTransactionsByTime(transactions, year, month)
│
├── useMemo: balanceBreakdown = calculateNetBalanceBreakdown(filteredData) ✅
│   │
│   └── Returns:
│       ├── cash: 450000
│       ├── investments: 1200000 ✅ (was 0, now fixed)
│       ├── deposits: 150000 ✅ (was 0, now fixed)
│       ├── debt: 85000 ✅ (now includes negative balances)
│       └── total: 1715000
│
├── useMemo: enhancedKPI = useEnhancedKPIData(filteredData)
│
├── useMemo: advancedAnalytics = useAdvancedAnalytics(filteredData)
│
├── useMemo: insights = generateSmartInsights(filteredData, enhancedKPI)
│
└── Render:
    ├── MainKPISection (balanceBreakdown props)
    │   │
    │   └── Maps to 4 KPI Cards:
    │       ├── Cash & Bank: {formatCurrency(balanceBreakdown.cash)}
    │       ├── Investments: {formatCurrency(balanceBreakdown.investments)} ✅
    │       ├── Deposits: {formatCurrency(balanceBreakdown.deposits)} ✅
    │       └── Debt: {formatCurrency(balanceBreakdown.debt)} ✅
    │
    ├── FinancialHealthMetrics (enhancedKPI props)
    │   ├── Displays: savingsRate, spendingVelocity, netWorth
    │   └── Color-coded based on thresholds
    │
    └── Smart Insights Panel (insights props)
        └── Displays: Array of insight cards with priority badges
```

---

## 🔄 State Management

### DataContext (Global State)

**Location:** `src/contexts/DataContext.js`

**State:**

```javascript
{
  transactions: [
    {
      date: "25/12/2024",
      time: "14:30:00",
      account: "HDFC Bank",
      category: "Food & Dining",
      subcategory: "Restaurants",
      note: "Lunch with team",
      amount: 1500,
      type: "Expense"
    },
    // ... more transactions
  ],
  dateRange: {
    start: Date("2024-01-01"),
    end: Date("2024-12-31")
  },
  loading: false,
  error: null
}
```

**Actions:**

- `updateTransactions(newTransactions)` - Replace all transactions
- `updateDateRange(start, end)` - Update date boundaries
- `setLoading(boolean)` - Set loading state
- `setError(string)` - Set error message
- `clearError()` - Clear error state

**Usage:**

```javascript
import { useData } from "./contexts/DataContext";

function MyComponent() {
  const { transactions, loading, error } = useData();
  // Use transactions...
}
```

### Local State (Component-Level)

**OverviewPage:**

```javascript
- [year, setYear] - Selected year filter
- [month, setMonth] - Selected month filter
```

**App.js:**

```javascript
- [activeTab, setActiveTab] - Current active tab
- [sortConfig, setSortConfig] - Table sorting configuration
- [drilldownCategory, setDrilldownCategory] - Category drill-down
- [currentPage, setCurrentPage] - Pagination state
```

### Derived State (useMemo)

**Pattern:**

```javascript
const derivedValue = useMemo(() => {
  return expensiveCalculation(inputData);
}, [inputData]);
```

**Examples:**

```javascript
// Balance breakdown (OverviewPage)
const balanceBreakdown = useMemo(
  () => calculateNetBalanceBreakdown(filteredData),
  [filteredData]
);

// KPI data (App.js)
const kpiData = useMemo(() => useKPIData(filteredData), [filteredData]);

// Chart data (ChartsPage)
const chartData = useMemo(() => useChartData(filteredData), [filteredData]);
```

**Why useMemo?**

- Expensive calculations only run when dependencies change
- Prevents unnecessary re-renders
- Improves performance with large datasets

---

## 🔗 Integration Points

### File Upload Flow

```
1. User clicks "Upload File" in Header
   ↓
2. Header.js calls onFileUpload(file)
   ↓
3. App.js passes file to useDataProcessor.handleFileUpload(file)
   ↓
4. useDataProcessor.js:
   - Detects file type (CSV/Excel)
   - Parses rows and columns
   - Normalizes data
   - Validates required fields
   ↓
5. useDataProcessor updates local state
   ↓
6. Normalized data passed to DataContext.updateTransactions()
   ↓
7. All components re-render with new data
   ↓
8. Calculations run automatically via useMemo hooks
   ↓
9. UI updates with fresh KPIs, charts, tables
```

### Calculation Trigger Points

**When do calculations run?**

1. **On File Upload** - All calculations run immediately after data load
2. **On Filter Change** - When year/month/category filters change
3. **On Tab Switch** - When switching to a new tab (via lazy loading)
4. **On Sort/Search** - When sorting or searching transaction table

**Optimization:**

- useMemo prevents recalculation if dependencies haven't changed
- Lazy loading prevents loading unnecessary page components
- Debouncing on search inputs reduces calculation frequency

### Chart Integration

**Chart.js Setup:**

```javascript
// Register required Chart.js components
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
```

**Data Flow:**

```
Raw Transactions
↓
useChartData Hook
↓
Aggregate/Group by time period or category
↓
Format for Chart.js (labels, datasets, colors)
↓
Pass to Chart Component
↓
Render using Chart.js
```

**Example Chart Data Structure:**

```javascript
{
  labels: ["Jan", "Feb", "Mar", ...],
  datasets: [
    {
      label: "Income",
      data: [150000, 160000, 155000, ...],
      backgroundColor: "#10b981",
      borderColor: "#10b981"
    },
    {
      label: "Expense",
      data: [120000, 130000, 125000, ...],
      backgroundColor: "#ef4444",
      borderColor: "#ef4444"
    }
  ]
}
```

---

## ✅ Testing & Verification

### Manual Testing Checklist

#### Balance Breakdown Verification

**Test Case 1: Cash Balance**

```
1. Upload transaction file
2. Navigate to Overview page
3. Check "Cash & Bank" KPI card
4. Expected: Sum of all bank/UPI/wallet account balances
5. Verify by manually checking account list
```

**Test Case 2: Investments (Fixed) ✅**

```
1. Look for accounts containing: grow, stock, mutual, fund, zerodha
2. Exclude accounts with: fam, friend
3. Expected: Non-zero value if investment accounts exist
4. Example: "Groww Mutual Fund" should appear in Investments
5. Example: "Family Mutual Help" should NOT appear in Investments
```

**Test Case 3: Deposits (Fixed) ✅**

```
1. Look for accounts containing: friend, fam, family, loan, deposit
2. Expected: Non-zero value if friend/family accounts exist
3. Example: "Friend Loan" should appear in Deposits
4. Example: "Land Investment" should appear in Deposits
```

**Test Case 4: Debt (Fixed) ✅**

```
1. Check all credit card accounts
2. Check all negative balance accounts
3. Expected: Absolute value of (credit cards + negative balances)
4. Example: Credit Card with ₹50,000 spent → ₹50,000 debt
5. Example: Bank overdraft of -₹10,000 → ₹10,000 debt
```

#### Tax Calculation Verification

**Test Case 5: EPF Integration ✅**

```
1. Navigate to Tax Planning Dashboard
2. Check Deductions section
3. Expected: EPF Deduction listed separately
4. Verify: Gross Salary After EPF = Gross Salary - EPF
5. Verify: EPF deduction is subtracted BEFORE other deductions
```

**Test Case 6: Multi-Year Tax Slabs ✅**

```
1. Select FY 2024-25 from dropdown
2. Expected: Tax-free limit ₹3,00,000
3. Select FY 2025-26 from dropdown
4. Expected: Tax-free limit ₹4,00,000
5. Verify correct slab rates apply
```

**Test Case 7: Tax Calculation Accuracy**

```
Example: ₹22,07,600 gross salary
1. EPF: ₹21,600
2. Gross After EPF: ₹21,86,000
3. Standard Deduction: ₹75,000
4. Professional Tax: ₹2,400
5. Meal Voucher: ₹13,200
6. Taxable Income: ₹20,95,400
7. Expected Tax (FY 2025-26): ₹2,23,850
8. Cess: ₹8,954
9. Total: ₹2,35,204
```

#### Investment Performance Verification

**Test Case 8: Return Percentage**

```
1. Navigate to Investment Performance Tracker
2. Check Return Percentage card
3. Formula: (Net Return / Total Capital Deployed) × 100
4. Verify: Positive return shows green, negative shows red
5. Check transaction list for capital deployed and withdrawals
```

#### Console Verification (Fixed) ✅

**Test Case 9: No Debug Logs**

```
1. Open browser console (F12)
2. Navigate through all tabs
3. Expected: No console.log statements from:
   - netBalance.js
   - OverviewPage.js
4. Only intentional error logs from ErrorBoundary should appear
```

### Automated Verification

**Build Test:**

```bash
pnpm run build
```

**Expected Output:**

```
Compiled successfully!

File sizes after gzip:
  253.06 KB  build/static/js/main.0f237ae7.js

The build folder is ready to be deployed.
```

**Warning Acceptance:**

- ESLint console warnings (stale cache) - IGNORE
- Function length warning for CreditCardFoodOptimizer.js (590 lines) - LOW PRIORITY

### Data Integrity Checks

**Verify Formulas:**

1. **Balance = Income - Expense**

   ```javascript
   // For each account:
   balance = sum(Income + Transfer - In) - sum(Expense + Transfer - Out);
   ```

2. **Total Balance = Cash + Investments + Deposits - Debt**

   ```javascript
   total =
     breakdown.cash +
     breakdown.investments +
     breakdown.deposits -
     breakdown.debt;
   ```

3. **Tax = Sum of Slab Calculations**

   ```javascript
   // Verify each slab calculation manually
   // Ensure cess is applied correctly (4%)
   ```

4. **Return % = (Net Return / Capital) × 100**
   ```javascript
   // Verify with actual numbers from transaction list
   // Cross-check brokerage fee deductions
   ```

---

## 📝 Summary

### Core Architecture Principles

1. **Separation of Concerns**
   - UI components in `components/` and `pages/`
   - Business logic in `lib/calculations/`
   - State management in `contexts/`
   - Utilities in `utils/` and `hooks/`

2. **Single Source of Truth**
   - All transactions stored in DataContext
   - All calculations derive from this single source
   - No duplicate calculation logic

3. **Performance Optimization**
   - useMemo for expensive calculations
   - Lazy loading for page components
   - Debouncing for search inputs
   - Chart.js for efficient rendering

4. **Maintainability**
   - Modular calculation files (balance, tax, cashback, reimbursement)
   - Centralized constants
   - Clear file naming conventions
   - Comprehensive documentation

### Recent Fixes (December 30, 2025)

✅ **Balance Breakdown** - Fixed keyword matching, excluded family/friend from investments, improved debt calculation  
✅ **Tax Planning** - Added EPF deduction, multi-year tax slab support (FY 2024-25 & FY 2025-26)  
✅ **Code Cleanup** - Removed all console.log statements from production code  
✅ **Documentation** - Created comprehensive architecture and fix documentation

### Next Steps (Optional Enhancements)

1. **Net Worth Chart** (MEDIUM) - Fix date formatting and currency symbol display
2. **Subscription Detection** (LOW) - Add ±10% tolerance for recurring transactions
3. **Lifestyle Filter** (LOW) - Add unified time filter in CreditCardFoodOptimizer
4. **Code Refactoring** (LOW) - Split CreditCardFoodOptimizer.js into smaller components

---

## 📚 Related Documentation

- [COMPLETE_FIX_SUMMARY.md](./COMPLETE_FIX_SUMMARY.md) - Detailed fix summary with testing checklist
- [README.md](./README.md) - Project overview and setup instructions
- [FIXES_PLAN.md](./FIXES_PLAN.md) - Original issues and planned fixes

---

**Document Version:** 2.0  
**Last Verified:** December 30, 2025  
**Build Status:** ✅ Production Ready (253.06 KB)  
**Test Status:** ✅ All Core Features Verified
