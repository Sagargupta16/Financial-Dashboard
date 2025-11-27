/**
 * Data Validation Utilities
 * Provides robust validation for imported financial data
 */

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
  }
}

/**
 * Transaction schema validator
 */
export const transactionSchema = {
  date: {
    required: true,
    validate: (value) => {
      if (!value) {
        return { valid: false, message: "Date is required" };
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { valid: false, message: "Invalid date format" };
      }
      // Check if date is not in the future
      if (date > new Date()) {
        return { valid: false, message: "Date cannot be in the future" };
      }
      // Check if date is not too old (e.g., before 1900)
      if (date.getFullYear() < 1900) {
        return { valid: false, message: "Date is too old" };
      }
      return { valid: true };
    },
  },
  amount: {
    required: true,
    validate: (value) => {
      if (value === null || value === undefined) {
        return { valid: false, message: "Amount is required" };
      }
      const num = Number(value);
      if (isNaN(num)) {
        return { valid: false, message: "Amount must be a number" };
      }
      if (num === 0) {
        return { valid: false, message: "Amount cannot be zero" };
      }
      if (num > 10000000) {
        return { valid: false, message: "Amount seems unusually large" };
      }
      return { valid: true };
    },
  },
  type: {
    required: true,
    validate: (value) => {
      const validTypes = ["Income", "Expense", "Transfer-In", "Transfer-Out"];
      if (!value) {
        return { valid: false, message: "Transaction type is required" };
      }
      if (!validTypes.includes(value)) {
        return {
          valid: false,
          message: `Type must be one of: ${validTypes.join(", ")}`,
        };
      }
      return { valid: true };
    },
  },
  category: {
    required: true,
    validate: (value) => {
      if (!value || value.trim() === "") {
        return { valid: false, message: "Category is required" };
      }
      if (value.length > 100) {
        return { valid: false, message: "Category name is too long" };
      }
      return { valid: true };
    },
  },
  account: {
    required: true,
    validate: (value) => {
      if (!value || value.trim() === "") {
        return { valid: false, message: "Account is required" };
      }
      return { valid: true };
    },
  },
};

/**
 * Validate a single transaction
 * @param {Object} transaction - Transaction object to validate
 * @param {boolean} strict - If true, throw errors; if false, return validation result
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
export const validateTransaction = (transaction, strict = false) => {
  const errors = [];

  for (const [field, rules] of Object.entries(transactionSchema)) {
    const value = transaction[field];

    // Check required fields
    if (rules.required && !value && value !== 0) {
      errors.push({
        field,
        message: `${field} is required`,
        value,
      });
      continue;
    }

    // Run custom validation
    if (rules.validate) {
      const result = rules.validate(value);
      if (!result.valid) {
        errors.push({
          field,
          message: result.message,
          value,
        });
      }
    }
  }

  if (strict && errors.length > 0) {
    throw new ValidationError(
      `Transaction validation failed: ${errors.map((e) => e.message).join(", ")}`,
      errors[0].field,
      errors[0].value
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate multiple transactions
 * @param {Array} transactions - Array of transactions to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateTransactions = (
  transactions,
  options = { strict: false, skipInvalid: true }
) => {
  const results = {
    valid: [],
    invalid: [],
    totalCount: transactions.length,
    validCount: 0,
    invalidCount: 0,
  };

  transactions.forEach((transaction, index) => {
    const validation = validateTransaction(transaction, false);

    if (validation.valid) {
      results.valid.push({ index, transaction });
      results.validCount++;
    } else {
      results.invalid.push({
        index,
        transaction,
        errors: validation.errors,
      });
      results.invalidCount++;
    }
  });

  // In strict mode, throw error if any invalid
  if (options.strict && results.invalidCount > 0) {
    throw new ValidationError(
      `Found ${results.invalidCount} invalid transactions`,
      "transactions",
      results.invalid
    );
  }

  return results;
};

/**
 * Sanitize transaction data
 * Cleans and normalizes transaction data
 * @param {Object} transaction - Transaction to sanitize
 * @returns {Object} Sanitized transaction
 */
export const sanitizeTransaction = (transaction) => {
  const sanitized = { ...transaction };

  // Trim string fields
  if (sanitized.category) {
    sanitized.category = sanitized.category.trim();
  }
  if (sanitized.subcategory) {
    sanitized.subcategory = sanitized.subcategory.trim();
  }
  if (sanitized.account) {
    sanitized.account = sanitized.account.trim();
  }
  if (sanitized.note) {
    sanitized.note = sanitized.note.trim();
  }

  // Ensure amount is a number
  if (sanitized.amount) {
    sanitized.amount = Math.abs(Number(sanitized.amount));
  }

  // Normalize type
  if (sanitized.type) {
    const typeMap = {
      income: "Income",
      expense: "Expense",
      "transfer-in": "Transfer-In",
      "transfer-out": "Transfer-Out",
    };
    sanitized.type = typeMap[sanitized.type.toLowerCase()] || sanitized.type;
  }

  return sanitized;
};

/**
 * Detect duplicate transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Array of potential duplicates
 */
export const detectDuplicates = (transactions) => {
  const seen = new Map();
  const duplicates = [];

  transactions.forEach((transaction, index) => {
    // Create a key from date, amount, category
    const key = `${transaction.date.toISOString()}-${transaction.amount}-${transaction.category}`;

    if (seen.has(key)) {
      duplicates.push({
        index,
        transaction,
        duplicateOf: seen.get(key),
      });
    } else {
      seen.set(key, index);
    }
  });

  return duplicates;
};

/**
 * Validate CSV structure
 * @param {Array} headers - CSV headers
 * @returns {Object} Validation result
 */
export const validateCSVStructure = (headers) => {
  const requiredHeaders = [
    "Date",
    "Accounts",
    "Category",
    "INR",
    "Income/Expense",
  ];
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

  return {
    valid: missingHeaders.length === 0,
    missingHeaders,
    message:
      missingHeaders.length > 0
        ? `Missing required columns: ${missingHeaders.join(", ")}`
        : "CSV structure is valid",
  };
};

/**
 * Generate validation report
 * @param {Object} validationResults - Results from validateTransactions
 * @returns {string} Human-readable report
 */
export const generateValidationReport = (validationResults) => {
  const { validCount, invalidCount, invalid } = validationResults;
  const total = validCount + invalidCount;

  let report = `Validation Report:\n`;
  report += `Total transactions: ${total}\n`;
  report += `Valid: ${validCount} (${((validCount / total) * 100).toFixed(1)}%)\n`;
  report += `Invalid: ${invalidCount} (${((invalidCount / total) * 100).toFixed(1)}%)\n\n`;

  if (invalidCount > 0) {
    report += `Invalid transactions:\n`;
    invalid.slice(0, 10).forEach(({ index, errors }) => {
      report += `Row ${index + 1}: ${errors.map((e) => e.message).join(", ")}\n`;
    });

    if (invalidCount > 10) {
      report += `... and ${invalidCount - 10} more\n`;
    }
  }

  return report;
};
