// @ts-nocheck
import EnhancedTransactionTable from "../../features/transactions/components/TransactionTable";
import type { Transaction, TransactionSortKey } from "../../types";

interface TransactionsPageProps {
  filteredData: Transaction[];
  handleSort: (key: TransactionSortKey) => void;
  currentPage: number;
  transactionsPerPage: number;
}

/**
 * Transactions Section - Detailed transaction table with filters
 */
export const TransactionsPage = ({
  filteredData,
  handleSort,
  currentPage,
  transactionsPerPage,
}: TransactionsPageProps) => {
  return (
    <div>
      <EnhancedTransactionTable
        data={filteredData}
        onSort={handleSort}
        currentPage={currentPage}
        transactionsPerPage={transactionsPerPage}
      />
    </div>
  );
};
