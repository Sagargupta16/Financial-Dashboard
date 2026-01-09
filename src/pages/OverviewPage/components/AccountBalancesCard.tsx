// @ts-nocheck
import { formatCurrency } from "../../../lib/formatters";

export const AccountBalancesCard = ({ balances }) => (
  <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
    <h3 className="text-xl font-semibold text-white mb-4">Account Balances</h3>
    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
      {balances.map(({ name, balance }) => (
        <div
          key={name}
          className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-700/50"
        >
          <span className="text-gray-300 truncate pr-2">{name}</span>
          <span
            className={`font-medium whitespace-nowrap ${
              balance >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      ))}
      {balances.length === 0 && <p className="text-gray-400 text-center py-4">No account data.</p>}
    </div>
  </div>
);
