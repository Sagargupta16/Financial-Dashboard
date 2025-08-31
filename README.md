# 💰 Financial Dashboard

A comprehensive, modern financial dashboard built with React that provides powerful analytics and visualizations for personal finance management. Upload your financial data and gain deep insights into your spending patterns, income sources, and financial trends.

![Financial Dashboard](https://img.shields.io/badge/React-19.1.1-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-blue) ![Chart.js](https://img.shields.io/badge/Chart.js-4.5.0-orange)

## ✨ Features

### 📊 **Comprehensive Analytics**
- **KPI Overview**: Total income, expenses, net balance, and transaction counts
- **Account Balances**: Real-time view of all account balances
- **Transfer Tracking**: Monitor internal money movements between accounts
- **Advanced Metrics**: Highest expenses, average spending, and transaction insights

### 📈 **Rich Visualizations**
- **Income vs Expense Breakdown** (Doughnut Chart)
- **Top Expense Categories** (Bar Chart) - *with time filtering*
- **Income Sources Analysis** (Bar Chart) - *with time filtering*
- **Spending by Account** (Doughnut Chart)
- **Monthly Trends** (Line Chart) - *with time filtering*
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

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sagargupta16/Financial-Dashboard.git
   cd Financial-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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

### Required Columns:
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
- **React 19.1.1**: Modern UI framework with latest features
- **Chart.js 4.5.0**: Powerful charting library
- **react-chartjs-2**: React wrapper for Chart.js
- **TailwindCSS 3.4.17**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **xlsx 0.18.5**: Excel file parsing and processing

### Build Tools
- **Create React App 5.0.1**: Zero-configuration setup
- **PostCSS & Autoprefixer**: CSS processing
- **React Scripts**: Build and development tools

## 📁 Project Structure

```
src/
├── components/
│   ├── Charts/
│   │   ├── ChartCard.js          # Reusable chart container
│   │   └── ChartComponents.js    # All chart implementations
│   └── UI/
│       ├── Header.js             # App header with file upload
│       ├── KPICards.js           # Key performance indicators
│       ├── AccountBalancesCard.js # Account balance display
│       ├── TransactionTable.js   # Sortable transaction table
│       └── Footer.js             # App footer
├── hooks/
│   ├── useDataProcessor.js       # CSV parsing and data processing
│   ├── useCalculations.js        # KPI calculations and insights
│   └── useChartData.js          # Chart data preparation
├── utils/
│   ├── constants.js              # App constants
│   └── dataUtils.js             # Utility functions
├── App.js                        # Main application component
├── index.js                      # Application entry point
└── index.css                     # Global styles with Tailwind
```

## 🎯 Available Scripts

### Development
```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production
npm run eject      # Eject from Create React App (one-way operation)
```

### Production Deployment
```bash
npm run build      # Creates optimized production build in /build folder
```

## 🔧 Customization

### Adding New Chart Types
1. Create new chart component in `src/components/Charts/ChartComponents.js`
2. Add chart data processing logic in `src/hooks/useChartData.js`
3. Import and use in `src/App.js`

### Modifying Currency Format
Update the `formatCurrency` function in `src/utils/dataUtils.js`:

```javascript
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Change currency here
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
```

### Custom Themes
Modify the color scheme in `tailwind.config.js` or update the CSS classes in components.

## 📊 Features Overview

### Dashboard Sections

1. **Main KPI Cards**: Income, Expenses, Net Balance
2. **Secondary Metrics**: Transaction count, highest expense, averages
3. **Transfer Information**: Internal money movement tracking
4. **Visualizations Grid**: Multiple chart types for different insights
5. **Deeper Analysis**: Day-wise patterns and category insights
6. **Time-based Analysis**: Advanced temporal analytics
7. **Transaction Table**: Detailed, sortable transaction list

### Key Insights Generated
- Busiest spending day of the week
- Most frequent expense category
- Average transaction value
- Monthly and yearly trends
- Account balance distribution
- Category-wise spending patterns

## 🐛 Troubleshooting

### Common Issues

**CSV/Excel Upload Not Working**
- Ensure file follows the exact format specified
- Check that all required columns are present
- Verify date format is DD/MM/YYYY
- For Excel files, ensure data is in the first worksheet

**Charts Not Displaying**
- Check browser console for JavaScript errors
- Ensure all dependencies are installed correctly
- Verify file data is properly formatted

**Build Failures**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version compatibility
- Clear npm cache: `npm cache clean --force`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add new feature'`
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
#   F i n a n c i a l   D a s h b o a r d  
 