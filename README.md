# 💰 Financial Dashboard

A comprehensive, modern financial dashboard built with React that provides powerful analytics, AI-style insights, and visualizations for personal finance management. Upload your financial data and gain deep insights into your spending patterns, income sources, and financial health.

![Financial Dashboard](https://img.shields.io/badge/React-19.1.1-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-blue) ![Chart.js](https://img.shields.io/badge/Chart.js-4.5.0-orange) ![License](https://img.shields.io/badge/License-MIT-green) ![Version](https://img.shields.io/badge/Version-0.1.0-brightgreen)

## 🎯 Demo

🔗 **[Live Demo](https://sagargupta16.github.io/Financial-Dashboard)**

💡 **Quick Start**: Just export your Money Manager backup to Excel and upload it on this link UI - you'll get comprehensive financial insights instantly!

## 📸 Screenshots

_Upload your financial data and watch your dashboard come to life with interactive charts, smart insights, and comprehensive analytics._

## ✨ Features

### 📊 **Comprehensive Analytics**

- **KPI Overview**: Total income, expenses, net balance, transaction counts, and advanced financial health metrics
- **Account Balances**: Real-time view of all account balances
- **Transfer Tracking**: Monitor internal money movements between accounts
- **Advanced Metrics**: Savings rate, spending velocity, burn rate, and category concentration

### 📈 **Rich Visualizations**

- **Income vs Expense Breakdown** (Doughnut Chart)
- **Top Expense Categories** (Bar Chart) - _with time filtering_
- **Income Sources Analysis** (Bar Chart) - _with time filtering_
- **Spending by Account** (Doughnut Chart)
- **Monthly Trends** (Line Chart) - _with time filtering_
- **Daily Spending Patterns** (Bar Chart)
- **Subcategory Analysis** with drill-down capabilities

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

## 🎯 Key Features in Detail

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
├── features/              # Feature modules (analytics, budget, charts, transactions)
├── shared/                # Shared resources
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── config/                # Configuration files
├── App.js                 # Main application
└── index.js               # Entry point
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

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
