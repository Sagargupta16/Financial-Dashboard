import React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "../../utils/dataUtils";

// Helper functions for styling
const getTypeStyles = (type) => {
  switch (type) {
    case "Income":
      return "bg-green-900/50 text-green-300";
    case "Expense":
      return "bg-red-900/50 text-red-300";
    case "Transfer-In":
      return "bg-blue-900/50 text-blue-300";
    case "Transfer-Out":
      return "bg-orange-900/50 text-orange-300";
    default:
      return "bg-gray-700 text-gray-300";
  }
};

const getAmountTextColor = (type) => {
  if (type === "Income") return "text-green-400";
  if (type === "Transfer-In") return "text-blue-400";
  if (type === "Transfer-Out") return "text-orange-400";
  return "text-red-400";
};

export const TransactionTable = ({
  data,
  onSort,
  currentPage,
  totalPages,
  transactionsPerPage,
  totalTransactions,
  onPageChange,
}) => (
  <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
    <div className="p-6">
      <h3 className="text-xl font-semibold text-white">Transactions</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-700/50">
          <tr>
            {[
              "date",
              "time",
              "account",
              "category",
              "subcategory",
              "note",
              "amount",
              "type",
            ].map((key) => (
              <th
                key={key}
                className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort(key)}
              >
                <div className="flex items-center">
                  {key === "type" ? "Income/Expense" : key}
                  <ArrowUpDown size={14} className="ml-2 opacity-50" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-700/50 transition-colors"
            >
              <td className="p-4 whitespace-nowrap text-sm">
                {item.date?.toLocaleDateString()}
              </td>
              <td className="p-4 whitespace-nowrap text-sm">{item.time}</td>
              <td className="p-4 whitespace-nowrap text-sm">{item.account}</td>
              <td className="p-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getTypeStyles(
                    item.type
                  )}`}
                >
                  {item.category}
                </span>
              </td>
              <td className="p-4 text-sm">{item.subcategory || "-"}</td>
              <td className="p-4 text-sm max-w-xs truncate">
                {item.note || "-"}
              </td>
              <td
                className={`p-4 whitespace-nowrap font-medium text-sm ${getAmountTextColor(
                  item.type
                )}`}
              >
                {formatCurrency(item.amount)}
              </td>
              <td className="p-4 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getTypeStyles(
                    item.type
                  )}`}
                >
                  {item.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No transactions match.</p>
        </div>
      )}
    </div>
    {totalPages > 1 && (
      <div className="flex justify-between items-center p-4 bg-gray-800 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Showing {(currentPage - 1) * transactionsPerPage + 1}-
          {Math.min(currentPage * transactionsPerPage, totalTransactions)} of{" "}
          {totalTransactions}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )}
  </div>
);
