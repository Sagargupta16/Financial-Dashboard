import React from "react";
import PropTypes from "prop-types";
import EnhancedTransactionTable from "../../features/transactions/components/TransactionTable";

/**
 * Transactions Section - Detailed transaction table with filters
 */
export const TransactionsSection = ({
  filteredData,
  handleSort,
  currentPage,
  transactionsPerPage,
}) => {
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

TransactionsSection.propTypes = {
  filteredData: PropTypes.array.isRequired,
  handleSort: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  transactionsPerPage: PropTypes.number.isRequired,
};
