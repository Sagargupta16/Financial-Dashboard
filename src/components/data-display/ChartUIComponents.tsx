import type { Chart as ChartJS } from "chart.js";
import type React from "react";
import { exportChartAsPNG } from "../../hooks/useChartExport";

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
  colSpan?: string;
  chartRef?: React.RefObject<ChartJS>;
  filename?: string;
  actions?: React.ReactNode;
}

interface ExportButtonProps {
  chartRef?: React.RefObject<ChartJS>;
  filename: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  value: string;
  onChange: (_e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: DropdownOption[];
  className?: string;
}

interface NavigationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  direction?: "left" | "right";
  className?: string;
}

interface TimeNavigationControlsProps {
  viewMode: string;
  onViewModeChange: (_mode: string) => void;
  currentPeriod: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  viewModeOptions?: DropdownOption[];
}

interface ChartWrapperProps {
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

interface FilterItem {
  name: string;
  value: string;
  options: DropdownOption[];
}

interface FilterControlsProps {
  filters: FilterItem[];
  onFilterChange?: (_name: string, _value: string) => void;
  className?: string;
}

interface InfoCardProps {
  label: string;
  value: string | number;
  change?: number | null;
  icon?: React.ReactNode;
  className?: string;
}

// Common chart container component
export const ChartContainer = ({
  title,
  children,
  className = "",
  height = "h-[450px]",
  colSpan = "",
  chartRef,
  filename,
  actions = null,
}: ChartContainerProps) => {
  return (
    <div
      className={`bg-gray-800 p-6 rounded-2xl shadow-lg ${height} flex flex-col ${colSpan} ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-4">
          {actions}
          {chartRef && filename && <ExportButton chartRef={chartRef} filename={filename} />}
        </div>
      </div>
      {children}
    </div>
  );
};

// Export button component
export const ExportButton = ({ chartRef, filename }: ExportButtonProps) => (
  <button
    type="button"
    onClick={() => chartRef && exportChartAsPNG(chartRef, filename)}
    className="text-gray-400 hover:text-white transition-colors"
    title="Export as PNG"
    disabled={!chartRef}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      role="img"
      aria-label="Download chart as PNG"
    >
      <title>Download Chart</title>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  </button>
);

// Common dropdown/select component
export const DropdownSelect = ({
  value,
  onChange,
  options = [],
  className = "bg-gray-700 text-white px-3 py-1 rounded-lg text-sm",
}: DropdownSelectProps) => (
  <select value={value} onChange={onChange} className={className}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Navigation button component
export const NavigationButton = ({
  onClick,
  disabled,
  direction = "left",
  className = "text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
}: NavigationButtonProps) => (
  <button type="button" onClick={onClick} disabled={disabled} className={className}>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      role="img"
      aria-label={direction === "left" ? "Previous" : "Next"}
    >
      <title>{direction === "left" ? "Previous" : "Next"}</title>
      {direction === "left" ? (
        <polyline points="15,18 9,12 15,6" />
      ) : (
        <polyline points="9,18 15,12 9,6" />
      )}
    </svg>
  </button>
);

// Time navigation controls component
export const TimeNavigationControls = ({
  viewMode,
  onViewModeChange,
  currentPeriod,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  viewModeOptions = [
    { value: "month", label: "Monthly View" },
    { value: "year", label: "Yearly View" },
    { value: "all-time", label: "All Time" },
  ],
}: TimeNavigationControlsProps) => (
  <div className="flex justify-between items-center mb-4 bg-gray-700/50 rounded-lg p-3">
    <div className="flex items-center gap-2">
      <DropdownSelect
        value={viewMode}
        onChange={(e) => onViewModeChange(e.target.value)}
        options={viewModeOptions}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="flex items-center gap-4">
      <NavigationButton onClick={onPrevious} disabled={!canGoPrevious} direction="left" />

      <div className="text-white font-semibold min-w-[150px] text-center">{currentPeriod}</div>

      <NavigationButton onClick={onNext} disabled={!canGoNext} direction="right" />
    </div>
  </div>
);

// Chart wrapper with loading and error states
export const ChartWrapper = ({
  loading = false,
  error = null,
  children,
  className = "flex-1 relative",
}: ChartWrapperProps) => {
  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

// Filter controls component
export const FilterControls = ({
  filters,
  onFilterChange,
  className = "flex items-center space-x-4",
}: FilterControlsProps) => (
  <div className={className}>
    {filters.map((filter) => (
      <DropdownSelect
        key={filter.name}
        value={filter.value}
        onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
        options={filter.options}
      />
    ))}
  </div>
);

// Info card component for displaying metrics
export const InfoCard = ({
  label,
  value,
  change = null,
  icon = null,
  className = "bg-gray-700/50 rounded-lg p-3",
}: InfoCardProps) => (
  <div className={className}>
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">{label}</span>
      {icon && <span className="text-gray-400">{icon}</span>}
    </div>
    <div className="text-white font-semibold text-lg mt-1">{value}</div>
    {change !== null && (
      <div className={`text-sm mt-1 ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
        {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(1)}%
      </div>
    )}
  </div>
);
