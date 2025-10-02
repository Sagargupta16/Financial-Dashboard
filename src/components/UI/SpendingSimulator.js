/* eslint-disable max-lines-per-function */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  calculateCategorySpending,
  calculateSimulatedSpending,
  calculateImpact,
  loadScenarios,
  saveScenarios,
} from "../../utils/budgetUtils";

/**
 * Interactive What-If Spending Simulator
 * Allows users to adjust category spending and see instant impact
 */
export const SpendingSimulator = ({ filteredData }) => {
  const [actualSpending, setActualSpending] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [simulatedSpending, setSimulatedSpending] = useState({});
  const [impact, setImpact] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Calculate actual spending whenever data changes
  useEffect(() => {
    const spending = calculateCategorySpending(filteredData);
    setActualSpending(spending);

    // Initialize adjustments to 0 for all categories
    const initialAdjustments = {};
    Object.keys(spending).forEach((category) => {
      initialAdjustments[category] = 0;
    });
    setAdjustments(initialAdjustments);
  }, [filteredData]);

  // Recalculate simulated spending when adjustments change
  useEffect(() => {
    const simulated = calculateSimulatedSpending(actualSpending, adjustments);
    setSimulatedSpending(simulated);

    const impactData = calculateImpact(actualSpending, simulated);
    setImpact(impactData);
  }, [actualSpending, adjustments]);

  // Load saved scenarios
  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const handleAdjustmentChange = (category, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [category]: parseFloat(value),
    }));
  };

  const resetAdjustments = () => {
    const resetAdjustments = {};
    Object.keys(actualSpending).forEach((category) => {
      resetAdjustments[category] = 0;
    });
    setAdjustments(resetAdjustments);
  };

  const saveScenario = () => {
    if (!scenarioName.trim()) {
      return;
    }

    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      adjustments: { ...adjustments },
      impact: { ...impact },
      createdAt: new Date().toISOString(),
    };

    const updatedScenarios = [...scenarios, newScenario];
    setScenarios(updatedScenarios);
    saveScenarios(updatedScenarios);
    setScenarioName("");
    setShowSaveModal(false);
  };

  const loadScenario = (scenario) => {
    setAdjustments(scenario.adjustments);
  };

  const deleteScenario = (scenarioId) => {
    const updatedScenarios = scenarios.filter((s) => s.id !== scenarioId);
    setScenarios(updatedScenarios);
    saveScenarios(updatedScenarios);
  };

  const getAdjustmentColor = (value) => {
    if (value < 0) {
      return "text-green-400";
    }
    if (value > 0) {
      return "text-red-400";
    }
    return "text-gray-400";
  };

  const categories = Object.keys(actualSpending).sort(
    (a, b) => actualSpending[b] - actualSpending[a]
  );

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No expense data available for simulation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            💡 What-If Simulator
          </h2>
          <p className="text-gray-400 mt-1">
            Adjust spending by category and see instant impact
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetAdjustments}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Scenario
          </button>
        </div>
      </div>

      {/* Impact Summary */}
      {impact && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Current Spending</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₹{impact.actualTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Simulated Spending</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₹{impact.simulatedTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm">Monthly Savings</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              ₹{Math.abs(impact.monthlySavings).toLocaleString()}
            </p>
            <p className="text-xs text-green-400/70 mt-1">
              {impact.percentageChange.toFixed(1)}% change
            </p>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">Annual Impact</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              ₹{Math.abs(impact.annualSavings).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Category Sliders */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Adjust Category Spending
        </h3>
        <div className="space-y-4">
          {categories.map((category) => {
            const actual = actualSpending[category];
            const adjustment = adjustments[category] || 0;
            const simulated = simulatedSpending[category] || 0;

            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{category}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">
                      ₹{actual.toLocaleString()}
                    </span>
                    <span className="text-gray-600">→</span>
                    <span className="text-white text-sm font-medium">
                      ₹{simulated.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={adjustment}
                    onChange={(e) =>
                      handleAdjustmentChange(category, e.target.value)
                    }
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span
                    className={`text-sm font-medium w-16 text-right ${getAdjustmentColor(
                      adjustment
                    )}`}
                  >
                    {adjustment > 0 ? "+" : ""}
                    {adjustment}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (simulated / actual) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Scenarios */}
      {scenarios.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Saved Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{scenario.name}</h4>
                  <button
                    onClick={() => deleteScenario(scenario.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-green-400 text-sm mb-3">
                  Saves ₹
                  {Math.abs(scenario.impact.monthlySavings).toLocaleString()}
                  /month
                </p>
                <button
                  onClick={() => loadScenario(scenario)}
                  className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Load Scenario
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Scenario Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Save Scenario</h3>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveScenario}
                disabled={!scenarioName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SpendingSimulator.propTypes = {
  filteredData: PropTypes.array.isRequired,
};
