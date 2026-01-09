import { AlertCircle, CheckCircle, Download, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import {
  type CsvTransaction,
  downloadCSV,
  exportToCSV,
  parseCSV,
  readFileAsText,
} from "../../utils/csvUtils";

interface CSVImportExportProps {
  data: CsvTransaction[];
  onImport: (data: CsvTransaction[]) => void;
  filteredData: CsvTransaction[];
}

/**
 * Component for importing and exporting CSV files
 */

export const CSVImportExport = ({ data, onImport, filteredData }: CSVImportExportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setImportStatus({ type: "loading", message: "Importing CSV..." });
      const fileContent = await readFileAsText(file);
      const parsedData = parseCSV(fileContent);
      onImport(parsedData);
      setImportStatus({
        type: "success",
        message: `Successfully imported ${parsedData.length} transactions`,
      });
      setTimeout(() => setImportStatus(null), 5000);
    } catch (error) {
      setImportStatus({
        type: "error",
        message: (error as Error).message || "Failed to import CSV",
      });
      setTimeout(() => setImportStatus(null), 5000);
    }

    // Reset file input
    event.target.value = "";
  };

  const handleExport = (useFiltered: boolean = false) => {
    try {
      const dataToExport = useFiltered ? filteredData : data;
      if (!dataToExport || dataToExport.length === 0) {
        setExportStatus({
          type: "error",
          message: "No data to export",
        });
        setTimeout(() => setExportStatus(null), 3000);
        return;
      }

      const csvString = exportToCSV(dataToExport);
      const filename = useFiltered
        ? `transactions_filtered_${new Date().toISOString().split("T")[0]}`
        : `transactions_all_${new Date().toISOString().split("T")[0]}`;
      downloadCSV(csvString, filename);

      setExportStatus({
        type: "success",
        message: `Exported ${dataToExport.length} transactions`,
      });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      setExportStatus({
        type: "error",
        message: (error as Error).message || "Failed to export CSV",
      });
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Import/Export Data</h3>

      <div className="flex flex-wrap gap-4">
        {/* Import Button */}
        <div className="flex-1 min-w-[200px]">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            aria-label="Import CSV file"
          >
            <Upload size={20} />
            Import CSV
          </button>
        </div>

        {/* Export All Button */}
        <div className="flex-1 min-w-[200px]">
          <button
            type="button"
            onClick={() => handleExport(false)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            aria-label="Export all transactions as CSV"
          >
            <Download size={20} />
            Export All
          </button>
        </div>

        {/* Export Filtered Button */}
        <div className="flex-1 min-w-[200px]">
          <button
            type="button"
            onClick={() => handleExport(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            aria-label="Export filtered transactions as CSV"
          >
            <Download size={20} />
            Export Filtered
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {importStatus && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${(() => {
            if (importStatus.type === "success") {
              return "bg-green-900/30 text-green-300";
            }
            if (importStatus.type === "error") {
              return "bg-red-900/30 text-red-300";
            }
            return "bg-blue-900/30 text-blue-300";
          })()}`}
          role="alert"
        >
          {importStatus.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {exportStatus && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            exportStatus.type === "success"
              ? "bg-green-900/30 text-green-300"
              : "bg-red-900/30 text-red-300"
          }`}
          role="alert"
        >
          {exportStatus.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{exportStatus.message}</span>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-400">
        <p className="mb-2">
          <strong>CSV Format:</strong> Date, Type, Category, Subcategory, Amount, Account,
          Description
        </p>
        <p>
          <strong>Note:</strong> Import will add to existing data. Export &quot;Filtered&quot;
          exports only the currently visible transactions.
        </p>
      </div>
    </div>
  );
};
