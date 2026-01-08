// @ts-nocheck
/**
 * Financial Health Score Helper Functions
 * Extracted to reduce component complexity
 */

/**
 * Get score color based on value
 * @param {number} scoreValue - Health score value
 * @returns {string} Tailwind CSS class
 */
export const getScoreColor = (scoreValue) => {
  if (scoreValue >= 80) {
    return "text-green-400";
  }
  if (scoreValue >= 60) {
    return "text-yellow-400";
  }
  return "text-red-400";
};

/**
 * Get gradient color based on score
 * @param {number} scoreValue - Health score value
 * @returns {string} Tailwind CSS class
 */
export const getGradient = (scoreValue) => {
  if (scoreValue >= 80) {
    return "from-green-600 to-green-700";
  }
  if (scoreValue >= 60) {
    return "from-yellow-600 to-yellow-700";
  }
  return "from-red-600 to-red-700";
};

/**
 * Prepare health data for score calculation
 * @param {Object} params - Parameters object
 * @param {Array} params.filteredData - Filtered transaction data
 * @param {Object} params.kpiData - KPI metrics
 * @param {Object} params.accountBalances - Account balance data
 * @param {Object} params.investments - Investment data
 * @param {Object} params.deposits - Deposit data
 * @param {Function} params.calculateCategorySpending - Function to calculate category spending
 * @param {Function} params.calculateHealthScore - Function to calculate health score
 * @param {Function} params.generateRecommendations - Function to generate recommendations
 * @returns {Object} Health data object
 */
export const prepareHealthData = ({
  filteredData,
  kpiData,
  accountBalances,
  allAccountBalances,
  investments,
  deposits,
  calculateCategorySpending,
  calculateHealthScore,
  generateRecommendations,
}) => {
  const categorySpending = calculateCategorySpending(filteredData);
  const totalExpenses = Object.values(categorySpending).reduce(
    (sum, val) => sum + val,
    0
  );

  const income = kpiData?.income || 0;
  const data = {
    income,
    expenses: totalExpenses,
    savings: income - totalExpenses,
    accountBalances: accountBalances || {},
    allAccountBalances: allAccountBalances || accountBalances || {},
    investments: investments || {},
    deposits: deposits || {},
    categorySpending,
    filteredData,
  };

  const score = calculateHealthScore(data);
  const budgetComparison = {};
  const recommendations = generateRecommendations(budgetComparison, score);

  return { score, recommendations, data };
};
