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
 * Format monthly trend display
 * @param {Object} monthlyComparison - Monthly comparison data
 * @returns {string} Formatted trend display
 */
export const getMonthlyTrendDisplay = (monthlyComparison) => {
  if (!monthlyComparison?.trend || monthlyComparison.avgGrowth === undefined) {
    return "N/A";
  }
  if (monthlyComparison.trend === "increasing") {
    return `↗️ +${monthlyComparison.avgGrowth.toFixed(1)}%`;
  }
  if (monthlyComparison.trend === "decreasing") {
    return `↘️ ${monthlyComparison.avgGrowth.toFixed(1)}%`;
  }
  return "→ Stable";
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
  const totalMonthly = recurringTransactions.reduce(
    (sum, t) => sum + Math.abs(t.averageAmount),
    0
  );
  return `${recurringTransactions.length} (${formatCurrency(totalMonthly)}/mo)`;
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
