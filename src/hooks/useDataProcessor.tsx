// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { parseCurrency, parseDate } from "../lib/data";
import logger from "../utils/logger";
import * as XLSX from "xlsx";
import type { Transaction, UniqueValues, DataFilters, SortConfig } from "../types";

// Helper function: Parse CSV/TSV row handling quoted fields
const parseCsvRow = (row) => {
  const columns = [];
  let current = "";
  let inQuotes = false;
  const separator = row.includes("\t") ? "\t" : ",";
  let i = 0;

  while (i < row.length) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      columns.push(current.trim());
      current = "";
      i++;
      continue;
    } else {
      current += char;
    }
    i++;
  }
  columns.push(current.trim());
  return columns;
};

// Helper function: Clean and normalize column data
const cleanColumn = (col) => {
  if (col === null || col === undefined) {
    return "";
  }
  return col.toString().trim();
};

// Helper function: Convert Excel serial date to date/time strings
const convertExcelSerialDate = (excelDate, index) => {
  logger.debug(`Row ${index} is Excel date serial number`);
  const excelEpoch = new Date(1900, 0, 1);
  const days = Math.floor(excelDate);
  const timeFraction = excelDate - days;

  const date = new Date(
    excelEpoch.getTime() + (days - 2) * 24 * 60 * 60 * 1000
  );

  const hours = Math.floor(timeFraction * 24);
  const minutes = Math.floor((timeFraction * 24 - hours) * 60);
  const seconds = Math.floor(((timeFraction * 24 - hours) * 60 - minutes) * 60);

  date.setHours(hours, minutes, seconds);

  const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
  const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  logger.debug(`Row ${index} converted from serial:`, {
    excelDate,
    dateStr,
    timeStr,
  });

  return { dateStr, timeStr };
};

// Helper function: Convert Date object to date/time strings
const convertDateObject = (date, index) => {
  logger.debug(`Row ${index} is Date object`);
  const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
  const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

  logger.debug(`Row ${index} converted from Date object:`, {
    dateStr,
    timeStr,
  });

  return { dateStr, timeStr };
};

// Helper function: Parse string period value
const parseStringPeriod = (periodValue, index) => {
  const cleanedValue = cleanColumn(periodValue);
  logger.debug(`Row ${index} is string period:`, cleanedValue);

  let dateStr, timeStr;

  if (cleanedValue.includes(", ")) {
    const periodParts = cleanedValue.split(", ");
    dateStr = periodParts[0];
    timeStr = periodParts[1] || "00:00:00";
  } else if (cleanedValue.includes(" ")) {
    const periodParts = cleanedValue.split(" ");
    dateStr = periodParts[0];
    timeStr = periodParts[1] || "00:00:00";
  } else {
    dateStr = cleanedValue;
    timeStr = "00:00:00";
  }

  return { dateStr, timeStr };
};

// Helper function: Process period value (handles Excel serial, Date object, or string)
const processPeriodValue = (periodValue, index) => {
  let dateStr, timeStr;

  if (typeof periodValue === "number" && periodValue > 40000) {
    ({ dateStr, timeStr } = convertExcelSerialDate(periodValue, index));
  } else if (periodValue instanceof Date) {
    ({ dateStr, timeStr } = convertDateObject(periodValue, index));
  } else {
    ({ dateStr, timeStr } = parseStringPeriod(periodValue, index));
  }

  logger.debug(`Row ${index} parsed:`, { dateStr, timeStr });
  return { dateStr, timeStr };
};

// Helper function: Create item from new format row
const createNewFormatItem = (row, index) => {
  logger.debug(`Row ${index} is new format`);
  const periodValue = row[0];
  logger.debug(`Row ${index} period value:`, periodValue, typeof periodValue);

  const { dateStr, timeStr } = processPeriodValue(periodValue, index);
  const parsedDate = parseDate(dateStr, timeStr);
  logger.debug(`Row ${index} parsed date:`, parsedDate);

  const item = {
    id: index,
    date: parsedDate,
    time: timeStr,
    account: cleanColumn(row[1]),
    category: cleanColumn(row[2]),
    subcategory: cleanColumn(row[3]),
    note: cleanColumn(row[4]),
    amount: parseCurrency(cleanColumn(row[5])),
    type: cleanColumn(row[6]) === "Exp." ? "Expense" : cleanColumn(row[6]),
  };

  logger.debug(`Row ${index} final item:`, item);
  return item;
};

// Helper function: Create item from old format row
const createOldFormatItem = (row, index) => {
  logger.debug(`Row ${index} is old format`);
  return {
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
};

// Helper function: Validate parsed item
const isValidItem = (item) => {
  const isValid =
    item?.date &&
    item?.type &&
    (item.type.includes("Transfer") || item.amount > 0);

  logger.debug("Filter check for item:", item, "isValid:", isValid);
  return isValid;
};

// Helper function: Detect Excel data format
const detectExcelFormat = (header) => {
  const hasPeriod = header.some(
    (h) => h?.includes("period") || h?.includes("date")
  );
  const hasTime = header.some((h) => h?.includes("time"));
  const hasAccounts = header.some((h) => h?.includes("account"));
  const hasCategory = header.some((h) => h?.includes("category"));
  const isNewFormat = (hasPeriod || hasTime) && hasAccounts && hasCategory;

  logger.debug("Format detection:", {
    hasPeriod,
    hasTime,
    hasAccounts,
    hasCategory,
    isNewFormat,
  });

  return isNewFormat;
};

// Helper function: Process Excel row
const processExcelRow = (row, index, isNewFormat) => {
  logger.debug(`Processing row ${index}:`, row);

  // Skip rows with insufficient columns
  if (!row || row.length < 7) {
    logger.debug(
      `Skipping row ${index} due to insufficient columns:`,
      row?.length
    );
    return null;
  }

  // Create item based on format
  const item = isNewFormat
    ? createNewFormatItem(row, index)
    : createOldFormatItem(row, index);

  return item;
};

export const useDataProcessor = (initialCsvData) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseData = (csvText) => {
    try {
      const lines = csvText.trim().split("\n");
      const header = lines[0].toLowerCase();
      const isNewFormat =
        header.includes("period") &&
        header.includes("accounts") &&
        header.includes("category");

      const rows = lines.slice(1);

      const parsedData = rows
        .map((row, index) => {
          const columns = parseCsvRow(row);

          // Skip rows with insufficient columns
          if (columns.length < 7) {
            return null;
          }

          // Create item based on format
          const item = isNewFormat
            ? createNewFormatItem(columns, index)
            : createOldFormatItem(columns, index);

          return item;
        })
        .filter(isValidItem);

      setData(parsedData);
      setError(null);
    } catch (e) {
      logger.error("Failed to parse CSV data:", e);
      setError(
        "Could not parse the financial data. Please check the file format."
      );
    } finally {
      setLoading(false);
    }
  };

  const parseExcelData = (arrayBuffer) => {
    logger.debug("Starting Excel parsing...");
    try {
      // Read the workbook from array buffer
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      logger.debug("Workbook loaded:", workbook.SheetNames);

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      logger.debug("Processing sheet:", firstSheetName);

      // Convert to JSON array with raw values
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: true,
      });
      logger.debug("Excel data loaded, total rows:", jsonData.length);

      if (!jsonData || jsonData.length === 0) {
        logger.error("No data found in Excel file");
        setError(
          "No data found in the Excel file. Please check the file format."
        );
        return;
      }

      // Check header to determine format
      const header =
        jsonData[0]?.map((h) => h?.toString().toLowerCase().trim()) || [];
      logger.debug("Processed header:", header);

      const isNewFormat = detectExcelFormat(header);

      // Skip the header row and process data
      const rows = jsonData.slice(1);
      logger.debug("Data rows to process:", rows.length);

      const parsedData = rows
        .map((row, index) => processExcelRow(row, index, isNewFormat))
        .filter(isValidItem);

      logger.debug("Final parsed data:", parsedData);
      setData(parsedData);
      setError(null);
    } catch (e) {
      logger.error("Failed to parse Excel data:", e);
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
    if (!file) {
      return;
    }

    setLoading(true);

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      // Handle CSV files using Blob.text()
      file
        .text()
        .then((text) => {
          parseData(text);
        })
        .catch((e) => {
          console.error("File reading error:", e);
          setError("Failed to read the uploaded CSV file.");
          setLoading(false);
        });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Handle Excel files using Blob.arrayBuffer()
      file
        .arrayBuffer()
        .then((arrayBuffer) => {
          parseExcelData(arrayBuffer);
        })
        .catch((e) => {
          console.error("File reading error:", e);
          setError("Failed to read the uploaded Excel file.");
          setLoading(false);
        });
    } else {
      setError("Unsupported file format. Please upload a CSV or Excel file.");
      setLoading(false);
    }
  };

  return { data, loading, error, handleFileUpload };
};

export const useUniqueValues = (data: Transaction[]): UniqueValues => {
  return useMemo(() => {
    const categories = new Set<string>();
    const expenseCategories = new Set<string>();
    const accounts = new Set<string>();
    data.forEach((item) => {
      categories.add(item.category);
      accounts.add(item.account);
      if (item.type === "Expense") {
        expenseCategories.add(item.category);
      }
    });
    return {
      types: ["All", "Income", "Expense", "Transfer-In", "Transfer-Out"],
      categories: ["All", ...categories],
      expenseCategories: [...expenseCategories],
      accounts: ["All", ...accounts],
    };
  }, [data]);
};

export const useFilteredData = (
  data: Transaction[],
  filters: DataFilters,
  sortConfig: SortConfig
): Transaction[] => {
  return useMemo(() => {
    return data
      .filter((item) => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const itemDate = item.date;
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
        }
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }
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
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
  }, [data, filters, sortConfig]);
};
