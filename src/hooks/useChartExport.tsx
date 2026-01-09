import type { Chart as ChartJS } from "chart.js";
import type { RefObject } from "react";

/**
 * Export a Chart.js chart as PNG image
 * @param {RefObject<ChartJS>} chartRef - Reference to the chart instance
 * @param {string} filename - Name for the downloaded file
 */
export const exportChartAsPNG = (chartRef: RefObject<ChartJS>, filename: string): void => {
  if (!chartRef.current) {
    console.warn("Chart reference is not available");
    return;
  }

  try {
    const url = chartRef.current.toBase64Image();
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting chart:", error);
  }
};

/**
 * Custom hook for chart export functionality
 * @param {RefObject<ChartJS>} chartRef - Reference to the chart instance
 * @param {string} defaultFilename - Default filename for exports
 * @returns {object} - Export utilities
 *
 * @example
 * const chartRef = useRef<ChartJS>(null);
 * const { exportAsPNG, canExport } = useChartExport(chartRef, 'my-chart');
 *
 * <button onClick={exportAsPNG} disabled={!canExport}>
 *   Download Chart
 * </button>
 */
export const useChartExport = (chartRef: RefObject<ChartJS>, defaultFilename: string) => {
  const exportAsPNG = (customFilename?: string) => {
    exportChartAsPNG(chartRef, customFilename || defaultFilename);
  };

  const canExport = chartRef.current !== null;

  return {
    exportAsPNG,
    canExport,
    chartRef,
  };
};
