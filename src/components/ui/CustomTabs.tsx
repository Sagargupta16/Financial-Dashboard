import { Sparkles } from "lucide-react";
import type React from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: string | React.ElementType;
  badge?: string | number;
  description?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (_tabId: string) => void;
}

/**
 * Custom Tab Navigation Component
 * Provides a beautiful tabbed interface for switching between dashboard sections
 * Note: Renamed from Tabs to CustomTabs to avoid conflict with shadcn/ui Tabs
 */
export const CustomTabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  return (
    <div className="mb-8">
      {/* Desktop Tabs - Grid Layout */}
      <div className="hidden md:block">
        <div className="glass p-3 rounded-2xl shadow-2xl border border-gray-700/30">
          <div className="grid grid-cols-4 gap-3">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  group relative flex items-center justify-center gap-2.5 px-4 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden
                  ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/70 hover:text-white hover:scale-102 border border-gray-700/50"
                  }
                `}
                aria-label={`Switch to ${tab.label} tab`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                )}
                {tab.icon &&
                  (typeof tab.icon === "string" ? (
                    <span className="text-xl relative z-10">{tab.icon}</span>
                  ) : (
                    <tab.icon className="w-5 h-5 flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  ))}
                <span className="font-bold text-sm truncate relative z-10">{tab.label}</span>
                {tab.badge && (
                  <span className="ml-2 px-2.5 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold shadow-lg relative z-10 pulse-glow">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(e) => onChange(e.target.value)}
          className="w-full glass text-white border border-gray-700/50 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold shadow-xl transition-all duration-300"
          aria-label="Select dashboard section"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id} className="py-2 bg-gray-900">
              {tab.label}
              {tab.badge ? ` (${tab.badge})` : ""}
            </option>
          ))}
        </select>
        <p className="mt-3 text-center text-xs text-gray-400 font-medium">
          {tabs.length} sections • Swipe to explore
        </p>
      </div>

      {/* Active Tab Description (Optional) */}
      {tabs.find((t) => t.id === activeTab)?.description && (
        <div className="mt-5 p-5 glass border border-blue-500/30 rounded-2xl shadow-xl animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Sparkles size={16} className="text-blue-400" />
            </div>
            <p className="text-sm text-blue-200 font-medium leading-relaxed">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface TabContentProps {
  children: React.ReactNode;
  isActive: boolean;
}

/**
 * Tab Content Wrapper
 * Provides consistent styling and animations for tab content
 */
export const TabContent = ({ children, isActive }: TabContentProps) => {
  if (!isActive) {
    return null;
  }

  return <div className="animate-fade-in">{children}</div>;
};
