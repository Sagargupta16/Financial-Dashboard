import React from "react";
import { formatCurrency } from "../../utils/dataUtils";

export const KPICard = ({ title, value, icon, color }) => (
  <div className="group relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-gray-600 overflow-hidden">
    {/* Animated background gradient */}
    {/* <div
      className={`absolute inset-0 bg-gradient-to-br from-${color}-600/10 via-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
    ></div> */}

    {/* Floating particles effect */}
    {/* <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div> */}

    <div className="relative z-10 flex items-center justify-between text-gray-400 mb-4">
      <span className="text-lg font-medium group-hover:text-gray-300 transition-colors duration-300">
        {title}
      </span>
      <div
        className={`p-3 rounded-xl bg-gradient-to-br from-${color}-600/20 to-${color}-800/20 text-${color}-400 group-hover:from-${color}-500/30 group-hover:to-${color}-700/30 group-hover:scale-110 transition-all duration-300 shadow-lg`}
      >
        {icon}
      </div>
    </div>
    <div className="relative z-10">
      <h2 className="text-4xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
        {formatCurrency(value)}
      </h2>
    </div>

    {/* Bottom accent line */}
    <div
      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${color}-600 to-${color}-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
    ></div>
  </div>
);

export const SmallKPICard = ({ title, value, icon, unit }) => (
  <div className="group bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center border border-gray-700 hover:border-gray-600 relative overflow-hidden">
    {/* Hover background effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    <div className="relative z-10 p-3 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 text-blue-400 mr-4 group-hover:from-blue-600/20 group-hover:to-blue-800/20 group-hover:scale-110 transition-all duration-300 shadow-lg">
      {icon}
    </div>
    <div className="relative z-10">
      <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {title}
      </span>
      <p className="text-xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
        {typeof value === "number" && !unit ? formatCurrency(value) : value}
        {unit && (
          <span className="text-base font-normal text-gray-400"> {unit}</span>
        )}
      </p>
    </div>

    {/* Side accent */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-purple-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
  </div>
);
