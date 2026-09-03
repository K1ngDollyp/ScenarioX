"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Plus, Trash2, Save } from "lucide-react";

export default function ManualModelCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("Restaurant Financial Baseline");
  const [description, setDescription] = useState("Manual small business model entry");
  const [variables, setVariables] = useState<any[]>([
    { variable_name: "customers_per_month", display_name: "Customers per Month", category: "revenue", value: 600, unit: "customers/month", period: "month", currency: "NGN" },
    { variable_name: "average_order_value", display_name: "Average Order Value", category: "revenue", value: 2500, unit: "NGN/order", period: "order", currency: "NGN" },
    { variable_name: "inventory_cost", display_name: "Inventory / Food Cost", category: "expense", value: 500000, unit: "NGN/month", period: "month", currency: "NGN" },
    { variable_name: "salary_cost", display_name: "Salary Cost", category: "expense", value: 250000, unit: "NGN/month", period: "month", currency: "NGN" },
    { variable_name: "rent", display_name: "Rent", category: "expense", value: 100000, unit: "NGN/month", period: "month", currency: "NGN" },
    { variable_name: "utilities", display_name: "Utilities", category: "expense", value: 50000, unit: "NGN/month", period: "month", currency: "NGN" },
    { variable_name: "marketing", display_name: "Marketing Spend", category: "expense", value: 100000, unit: "NGN/month", period: "month", currency: "NGN" },
  ]);
  const [saving, setSaving] = useState(false);

  const handleAddVariable = () => {
    setVariables([
      ...variables,
      { variable_name: "new_variable", display_name: "New Variable", category: "expense", value: 0, unit: "NGN/month", period: "month", currency: "NGN" }
    ]);
  };

  const handleRemoveVariable = (idx: number) => {
    setVariables(variables.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.createModel({
        name,
        business_type: "restaurant",
        currency: "NGN",
        description,
        variables,
      });
      router.push("/dashboard/models");
    } catch (err: any) {
      alert(err.message || "Failed to create model");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Manual Model Creation</h1>
        <p className="text-slate-400 text-sm">Enter variables with explicit unit metadata.</p>
      </div>

      <div className="glass-panel p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Variables</h3>
            <button
              onClick={handleAddVariable}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable</span>
            </button>
          </div>

          <div className="space-y-2">
            {variables.map((v, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <input
                  type="text"
                  value={v.variable_name}
                  onChange={(e) => {
                    const copy = [...variables];
                    copy[idx].variable_name = e.target.value;
                    setVariables(copy);
                  }}
                  className="w-36 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                  placeholder="name"
                />
                <input
                  type="text"
                  value={v.display_name}
                  onChange={(e) => {
                    const copy = [...variables];
                    copy[idx].display_name = e.target.value;
                    setVariables(copy);
                  }}
                  className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="label"
                />
                <input
                  type="number"
                  value={v.value}
                  onChange={(e) => {
                    const copy = [...variables];
                    copy[idx].value = float(e.target.value);
                    setVariables(copy);
                  }}
                  className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
                <input
                  type="text"
                  value={v.unit}
                  onChange={(e) => {
                    const copy = [...variables];
                    copy[idx].unit = e.target.value;
                    setVariables(copy);
                  }}
                  className="w-28 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400"
                />
                <button
                  onClick={() => handleRemoveVariable(idx)}
                  className="p-1.5 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="py-2.5 px-6 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Model</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function float(val: string): number {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}
