# Financial Dashboard

![GitHub stars](https://img.shields.io/github/stars/Sagargupta16/Financial-Dashboard?style=flat-square) ![GitHub forks](https://img.shields.io/github/forks/Sagargupta16/Financial-Dashboard?style=flat-square) ![License](https://img.shields.io/github/license/Sagargupta16/Financial-Dashboard?style=flat-square) ![Last Commit](https://img.shields.io/github/last-commit/Sagargupta16/Financial-Dashboard?style=flat-square) ![Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat-square)

**[View Live Demo](https://sagargupta.online/Financial-Dashboard/)**

=======
> **Looking for a fully working, production-ready financial dashboard with Sankey diagrams and anomaly detection?**
> **Check out [Ledger Sync](https://github.com/Sagargupta16/ledger-sync)** -- Transform messy Excel bank statements into beautiful financial dashboards.

A comprehensive, modern financial dashboard built with React that provides powerful analytics, AI-style insights, and visualizations for personal finance management. Upload your financial data and gain deep insights into your spending patterns, income sources, financial health, investments, tax planning, and lifestyle optimization.

![Financial Dashboard](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-blue) ![Chart.js](https://img.shields.io/badge/Chart.js-4.5.0-orange) ![License](https://img.shields.io/badge/License-MIT-green) ![Version](https://img.shields.io/badge/Version-0.5.0-brightgreen)

## Demo

**[Live Demo](https://sagargupta16.github.io/Financial-Dashboard)**

**Quick Start**: Just export your Money Manager backup to Excel and upload it on this link UI - you'll get comprehensive financial insights instantly!

## 📸 Screenshots

_Upload your financial data and watch your dashboard come to life with interactive charts, smart insights, and comprehensive analytics._

## ✨ Features

### 🆕 **NEW: TypeScript Migration v0.5.0**

- **Full TypeScript Support**: Enhanced type safety and developer experience
- **Strict Mode**: Robust error checking and improved code quality
- **Modern Architecture**: Updated codebase using latest React patterns
- **Zero Runtime Errors**: Significantly improved stability and reliability

### 🏗️ **Refactored Architecture v0.4.0**

- **Clean Folder Structure**: Modular organization by feature and concern
- **Single Source of Truth**: All financial calculations centralized in `lib/calculations`
- **No Duplicates**: Clean, maintainable codebase with zero duplicate calculation logic
- **SonarQube Compliant**: All code quality warnings resolved
- **Optimized Performance**: Efficient calculations reused across all components
- **Easy to Extend**: Add new features in isolated, focused modules

### 📊 **Advanced Financial Management**

- **📈 Investment Performance Tracker**: Stock market P&L, brokerage fees, returns, and actionable insights
- **📋 Tax Planning Dashboard**: Income tax calculations, deductions (80C, HRA), tax slab breakdown, saving recommendations
- **👨‍👩‍👧 Family & Housing Manager**: Family expenses, rent payments, utilities, HRA benefits
- **💳 Lifestyle Optimizer**: Credit card analytics, cashback tracking, food spending, commute cost analysis

### 📊 **Comprehensive Analytics**

- **KPI Overview**: Total income, expenses, net balance, transaction counts, and advanced financial health metrics
- **Account Balances**: Real-time view of all account balances
- **Transfer Tracking**: Monitor internal money movements between accounts
- **Advanced Metrics**: Savings rate, spending velocity, burn rate, and category concentration

### 📈 **Rich Visualizations**

- **Income vs Expense Breakdown** (Doughnut Chart)
- **Top Expense Categories** (Bar Chart) - with time filtering
- **Income Sources Analysis** (Bar Chart) - with time filtering
- **Spending by Account** (Doughnut Chart)
- **Monthly Trends** (Line Chart) - with time filtering
- **Daily Spending Patterns** (Bar Chart)
- **Subcategory Analysis** with drill-down capabilities
- **Investment P&L Charts**: Cumulative profit/loss tracking over time
- **Tax Breakdown**: Visual representation of tax slabs and deductions
- **Food & Transport Trends**: Monthly spending patterns and optimization opportunities

### 🕒 **Time-Based Analysis**

- **Enhanced Top Categories**: Monthly, yearly, and all-time views for expenses and income
- **Enhanced Monthly Trends**: Yearly, last 12 months, and all-time views
- **Enhanced Subcategory Breakdown**: Monthly, yearly, and decade views
- **Multi-Category Time Analysis**: Compare spending across categories over time
- **Interactive Navigation**: Navigate through different time periods
- **Trend Identification**: Spot patterns and seasonal variations

### 🔍 **Data Management**

- **CSV & Excel Upload**: Easy data import functionality for both CSV and Excel files (.xlsx, .xls)
- **Smart Parsing**: Handles quoted fields and various file formats
- **Data Filtering**: Search and filter transactions
- **Sorting & Pagination**: Organized transaction table with sorting capabilities
- **Export Charts**: Download visualizations as PNG images

### 💼 **Transaction Types Support**

- **Income**: Track all income sources
- **Expenses**: Monitor spending across categories
- **Transfers**: Handle internal account transfers
- **Categorization**: Organize transactions with categories and subcategories

## 🏗️ Architecture

### Clean Modular Structure

```
src/
├── app/
│   └── App.js                        # Main application component
├── pages/                            # Page-level components
│   ├── OverviewPage/
│   ├── AdvancedAnalyticsPage/
│   ├── CategoryAnalysisPage/
│   ├── IncomeExpensePage/
│   ├── PatternsPage/
│   ├── TransactionsPage/
│   └── TrendsForecastsPage/
├── features/                         # Feature modules
│   ├── analytics/                    # Advanced analytics components
│   │   ├── components/
│   │   └── hooks/
│   ├── budget/                       # Budget & goals features
│   │   ├── components/
│   │   └── utils/
│   ├── charts/                       # Chart components & logic
│   │   ├── components/
│   │   └── hooks/
│   ├── kpi/                          # KPI cards & metrics
│   │   ├── components/
│   │   └── hooks/
│   └── transactions/                 # Transaction management
│       └── components/
├── components/                       # Shared UI components
│   ├── data-display/                 # Charts, health scores, calendars
│   ├── errors/                       # Error boundaries
│   ├── import-export/                # CSV/Excel import
│   ├── layout/                       # Header, footer
│   └── ui/                          # Reusable UI elements
├── lib/                             # Core libraries
│   ├── calculations/                # Financial calculation engine
│   │   ├── aggregations/            # Averages, totals, categories
│   │   ├── financial/               # Financial calculations
│   │   ├── time/                    # Date range calculations
│   │   ├── index.js                 # Main calculation exports
│   │   └── legacy.js                # Backward compatibility
│   ├── analytics/                   # Analytics utilities
│   │   ├── forecasts.js
│   │   ├── insights.js
│   │   ├── trends.js
│   │   └── healthScore.js
│   ├── charts/                      # Chart utilities
│   └── data/                        # Data processing & validation
├── contexts/                        # React contexts
│   └── DataContext.js
├── hooks/                           # Custom React hooks
│   ├── useDataProcessor.js
│   └── useDebouncedValue.js
├── utils/                           # General utilities
│   ├── accessibility.js
│   ├── localStorage.js
│   ├── logger.js
│   └── performance.js
├── config/                          # Configuration files
│   ├── overview.js
│   └── tabs.js
├── constants/                       # App constants
│   └── index.js
└── styles/                          # Global styles
    └── index.css
```

### Key Principles

- ✅ **Feature-Based Structure**: Organize code by feature, not by file type
- ✅ **Separation of Concerns**: Pages, features, components, and libraries are clearly separated
- ✅ **Single Responsibility**: Each module and function does one thing well
- ✅ **No Duplicates**: Same calculation or component never written twice
- ✅ **Easy to Test**: Pure functions with predictable outputs
- ✅ **Easy to Extend**: Add new features without breaking existing ones
- ✅ **Code Quality**: SonarQube compliant with proper error handling and logging

## 🎯 Key Features in Detail

### Investment Performance Tracker 📈

**Comprehensive stock market analysis:**

1. **P&L Tracking**
   - Total deposits and withdrawals
   - Realized profits and losses
   - Net profit/loss with return percentage
   - Cumulative P&L chart over time

2. **Brokerage Analysis**
   - Total fees paid
   - Fee percentage of invested amount
   - Optimization recommendations

3. **Investment Insights**
   - Win/loss ratio calculation
   - Tax loss harvesting opportunities
   - Strategy recommendations based on performance
   - Recent transaction history

### Tax Planning Dashboard 📋

**Complete income tax planning (FY 2025-26):**

1. **Income Analysis**
   - Salary, bonus, and other income breakdown
   - Gross vs taxable income comparison
   - Visual income distribution

2. **Deductions Tracking**
   - 80C investments (₹1.5L limit) with progress bar
   - HRA exemption calculation
   - Standard deduction (₹50,000)
   - Professional tax

3. **Tax Calculation**
   - New tax regime slab-wise breakdown
   - Effective tax rate calculation
   - Post-tax income projection
   - Year-end tax estimate

4. **Recommendations**
   - Tax-saving investment suggestions
   - Unutilized deduction alerts
   - Optimization opportunities

### Family & Housing Manager 👨‍👩‍👧‍👦

**Track family and housing expenses:**

1. **Family Expenses**
   - Total family support tracking
   - Monthly average calculations
   - Subcategory breakdown
   - Top expense identification

2. **Housing Costs**
   - Rent payment history
   - Utility bills tracking
   - Monthly housing trends
   - HRA tax benefit calculation

3. **Insights**
   - Spending patterns over time
   - Budget recommendations
   - Tax benefit alerts

### Lifestyle Optimizer 💳

**Optimize daily spending:**

1. **Credit Card Analytics**
   - Card-wise spending breakdown
   - **Total Cashback Earned**: Sum of all cashback income
   - **Cashback Shared**: Expenses and transfers from "Cashback Shared" account
   - **Actual Cashback**: Total Earned - Shared (what you actually kept)
   - Cashback rate calculation
   - Category-wise card usage
   - Card optimization tips

2. **Food Spending**
   - Delivery apps vs groceries
   - Office cafeteria spending
   - Dining out costs
   - Daily food average
   - Monthly trends and savings opportunities

3. **Transportation**
   - Daily commute costs
   - Intercity travel expenses
   - Per-trip averages
   - Alternative suggestions (bike, monthly pass)

4. **Reimbursements**
   - **Total Reimbursements**: Sum of all expense reimbursement income
   - Average reimbursement amount
   - Monthly reimbursement trends
   - Recent reimbursement activity

### Financial Health Metrics

**6 Advanced KPI Cards that give you instant insights:**

1. **Savings Rate** 🐷
   - Shows: `(Income - Expense) / Income × 100`
   - Color-coded: Green (≥20%), Yellow (≥10%), Red (<10%)
   - Example: "23.5% - Excellent! 🎉"

2. **Daily Spending Rate** 🔥
   - Shows: Average money spent per day
   - Helps understand your daily burn rate
   - Example: "₹485.50/day"

3. **Monthly Burn Rate** 📅
   - Shows: Projected monthly expenses
   - Useful for monthly budgeting
   - Example: "₹14,750/month"

4. **Net Worth Change** 📈
   - Shows: Total wealth change over period
   - Color-coded: Green (positive), Red (negative)
   - Example: "+₹15,250 (+₹5,000/month) ↑"

5. **Spending Velocity (30-day)** ⚡
   - Shows: If you're spending more/less than usual
   - Early warning system for budget overruns
   - Color-coded: Red (>120%), Yellow (80-120%), Green (<80%)
   - Example: "115% ↑ Above average"

6. **Top Category Concentration** 🎯
   - Shows: Which category dominates your spending
   - Warns if >50% (over-concentration risk)
   - Example: "Food - 45% of spending ⚠️"

### Smart Insights & Recommendations

**AI-style personalized financial advice that includes:**

- **💰 Savings Opportunities**: Identifies potential savings from delivery apps, cafeteria spending, and recurring expenses
- **📊 Pattern Detection**: Analyzes weekend vs weekday spending, high-frequency categories, and unusual transactions
- **🎉 Achievements**: Celebrates your good financial behaviors
- **⚠️ Warnings**: Alerts you to concerning patterns or low savings rates
- **🕐 Time Filtering**: Filter insights by year and month to analyze specific periods
- **🎯 Priority System**: High-priority insights shown first for immediate action

**Example Insights:**

- "You order food 4.2x/week (avg ₹350/order). Reducing by 30% could save ₹52,416/year"
- "You spend 68% more on weekends vs weekdays - consider planning weekend activities better"
- "You're saving 28.5% of your income - that's excellent! Keep it up!"

### Running Balance Tracking

**See exactly how your balance changes over time:**

- **Chronological View**: Transactions sorted by date with cumulative balance
- **All Transaction Types**: Handles income (+), expenses (-), and transfers
- **Color Coding**: Green for positive, Red for negative balances
- **Historical Analysis**: Track exactly when you went positive or negative
- **Visual Impact**: See the immediate effect of large expenses

**Example:**

```text
Date    | Amount     | Type    | Running Balance
--------|------------|---------|------------------
Jan 1   | ₹50,000    | Income  | ₹50,000 (Positive)
Jan 5   | -₹12,000   | Expense | ₹38,000 (Positive)
Jan 10  | ₹60,000    | Income  | ₹98,000 (Positive)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- pnpm 9.x or higher (recommended) or npm

> **Note**: This project uses pnpm for faster installs and better disk space usage. Install pnpm: `npm install -g pnpm`

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sagargupta16/Financial-Dashboard.git
   cd Financial-Dashboard
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   pnpm start
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### 🪝 Git Hooks with Husky

This project uses **Husky** for Git hooks to maintain code quality automatically:

**What is Husky?**
Husky is a tool that makes Git hooks easy. It runs scripts before certain Git actions (like commit or push) to ensure code quality.

**Pre-commit Hook** (`.husky/pre-commit`):

- ✅ Automatically runs ESLint on staged files
- ✅ Automatically formats code with Prettier
- ✅ Prevents commits if there are linting errors
- ✅ Ensures consistent code style across the team

**Benefits:**

- No more "fix lint errors" commits
- Consistent formatting across all developers
- Faster CI/CD pipelines (fewer failed builds)
- Higher code quality in the repository

The hook configuration uses `lint-staged` to only check files you're actually committing.

## 📋 Data Format (CSV & Excel)

Your CSV or Excel file should follow this format:

```csv
Date,Time,Accounts,Category,Subcategory,Note,INR,Income/Expense
01/01/2024,10:30:00,Bank Account,Food,Groceries,Weekly shopping,2500,Expense
01/01/2024,14:15:00,Savings Account,Salary,Basic Salary,Monthly salary,50000,Income
```

**Supported File Types:**

- **.csv** - Comma-separated values
- **.xlsx** - Excel workbook format
- **.xls** - Legacy Excel format

### Required Columns

- **Date**: DD/MM/YYYY format
- **Time**: HH:MM:SS format
- **Accounts**: Account name (e.g., "Bank Account", "Credit Card")
- **Category**: Transaction category (e.g., "Food", "Transport", "Salary")
- **Subcategory**: Optional subcategory for detailed tracking
- **Note**: Transaction description or notes
- **INR**: Amount in Indian Rupees (can include ₹ symbol and commas)
- **Income/Expense**: Transaction type ("Income", "Expense", "Transfer-In", "Transfer-Out")

## 🛠️ Technology Stack

### Core Technologies

- **React 19.1.1**: Modern UI framework
- **Chart.js 4.5.0**: Powerful charting library
- **react-chartjs-2**: React wrapper for Chart.js
- **TailwindCSS 3.4**: Utility-first CSS framework
- **Lucide React**: Icon library
- **xlsx**: Excel file parsing

### Build & Development

- **Create React App**: Zero-configuration setup
- **ESLint**: Code quality and linting
- **PropTypes**: Runtime type checking
- **pnpm**: Fast, disk space efficient package manager
- **Husky**: Git hooks for code quality

### Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge)

## 📁 Project Structure

```text
src/
├── app/                   # Main application entry
├── pages/                 # Page-level components for routing
├── features/              # Feature modules (analytics, budget, charts, kpi, transactions)
├── components/            # Shared UI components (data-display, errors, import-export, layout, ui)
├── lib/                   # Core libraries (calculations, analytics, charts, data)
├── contexts/              # React contexts (DataContext)
├── hooks/                 # Custom React hooks
├── utils/                 # General utilities (logger, localStorage, performance)
├── config/                # Configuration files
├── constants/             # Application constants
└── styles/                # Global styles
```

## 🎯 Available Scripts

```bash
pnpm start          # Start development server
pnpm build          # Build for production
pnpm test           # Run test suite
pnpm lint           # Run ESLint
pnpm lint:fix       # Fix ESLint issues
pnpm format         # Format code with Prettier
```

## 🔧 Configuration

### Currency Format

Update the `formatCurrency` function in `src/shared/utils/dataUtils.js` to change currency:

```javascript
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR", // Change as needed
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
```

### Custom Themes

Modify the color scheme in `tailwind.config.js` or update the CSS classes in components.

## 📐 Formulas & Calculations Reference

This dashboard uses a comprehensive set of financial calculations. All formulas are centralized in `src/lib/calculations/` for consistency and maintainability.

### Core Financial Metrics

#### 1. **Total Income**

```
Total Income = Sum of all transactions where type = "Income"
```

_Location:_ `src/lib/calculations/aggregations/totals.js`

#### 2. **Total Expense**

```
Total Expense = Sum of all transactions where type = "Expense"
```

_Location:_ `src/lib/calculations/aggregations/totals.js`

#### 3. **Net Balance (Savings)**

```
Net Balance = Total Income - Total Expense
```

_Location:_ `src/lib/calculations/financial/savings.js`

#### 4. **Savings Rate**

```
Savings Rate = ((Total Income - Total Expense) / Total Income) × 100
```

_Interpretation:_

- ≥20%: Excellent 🎉 (Green)
- ≥10%: Good 👍 (Yellow)
- <10%: Needs Improvement ⚠️ (Red)

_Location:_ `src/lib/calculations/financial/savings.js`

### Spending Analysis

#### 5. **Daily Average Spending**

```
Daily Average = Total Expense / Number of Days in Period
```

_Location:_ `src/lib/calculations/aggregations/averages.js`

#### 6. **Monthly Average Spending**

```
Monthly Average = (Total Expense / Number of Days) × 30.44
```

_Note:_ 30.44 is the average number of days per month (365.25 / 12)

_Location:_ `src/lib/calculations/aggregations/averages.js`

#### 7. **Average Transaction Value**

```
Average Transaction = Total Transaction Amount / Number of Transactions
```

_Location:_ `src/lib/calculations/aggregations/averages.js`

#### 8. **Spending Velocity (30-day)**

```
Spending Velocity = (Last 30 Days Daily Average / All-Time Daily Average) × 100
```

_Interpretation:_

- <80%: Spending less than usual (Green)
- 80-120%: Normal spending range (Yellow)
- > 120%: Spending more than usual (Red)

_Location:_ `src/features/kpi/hooks/useCalculations.js`

### Cashback Calculations

#### 9. **Total Cashback Earned**

```
Total Cashback Earned = Sum of all transactions where:
  - Category = "Refund & Cashbacks"
  - Type = "Income"
```

_Location:_ `src/lib/calculations/financial/cashback.js`

#### 10. **Cashback Shared**

```
Cashback Shared = Sum of all transactions where:
  - Account = "Cashback Shared"
  - Type = "Expense" OR "Transfer-Out"
```

_Location:_ `src/lib/calculations/financial/cashback.js`

#### 11. **Actual Cashback**

```
Actual Cashback = Total Cashback Earned - Cashback Shared
```

_This represents the cashback you actually kept for yourself after sharing with others_

_Location:_ `src/lib/calculations/financial/cashback.js`

#### 12. **Cashback Rate**

```
Cashback Rate = (Total Cashback Earned / Total Credit Card Spending) × 100
```

_Location:_ `src/lib/calculations/financial/cashback.js`

#### 13. **Per-Card Cashback**

```
For each credit card:
  Card Cashback = Sum of cashback transactions for that card
  Card Cashback Rate = (Card Cashback / Card Spending) × 100
```

_Location:_ `src/lib/calculations/financial/cashback.js`

### Reimbursement Calculations

#### 14. **Total Reimbursements**

```
Total Reimbursements = Sum of all transactions where:
  - Subcategory = "Expense Reimbursement"
  - Type = "Income"
```

_Location:_ `src/lib/calculations/financial/reimbursement.js`

#### 15. **Average Reimbursement**

```
Average Reimbursement = Total Reimbursements / Number of Reimbursement Transactions
```

_Location:_ `src/lib/calculations/financial/reimbursement.js`

### Investment Metrics

#### 16. **Total Capital Deployed**

```
Total Capital Deployed = Sum of all Transfer-Out to investment accounts
```

#### 17. **Investment Returns**

```
Net Return = (Current Holdings + Withdrawals - Capital Deployed + Realized Profits - Realized Losses - Brokerage Fees)
Return Percentage = (Net Return / Capital Deployed) × 100
```

_Location:_ `src/lib/calculations/financial/index.js`

### Tax Calculations

#### 18. **Taxable Income**

```
Taxable Income = Total Income - Standard Deduction - Section 80C Deductions - HRA Exemption
```

#### 19. **Income Tax (New Regime)**

```
Tax = Sum of (Slab Amount × Slab Rate) for all applicable slabs
Total Tax = Income Tax + 4% Cess on Income Tax
```

_Tax Slabs (New Regime FY 2025-26):_

- ₹0 - ₹4L: 0%
- ₹4L - ₹8L: 5%
- ₹8L - ₹12L: 10%
- ₹12L - ₹16L: 15%
- ₹16L - ₹20L: 20%
- ₹20L - ₹24L: 25%
- Above ₹24L: 30%

_Location:_ `src/lib/calculations/financial/index.js`

#### 20. **HRA Exemption**

```
HRA Exemption = Minimum of:
  1. Actual HRA Received
  2. 50% of Basic Salary (Metro) or 40% (Non-Metro)
  3. Rent Paid - 10% of Basic Salary
```

_Location:_ `src/lib/calculations/financial/index.js`

### Food & Lifestyle Metrics

#### 21. **Food Spending Breakdown**

```
Total Food = Sum of all "Food & Dining" expenses
Delivery Apps = Swiggy + Zomato + Other delivery services
Groceries = Supermarket + Grocery store purchases
Dining Out = Restaurant + Café expenses
Office Cafeteria = Office food expenses

Daily Average = Total Food / Number of Days
Monthly Average = (Total Food / Number of Days) × 30.44
```

_Location:_ `src/lib/calculations/financial/index.js`

#### 22. **Transportation Metrics**

```
Total Transportation = Sum of all "Transportation" expenses
Daily Commute = Local transport (metro, bus, auto, bike)
Intercity Travel = Long-distance travel expenses

Daily Average = Total Transportation / Number of Days
Per Trip Average = Total Transportation / Number of Transport Transactions
```

_Location:_ `src/lib/calculations/financial/index.js`

### Advanced Metrics

#### 23. **Net Worth Change**

```
Net Worth = Total Income - Total Expense
Net Worth Per Month = (Net Worth / Number of Days) × 30.44
```

#### 24. **Category Concentration**

```
For each expense category:
  Category Total = Sum of expenses in that category
  Category Percentage = (Category Total / Total Expense) × 100

Top Category Concentration = Highest category percentage
```

_Warning threshold: >50% indicates over-concentration_

_Location:_ `src/features/kpi/hooks/useCalculations.js`

#### 25. **Account Balance Tracking**

```
For each account:
  Balance = Sum of:
    + Income to account
    + Transfers In
    - Expenses from account
    - Transfers Out
```

_Location:_ `src/features/kpi/hooks/useCalculations.js`

### Time Period Calculations

#### 26. **Date Range Analysis**

```
Total Days = (End Date - Start Date) in days
Total Months = Total Days / 30.44
Total Years = Total Days / 365.25
```

_Location:_ `src/lib/calculations/time/dateRange.js`

### Data Aggregation

#### 27. **Category Grouping**

```
For each category:
  Total = Sum of all transaction amounts in category
  Count = Number of transactions in category
  Average = Total / Count
```

_Location:_ `src/lib/calculations/aggregations/category.js`

#### 28. **Monthly Trends**

```
For each month:
  Income = Sum of income transactions in month
  Expense = Sum of expense transactions in month
  Net = Income - Expense
  Growth Rate = ((Current Month - Previous Month) / Previous Month) × 100
```

### Running Balance

#### 29. **Cumulative Balance**

```
For each transaction (chronologically):
  Running Balance = Previous Balance + Transaction Amount
  (where Income/Transfer-In adds, Expense/Transfer-Out subtracts)
```

## 📊 Calculation Module Structure

All calculations are organized in a clean, modular structure:

```
src/lib/calculations/
├── index.js                    # Main exports
├── aggregations/
│   ├── averages.js            # Daily, monthly, per-transaction averages
│   ├── category.js            # Category grouping and top categories
│   └── totals.js              # Total income and expense
├── financial/
│   ├── cashback.js            # All cashback calculations
│   ├── reimbursement.js       # Reimbursement calculations
│   ├── savings.js             # Savings and savings rate
│   └── index.js               # Investment, tax, food, transport
├── time/
│   └── dateRange.js           # Date range and period calculations
└── legacy.js                  # Legacy calculations (for compatibility)
```

### Using Calculations in Your Code

```javascript
// Import what you need
import {
  calculateTotalIncome,
  calculateTotalExpense,
  calculateSavingsRate,
  calculateTotalCashbackEarned,
  calculateCashbackShared,
  calculateActualCashback,
  calculateTotalReimbursements,
} from "src/lib/calculations";

// Use in components
const totalIncome = calculateTotalIncome(transactions);
const totalExpense = calculateTotalExpense(transactions);
const savingsRate = calculateSavingsRate(totalIncome, totalExpense);

// Cashback metrics
const cashbackEarned = calculateTotalCashbackEarned(transactions);
const cashbackShared = calculateCashbackShared(transactions);
const actualCashback = calculateActualCashback(transactions);

// Reimbursements
const reimbursements = calculateTotalReimbursements(transactions);
```

**Benefits:**

- ✅ Single source of truth - no duplicate logic
- ✅ Easy to test and maintain
- ✅ Consistent calculations across all pages
- ✅ Well-documented with JSDoc comments
- ✅ Type-safe with PropTypes validation

## 📊 Dashboard Overview

### Main Sections

1. **Overview Tab** - Your financial command center
   - Main KPI Cards (Income, Expenses, Net Balance)
   - 6 Financial Health Metrics (Savings Rate, Burn Rate, Velocity, etc.)
   - Smart Insights & Recommendations with time filtering
   - Account balances and transfer tracking
2. **Income & Expense Tab** - Detailed breakdowns
   - Income vs Expense comparison charts
   - Top expense categories with time filtering
   - Income sources analysis
   - Spending by account visualization
3. **Trends & Forecasts Tab** - Temporal analysis
   - Monthly trends with time filtering
   - Daily spending patterns
   - Category-wise spending over time
   - Seasonal variation detection

4. **Category Analysis Tab** - Deep dives
   - Subcategory breakdown with drill-down
   - Multi-category time comparisons
   - Category concentration analysis
   - Spending heatmaps

5. **Insights Tab** - Advanced analytics
   - Food spending analytics
   - Commute optimization insights
   - Account-level analysis
   - Recurring payment detection

6. **Transactions Tab** - Full transaction list
   - Running balance column
   - Advanced filtering and search
   - Proper sorting on all columns
   - Pagination and export capabilities

7. **Budget & Goals Tab** - Financial planning
   - Budget tracking by category
   - Goal setting and monitoring
   - Budget vs actual comparison
   - Progress visualization

### Key Metrics & Insights

**Automatically calculated for your data:**

- Savings rate and financial health score
- Daily and monthly burn rates
- Spending velocity (are you spending more than usual?)
- Category concentration (is spending too concentrated?)
- Weekend vs weekday spending patterns
- Most frequent categories and transaction patterns
- Potential savings opportunities
- Large transaction alerts
- Running balance throughout the period

## 🐛 Troubleshooting

### Common Issues

#### CSV/Excel Upload Not Working

- Ensure file follows the exact format specified
- Check that all required columns are present
- Verify date format is DD/MM/YYYY
- For Excel files, ensure data is in the first worksheet

#### Charts Not Displaying

- Check browser console for JavaScript errors
- Ensure all dependencies are installed correctly
- Verify file data is properly formatted

#### Build Failures

- Run `pnpm install` to ensure all dependencies are installed
- Check Node.js version compatibility (>=20.0.0 required)
- Clear pnpm cache: `pnpm store prune`

## 📚 Documentation

Comprehensive technical documentation is available in the [`docs/`](./docs) folder:

- **[Architecture Guide](./docs/architecture/comprehensive-guide.md)** - System design, patterns, and technical decisions
- **[Data Flow Diagram](./docs/architecture/data-flow.md)** - Visual representation of data flow
- **[TypeScript Migration](./docs/migration/typescript-migration.md)** - Migration guide and best practices
- **[Phase 1 Report](./docs/reports/phase-1-completion.md)** - Project milestones and achievements

📖 **[View Full Documentation Index →](./docs/README.md)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

**Before contributing:**

- Review the [Architecture Guide](./docs/architecture/comprehensive-guide.md)
- Follow TypeScript best practices from the [Migration Guide](./docs/migration/typescript-migration.md)
- Add tests for new business logic

## More Projects

| Project | Description |
|---------|-------------|
| [LeetCode Rating Predictor](https://github.com/Sagargupta16/LeetCode_Rating_Predictor) | Full-stack ML-powered LeetCode contest rating predictor |
| [InstagramLikesLeaderboard](https://github.com/Sagargupta16/InstagramLikesLeaderboard) | Browser tool showing who likes your Instagram posts the most |
| [claude-cost-optimizer](https://github.com/Sagargupta16/claude-cost-optimizer) | Save 30-60% on Claude Code costs - proven strategies and benchmarks |
| [Contact Manager](https://github.com/Sagargupta16/Contact-Manager-Mern) | Full-stack MERN contact manager with CRUD and dark mode |

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Sagar Gupta**

- GitHub: [@Sagargupta16](https://github.com/Sagargupta16)

## 🙏 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

⭐ **Star this repository if you find it helpful!**
