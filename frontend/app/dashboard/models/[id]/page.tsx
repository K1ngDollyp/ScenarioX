"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { api } from "@/lib/api-client";
import { Building2, GitFork, PlaySquare, ArrowRight, TrendingUp, Edit3, Save, Plus, Trash2, Check, X } from "lucide-react";

export default function ModelOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingVariables, setEditingVariables] = useState<boolean>(false);
  const [editedVars, setEditedVars] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");

  useEffect(() => {
    // Seed model fallback
    const seedModel = {
      id: resolvedParams.id,
      name: "Standard Restaurant Baseline",
      business_type: "restaurant",
      currency: "NGN",
      description: "600 customers/month @ ₦2,500 avg order, ₦1.0M operating expenses.",
      created_at: new Date().toISOString(),
      variables: [
        { variable_name: "customers_per_month", display_name: "Customers per Month", category: "revenue", value: 600, unit: "customers/month", currency: "N/A" },
        { variable_name: "average_order_value", display_name: "Average Order Value", category: "revenue", value: 2500, unit: "NGN/order", currency: "NGN" },
        { variable_name: "inventory_cost", display_name: "Inventory Cost", category: "expense", value: 500000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "salary_cost", display_name: "Salary Cost", category: "expense", value: 250000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "rent", display_name: "Rent", category: "expense", value: 100000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "utilities", display_name: "Utilities", category: "expense", value: 50000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "marketing", display_name: "Marketing", category: "expense", value: 100000, unit: "NGN/month", currency: "NGN" },
      ]
    };

    api.getModel(resolvedParams.id)
      .then((data) => {
        setModel(data);
        setEditedVars(data?.variables || []);
      })
      .catch(() => {
        setModel(seedModel);
        setEditedVars(seedModel.variables);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="glass-panel p-8 text-center text-slate-500">Loading model overview...</div>;
  }

  // Calculate baseline preview dynamically based on active vars
  const activeVars = editingVariables ? editedVars : (model?.variables || []);
  const varsMap: Record<string, number> = {};
  activeVars.forEach((v: any) => { varsMap[v.variable_name] = Number(v.value) || 0; });

  const revenue = (varsMap["customers_per_month"] || 0) * (varsMap["average_order_value"] || 0);
  
  // Calculate expenses (sum of all expense variables or explicit line items)
  let expenses = 0;
  activeVars.forEach((v: any) => {
    if (v.category === 'expense' && v.variable_name !== 'customers_per_month' && v.variable_name !== 'average_order_value') {
      expenses += Number(v.value) || 0;
    }
  });

  const profit = revenue - expenses;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const handleVarChange = (index: number, field: string, value: any) => {
    const next = [...editedVars];
    next[index] = { ...next[index], [field]: value };
    setEditedVars(next);
  };

  const handleAddVariable = () => {
    setEditedVars([
      ...editedVars,
      {
        variable_name: `custom_var_${Date.now()}`,
        display_name: "New Variable",
        category: "expense",
        value: 0,
        unit: "NGN/month",
        currency: "NGN"
      }
    ]);
  };

  const handleRemoveVariable = (index: number) => {
    setEditedVars(editedVars.filter((_, idx) => idx !== index));
  };

  const handleSaveVariables = async () => {
    setSaveStatus("Saving changes...");
    const updatedModel = {
      ...model,
      variables: editedVars
    };

    await api.updateModel(model.id, updatedModel);
    setModel(updatedModel);
    setEditingVariables(false);
    setSaveStatus("Saved successfully!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">{model.business_type}</span>
          <h1 className="text-2xl font-bold text-white mt-0.5">{model.name}</h1>
          <p className="text-slate-400 text-sm">{model.description}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/scenarios"
            className="py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition shadow-md flex items-center gap-2"
          >
            <GitFork className="w-4 h-4" />
            <span>Create Scenario</span>
          </Link>
          <Link
            href="/dashboard/simulations"
            className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700 flex items-center gap-2"
          >
            <PlaySquare className="w-4 h-4" />
            <span>Run Deterministic Simulation</span>
          </Link>
        </div>
      </div>

      {/* Baseline Financial KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Baseline Revenue</span>
          <p className="text-2xl font-extrabold text-white mt-1">₦{revenue.toLocaleString()}</p>
          <span className="text-xs text-slate-500">
            {(varsMap["customers_per_month"] || 0).toLocaleString()} customers × ₦{(varsMap["average_order_value"] || 0).toLocaleString()}
          </span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Total Expenses</span>
          <p className="text-2xl font-extrabold text-white mt-1">₦{expenses.toLocaleString()}</p>
          <span className="text-xs text-slate-500">Sum of operating expenses</span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Baseline Net Profit</span>
          <p className={`text-2xl font-extrabold mt-1 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₦{profit.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500">Revenue - Expenses</span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Profit Margin</span>
          <p className="text-2xl font-extrabold text-brand-400 mt-1">{margin.toFixed(2)}%</p>
          <span className="text-xs text-slate-500">Margin ratio</span>
        </div>
      </div>

      {/* Configured Variables Table */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Configured Variables & Financial Parameters</h3>
            <p className="text-xs text-slate-400">Edit any value to test and update your business baseline.</p>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && <span className="text-xs text-emerald-400 font-semibold">{saveStatus}</span>}
            {!editingVariables ? (
              <button
                onClick={() => {
                  setEditedVars([...model.variables]);
                  setEditingVariables(true);
                }}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 text-brand-400" />
                <span>Edit Variables</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleAddVariable}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
                <button
                  onClick={() => {
                    setEditedVars([...model.variables]);
                    setEditingVariables(false);
                  }}
                  className="py-2 px-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVariables}
                  className="py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-semibold">Variable Name</th>
                <th className="pb-2 font-semibold">Display Label</th>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Value</th>
                <th className="pb-2 font-semibold">Unit</th>
                <th className="pb-2 font-semibold">Currency</th>
                {editingVariables && <th className="pb-2 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(editingVariables ? editedVars : model.variables).map((v: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-mono text-brand-400">
                    {editingVariables ? (
                      <input
                        type="text"
                        value={v.variable_name}
                        onChange={(e) => handleVarChange(idx, "variable_name", e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-brand-400 font-mono w-full"
                      />
                    ) : (
                      v.variable_name
                    )}
                  </td>
                  <td className="py-2.5 font-medium text-slate-200">
                    {editingVariables ? (
                      <input
                        type="text"
                        value={v.display_name}
                        onChange={(e) => handleVarChange(idx, "display_name", e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 w-full"
                      />
                    ) : (
                      v.display_name
                    )}
                  </td>
                  <td className="py-2.5">
                    {editingVariables ? (
                      <select
                        value={v.category}
                        onChange={(e) => handleVarChange(idx, "category", e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="revenue">revenue</option>
                        <option value="expense">expense</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${v.category === 'revenue' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {v.category}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono font-bold text-white">
                    {editingVariables ? (
                      <input
                        type="number"
                        value={v.value}
                        onChange={(e) => handleVarChange(idx, "value", parseFloat(e.target.value) || 0)}
                        className="bg-slate-900 border border-brand-500/50 rounded px-2 py-1 text-xs text-white font-bold w-28"
                      />
                    ) : (
                      v.currency === 'NGN' ? `₦${v.value.toLocaleString()}` : v.value.toLocaleString()
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">
                    {editingVariables ? (
                      <input
                        type="text"
                        value={v.unit}
                        onChange={(e) => handleVarChange(idx, "unit", e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 w-28"
                      />
                    ) : (
                      v.unit
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">
                    {editingVariables ? (
                      <select
                        value={v.currency}
                        onChange={(e) => handleVarChange(idx, "currency", e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="NGN">NGN</option>
                        <option value="N/A">N/A</option>
                        <option value="USD">USD</option>
                      </select>
                    ) : (
                      v.currency
                    )}
                  </td>
                  {editingVariables && (
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleRemoveVariable(idx)}
                        className="p-1 rounded hover:bg-rose-950 text-rose-400 transition"
                        title="Remove Variable"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

