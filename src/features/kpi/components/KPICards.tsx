import React from "react";
import { formatCurrency } from "../../../lib/formatters";

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "green" | "red" | "blue" | "purple" | "orange";
}

interface SmallKPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  unit?: string;
  isCount?: boolean;
  color?: KPICardProps["color"];
}

const getColorClasses = (color: KPICardProps["color"]) => {
  const colorMap: Record<KPICardProps["color"], { icon: string; accent: string }> = {
    green: {
      icon: "bg-green-500/15 text-green-400",
      accent: "bg-green-500",
    },
    red: {
      icon: "bg-red-500/15 text-red-400",
      accent: "bg-red-500",
    },
    blue: {
      icon: "bg-blue-500/15 text-blue-400",
      accent: "bg-blue-500",
    },
    purple: {
      icon: "bg-purple-500/15 text-purple-400",
      accent: "bg-purple-500",
    },
    orange: {
      icon: "bg-orange-500/15 text-orange-400",
      accent: "bg-orange-500",
    },
  };
  return colorMap[color] || colorMap.blue;
};

/**
 * KPICard Component - Memoized for performance
 * Only re-renders when value changes
 */
export const KPICard = React.memo(
  ({ title, value, icon, color }: KPICardProps) => {
    const colors = getColorClasses(color);

    return (
      <div className="relative bg-gray-800/50 border border-gray-700/30 p-6 rounded-xl hover:border-gray-600/50 transition-colors duration-200 overflow-hidden">
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.accent}`} />

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-400">{title}</span>
          <div className={`p-2.5 rounded-xl ${colors.icon}`}>{icon}</div>
        </div>
        <h2 className="text-3xl font-bold text-white">{formatCurrency(value)}</h2>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value && prevProps.title === nextProps.title
);

/**
 * SmallKPICard Component - Memoized for performance
 * Compact version of KPICard for grid layouts
 */
export const SmallKPICard = React.memo(
  ({ title, value, icon, unit, isCount = false, color = "blue" }: SmallKPICardProps) => {
    const colors = getColorClasses(color);

    const displayValue = () => {
      if (typeof value === "number" && !unit && !isCount) {
        return formatCurrency(value);
      }
      if (isCount && typeof value === "number") {
        return value.toLocaleString();
      }
      return value;
    };

    return (
      <div className="relative bg-gray-800/50 border border-gray-700/30 p-5 rounded-xl hover:border-gray-600/50 transition-colors duration-200 flex items-center overflow-hidden">
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.accent}`} />

        <div className={`p-3 rounded-xl ${colors.icon} mr-4 flex-shrink-0`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-400 block mb-1">{title}</span>
          <p className="text-xl font-bold text-white truncate">
            {displayValue()}
            {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    );
  }
);
