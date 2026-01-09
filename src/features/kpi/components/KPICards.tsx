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

// Helper function to get color classes based on color prop
const getColorClasses = (color: KPICardProps["color"]) => {
  const colorMap: Record<KPICardProps["color"], { icon: string; bar: string; side: string }> = {
    green: {
      icon: "from-green-600/20 to-green-800/20 text-green-400",
      bar: "from-green-600 via-green-500 to-emerald-400",
      side: "bg-gradient-to-b from-green-400 to-emerald-600",
    },
    red: {
      icon: "from-red-600/20 to-red-800/20 text-red-400",
      bar: "from-red-600 via-red-500 to-rose-400",
      side: "bg-gradient-to-b from-red-400 to-rose-600",
    },
    blue: {
      icon: "from-blue-600/20 to-blue-800/20 text-blue-400",
      bar: "from-blue-600 via-blue-500 to-cyan-400",
      side: "bg-gradient-to-b from-blue-400 to-cyan-600",
    },
    purple: {
      icon: "from-purple-600/20 to-purple-800/20 text-purple-400",
      bar: "from-purple-600 via-purple-500 to-pink-400",
      side: "bg-gradient-to-b from-purple-400 to-pink-600",
    },
    orange: {
      icon: "from-orange-600/20 to-orange-800/20 text-orange-400",
      bar: "from-orange-600 via-orange-500 to-yellow-400",
      side: "bg-gradient-to-b from-orange-400 to-yellow-600",
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
      <div className="group relative glass border border-gray-700/30 p-7 rounded-2xl shadow-2xl hover:shadow-blue-500/20 transform hover:scale-105 transition-all duration-300 overflow-hidden animate-scale-in">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

        <div className="relative z-10 flex items-center justify-between mb-5">
          <span className="text-base font-semibold text-gray-400 group-hover:text-gray-300 transition-colors duration-300 tracking-wide">
            {title}
          </span>
          <div
            className={`p-3.5 rounded-2xl bg-gradient-to-br ${colors.icon} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl`}
          >
            {icon}
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white group-hover:text-gradient-primary transition-all duration-300 mb-1">
            {formatCurrency(value)}
          </h2>
        </div>

        {/* Bottom accent bar with animation */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.bar} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left shadow-lg`}
        ></div>

        {/* Side glow effect */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${colors.side} transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500`}
        ></div>
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
      <div className="group glass border border-gray-700/30 p-6 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div
          className={`relative z-10 p-4 rounded-2xl bg-gradient-to-br ${colors.icon} mr-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}
        >
          {icon}
        </div>
        <div className="relative z-10 flex-1">
          <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-300 block mb-1">
            {title}
          </span>
          <p className="text-2xl font-extrabold text-white group-hover:text-gradient-primary transition-all duration-300">
            {displayValue()}
            {unit && <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>}
          </p>
        </div>

        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.side} transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 shadow-lg`}
        ></div>
      </div>
    );
  }
);
