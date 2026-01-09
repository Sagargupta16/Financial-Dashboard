import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { generateComprehensiveInsights } from "../../../lib/analytics/trends";
import type { ComprehensiveInsights, Insight, Transaction } from "../../../types";

interface SmartInsightsPanelProps {
  filteredData: Transaction[];
  budgets?: Record<string, number>;
}

/**
 * Smart Insights Panel
 * Shows automatically detected patterns, anomalies, and recommendations
 */
export const SmartInsightsPanel = ({ filteredData, budgets = {} }: SmartInsightsPanelProps) => {
  const insights: ComprehensiveInsights = useMemo(() => {
    return generateComprehensiveInsights(filteredData, budgets);
  }, [filteredData, budgets]);

  const getIcon = (type: string) => {
    const iconProps = { size: 20 };

    if (type === "budget-alert" || type === "budget-warning") {
      return <AlertTriangle {...iconProps} className="text-red-400" />;
    }
    if (type === "anomaly") {
      return <AlertCircle {...iconProps} className="text-orange-400" />;
    }
    if (type === "trend") {
      return <TrendingUp {...iconProps} className="text-yellow-400" />;
    }
    if (type === "seasonal") {
      return <Calendar {...iconProps} className="text-blue-400" />;
    }
    if (type === "pattern") {
      return <Info {...iconProps} className="text-purple-400" />;
    }
    return <CheckCircle {...iconProps} className="text-green-400" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-500/10";
      case "medium":
        return "border-yellow-500 bg-yellow-500/10";
      case "low":
        return "border-blue-500 bg-blue-500/10";
      default:
        return "border-gray-500 bg-gray-500/10";
    }
  };

  const highPriorityInsights = insights.byPriority.high || [];
  const mediumPriorityInsights = insights.byPriority.medium || [];
  const lowPriorityInsights = insights.byPriority.low || [];

  if (!insights.all || insights.all.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="text-green-400" size={24} />
          <h3 className="text-xl font-semibold text-white">Smart Insights</h3>
        </div>
        <div className="text-gray-400 text-center py-8">
          <p>No unusual patterns detected. Your spending looks stable! 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-blue-400" size={24} />
          <h3 className="text-xl font-semibold text-white">Smart Insights & Alerts</h3>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300">
            {highPriorityInsights.length} High
          </span>
          <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
            {mediumPriorityInsights.length} Medium
          </span>
          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
            {lowPriorityInsights.length} Low
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {/* High Priority */}
        {highPriorityInsights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-2 uppercase tracking-wide">
              ⚠️ Urgent Attention
            </h4>
            {highPriorityInsights.map((insight: Insight, idx: number) => (
              <div
                key={`high-${insight.type}-${insight.title}-${idx}`}
                className={`border-l-4 ${getPriorityColor(insight.priority)} rounded-r-lg p-4 mb-2`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{getIcon(insight.type)}</div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold mb-1">{insight.title}</h5>
                    <p className="text-gray-300 text-sm mb-2">{insight.message}</p>
                    {insight.action && (
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <TrendingDown size={14} />
                        <span className="font-medium">Action: {insight.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriorityInsights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-2 uppercase tracking-wide">
              📊 Worth Monitoring
            </h4>
            {mediumPriorityInsights.map((insight: Insight, idx: number) => (
              <div
                key={`medium-${insight.type}-${insight.title}-${idx}`}
                className={`border-l-4 ${getPriorityColor(insight.priority)} rounded-r-lg p-4 mb-2`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{getIcon(insight.type)}</div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold mb-1">{insight.title}</h5>
                    <p className="text-gray-300 text-sm mb-2">{insight.message}</p>
                    {insight.action && (
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <Info size={14} />
                        <span className="font-medium">Suggestion: {insight.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Low Priority */}
        {lowPriorityInsights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wide">
              💡 Good to Know
            </h4>
            {lowPriorityInsights.map((insight: Insight, idx: number) => (
              <div
                key={`low-${insight.type}-${insight.title}-${idx}`}
                className={`border-l-4 ${getPriorityColor(insight.priority)} rounded-r-lg p-4 mb-2`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{getIcon(insight.type)}</div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold mb-1">{insight.title}</h5>
                    <p className="text-gray-300 text-sm mb-2">{insight.message}</p>
                    {insight.action && (
                      <div className="flex items-center gap-2 text-xs text-blue-400">
                        <CheckCircle size={14} />
                        <span className="font-medium">{insight.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {insights.dayPatterns && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            📈 Spending Patterns
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700/50 rounded-lg p-2">
              <p className="text-gray-400">Weekend Avg</p>
              <p className="text-white font-semibold">
                ₹{insights.dayPatterns.weekendAvg?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2">
              <p className="text-gray-400">Weekday Avg</p>
              <p className="text-white font-semibold">
                ₹{insights.dayPatterns.weekdayAvg?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
