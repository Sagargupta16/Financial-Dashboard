import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTransactions = useCallback((newTransactions) => {
    setTransactions(newTransactions);
  }, []);

  const updateDateRange = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      transactions,
      updateTransactions,
      dateRange,
      updateDateRange,
      loading,
      setLoading,
      error,
      setError,
      clearError,
    }),
    [
      transactions,
      updateTransactions,
      dateRange,
      updateDateRange,
      loading,
      error,
      clearError,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
