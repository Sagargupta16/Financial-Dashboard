import { Coffee, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Doughnut, Line } from "react-chartjs-2";

interface FoodData {
  totalFoodSpending: number;
  monthlyAverage: number;
  dailyAverage: number;
  deliveryApps: number;
  insights: { title: string; message: string; priority: string }[];
}

interface FoodSpendingSectionProps {
  foodData: FoodData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  foodChartData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  foodTrendsData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOptions: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doughnutOptions: any;
}

/**
 * Food Spending Analytics Section Component
 */
export const FoodSpendingSection = ({
  foodData,
  foodChartData,
  foodTrendsData,
  chartOptions,
  doughnutOptions,
}: FoodSpendingSectionProps) => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <UtensilsCrossed className="text-green-400" size={28} />
        Food Spending Analysis
      </h3>

      {/* Food Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Food Spending</span>
            <UtensilsCrossed className="text-green-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹
            {foodData.totalFoodSpending.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Monthly Average</span>
            <ShoppingBag className="text-blue-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ₹
            {foodData.monthlyAverage.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Daily Average</span>
            <Coffee className="text-yellow-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            ₹
            {foodData.dailyAverage.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Delivery Apps</span>
            <ShoppingBag className="text-purple-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            ₹
            {foodData.deliveryApps.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
      </div>

      {/* Food Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Category Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Food Category Breakdown</h4>
          <div style={{ height: "300px" }}>
            <Doughnut data={foodChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Monthly Food Trends */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Monthly Food Spending Trend</h4>
          <div style={{ height: "300px" }}>
            <Line data={foodTrendsData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Food Insights */}
      {foodData.insights && foodData.insights.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Food Spending Insights</h4>
          <div className="space-y-3">
            {foodData.insights.map((insight) => {
              let bgClass: string;
              if (insight.priority === "high") {
                bgClass = "bg-red-900/30 border border-red-700";
              } else if (insight.priority === "medium") {
                bgClass = "bg-yellow-900/30 border border-yellow-700";
              } else {
                bgClass = "bg-blue-900/30 border border-blue-700";
              }
              return (
                <div
                  key={`${insight.title}-${insight.priority}`}
                  className={`p-4 rounded-lg ${bgClass}`}
                >
                  <div className="font-semibold text-white mb-1">{insight.title}</div>
                  <div className="text-gray-300">{insight.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
