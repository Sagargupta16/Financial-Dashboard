import type { Chart as ChartJS } from "chart.js";
import { Download } from "lucide-react";
import type React from "react";
import { downloadChart } from "../../../lib/data";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  chartRef?: React.RefObject<ChartJS | null>;
  fileName?: string;
  className?: string;
}

export const ChartCard = ({
  title,
  children,
  chartRef,
  fileName,
  className = "glass border border-gray-700/30 p-6 rounded-2xl shadow-2xl h-[450px] flex flex-col card-hover animate-scale-in",
}: ChartCardProps) => (
  <div className={className}>
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        {title}
      </h3>
      {chartRef && fileName && (
        <button
          type="button"
          onClick={() => downloadChart(chartRef, fileName)}
          className="group p-2.5 rounded-xl bg-gray-700/50 text-gray-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 hover:scale-110 shadow-lg"
          title="Download chart"
        >
          <Download size={18} className="group-hover:animate-bounce" />
        </button>
      )}
    </div>
    <div className="flex-grow relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl"></div>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  </div>
);
