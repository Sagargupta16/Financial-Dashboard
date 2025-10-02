/**
 * Utility functions for CSV import and export
 */

/**
 * Parse CSV string to array of objects
 * @param {string} csvString - Raw CSV string
 * @returns {Array} Array of transaction objects
 */
export const parseCSV = (csvString) => {
  const lines = csvString.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV file is empty or invalid");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length !== headers.length) {
      continue; // Skip invalid rows
    }

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    // Convert to proper data types
    const transaction = {
      date: new Date(row.Date || row.date),
      type: row.Type || row.type,
      category: row.Category || row.category,
      subcategory: row.Subcategory || row.subcategory || "",
      amount: parseFloat(row.Amount || row.amount || 0),
      account: row.Account || row.account || "",
      description: row.Description || row.description || "",
    };

    // Validate required fields
    if (
      !isNaN(transaction.date.getTime()) &&
      transaction.type &&
      transaction.category &&
      !isNaN(transaction.amount)
    ) {
      data.push(transaction);
    }
  }

  if (data.length === 0) {
    throw new Error("No valid transactions found in CSV file");
  }

  return data;
};

/**
 * Convert array of transaction objects to CSV string
 * @param {Array} data - Array of transaction objects
 * @returns {string} CSV formatted string
 */
export const exportToCSV = (data) => {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  const headers = [
    "Date",
    "Type",
    "Category",
    "Subcategory",
    "Amount",
    "Account",
    "Description",
  ];
  const csvRows = [headers.join(",")];

  data.forEach((transaction) => {
    const row = [
      transaction.date.toISOString().split("T")[0], // Format: YYYY-MM-DD
      transaction.type,
      transaction.category,
      transaction.subcategory || "",
      transaction.amount.toFixed(2),
      transaction.account || "",
      transaction.description || "",
    ];
    // Escape commas in text fields
    const escapedRow = row.map((field) => {
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvRows.push(escapedRow.join(","));
  });

  return csvRows.join("\n");
};

/**
 * Download CSV file to user's computer
 * @param {string} csvString - CSV formatted string
 * @param {string} filename - Desired filename (without extension)
 */
export const downloadCSV = (csvString, filename = "transactions") => {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Read file as text
 * @param {File} file - File object from input
 * @returns {Promise<string>} Promise that resolves to file content
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
