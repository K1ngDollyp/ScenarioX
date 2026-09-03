"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { GitFork, Plus, PlaySquare, Building2 } from "lucide-react";

export default function ScenarioBuilderPage() {
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [name, setName] = useState("10% Price Increase + Elasticity");
  const [description, setDescription] = useState("Test raising prices by 10% assuming demand elasticity.");
  const [changes, setChanges] = useState<any[]>([
    { variable_name: "price_change", change_type: "percentage", change_value: 10.0 }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadModels() {
      const activeModels = await api.getModels();
      setModels(activeModels);
      if (activeModels.length > 0) {
        setSelectedModelId(activeModels[0].id);
      }
    }
    loadModels();
  }, []);

  const handleAddChange = () => {
    setChanges([
      ...changes,
      { variable_name: "marketing", change_type: "percentage", change_value: 10.0 }
    ]);
  };

  const handleCreateScenario = async () => {
    setSaving(true);
    try {
      const targetModelId = selectedModelId || (models[0] ? models[0].id : "seed-restaurant-001");
      await api.createScenario(targetModelId, {
        name,
        description,
        changes
      });
      router.push("/dashboard/simulations");
    } catch (err: any) {
      alert(err.message || "Failed to create scenario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Scenario Builder</h1>
        <p className="text-slate-400 text-sm">Create scenario modifications to evaluate against baseline math.</p>
      </div>

      <div className="glass-panel p-6 space-y-6">
        {/* Model Selector */}
        {models.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Target Business Model</span>
            </label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.business_type})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Scenario Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Variable Modifications</h3>
            <button
              onClick={handleAddChange}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable Change</span>
            </button>
          </div>

          <div className="space-y-2">
            {changes.map((c, idx) => (
              <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <select
                  value={c.variable_name}
                  onChange={(e) => {
                    const copy = [...changes];
                    copy[idx].variable_name = e.target.value;
                    setChanges(copy);
                  }}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                >
                  <option value="price_change">price_change (+10% menu price)</option>
                  <option value="marketing">marketing spend</option>
                  <option value="inventory_cost">inventory_cost</option>
                  <option value="salary_cost">salary_cost</option>
                  <option value="rent">rent</option>
                  <option value="utilities">utilities</option>
                </select>

                <select
                  value={c.change_type}
                  onChange={(e) => {
                    const copy = [...changes];
                    copy[idx].change_type = e.target.value;
                    setChanges(copy);
                  }}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="absolute">Absolute (+/- NGN)</option>
                  <option value="multiplier">Multiplier (x Factor)</option>
                </select>

                <input
                  type="number"
                  value={c.change_value}
                  onChange={(e) => {
                    const copy = [...changes];
                    copy[idx].change_value = parseFloat(e.target.value) || 0;
                    setChanges(copy);
                  }}
                  className="w-28 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <Link href="/dashboard/scenarios/compare" className="text-xs text-brand-400 hover:underline">
            Compare Multiple Scenarios →
          </Link>

          <button
            onClick={handleCreateScenario}
            disabled={saving}
            className="py-2.5 px-6 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition flex items-center gap-2 shadow-md"
          >
            <GitFork className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Scenario & Prepare Simulation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
