/**
 * Metric Helper Utilities
 * Reusable helper functions for KPI metrics, colors, and formatting
 */

/**
 * Get color class for savings rate metric
 * @param {number} rate - Savings rate percentage
 * @returns {string} Tailwind CSS class
 */
export const getSavingsRateColor = (rate) => {
  if (rate >= 20) {
    return "bg-green-900/20 border-green-500/30";
  }
  if (rate >= 10) {
    return "bg-yellow-900/20 border-yellow-500/30";
  }
  return "bg-red-900/20 border-red-500/30";
};

/**
 * Get icon color for savings rate metric
 * @param {number} rate - Savings rate percentage
 * @returns {string} Tailwind CSS class
 */
export const getSavingsRateIconColor = (rate) => {
  if (rate >= 20) {
    return "text-green-400";
  }
  if (rate >= 10) {
    return "text-yellow-400";
  }
  return "text-red-400";
};

/**
 * Get message for savings rate metric
 * @param {number} rate - Savings rate percentage
 * @returns {string} Message text
 */
export const getSavingsRateMessage = (rate) => {
  if (rate >= 20) {
    return "Excellent! 🎉";
  }
  if (rate >= 10) {
    return "Good, aim for 20%+";
  }
  return "Target: 20%+";
};

/**
 * Get color class for spending velocity metric
 * @param {number} velocity - Spending velocity percentage
 * @returns {string} Tailwind CSS class
 */
export const getSpendingVelocityColor = (velocity) => {
  if (velocity > 120) {
    return "bg-red-900/20 border-red-500/30";
  }
  if (velocity < 80) {
    return "bg-green-900/20 border-green-500/30";
  }
  return "bg-yellow-900/20 border-yellow-500/30";
};

/**
 * Get icon color for spending velocity metric
 * @param {number} velocity - Spending velocity percentage
 * @returns {string} Tailwind CSS class
 */
export const getSpendingVelocityIconColor = (velocity) => {
  if (velocity > 120) {
    return "text-red-400";
  }
  if (velocity < 80) {
    return "text-green-400";
  }
  return "text-yellow-400";
};

/**
 * Get color class for net worth metric
 * @param {number} netWorth - Net worth value
 * @returns {string} Tailwind CSS class
 */
export const getNetWorthColor = (netWorth) => {
  return netWorth >= 0
    ? "bg-green-900/20 border-green-500/30"
    : "bg-red-900/20 border-red-500/30";
};

/**
 * Get icon color for net worth metric
 * @param {number} netWorth - Net worth value
 * @returns {string} Tailwind CSS class
 */
export const getNetWorthIconColor = (netWorth) => {
  return netWorth >= 0 ? "text-green-400" : "text-red-400";
};

/**
 * Get color class for category concentration
 * @param {number} percentage - Concentration percentage
 * @param {number} threshold - Warning threshold (default 50)
 * @returns {string} Tailwind CSS class
 */
export const getCategoryConcentrationColor = (percentage, threshold = 50) => {
  return percentage > threshold
    ? "bg-orange-900/20 border-orange-500/30"
    : "bg-blue-900/20 border-blue-500/30";
};

/**
 * Get color class for insight priority
 * @param {string} priority - Priority level (high, positive, medium, low)
 * @returns {string} Tailwind CSS class
 */
export const getInsightPriorityColor = (priority) => {
  if (priority === "high") {
    return "bg-red-900/20 border-red-500/30";
  }
  if (priority === "positive") {
    return "bg-green-900/20 border-green-500/30";
  }
  if (priority === "medium") {
    return "bg-yellow-900/20 border-yellow-500/30";
  }
  return "bg-blue-900/20 border-blue-500/30";
};

/**
 * Get metric color class based on thresholds
 * @param {number} value - Metric value
 * @param {Object} thresholds - {good, warning} threshold values
 * @param {boolean} inverse - If true, lower is better
 * @returns {string} Tailwind CSS class
 */
export const getMetricColor = (value, thresholds, inverse = false) => {
  const { good, warning } = thresholds;

  if (inverse) {
    if (value <= good) {
      return "bg-green-900/20 border-green-500/30";
    }
    if (value <= warning) {
      return "bg-yellow-900/20 border-yellow-500/30";
    }
    return "bg-red-900/20 border-red-500/30";
  }

  if (value >= good) {
    return "bg-green-900/20 border-green-500/30";
  }
  if (value >= warning) {
    return "bg-yellow-900/20 border-yellow-500/30";
  }
  return "bg-red-900/20 border-red-500/30";
};

/**
 * Get metric icon color based on thresholds
 * @param {number} value - Metric value
 * @param {Object} thresholds - {good, warning} threshold values
 * @param {boolean} inverse - If true, lower is better
 * @returns {string} Tailwind CSS class
 */
export const getMetricIconColor = (value, thresholds, inverse = false) => {
  const { good, warning } = thresholds;

  if (inverse) {
    if (value <= good) {
      return "text-green-400";
    }
    if (value <= warning) {
      return "text-yellow-400";
    }
    return "text-red-400";
  }

  if (value >= good) {
    return "text-green-400";
  }
  if (value >= warning) {
    return "text-yellow-400";
  }
  return "text-red-400";
};

/**
 * Format monthly trend display - Shows Month-over-Month spending trend
 * @param {Object} monthlyComparison - Monthly comparison data
 * @returns {string} Formatted trend message
 */
export const getMonthlyTrendDisplay = (monthlyComparison) => {
  if (!monthlyComparison?.trend || monthlyComparison.avgGrowth === undefined) {
    return "No trend data";
  }
  if (monthlyComparison.trend === "increasing") {
    return `↗️ +${monthlyComparison.avgGrowth.toFixed(1)}% MoM`;
  }
  if (monthlyComparison.trend === "decreasing") {
    return `↘️ ${monthlyComparison.avgGrowth.toFixed(1)}% MoM`;
  }
  return `➡️ Stable (${monthlyComparison.avgGrowth.toFixed(1)}% MoM)`;
};

/**
 * Format anomaly alert display
 * @param {number} anomaliesCount - Number of anomalies
 * @returns {string} Formatted alert display
 */
export const getAnomalyAlertDisplay = (anomaliesCount) => {
  if (anomaliesCount > 0) {
    const plural = anomaliesCount > 1 ? "s" : "";
    return `⚠️ ${anomaliesCount} unusual transaction${plural}`;
  }
  return "✓ All normal";
};

/**
 * Format subscriptions display
 * @param {Array} recurringTransactions - Array of recurring transactions
 * @param {Function} formatCurrency - Currency formatter function
 * @returns {string} Formatted subscriptions display
 */
export const getSubscriptionsDisplay = (
  recurringTransactions,
  formatCurrency
) => {
  if (!recurringTransactions || recurringTransactions.length === 0) {
    return "None detected";
  }

  // Filter only active subscriptions
  const activeSubscriptions = recurringTransactions.filter((t) => t.isActive);

  if (activeSubscriptions.length === 0) {
    return "None active";
  }

  // Calculate total monthly cost using monthlyEquivalent
  const totalMonthly = activeSubscriptions.reduce(
    (sum, t) => sum + (t.monthlyEquivalent || 0),
    0
  );

  const count = activeSubscriptions.length;
  const plural = count > 1 ? "s" : "";

  return `${count} active subscription${plural} (${formatCurrency(totalMonthly)}/mo)`;
};

/**
 * Get gradient and border styles for a section
 * @param {string} sectionType - Type of section (financial-health, insights, key-insights, transfer-info)
 * @returns {Object} Object with gradient and border classes
 */
export const getSectionStyles = (sectionType) => {
  const styles = {
    "financial-health": {
      gradient: "from-blue-900/20 to-purple-900/20",
      border: "border-blue-500/30",
    },
    insights: {
      gradient: "from-purple-900/20 to-pink-900/20",
      border: "border-purple-500/30",
    },
    "key-insights": {
      gradient: "from-gray-800/80 via-gray-800/60 to-gray-900/80",
      border: "border-gray-700/50",
    },
    "transfer-info": {
      gradient: "from-purple-900/20 to-purple-800/20",
      border: "border-purple-500/30",
    },
  };
  return (
    styles[sectionType] || {
      gradient: "from-gray-800/80 to-gray-900/80",
      border: "border-gray-700/50",
    }
  );
};

/**
 * Validate and provide default KPI data
 * @param {Object} kpiData - KPI data object
 * @param {Object} defaults - Default values
 * @returns {Object} Validated KPI data with defaults
 */
export const validateKPIData = (kpiData, defaults) => {
  if (!kpiData || typeof kpiData !== "object") {
    return defaults;
  }
  return {
    ...defaults,
    ...kpiData,
  };
};

/**
 * Extract unique years and months from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Object containing years and month labels
 */
export const getYearsAndMonths = (transactions) => {
  const yearSet = new Set();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    yearSet.add(date.getFullYear());
  });

  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
  const monthLabels = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  return { sortedYears, monthLabels };
};
