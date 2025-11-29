import { Heart, TrendingUp } from "lucide-react";

export const Footer = () => (
  <footer className="text-center mt-12 mb-8">
    <div className="bg-gradient-to-r from-gray-800/50 via-gray-800/80 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="text-gray-300 font-medium">Financial Dashboard</span>
          <span className="text-gray-500">&copy; 2025</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-sm">Made with</span>
          <Heart size={16} className="text-red-400 animate-pulse" />
          <span className="text-sm">for better financial insights</span>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
    </div>
  </footer>
);
