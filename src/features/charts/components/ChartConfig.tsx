import { getCommonChartOptions } from "../../../lib/charts";

// Chart configuration will be moved here gradually
// For now, these are exported from ChartComponents.js to avoid conflicts
const commonChartOptions = getCommonChartOptions();

const doughnutOptions = {
  ...commonChartOptions,
  scales: {},
};

// Export for internal use within chart files
export { commonChartOptions, doughnutOptions };
