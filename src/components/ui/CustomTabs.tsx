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
 * Provides a tabbed interface for switching between dashboard sections
 */
export const CustomTabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  return (
    <div className="mb-8">
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <div className="bg-gray-800/50 border border-gray-700/30 p-2 rounded-2xl">
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  group flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                  }
                `}
                aria-label={`Switch to ${tab.label} tab`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.icon &&
                  (typeof tab.icon === "string" ? (
                    <span className="text-lg">{tab.icon}</span>
                  ) : (
                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                  ))}
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
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
          className="w-full bg-gray-800/50 text-white border border-gray-700/30 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          aria-label="Select dashboard section"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id} className="bg-gray-900">
              {tab.label}
              {tab.badge ? ` (${tab.badge})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

interface TabContentProps {
  children: React.ReactNode;
  isActive: boolean;
}

/**
 * Tab Content Wrapper
 */
export const TabContent = ({ children, isActive }: TabContentProps) => {
  if (!isActive) {
    return null;
  }

  return <div className="animate-fade-in">{children}</div>;
};
