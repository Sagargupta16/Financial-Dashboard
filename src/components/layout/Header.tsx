import { FileSpreadsheet, TrendingUp, Upload } from "lucide-react";
import type React from "react";

interface HeaderProps {
  onFileUpload: (_event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header = ({ onFileUpload }: HeaderProps) => (
  <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800/40 border border-gray-700/30 rounded-2xl p-6 sm:p-8">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
        <TrendingUp size={28} className="text-white" />
      </div>
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Financial Dashboard
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mt-1">
          Your intelligent finance analytics platform
        </p>
      </div>
    </div>

    <div className="mt-6 sm:mt-0 flex gap-3">
      <label
        htmlFor="csv-upload"
        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl cursor-pointer hover:from-blue-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
      >
        <Upload size={18} className="mr-2" />
        Upload CSV
      </label>
      <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={onFileUpload} />

      <label
        htmlFor="excel-upload"
        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl cursor-pointer hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
      >
        <FileSpreadsheet size={18} className="mr-2" />
        Upload Excel
      </label>
      <input
        id="excel-upload"
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={onFileUpload}
      />
    </div>
  </header>
);
