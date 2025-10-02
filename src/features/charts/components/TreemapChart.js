import React, { useRef, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3-selection";
import { hierarchy, treemap, treemapBinary } from "d3-hierarchy";
import { scaleOrdinal } from "d3-scale";
import { formatCurrency } from "../../../shared/utils/chartUtils";

// eslint-disable-next-line max-lines-per-function
export const TreemapChart = ({ filteredData, chartRef }) => {
  const svgRef = useRef(null);
  const [viewMode, setViewMode] = useState("all-time");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [showSubcategories, setShowSubcategories] = useState(false);

  // Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set();
    filteredData.forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filteredData]);

  // Filter data based on selected time period
  const timeFilteredData = useMemo(() => {
    return filteredData.filter((item) => {
      if (!item.date || item.type !== "Expense") {
        return false;
      }
      const date = new Date(item.date);

      if (viewMode === "all-time") {
        return true;
      } else if (viewMode === "year") {
        return date.getFullYear() === currentYear;
      } else if (viewMode === "month") {
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      }
      return false;
    });
  }, [filteredData, currentYear, currentMonth, viewMode]);

  // Process data for treemap
  const treemapData = useMemo(() => {
    if (!timeFilteredData || timeFilteredData.length === 0) {
      return { name: "root", children: [] };
    }

    if (showSubcategories) {
      // Group by category and subcategory
      const categoryData = {};

      timeFilteredData.forEach((item) => {
        const category = item.category || "Other";
        const subcategory = item.subcategory || "Uncategorized";

        if (!categoryData[category]) {
          categoryData[category] = {};
        }

        if (!categoryData[category][subcategory]) {
          categoryData[category][subcategory] = 0;
        }

        categoryData[category][subcategory] += item.amount;
      });

      // Convert to hierarchical structure
      const children = Object.entries(categoryData).map(
        ([category, subcategories]) => ({
          name: category,
          children: Object.entries(subcategories).map(
            ([subcategory, amount]) => ({
              name: subcategory,
              value: amount,
              category: category,
              fullName: `${category} - ${subcategory}`,
            })
          ),
        })
      );

      return { name: "root", children };
    } else {
      // Group by category only
      const categoryTotals = {};

      timeFilteredData.forEach((item) => {
        const category = item.category || "Other";
        categoryTotals[category] =
          (categoryTotals[category] || 0) + item.amount;
      });

      const children = Object.entries(categoryTotals).map(
        ([category, amount]) => ({
          name: category,
          value: amount,
          category: category,
        })
      );

      return { name: "root", children };
    }
  }, [timeFilteredData, showSubcategories]);

  // Color scale
  const colorScale = scaleOrdinal()
    .domain([
      "Food & Dining",
      "Shopping",
      "Transportation",
      "Bills & Utilities",
      "Entertainment",
      "Health & Fitness",
      "Travel",
      "Education",
      "Gifts & Donations",
      "Business Services",
      "Personal Care",
      "Other",
    ])
    .range([
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f97316",
      "#eab308",
      "#10b981",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
      "#f59e0b",
      "#8b5a2b",
      "#6b7280",
    ]);

  // Navigation functions
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevious = () => {
    if (viewMode === "month") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === "year") {
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === "year") {
      setCurrentYear(currentYear + 1);
    }
  };

  const canGoPrevious = () => {
    if (viewMode === "all-time") {
      return false;
    }
    if (viewMode === "month") {
      return currentYear > Math.min(...availableYears) || currentMonth > 1;
    } else if (viewMode === "year") {
      return currentYear > Math.min(...availableYears);
    }
    return false;
  };

  const canGoNext = () => {
    if (viewMode === "all-time") {
      return false;
    }
    const currentDate = new Date();
    if (viewMode === "month") {
      return (
        currentYear < currentDate.getFullYear() ||
        (currentYear === currentDate.getFullYear() &&
          currentMonth < currentDate.getMonth() + 1)
      );
    } else if (viewMode === "year") {
      return currentYear < currentDate.getFullYear();
    }
    return false;
  };

  // eslint-disable-next-line max-lines-per-function
  useEffect(() => {
    if (
      !svgRef.current ||
      !treemapData.children ||
      treemapData.children.length === 0
    ) {
      return;
    }

    const renderTreemap = () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Get container dimensions dynamically
      const container = svgRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = Math.max(containerRect.width || 800, 400);
      const containerHeight = Math.max(containerRect.height || 500, 300);

      const margin = { top: 5, right: 5, bottom: 5, left: 5 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create hierarchy and treemap layout
      const root = hierarchy(treemapData)
        .sum((d) => d.value || 0)
        .sort((a, b) => b.value - a.value);

      const treemapLayout = treemap()
        .tile(treemapBinary)
        .size([width, height])
        .padding(2)
        .round(true);

      treemapLayout(root);

      svg
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .style("width", "100%")
        .style("height", "100%")
        .style("max-width", "100%")
        .style("max-height", "100%");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Create tooltip
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "treemap-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("z-index", "1000");

      // Create leaves (rectangles)
      const leaves = g
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      // Add rectangles
      leaves
        .append("rect")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .attr("fill", (d) => {
          const category = showSubcategories ? d.data.category : d.data.name;
          return colorScale(category);
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 1);
          const displayName = showSubcategories ? d.data.fullName : d.data.name;
          tooltip.style("visibility", "visible").html(`
            <strong>${displayName}</strong><br/>
            Amount: ${formatCurrency(d.data.value)}<br/>
            ${((d.data.value / root.value) * 100).toFixed(1)}% of total
          `);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 0.8);
          tooltip.style("visibility", "hidden");
        });

      // Add text labels
      leaves
        .append("text")
        .attr("x", 4)
        .attr("y", 14)
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", (d) => {
          const rectWidth = d.x1 - d.x0;
          const rectHeight = d.y1 - d.y0;
          const area = rectWidth * rectHeight;
          if (area < 1000) {
            return "0px";
          } // Hide text for very small rectangles
          if (area < 3000) {
            return "10px";
          }
          if (area < 6000) {
            return "11px";
          }
          return "12px";
        })
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)")
        .style("pointer-events", "none")
        .each(function (d) {
          const text = d3.select(this);
          const rectWidth = d.x1 - d.x0;
          const rectHeight = d.y1 - d.y0;

          if (rectWidth < 50 || rectHeight < 30) {
            return; // Don't add text for very small rectangles
          }

          const lines = [];

          let displayName;
          if (showSubcategories) {
            displayName =
              d.data.name.length > 15
                ? `${d.data.name.substring(0, 12)}...`
                : d.data.name;
          } else {
            displayName =
              d.data.name.length > 20
                ? `${d.data.name.substring(0, 17)}...`
                : d.data.name;
          }

          lines.push(displayName);

          if (rectHeight > 50) {
            lines.push(formatCurrency(d.data.value));
          }

          lines.forEach((line, i) => {
            text
              .append("tspan")
              .attr("x", 4)
              .attr("dy", i === 0 ? 0 : "1.2em")
              .attr("font-size", i === 0 ? "12px" : "10px")
              .attr("font-weight", i === 0 ? "bold" : "normal")
              .text(line);
          });
        });

      // Cleanup tooltip on component unmount
      return () => {
        tooltip.remove();
      };
    };

    // Initial render
    renderTreemap();

    // Add resize observer for responsiveness
    const resizeObserver = new ResizeObserver(() => {
      renderTreemap();
    });

    if (svgRef.current?.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [treemapData, colorScale, showSubcategories]);

  // Sync external ref
  useEffect(() => {
    if (chartRef) {
      chartRef.current = svgRef.current;
    }
  }, [chartRef]);

  return (
    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Expense Breakdown Treemap
        </h3>
        <button
          onClick={() => {
            if (chartRef?.current) {
              const svgElement = chartRef.current;
              const serializer = new XMLSerializer();
              const svgString = serializer.serializeToString(svgElement);
              const blob = new Blob([svgString], { type: "image/svg+xml" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              const fileName = `expense-treemap-${viewMode}-${currentYear}`;
              const monthSuffix =
                viewMode === "month" ? `-${currentMonth}` : "";
              link.download = fileName + monthSuffix + ".svg";
              link.href = url;
              link.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-3 bg-gray-700/50 rounded-lg p-2">
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm transition-colors border-none focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="month">Monthly View</option>
            <option value="year">Yearly View</option>
            <option value="all-time">All Time</option>
          </select>

          <label className="flex items-center text-white text-sm">
            <input
              type="checkbox"
              checked={showSubcategories}
              onChange={(e) => setShowSubcategories(e.target.checked)}
              className="mr-1"
            />
            Subcategories
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          <div className="text-white font-semibold min-w-[120px] text-center text-sm">
            {(() => {
              if (viewMode === "all-time") {
                return "All Time";
              }
              if (viewMode === "year") {
                return `${currentYear}`;
              }
              return `${monthNames[currentMonth - 1].substring(0, 3)} ${currentYear}`;
            })()}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div className="text-xs text-gray-400">
          {timeFilteredData.length} expenses
        </div>
      </div>

      {/* Treemap Container */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
        {treemapData.children && treemapData.children.length > 0 ? (
          <div className="w-full h-full">
            <svg ref={svgRef} className="w-full h-full block"></svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>No expense data available</div>
              <div className="text-sm">for the selected period</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-600">
        <p className="mb-1">
          Rectangle size = expense amount. Hover for details.
        </p>
        <div className="text-xs text-gray-500">
          {showSubcategories
            ? "Showing subcategories within main categories"
            : "Showing main expense categories only"}
        </div>
      </div>
    </div>
  );
};

TreemapChart.propTypes = {
  filteredData: PropTypes.array.isRequired,
  chartRef: PropTypes.object,
};

export default TreemapChart;
