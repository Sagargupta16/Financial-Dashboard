/**
 * Financial Health Score Helper Functions
 * Extracted to reduce component complexity
 */

/**
 * Get score color based on value
 * @param scoreValue - Health score value
 * @returns Tailwind CSS class
 */
export const getScoreColor = (scoreValue: number): string => {
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
 * @param scoreValue - Health score value
 * @returns Tailwind CSS class
 */
export const getGradient = (scoreValue: number): string => {
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
 * @param params - Parameters object
 * @returns Health data object
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
}: {
  filteredData: any[];
  kpiData: any;
  accountBalances: any;
  allAccountBalances?: any;
  investments: any;
  deposits: any;
  calculateCategorySpending: any;
  calculateHealthScore: any;
  generateRecommendations: any;
}): any => {
  const categorySpending = calculateCategorySpending(filteredData);
  const totalExpenses = Object.values(categorySpending).reduce(
    (sum: number, val: unknown) => sum + Number(val || 0),
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
