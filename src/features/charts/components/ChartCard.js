import React from "react";
import PropTypes from "prop-types";
import { Download } from "lucide-react";
import { downloadChart } from "../../../shared/utils/dataUtils";

export const ChartCard = ({
  title,
  children,
  chartRef,
  fileName,
  className = "bg-gray-800 p-6 rounded-2xl shadow-lg h-[450px] flex flex-col",
}) => (
  <div className={className}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {chartRef && fileName && (
        <button
          onClick={() => downloadChart(chartRef, fileName)}
          className="text-gray-400 hover:text-white"
        >
          <Download size={18} />
        </button>
      )}
    </div>
    <div className="flex-grow">{children}</div>
  </div>
);

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  chartRef: PropTypes.object,
  fileName: PropTypes.string,
  className: PropTypes.string,
};
