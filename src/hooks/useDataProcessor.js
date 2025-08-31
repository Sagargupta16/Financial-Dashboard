import { useState, useEffect, useMemo } from "react";
import { parseCurrency, parseDate } from "../utils/dataUtils";
import * as XLSX from "xlsx";

export const useDataProcessor = (initialCsvData) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseData = (csvText) => {
    try {
      const rows = csvText.trim().split("\n").slice(1);

      const parsedData = rows
        .map((row, index) => {
          // Improved CSV parsing to handle quoted fields with commas
          const columns = [];
          let current = "";
          let inQuotes = false;
          let i = 0;

          while (i < row.length) {
            const char = row[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              columns.push(current.trim());
              current = "";
              i++;
              continue;
            } else {
              current += char;
            }
            i++;
          }
          columns.push(current.trim()); // Push the last column

          // Skip rows with insufficient columns
          if (columns.length < 8) {
            return null;
          }

          // Clean and normalize the data to match constants format
          const cleanColumn = (col) => col?.replace(/"/g, "").trim() || "";

          const item = {
            id: index,
            date: parseDate(cleanColumn(columns[0]), cleanColumn(columns[1])),
            time: cleanColumn(columns[1]),
            account: cleanColumn(columns[2]), // This will remove trailing spaces
            category: cleanColumn(columns[3]),
            subcategory: cleanColumn(columns[4]),
            note: cleanColumn(columns[5]),
            amount: parseCurrency(cleanColumn(columns[6])),
            type: cleanColumn(columns[7]),
          };

          return item;
        })
        .filter((item) => {
          // Keep all valid items with dates and types
          // For Transfer transactions, allow zero amounts (they might be internal transfers)
          // For Income/Expense transactions, require positive amounts
          const isValid =
            item?.date &&
            item?.type &&
            (item.type.includes("Transfer") || item.amount > 0);

          return isValid;
        });

      setData(parsedData);
      setError(null);
    } catch (e) {
      console.error("Failed to parse data:", e);
      setError(
        "Could not parse the financial data. Please check the file format."
      );
    } finally {
      setLoading(false);
    }
  };

  const parseExcelData = (arrayBuffer) => {
    try {
      // Read the workbook from array buffer
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON array
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip the header row and process data
      const rows = jsonData.slice(1);

      const parsedData = rows
        .map((row, index) => {
          // Skip rows with insufficient columns
          if (!row || row.length < 8) {
            return null;
          }

          // Clean and normalize the data
          const cleanColumn = (col) => col?.toString().trim() || "";

          const item = {
            id: index,
            date: parseDate(cleanColumn(row[0]), cleanColumn(row[1])),
            time: cleanColumn(row[1]),
            account: cleanColumn(row[2]),
            category: cleanColumn(row[3]),
            subcategory: cleanColumn(row[4]),
            note: cleanColumn(row[5]),
            amount: parseCurrency(cleanColumn(row[6])),
            type: cleanColumn(row[7]),
          };

          return item;
        })
        .filter((item) => {
          // Keep all valid items with dates and types
          const isValid =
            item?.date &&
            item?.type &&
            (item.type.includes("Transfer") || item.amount > 0);

          return isValid;
        });

      setData(parsedData);
      setError(null);
    } catch (e) {
      console.error("Failed to parse Excel data:", e);
      setError("Could not parse the Excel file. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    parseData(initialCsvData);
  }, [initialCsvData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      // Handle CSV files
      const reader = new FileReader();
      reader.onload = (e) => {
        parseData(e.target.result);
      };
      reader.onerror = (e) => {
        console.error("File reading error:", e);
        setError("Failed to read the uploaded CSV file.");
        setLoading(false);
      };
      reader.readAsText(file);
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        parseExcelData(arrayBuffer);
      };
      reader.onerror = (e) => {
        console.error("File reading error:", e);
        setError("Failed to read the uploaded Excel file.");
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("Unsupported file format. Please upload a CSV or Excel file.");
      setLoading(false);
    }
  };

  return { data, loading, error, handleFileUpload };
};

export const useUniqueValues = (data) => {
  return useMemo(() => {
    const categories = new Set();
    const expenseCategories = new Set();
    const accounts = new Set();
    data.forEach((item) => {
      categories.add(item.category);
      accounts.add(item.account);
      if (item.type === "Expense") {
        expenseCategories.add(item.category);
      }
    });
    return {
      types: ["All", "Income", "Expense", "Transfer-In", "Transfer-Out"],
      categories: ["All", ...Array.from(categories)],
      expenseCategories: [...Array.from(expenseCategories)],
      accounts: ["All", ...Array.from(accounts)],
    };
  }, [data]);
};

export const useFilteredData = (data, filters, sortConfig) => {
  return useMemo(() => {
    return data
      .filter((item) => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const itemDate = item.date;
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);
        return (
          (item.category?.toLowerCase().includes(searchTermLower) ||
            item.subcategory?.toLowerCase().includes(searchTermLower) ||
            item.note?.toLowerCase().includes(searchTermLower) ||
            item.account?.toLowerCase().includes(searchTermLower)) &&
          (filters.type === "All" || item.type === filters.type) &&
          (filters.category === "All" || item.category === filters.category) &&
          (filters.account === "All" || item.account === filters.account) &&
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate)
        );
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [data, filters, sortConfig]);
};
