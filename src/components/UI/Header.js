import React from "react";
import PropTypes from "prop-types";
import { Upload, FileSpreadsheet, TrendingUp, Sparkles } from "lucide-react";

export const Header = ({ onFileUpload }) => (
  <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden">
    {/* Background gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-2xl backdrop-blur-sm"></div>

    {/* Content */}
    <div className="relative z-10 flex-1 p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Sparkles size={16} className="text-yellow-400" />
            <p className="text-gray-300">Your personal finance analytics hub</p>
          </div>
        </div>
      </div>
    </div>

    <div className="relative z-10 mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3 p-6 sm:p-0">
      <label
        htmlFor="csv-upload"
        className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 transform"
      >
        <Upload
          size={18}
          className="mr-2 group-hover:rotate-12 transition-transform duration-300"
        />
        Upload CSV
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
        className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-xl cursor-pointer hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 transform"
      >
        <FileSpreadsheet
          size={18}
          className="mr-2 group-hover:rotate-12 transition-transform duration-300"
        />
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

Header.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
};
