/* eslint-disable max-lines-per-function */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { detectRecurringPayments } from "../../utils/budgetUtils";

/**
 * Recurring Payments Detector
 * Auto-detects subscriptions and bills from transaction patterns
 */
export const RecurringPayments = ({ filteredData }) => {
  const recurringPayments = useMemo(() => {
    return detectRecurringPayments(filteredData);
  }, [filteredData]);

  const getFrequencyBadge = (frequency) => {
    const colors = {
      weekly: "bg-blue-900/30 text-blue-400 border-blue-500/30",
      monthly: "bg-purple-900/30 text-purple-400 border-purple-500/30",
      quarterly: "bg-orange-900/30 text-orange-400 border-orange-500/30",
      yearly: "bg-green-900/30 text-green-400 border-green-500/30",
    };
    return colors[frequency] || colors.monthly;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (nextDate) => {
    const days = Math.ceil(
      (new Date(nextDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) {
      return "Overdue";
    }
    if (days === 0) {
      return "Today";
    }
    if (days === 1) {
      return "Tomorrow";
    }
    return `in ${days} days`;
  };

  const totalMonthly = recurringPayments.reduce((sum, payment) => {
    if (payment.frequency === "weekly") {
      return sum + payment.amount * 4;
    }
    if (payment.frequency === "monthly") {
      return sum + payment.amount;
    }
    if (payment.frequency === "quarterly") {
      return sum + payment.amount / 3;
    }
    if (payment.frequency === "yearly") {
      return sum + payment.amount / 12;
    }
    return sum;
  }, 0);

  if (recurringPayments.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          🔄 Recurring Payments
        </h2>
        <div className="text-center py-12 text-gray-400">
          <p>No recurring payments detected</p>
          <p className="text-sm mt-2">
            Need at least 3 similar transactions to detect patterns
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            🔄 Recurring Payments
          </h2>
          <p className="text-gray-400 mt-1">
            Auto-detected subscriptions and bills
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Estimated Monthly</p>
          <p className="text-2xl font-bold text-white">
            ₹{totalMonthly.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringPayments.map((payment) => (
          <div
            key={`${payment.category}-${payment.amount}-${payment.lastDate}`}
            className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">
                  {payment.category}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {payment.description}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${getFrequencyBadge(
                  payment.frequency
                )}`}
              >
                {payment.frequency}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-white font-medium">
                  ₹{payment.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Last Payment</span>
                <span className="text-gray-300 text-sm">
                  {formatDate(payment.lastDate)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Next Due</span>
                <span className="text-blue-400 text-sm font-medium">
                  {getDaysUntil(payment.nextDate)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                <span className="text-gray-400 text-sm">Occurrences</span>
                <span className="text-gray-300 text-sm">
                  {payment.occurrences}x
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

RecurringPayments.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
