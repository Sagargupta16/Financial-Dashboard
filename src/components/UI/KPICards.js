import React from "react";
import { formatCurrency } from "../../utils/dataUtils";

export const KPICard = ({ title, value, icon, color }) => (
  <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between transform hover:scale-105 transition-transform duration-300">
    <div className="flex items-center justify-between text-gray-400">
      <span className="text-lg font-medium">{title}</span>
      <div className={`p-2 rounded-lg bg-${color}-900/50 text-${color}-400`}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <h2 className="text-4xl font-bold text-white">{formatCurrency(value)}</h2>
    </div>
  </div>
);

export const SmallKPICard = ({ title, value, icon, unit }) => (
  <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex items-center">
    <div className="p-3 rounded-lg bg-gray-700 text-blue-400 mr-4">{icon}</div>
    <div>
      <span className="text-sm text-gray-400">{title}</span>
      <p className="text-xl font-bold text-white">
        {typeof value === "number" && !unit ? formatCurrency(value) : value}
        {unit && <span className="text-base font-normal"> {unit}</span>}
      </p>
    </div>
  </div>
);
