import { Upload, FileSpreadsheet, TrendingUp, Sparkles } from "lucide-react";
import React from "react";

interface HeaderProps {
  onFileUpload: (_event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header = ({ onFileUpload }: HeaderProps) => (
  <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden animate-fade-in">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl animate-pulse"></div>
    <div className="absolute inset-0 glass rounded-2xl"></div>

    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

    {/* Content */}
    <div className="relative z-10 flex-1 p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
          <TrendingUp size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text animate-slide-in">
            Financial Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Sparkles size={18} className="text-yellow-400 animate-pulse" />
            <p className="text-gray-300 text-sm sm:text-base font-medium">
              Your intelligent finance analytics platform
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="relative z-10 mt-6 sm:mt-0 flex flex-col sm:flex-row gap-3 p-6 sm:p-8">
      <label
        htmlFor="csv-upload"
        className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white font-bold rounded-2xl cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-blue-500/50 hover:scale-105 transform overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        <Upload
          size={20}
          className="mr-2.5 group-hover:rotate-12 transition-transform duration-300 relative z-10"
        />
        <span className="relative z-10">Upload CSV</span>
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
        className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-emerald-700 text-white font-bold rounded-2xl cursor-pointer hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-xl hover:shadow-green-500/50 hover:scale-105 transform overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        <FileSpreadsheet
          size={20}
          className="mr-2.5 group-hover:rotate-12 transition-transform duration-300 relative z-10"
        />
        <span className="relative z-10">Upload Excel</span>
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
