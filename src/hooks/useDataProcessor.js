import { useState, useEffect, useMemo } from "react";
import { parseCurrency, parseDate } from "../utils/dataUtils";
import * as XLSX from "xlsx";

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
          // Improved CSV/TSV parsing to handle quoted fields with commas/tabs
          const columns = [];
          let current = "";
          let inQuotes = false;
          let separator = row.includes("\t") ? "\t" : ",";
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
          columns.push(current.trim()); // Push the last column

          // Skip rows with insufficient columns
          if (columns.length < 7) {
            return null;
          }

          // Clean and normalize the data to match constants format
          const cleanColumn = (col) => col?.replace(/"/g, "").trim() || "";

          let item;
          if (isNewFormat) {
            // New format: Period,Accounts,Category,Subcategory,Note,INR,Income/Expense,Description,Amount,Currency,Accounts
            const periodParts = cleanColumn(columns[0]).split(", ");
            const dateStr = periodParts[0];
            const timeStr = periodParts[1] || "00:00:00";

            item = {
              id: index,
              date: parseDate(dateStr, timeStr),
              time: timeStr,
              account: cleanColumn(columns[1]),
              category: cleanColumn(columns[2]),
              subcategory: cleanColumn(columns[3]),
              note: cleanColumn(columns[4]),
              amount: parseCurrency(cleanColumn(columns[5])),
              type:
                cleanColumn(columns[6]) === "Exp."
                  ? "Expense"
                  : cleanColumn(columns[6]),
            };
          } else {
            // Old format: Date,Time,Accounts,Category,Subcategory,Note,INR,Income/Expense
            item = {
              id: index,
              date: parseDate(cleanColumn(columns[0]), cleanColumn(columns[1])),
              time: cleanColumn(columns[1]),
              account: cleanColumn(columns[2]),
              category: cleanColumn(columns[3]),
              subcategory: cleanColumn(columns[4]),
              note: cleanColumn(columns[5]),
              amount: parseCurrency(cleanColumn(columns[6])),
              type: cleanColumn(columns[7]),
            };
          }

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
    console.log("Starting Excel parsing...");
    try {
      // Read the workbook from array buffer
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      console.log("Workbook loaded:", workbook.SheetNames);

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      console.log("Processing sheet:", firstSheetName);

      // Convert to JSON array with raw values
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: true,
      });
      console.log("Excel data loaded, total rows:", jsonData.length);
      console.log("Header row:", jsonData[0]);
      console.log("First data row:", jsonData[1]);

      if (!jsonData || jsonData.length === 0) {
        console.error("No data found in Excel file");
        setError(
          "No data found in the Excel file. Please check the file format."
        );
        return;
      }

      // Check header to determine format
      const header =
        jsonData[0]?.map((h) => h?.toString().toLowerCase().trim()) || [];
      console.log("Processed header:", header);

      const hasPeriod = header.some(
        (h) => h?.includes("period") || h?.includes("date")
      );
      const hasTime = header.some((h) => h?.includes("time"));
      const hasAccounts = header.some((h) => h?.includes("account"));
      const hasCategory = header.some((h) => h?.includes("category"));
      const isNewFormat = (hasPeriod || hasTime) && hasAccounts && hasCategory;

      console.log("Format detection:", {
        hasPeriod,
        hasTime,
        hasAccounts,
        hasCategory,
        isNewFormat,
      });

      // Skip the header row and process data
      const rows = jsonData.slice(1);
      console.log("Data rows to process:", rows.length);

      const parsedData = rows
        .map((row, index) => {
          console.log(`Processing row ${index}:`, row);

          // Skip rows with insufficient columns
          if (!row || row.length < 7) {
            console.log(
              `Skipping row ${index} due to insufficient columns:`,
              row?.length
            );
            return null;
          }

          // Clean and normalize the data
          const cleanColumn = (col) => {
            if (col == null || col === undefined) return "";
            return col.toString().trim();
          };

          let item;
          if (isNewFormat) {
            console.log(`Row ${index} is new format`);
            // Try combined Period column first
            let periodValue = row[0]; // Don't clean this yet, we need to check if it's a number
            console.log(
              `Row ${index} period value:`,
              periodValue,
              typeof periodValue
            );

            let dateStr, timeStr;

            // Handle Excel date serial numbers
            if (typeof periodValue === "number" && periodValue > 40000) {
              console.log(`Row ${index} is Excel date serial number`);
              // Excel date serial number: integer part is days since 1900-01-01, decimal part is time
              const excelDate = periodValue;
              const excelEpoch = new Date(1900, 0, 1); // 1900-01-01
              const days = Math.floor(excelDate);
              const timeFraction = excelDate - days;

              // Add days to epoch (subtract 2 to account for Excel's leap year bug)
              const date = new Date(
                excelEpoch.getTime() + (days - 2) * 24 * 60 * 60 * 1000
              );

              // Add time
              const hours = Math.floor(timeFraction * 24);
              const minutes = Math.floor((timeFraction * 24 - hours) * 60);
              const seconds = Math.floor(
                ((timeFraction * 24 - hours) * 60 - minutes) * 60
              );

              date.setHours(hours, minutes, seconds);

              dateStr = `${date.getDate().toString().padStart(2, "0")}/${(
                date.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}/${date.getFullYear()}`;
              timeStr = `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

              console.log(`Row ${index} converted from serial:`, {
                excelDate,
                dateStr,
                timeStr,
              });
            } else if (periodValue instanceof Date) {
              console.log(`Row ${index} is Date object`);
              const date = periodValue;
              dateStr = `${date.getDate().toString().padStart(2, "0")}/${(
                date.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}/${date.getFullYear()}`;
              timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}:${date
                .getSeconds()
                .toString()
                .padStart(2, "0")}`;
              console.log(`Row ${index} converted from Date object:`, {
                dateStr,
                timeStr,
              });
            } else {
              // Handle string period values
              periodValue = cleanColumn(periodValue);
              console.log(`Row ${index} is string period:`, periodValue);

              // Handle different period formats
              if (periodValue.includes(", ")) {
                const periodParts = periodValue.split(", ");
                dateStr = periodParts[0];
                timeStr = periodParts[1] || "00:00:00";
              } else if (periodValue.includes(" ")) {
                const periodParts = periodValue.split(" ");
                dateStr = periodParts[0];
                timeStr = periodParts[1] || "00:00:00";
              } else {
                // Assume it's just a date
                dateStr = periodValue;
                timeStr = "00:00:00";
              }
            }

            console.log(`Row ${index} parsed:`, { dateStr, timeStr });

            const parsedDate = parseDate(dateStr, timeStr);
            console.log(`Row ${index} parsed date:`, parsedDate);

            item = {
              id: index,
              date: parsedDate,
              time: timeStr,
              account: cleanColumn(row[1]),
              category: cleanColumn(row[2]),
              subcategory: cleanColumn(row[3]),
              note: cleanColumn(row[4]),
              amount: parseCurrency(cleanColumn(row[5])),
              type:
                cleanColumn(row[6]) === "Exp."
                  ? "Expense"
                  : cleanColumn(row[6]),
            };

            console.log(`Row ${index} final item:`, item);
          } else {
            console.log(`Row ${index} is old format`);
            // Old format
            item = {
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
          }

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

          console.log("Filter check for item:", item, "isValid:", isValid);

          return isValid;
        });

      console.log("Final parsed data:", parsedData);
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
