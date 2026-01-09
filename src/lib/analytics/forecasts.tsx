/**
 * Advanced Forecasting Utilities
 * Provides sophisticated forecasting methods for financial data
 */

/**
 * Calculate moving average
 * @param data - Array of numbers
 * @param window - Window size
 * @returns Moving averages
 */
export const calculateMovingAverage = (data: number[], window = 3): number[] => {
  if (!data || data.length < window) {
    return [];
  }

  const result = [];
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }
  return result;
};

interface SmoothingResult {
  smoothed: number[];
  forecast: number[];
}

/**
 * Calculate exponential smoothing forecast
 * @param data - Historical data points
 * @param alpha - Smoothing factor (0-1, higher = more weight to recent)
 * @param periods - Number of periods to forecast
 * @returns Forecast data with smoothed values
 */
export const exponentialSmoothing = (data: number[], alpha = 0.3, periods = 6): SmoothingResult => {
  if (!data || data.length === 0) {
    return { smoothed: [], forecast: [] };
  }

  const smoothed = [data[0]];

  // Calculate smoothed values for historical data
  for (let i = 1; i < data.length; i++) {
    const smoothedValue = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
    smoothed.push(smoothedValue);
  }

  // Forecast future values (flat forecast - last smoothed value)
  const lastSmoothed = smoothed.at(-1);
  const forecast = new Array(periods).fill(lastSmoothed);

  return { smoothed, forecast };
};

interface DoubleExponentialResult {
  smoothed: number[];
  forecast: number[];
  level: number[];
  trend: number[];
}

/**
 * Calculate double exponential smoothing (Holt's method)
 * Better for data with trends
 * @param data - Historical data points
 * @param alpha - Level smoothing factor
 * @param beta - Trend smoothing factor
 * @param periods - Number of periods to forecast
 * @returns Forecast with trend
 */
export const doubleExponentialSmoothing = (
  data: number[],
  alpha = 0.3,
  beta = 0.1,
  periods = 6
): DoubleExponentialResult => {
  if (!data || data.length < 2) {
    return { smoothed: [], forecast: [], level: [], trend: [] };
  }

  const level = [data[0]];
  const trend = [data[1] - data[0]];
  const smoothed = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const newLevel = alpha * data[i] + (1 - alpha) * (level[i - 1] + trend[i - 1]);
    const newTrend = beta * (newLevel - level[i - 1]) + (1 - beta) * trend[i - 1];

    level.push(newLevel);
    trend.push(newTrend);
    smoothed.push(newLevel);
  }

  // Forecast with trend
  const lastLevel = level.at(-1) ?? 0;
  const lastTrend = trend.at(-1) ?? 0;
  const forecast = [];

  for (let i = 1; i <= periods; i++) {
    forecast.push(Math.max(0, lastLevel + i * lastTrend));
  }

  return { smoothed, forecast, level, trend };
};

interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

/**
 * Calculate linear regression
 * @param data - Array of numbers
 * @returns Slope and intercept
 */
export const linearRegression = (data: number[]): LinearRegressionResult => {
  if (!data || data.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const yMean = sumY / n;
  const ssTotal = data.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  const ssResidual = data.reduce((sum, y, i) => sum + (y - (slope * i + intercept)) ** 2, 0);
  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
};

interface SeasonalityResult {
  hasSeasonality: boolean;
  indices: Record<string, number>;
  strength: number;
  monthlyAverages?: Record<string, number>;
  overallAverage?: number;
}

/**
 * Detect seasonal patterns
 * @param monthlyData - Data grouped by month (e.g., "2024-01": value)
 * @returns Seasonal indices and analysis
 */
export const detectSeasonality = (monthlyData: Record<string, number>): SeasonalityResult => {
  if (!monthlyData || Object.keys(monthlyData).length < 12) {
    return { hasSeasonality: false, indices: {}, strength: 0 };
  }

  // Group by month (1-12) across all years
  const monthGroups: Record<number, number[]> = {};
  Object.entries(monthlyData).forEach(([key, value]) => {
    const month = Number.parseInt(key.split("-")[1], 10);
    if (!monthGroups[month]) {
      monthGroups[month] = [];
    }
    monthGroups[month].push(value);
  });

  // Calculate average for each month
  const monthlyAverages: Record<number, number> = {};
  Object.entries(monthGroups).forEach(([month, values]) => {
    monthlyAverages[Number(month)] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  // Calculate overall average
  const overallAverage = Object.values(monthlyAverages).reduce((a, b) => a + b, 0) / 12;

  // Calculate seasonal indices (month average / overall average)
  const indices: Record<string, number> = {};
  Object.entries(monthlyAverages).forEach(([month, avg]) => {
    indices[month] = overallAverage > 0 ? avg / overallAverage : 1;
  });

  // Calculate seasonality strength (coefficient of variation)
  const values = Object.values(indices);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const strength = mean > 0 ? stdDev / mean : 0;

  return {
    hasSeasonality: strength > 0.15, // 15% variation threshold
    indices,
    strength,
    monthlyAverages,
    overallAverage,
  };
};

interface OutlierItem {
  index: number;
  value: number;
}

interface OutliersResult {
  outliers: OutlierItem[];
  cleanData: number[];
  lowerBound?: number;
  upperBound?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
}

/**
 * Detect outliers using IQR method
 * @param data - Array of numbers
 * @returns Outlier analysis
 */
export const detectOutliers = (data: number[]): OutliersResult => {
  if (!data || data.length < 4) {
    return { outliers: [], cleanData: data || [] };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: OutlierItem[] = [];
  const cleanData: number[] = [];

  data.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outliers.push({ index, value });
    } else {
      cleanData.push(value);
    }
  });

  return {
    outliers,
    cleanData,
    lowerBound,
    upperBound,
    q1,
    q3,
    iqr,
  };
};

interface ConfidenceIntervalsResult {
  upper: number[];
  lower: number[];
  stdDev?: number;
  margin?: number;
}

/**
 * Calculate confidence intervals for forecast
 * @param historicalData - Historical data points
 * @param forecastData - Forecasted values
 * @param confidence - Confidence level (0.95 for 95%)
 * @returns Upper and lower bounds
 */
export const calculateConfidenceIntervals = (
  historicalData: number[],
  forecastData: number[],
  confidence = 0.95
): ConfidenceIntervalsResult => {
  if (!historicalData || !forecastData || historicalData.length < 2) {
    return { upper: forecastData, lower: forecastData };
  }

  // Calculate standard deviation of historical data
  const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
  const variance =
    historicalData.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (historicalData.length - 1);
  const stdDev = Math.sqrt(variance);

  // Z-score for confidence level (1.96 for 95%)
  let zScore = 1.96;
  if (confidence === 0.99) {
    zScore = 2.576;
  } else if (confidence === 0.9) {
    zScore = 1.645;
  }

  // Calculate margin of error (increases with forecast horizon)
  const upper = forecastData.map((value, index) => {
    const margin = stdDev * zScore * Math.sqrt(1 + (index + 1) / historicalData.length);
    return value + margin;
  });

  const lower = forecastData.map((value, index) => {
    const margin = stdDev * zScore * Math.sqrt(1 + (index + 1) / historicalData.length);
    return Math.max(0, value - margin);
  });

  return { upper, lower, stdDev, margin: stdDev * zScore };
};

interface VolatilityResult {
  volatility: number;
  level: string;
  stdDev?: number;
  mean?: number;
}

/**
 * Calculate volatility index
 * @param data - Historical data
 * @returns Volatility metrics
 */
export const calculateVolatility = (data: number[]): VolatilityResult => {
  if (!data || data.length < 2) {
    return { volatility: 0, level: "stable" };
  }

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation
  const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

  let level;
  if (volatility > 30) {
    level = "very high";
  } else if (volatility > 20) {
    level = "high";
  } else if (volatility > 10) {
    level = "moderate";
  } else if (volatility > 5) {
    level = "low";
  } else {
    level = "stable";
  }

  return { volatility, level, stdDev, mean };
};

interface ComprehensiveForecastResult {
  simple: { forecast: number[] };
  exponential: SmoothingResult;
  doubleExponential: DoubleExponentialResult;
  regression: LinearRegressionResult & { forecast: number[] };
  best: {
    method: string;
    forecast: number[];
    confidence: ConfidenceIntervalsResult;
  };
  volatility: VolatilityResult;
  outliers: number;
  dataQuality: {
    r2: number;
    volatility: number;
    outlierCount: number;
  };
}

/**
 * Comprehensive forecast with multiple methods
 * @param historicalData - Historical data points
 * @param periods - Periods to forecast
 * @returns All forecast methods and analysis
 */
export const comprehensiveForecast = (
  historicalData: number[],
  periods = 6
): ComprehensiveForecastResult | null => {
  if (!historicalData || historicalData.length < 3) {
    return null;
  }

  // Remove outliers for cleaner forecast
  const { cleanData, outliers } = detectOutliers(historicalData);
  const dataToUse = cleanData.length >= 3 ? cleanData : historicalData;

  // Calculate all forecast methods
  const simpleAverage =
    dataToUse.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, dataToUse.length);
  const expSmooth = exponentialSmoothing(dataToUse, 0.3, periods);
  const doubleExpSmooth = doubleExponentialSmoothing(dataToUse, 0.3, 0.1, periods);
  const regression = linearRegression(dataToUse);

  // Linear regression forecast
  const regressionForecast = Array.from({ length: periods }, (_, i) => {
    return Math.max(0, regression.slope * (dataToUse.length + i) + regression.intercept);
  });

  // Determine best method based on R² and volatility
  const volatility = calculateVolatility(dataToUse);
  let bestMethod = "exponential";
  let bestForecast = expSmooth.forecast;

  if (regression.r2 > 0.7 && volatility.level !== "very high") {
    bestMethod = "regression";
    bestForecast = regressionForecast;
  } else if (volatility.level === "low" || volatility.level === "stable") {
    bestMethod = "double-exponential";
    bestForecast = doubleExpSmooth.forecast;
  }

  // Calculate confidence intervals
  const confidence = calculateConfidenceIntervals(dataToUse, bestForecast);

  return {
    simple: { forecast: new Array(periods).fill(simpleAverage) },
    exponential: expSmooth,
    doubleExponential: doubleExpSmooth,
    regression: { forecast: regressionForecast, ...regression },
    best: {
      method: bestMethod,
      forecast: bestForecast,
      confidence,
    },
    volatility,
    outliers: outliers.length,
    dataQuality: {
      r2: regression.r2,
      volatility: volatility.volatility,
      outlierCount: outliers.length,
    },
  };
};
