import React from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

export const Header = ({ onFileUpload }) => (
  <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <div>
      <h1 className="text-4xl font-bold text-white">Financial Dashboard</h1>
      <p className="text-gray-400 mt-1">Your personal finance overview.</p>
    </div>
    <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
      <label
        htmlFor="csv-upload"
        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
      >
        <Upload size={18} className="mr-2" /> Upload CSV
      </label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={onFileUpload}
      />

      <label
        htmlFor="excel-upload"
        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
      >
        <FileSpreadsheet size={18} className="mr-2" /> Upload Excel
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
