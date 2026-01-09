import type { ChartData, ChartOptions } from "chart.js";
import { CreditCard, Gift, TrendingUp } from "lucide-react";
import { Doughnut } from "react-chartjs-2";

interface CardBreakdown {
  card: string;
  spending: number;
  cashback: number;
  cashbackRate: number;
}

interface CreditCardData {
  totalCreditCardSpending: number;
  totalCashbackEarned: number;
  cashbackShared: number;
  cashbackRate: number;
  cardBreakdown: CardBreakdown[];
}

interface CashbackSectionProps {
  creditCardData: CreditCardData;
  cardChartData: ChartData<"doughnut", number[], string>;
  doughnutOptions: ChartOptions<"doughnut">;
}

/**
 * Cashback Analytics Section Component
 */
export const CashbackSection = ({
  creditCardData,
  cardChartData,
  doughnutOptions,
}: CashbackSectionProps) => {
  const topCards = [...creditCardData.cardBreakdown]
    .sort((a, b) => b.cashback - a.cashback)
    .slice(0, 5);

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <CreditCard className="text-blue-400" size={28} />
        Credit Card Analytics
      </h3>

      {/* Credit Card Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Spending</span>
            <CreditCard className="text-blue-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹
            {creditCardData.totalCreditCardSpending.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Cashback Earned</span>
            <Gift className="text-green-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-green-400">
            ₹
            {creditCardData.totalCashbackEarned.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Cashback Shared</span>
            <Gift className="text-yellow-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            ₹
            {creditCardData.cashbackShared.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Cashback Rate</span>
            <TrendingUp className="text-purple-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {(creditCardData.cashbackRate || 0).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Credit Card Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Breakdown Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Spending by Card</h4>
          <div style={{ height: "300px" }}>
            <Doughnut data={cardChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Cashback by Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Top Cards by Cashback</h4>
          <div className="space-y-3">
            {topCards.map((card) => (
              <div
                key={card.card}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">{card.card}</div>
                  <div className="text-gray-400 text-sm">
                    {card.cashbackRate.toFixed(2)}% cashback rate
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">
                    ₹{card.cashback.toLocaleString("en-IN")}
                  </div>
                  <div className="text-gray-400 text-sm">
                    ₹{card.spending.toLocaleString("en-IN")} spent
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
