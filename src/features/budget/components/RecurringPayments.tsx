/* eslint-disable max-lines-per-function */

import { Calendar, CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react";
import { useMemo } from "react";
import { detectRecurringTransactions } from "../../../lib/calculations";
import type { Transaction } from "../../../types";

type RecurringPayment = {
  description: string;
  category?: string;
  isActive?: boolean;
  frequency?: string;
  nextExpected?: string | Date;
  lastOccurrence?: string | Date;
  averageAmount?: number;
  monthlyEquivalent?: number;
  count?: number;
  consistency?: number;
  daysSinceLastOccurrence?: number;
  amount?: number;
  confidence?: number;
};

interface RecurringPaymentsProps {
  filteredData: Transaction[];
}

/**
 * Recurring Payments Detector
 * Auto-detects subscriptions and bills from transaction patterns
 */
export const RecurringPayments = ({ filteredData }: RecurringPaymentsProps) => {
  const recurringPayments = useMemo(() => {
    return detectRecurringTransactions(filteredData) as RecurringPayment[];
  }, [filteredData]);

  const getFrequencyBadge = (frequency: string = "monthly") => {
    const colors: Record<string, string> = {
      weekly: "bg-blue-900/30 text-blue-400 border-blue-500/30",
      "bi-weekly": "bg-cyan-900/30 text-cyan-400 border-cyan-500/30",
      monthly: "bg-purple-900/30 text-purple-400 border-purple-500/30",
      "bi-monthly": "bg-pink-900/30 text-pink-400 border-pink-500/30",
      quarterly: "bg-orange-900/30 text-orange-400 border-orange-500/30",
      "semi-annually": "bg-yellow-900/30 text-yellow-400 border-yellow-500/30",
      annually: "bg-green-900/30 text-green-400 border-green-500/30",
    };
    return colors[frequency] || colors.monthly;
  };

  const formatDate = (date?: string | Date) => {
    if (!date) {
      return "—";
    }
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntil = (nextDate?: string | Date) => {
    if (!nextDate) {
      return { text: "—", color: "text-gray-400" };
    }
    const days = Math.ceil((new Date(nextDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { text: "Overdue", color: "text-red-400" };
    }
    if (days === 0) {
      return { text: "Today", color: "text-orange-400" };
    }
    if (days === 1) {
      return { text: "Tomorrow", color: "text-yellow-400" };
    }
    if (days <= 7) {
      return { text: `in ${days} days`, color: "text-blue-400" };
    }
    return { text: `in ${days} days`, color: "text-gray-400" };
  };

  const activePayments = recurringPayments.filter((p) => p.isActive);
  const inactivePayments = recurringPayments.filter((p) => !p.isActive);

  const totalMonthly = activePayments.reduce(
    (sum, payment) => sum + (payment.monthlyEquivalent || 0),
    0
  );

  if (recurringPayments.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          🔄 Recurring Payments & Subscriptions
        </h2>
        <div className="text-center py-12 text-gray-400">
          <p>No recurring payments detected</p>
          <p className="text-sm mt-2">
            Need at least 2 similar transactions with consistent intervals
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🔄 Recurring Payments & Subscriptions
          </h2>
          <p className="text-gray-400 mt-1">
            Auto-detected from transaction patterns •{" "}
            <span className="text-green-400">{activePayments.length} active</span>
            {inactivePayments.length > 0 && (
              <span className="text-gray-500"> • {inactivePayments.length} inactive</span>
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-4 border border-purple-500/30">
          <p className="text-gray-400 text-sm">Total Monthly Cost</p>
          <p className="text-3xl font-bold text-white">
            ₹{totalMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {activePayments.length} active subscription
            {activePayments.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Active Subscriptions */}
      {activePayments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle size={20} />
            Active Subscriptions ({activePayments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePayments.map((payment, index) => {
              const daysUntil = getDaysUntil(payment.nextExpected);
              const frequencyLabel = payment.frequency ?? "monthly";
              return (
                <div
                  key={`active-${payment.description}-${index}`}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg p-4 border border-green-500/30 hover:border-green-500/60 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1 truncate">
                        {payment.description}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">{payment.category}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border shrink-0 ml-2 ${getFrequencyBadge(
                        payment.frequency
                      )}`}
                    >
                      {frequencyLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <TrendingUp size={14} />
                        Amount
                      </span>
                      <span className="text-white font-bold">
                        ₹
                        {(payment.averageAmount ?? 0).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Monthly Cost</span>
                      <span className="text-purple-400 font-medium text-sm">
                        ₹
                        {(payment.monthlyEquivalent ?? 0).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                        /mo
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar size={14} />
                        Last Payment
                      </span>
                      <span className="text-gray-300 text-xs">
                        {formatDate(payment.lastOccurrence)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock size={14} />
                        Next Due
                      </span>
                      <span className={`text-xs font-medium ${daysUntil.color}`}>
                        {daysUntil.text}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-xs">
                        {(payment.count ?? 0).toString()} payments •{" "}
                        {(payment.consistency ?? 0).toString()}% consistent
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive/Ended Subscriptions */}
      {inactivePayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <XCircle size={20} />
            Inactive/Ended ({inactivePayments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactivePayments.map((payment, index) => (
              <div
                key={`inactive-${payment.description}-${index}`}
                className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 opacity-60"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-300 font-medium mb-1 truncate">
                      {payment.description}
                    </h3>
                    <p className="text-gray-500 text-xs truncate">{payment.category}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border shrink-0 ml-2 ${getFrequencyBadge(
                      payment.frequency
                    )}`}
                  >
                    {payment.frequency ?? "monthly"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Was</span>
                    <span className="text-gray-400 font-medium">
                      ₹
                      {(payment.averageAmount ?? 0).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Last seen</span>
                    <span className="text-gray-500 text-xs">
                      {(payment.daysSinceLastOccurrence ?? 0).toString()} days ago
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                    <span className="text-gray-500 text-xs">
                      {(payment.count ?? 0).toString()} payments total
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
