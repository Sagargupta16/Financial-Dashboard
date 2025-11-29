/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  CreditCard,
  Gift,
  TrendingUp,
  UtensilsCrossed,
  ShoppingBag,
  Coffee,
} from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  calculateCreditCardMetrics,
  calculateFoodMetrics,
  calculateCommuteMetrics,
} from "../../../lib/calculations/financial";

/**
 * Credit Card & Lifestyle Optimizer
 * Optimize credit card usage, food spending, and commute costs
 */
export const CreditCardFoodOptimizer = ({ filteredData }) => {
  const creditCardData = useMemo(() => {
    const data = calculateCreditCardMetrics(filteredData);
    // Ensure all required fields exist
    return {
      totalSpending: data.totalSpending || 0,
      totalCashback: data.totalCashback || 0,
      totalCreditCardSpending: data.totalCreditCardSpending || 0,
      cashbackRate: data.cashbackRate || 0,
      byCard: data.byCard || {},
      cardBreakdown: data.cardBreakdown || [],
      insights: data.insights || [],
    };
  }, [filteredData]);

  const foodData = useMemo(() => {
    const data = calculateFoodMetrics(filteredData);
    // Ensure all required fields exist
    return {
      totalFood: data.totalFood || 0,
      totalFoodSpending: data.totalFoodSpending || 0,
      monthlyAverage: data.monthlyAverage || 0,
      dailyAverage: data.dailyAverage || 0,
      deliveryApps: data.deliveryApps || 0,
      groceries: data.groceries || 0,
      diningOut: data.diningOut || 0,
      officeCafeteria: data.officeCafeteria || 0,
      bySubcategory: data.bySubcategory || {},
      breakdown: data.breakdown || [],
      monthlyTrends: data.monthlyTrends || [],
      insights: data.insights || [],
    };
  }, [filteredData]);

  const commuteData = useMemo(() => {
    const data = calculateCommuteMetrics(filteredData);
    // Ensure all required fields exist
    return {
      totalCommute: data.totalCommute || 0,
      totalTransportation: data.totalTransportation || 0,
      monthlyAverage: data.monthlyAverage || 0,
      dailyAverage: data.dailyAverage || 0,
      dailyCommute: data.dailyCommute || 0,
      intercityTravel: data.intercityTravel || 0,
      byMode: data.byMode || {},
      breakdown: data.breakdown || [],
      insights: data.insights || [],
    };
  }, [filteredData]);

  // Credit Card breakdown chart
  const cardChartData = {
    labels: creditCardData.cardBreakdown.map((c) =>
      c.card.replace(" Credit Card", "")
    ),
    datasets: [
      {
        data: creditCardData.cardBreakdown.map((c) => c.total),
        backgroundColor: [
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#f59e0b",
          "#10b981",
        ],
        borderColor: "#1f2937",
        borderWidth: 3,
      },
    ],
  };

  // Food breakdown chart
  const foodChartData = {
    labels: foodData.breakdown.map((b) => b.name),
    datasets: [
      {
        label: "Food Spending",
        data: foodData.breakdown.map((b) => b.total),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
      },
    ],
  };

  // Food trends chart
  const foodTrendsData = {
    labels: foodData.monthlyTrends.map((t) => t.month),
    datasets: [
      {
        label: "Monthly Food Spending",
        data: foodData.monthlyTrends.map((t) => t.total),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#fff" },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || context.dataset.label || "";
            const value =
              context.parsed.y === undefined
                ? context.parsed
                : context.parsed.y;
            return `${label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
      y: {
        ticks: {
          color: "#9ca3af",
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`,
        },
        grid: { color: "rgba(75, 85, 99, 0.3)" },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", padding: 15 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">
          💳 Lifestyle Spending Optimizer
        </h2>
        <p className="text-blue-100">
          Optimize credit cards, food spending, and commute costs
        </p>
      </div>

      {/* Credit Card Section */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="text-blue-400" size={28} />
          Credit Card Analytics
        </h3>

        {/* Credit Card Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Spending */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">
                Total Card Spending
              </span>
              <CreditCard className="text-blue-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {creditCardData.totalCreditCardSpending.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Total Cashback */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">
                Total Cashback
              </span>
              <Gift className="text-green-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {creditCardData.totalCashback.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Cashback Rate */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">
                Cashback Rate
              </span>
              <TrendingUp className="text-purple-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              {creditCardData.cashbackRate.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Card Usage Chart */}
        {creditCardData.cardBreakdown.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-4">
                Card-wise Spending
              </h4>
              <div style={{ height: "300px" }}>
                <Doughnut data={cardChartData} options={doughnutOptions} />
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-4">
                Card Details
              </h4>
              <div className="space-y-3">
                {creditCardData.cardBreakdown.map((card) => (
                  <div
                    key={card.card}
                    className="bg-gray-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {card.card.replace(" Credit Card", "")}
                      </span>
                      <span className="text-2xl font-bold text-blue-400">
                        ₹
                        {card.total.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">
                        Transactions: {card.count}
                      </div>
                      <div className="text-gray-400">
                        Avg: ₹
                        {card.average.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      {card.topCategory && (
                        <div className="col-span-2 text-gray-400">
                          Top: {card.topCategory[0]} (₹
                          {card.topCategory[1].toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                          )
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Food Spending Section */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <UtensilsCrossed className="text-green-400" size={28} />
          Food Spending Analysis
        </h3>

        {/* Food Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Food */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">
                Total Food
              </span>
              <UtensilsCrossed className="text-green-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {foodData.totalFoodSpending.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Delivery Apps */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-100 text-sm font-medium">
                Delivery Apps
              </span>
              <ShoppingBag className="text-orange-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {foodData.deliveryApps.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Groceries */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100 text-sm font-medium">
                Groceries
              </span>
              <ShoppingBag className="text-emerald-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {foodData.groceries.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Office Cafeteria */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm font-medium">
                Office Meals
              </span>
              <Coffee className="text-yellow-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {foodData.officeCafeteria.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        {/* Food Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-4">
              Food Category Breakdown
            </h4>
            <div style={{ height: "300px" }}>
              <Bar data={foodChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-4">
              Monthly Food Trends
            </h4>
            <div style={{ height: "300px" }}>
              <Line data={foodTrendsData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Food Insights */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
          <h4 className="text-xl font-bold text-white mb-4">
            Food Spending Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">
                Daily Food Average
              </div>
              <div className="text-2xl font-bold text-white">
                ₹
                {foodData.dailyAverage.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
                /day
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Dining Out</div>
              <div className="text-2xl font-bold text-white">
                ₹
                {foodData.diningOut.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commute Section */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-cyan-400" size={28} />
          Commute & Transportation
        </h3>

        {/* Commute Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Transportation */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-100 text-sm font-medium">
                Total Transport
              </span>
              <TrendingUp className="text-cyan-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {commuteData.totalTransportation.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Daily Commute */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">
                Daily Commute
              </span>
              <Coffee className="text-blue-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {commuteData.dailyCommute.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Intercity Travel */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">
                Intercity Travel
              </span>
              <TrendingUp className="text-purple-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {commuteData.intercityTravel.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Daily Average */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-100 text-sm font-medium">
                Daily Avg
              </span>
              <Coffee className="text-indigo-200" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">
              ₹
              {commuteData.dailyAverage.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        {/* Commute Breakdown */}
        {commuteData.breakdown.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-4">
              Transportation Breakdown
            </h4>
            <div className="space-y-3">
              {commuteData.breakdown.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-gray-400 text-sm">
                      {item.count} trips • Avg: ₹
                      {item.average.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      ₹
                      {item.total.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-sm text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">
          💡 Optimization Tips
        </h3>
        <div className="space-y-3">
          {foodData.deliveryApps > foodData.groceries && (
            <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <UtensilsCrossed className="text-orange-400 mt-0.5" size={20} />
              <div>
                <p className="text-orange-300 font-medium">
                  Reduce Delivery App Usage
                </p>
                <p className="text-orange-200/80 text-sm mt-1">
                  You're spending ₹
                  {(foodData.deliveryApps - foodData.groceries).toLocaleString(
                    "en-IN"
                  )}{" "}
                  more on delivery apps than groceries. Cooking at home could
                  save you ₹
                  {(
                    (foodData.deliveryApps - foodData.groceries) *
                    0.6
                  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}{" "}
                  per month.
                </p>
              </div>
            </div>
          )}

          {creditCardData.cashbackRate < 2 &&
            creditCardData.totalCreditCardSpending > 50000 && (
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <CreditCard className="text-blue-400 mt-0.5" size={20} />
                <div>
                  <p className="text-blue-300 font-medium">
                    Optimize Credit Card Rewards
                  </p>
                  <p className="text-blue-200/80 text-sm mt-1">
                    Your cashback rate is{" "}
                    {creditCardData.cashbackRate.toFixed(2)}%. Consider cards
                    with higher rewards (3-5%) to earn ₹
                    {(
                      creditCardData.totalCreditCardSpending * 0.03 -
                      creditCardData.totalCashback
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    more in cashback.
                  </p>
                </div>
              </div>
            )}

          {commuteData.dailyCommute > 30000 && (
            <div className="flex items-start gap-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <TrendingUp className="text-cyan-400 mt-0.5" size={20} />
              <div>
                <p className="text-cyan-300 font-medium">
                  Consider Monthly Pass or Bike
                </p>
                <p className="text-cyan-200/80 text-sm mt-1">
                  You've spent ₹
                  {commuteData.dailyCommute.toLocaleString("en-IN")} on daily
                  commute. A monthly pass or buying a bike could save you money
                  in the long run.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CreditCardFoodOptimizer.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
