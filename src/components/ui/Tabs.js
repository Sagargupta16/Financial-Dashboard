import React from "react";
import PropTypes from "prop-types";

/**
 * Tab Navigation Component
 * Provides a beautiful tabbed interface for switching between dashboard sections
 */
export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="mb-8">
      {/* Desktop Tabs - Grid Layout */}
      <div className="hidden md:block">
        <div className="bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-transparent text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                  }
                `}
                aria-label={`Switch to ${tab.label} tab`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {typeof tab.icon === "string" ? (
                  <span className="text-xl">{tab.icon}</span>
                ) : (
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-semibold text-sm truncate">
                  {tab.label}
                </span>
                {tab.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
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
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          aria-label="Select dashboard section"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id} className="py-2">
              {tab.label}
              {tab.badge ? ` (${tab.badge})` : ""}
            </option>
          ))}
        </select>
        <p className="mt-2 text-center text-xs text-gray-500">
          {tabs.length} sections available
        </p>
      </div>

      {/* Active Tab Description (Optional) */}
      {tabs.find((t) => t.id === activeTab)?.description && (
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            {tabs.find((t) => t.id === activeTab).description}
          </p>
        </div>
      )}
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      description: PropTypes.string,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * Tab Content Wrapper
 * Provides consistent styling and animations for tab content
 */
export const TabContent = ({ children, isActive }) => {
  if (!isActive) {
    return null;
  }

  return <div className="animate-fade-in">{children}</div>;
};

TabContent.propTypes = {
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool.isRequired,
};
